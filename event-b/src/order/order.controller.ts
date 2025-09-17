import { Controller, Get, Param, Post, Body, Request, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrdersService } from './order.service';
import { Order } from '../database/schemas/order.schema';
import { User } from '../database/schemas/user.schema';
import { UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as QRCode from 'qrcode';
import { MailService } from 'src/mail/mail.service';

@Controller('order')
export class OrderController {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(User.name) private userModel: Model<User>, // thêm dòng này
        private ordersService: OrdersService,
        private readonly mailService: MailService
    ) { }

    @Post('/create')
    async createOrder(@Body() body: any) {
        console.log("Order create body:", JSON.stringify(body, null, 2));
        // body: { user_id, email, tickets: [{ticket_id, session_id, price, quantity}], total_amount }
        const { user_id, email, tickets, total_amount, payment_method = 'VNPay' } = body;
        console.log("Tickets:", tickets);
        // Tạo từng vé (mỗi vé một object, chưa có qr_code)
        const ticketInstances: Order['tickets'] = [];


        tickets.forEach((t: any) => {
            for (let i = 0; i < t.quantity; i++) {
                ticketInstances.push({
                    ticket_id: t.ticket_id,
                    session_id: t.session_id,
                    price: t.price,
                    qr_code: '',
                    status: 'pending',
                    check_in_time: null,
                });
            }
        });

        const order = await this.orderModel.create({
            user_id: new Types.ObjectId(user_id),
            email,
            total_amount,
            status: 'pending',
            tickets: ticketInstances,
            payment_method,
        });

        return { orderId: order._id, total_amount: order.total_amount };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('my-orders')
    async getMyOrders(@Request() req) {
        const accountId = req.user.userId;
        console.log('AccountId from JWT:', accountId);

        const user = await this.userModel.findOne({ account_id: new Types.ObjectId(accountId) });

        console.log('User found:', user);
        if (!user) {
            console.log('User not found for accountId:', accountId);
            console.log('User found:', user);
            return [];
        }
        const userId = user._id;
        console.log('User _id for orders query:', userId);

        const orders = await this.ordersService.getOrderDetailsByUser(userId);
        console.log('Orders fetched:', orders.length);
        return orders;
    }


    @UseGuards(AuthGuard('jwt'))
    @Get('/admin/summary')
    async getAdminOrderSummary(
        @Query('from') from?: string,
        @Query('to') to?: string
    ) {
        return this.ordersService.getAdminOrderSummary(from, to);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('my-orders/:id')
    async getMyOrderDetails(@Request() req, @Param('id') orderId: string) {
        const accountId = req.user.userId;
        const user = await this.userModel.findOne({ account_id: new Types.ObjectId(accountId) });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const userId = user._id;
        return this.ordersService.getOrderDetailsById(userId, new Types.ObjectId(orderId));
    }

    @Post('/confirm-free')
    async confirmFreeOrder(@Body() body: { orderId: string }) {
        const { orderId } = body;
        const order = await this.orderModel.findById(orderId)
            .populate({ path: 'tickets.ticket_id', select: 'ticket_name ticket_price' })
            .populate({
                path: 'tickets.session_id',
                populate: { path: 'event_id', select: 'title location' },
            });
        if (!order) throw new NotFoundException('Order not found');
        if (order.total_amount !== 0) throw new BadRequestException('Order is not free');

        order.status = 'paid';
        for (const ticket of order.tickets) {
            ticket.status = 'valid';
            ticket.qr_code = await QRCode.toDataURL(
                JSON.stringify({ ticket_id: ticket.ticket_id, order_id: order._id })
            );
        }
        await order.save();

        // Gửi mail xác nhận vé
        await this.mailService.sendOrderEmail(order.email, order);

        return { success: true };
    }

}