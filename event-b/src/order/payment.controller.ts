import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Controller, Post, Get, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { Ticket } from '../database/schemas/ticket.schema';
import { MailService } from 'src/mail/mail.service';

import * as QRCode from 'qrcode';

function buildQuery(obj: Record<string, string>) {
    return Object.keys(obj)
        .filter(key => obj[key] !== '' && obj[key] !== undefined && obj[key] !== null)
        .sort()
        .map(key => `${key}=${encodeURIComponent(obj[key])}`)
        .join('&');
}

@Controller('payment')
export class PaymentController {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
        private readonly mailService: MailService,
    ) { }


    @Get('/create-payment-url')
    async createPaymentUrl(@Query('orderId') orderId: string, @Query('amount') amount: string) {
        try {
            // Validate orderId và amount
            if (!orderId || !amount) {
                throw new BadRequestException('Thiếu orderId hoặc amount');
            }

            // Kiểm tra đơn hàng tồn tại
            const order = await this.orderModel.findById(orderId);
            if (!order) {
                throw new NotFoundException('Đơn hàng không tồn tại');
            }
            if (order.total_amount !== parseInt(amount)) {
                throw new BadRequestException('Số tiền không khớp với đơn hàng');
            }

            const tmnCode = 'LJYY9O98';
            const secretKey = 'LXFTAXSAI5Q78JTNZRS7F8K5FWVIWY94';
            const returnUrl = 'http://localhost:3000/payreturn'; // Cập nhật returnUrl
            const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

            const pad = (n: number) => (n < 10 ? '0' + n : n);
            const date = new Date();
            const createDate =
                date.getFullYear().toString() +
                pad(date.getMonth() + 1) +
                pad(date.getDate()) +
                pad(date.getHours()) +
                pad(date.getMinutes()) +
                pad(date.getSeconds());

            const params: Record<string, string> = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: tmnCode,
                vnp_Amount: (parseInt(amount, 10) * 100).toString(), // Nhân 100 theo yêu cầu VNPay
                vnp_CurrCode: 'VND',
                vnp_TxnRef: orderId, // Sử dụng orderId làm vnp_TxnRef
                vnp_OrderInfo: encodeURIComponent(`Thanh toan don hang ${orderId}`),
                vnp_OrderType: 'other',
                vnp_Locale: 'vn',
                vnp_ReturnUrl: returnUrl,
                vnp_IpAddr: '127.0.0.1', // Thay bằng IP thực tế của client
                vnp_CreateDate: createDate,
            };

            // Xây dựng chuỗi query đã sắp xếp
            const querystring = buildQuery(params);

            // Tạo secure hash
            const hmac = crypto.createHmac('sha512', secretKey);
            const secureHash = hmac.update(querystring).digest('hex');

            // Tạo URL thanh toán
            const paymentUrl = `${vnpUrl}?${querystring}&vnp_SecureHash=${secureHash}`;

            return { paymentUrl };
        } catch (error) {
            console.error('Create Payment URL Error:', error);
            throw new BadRequestException(`Lỗi khi tạo URL thanh toán: ${error.message}`);
        }
    }


    @Get('/vnpay-return')
    async handleVnpayReturn(@Query() query: any) {
        try {
            const vnp_SecureHash = query.vnp_SecureHash;
            delete query.vnp_SecureHash;
            // Xây dựng chuỗi query để kiểm tra chữ ký
            const secretKey = 'LXFTAXSAI5Q78JTNZRS7F8K5FWVIWY94';
            const querystring = buildQuery(query);
            const hmac = crypto.createHmac('sha512', secretKey);
            const calculatedHash = hmac.update(querystring).digest('hex');

            if (calculatedHash !== vnp_SecureHash) {
                throw new BadRequestException('Chữ ký không hợp lệ');
            }

            const order = await this.orderModel.findById(query.vnp_TxnRef)
                .populate({ path: 'tickets.ticket_id', select: 'ticket_name ticket_price' })  // Populate ticket để lấy ticket_name và ticket_price
                .populate({
                    path: 'tickets.session_id',
                    populate: { path: 'event_id', select: 'title location' },  // Populate session và event để lấy title, start_time, end_time, location
                });
            if (!order) {

                throw new NotFoundException('Đơn hàng không tồn tại');
            }

            if (query.vnp_ResponseCode === '00') {
                // Thanh toán thành công
                order.status = 'paid';
                // Tạo QR code cho từng vé
                for (const ticket of order.tickets) {
                    ticket.status = 'valid';
                    ticket.qr_code = await QRCode.toDataURL(
                        JSON.stringify({ ticket_id: ticket.ticket_id, order_id: order._id })
                    );
                    await this.ticketModel.updateOne(
                        { _id: ticket.ticket_id },
                        { $inc: { sold_quantity: 1 } }
                    );
                }
                await order.save();
                await this.mailService.sendOrderEmail(order.email, order);
                return { status: 'success', orderId: order._id };
            } else {
                // Thanh toán thất bại
                order.status = 'failed';
                await order.save();

                return { status: 'failed', code: query.vnp_ResponseCode };
            }
        } catch (error) {
            //console.error('VNPay Return Error:', error);
            throw new BadRequestException(`Lỗi xử lý kết quả VNPay: ${error.message}`);
        }
    }
}