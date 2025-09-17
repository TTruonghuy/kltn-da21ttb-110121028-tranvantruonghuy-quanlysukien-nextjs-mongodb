import { Controller, Post, Put, Body, UseGuards, Req, Res, UseInterceptors, UploadedFile, Get, Param, Query, Inject } from '@nestjs/common';
import { EventService } from './event.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/auth.controller';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { bucket } from 'src/config/firebase.config';
import { InjectModel } from '@nestjs/mongoose';
import { Organizer, OrganizerDocument } from '../database/schemas/organizer.schema';
import { Model, Types } from 'mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { Event, EventDocument } from '../database/schemas/event.schema';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { Session, SessionDocument } from '../database/schemas/session.schema';
import { Ticket, TicketDocument } from 'src/database/schemas/ticket.schema';

function formatDateVNPay(date: Date): string {
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly mailService: MailService,
    @InjectModel(Organizer.name) private readonly organizerModel: Model<OrganizerDocument>,
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Ticket.name) private readonly ticketModel: Model<TicketDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) { }


  @Get('payment-list')
  @UseGuards(JwtAuthGuard)
  async getEventsForPayment(@Query('showPaid') showPaid?: string) {
    return this.eventService.getEventsForPayment(showPaid === "true");
  }

  @Put(':id/confirm-payment')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async confirmEventPayment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.eventService.confirmEventPayment(id, file);
  }



  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateEvent(
    @Param('id') id: string,
    @Body() body: any, // Consider using a DTO here
    @Res() res: Response
  ) {
    try {
      const updated = await this.eventService.updateEvent(id, body);
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ message: 'Update failed', error: error.message });
    }
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.eventService.updateStatus(id, body.status);
  }

  @Get('top-events')
  async getTopEvents(@Res() res: Response) {
    try {
      const events = await this.eventService.getTopEventsByTickets(6);
      return res.status(200).json(events);
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }


  @Get('my-events')
  @UseGuards(JwtAuthGuard)
  async getMyEvents(@Req() req: RequestWithUser, @Res() res: Response) {
    try {
      const accountId = req.user?.userId;
      console.log('accountId from token:', accountId);

      // Ép sang ObjectId để tìm kiếm
      const organizer = await this.organizerModel.findOne({
        account_id: new Types.ObjectId(accountId),
      });

      console.log('Found organizer:', organizer);

      if (!organizer) {
        return res.status(404).send({ message: 'Organizer not found' });
      }
      console.log('Calling getEventsByOrganizer with organizerId:', organizer._id);
      const events = await this.eventService.getEventsByOrganizer(organizer._id as Types.ObjectId);

      return res.status(200).send({ events });
    } catch (error) {
      console.error('Error in getMyEvents:', error);
      return res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  }

  @Get('list')
  async getEvents(
    @Query('event_type') eventType?: string,
    @Query('province') province?: string,
    @Query('dates') dates?: string[] | string, // <-- nhận cả string hoặc mảng
    @Query('search') search?: string,
  ) {
    // Đảm bảo dates là mảng
    let dateArr: string[] | undefined;
    if (typeof dates === 'string') {
      dateArr = [dates];
    } else if (Array.isArray(dates)) {
      dateArr = dates;
    }
    console.log({ eventType, province, dates, dateArr, search });
    try {
      const filter: any = {};
      if (eventType) filter.event_type = eventType;
      if (province) filter.province = province;
      if (search) filter.search = search;
      const events = await this.eventService.getEvents(filter, dateArr);
      return events;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }


  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  async uploadImage(
    @Res() res: Response,
    @UploadedFile() image?: Express.Multer.File,

  ) {
    try {
      let imageUrl = '';
      if (image && image.buffer) {
        const fileName = `event/${Date.now()}-${image.originalname}`;
        const file = bucket.file(fileName);

        await file.save(image.buffer, {
          metadata: {
            contentType: image.mimetype,
          },
          predefinedAcl: 'publicRead',
        });

        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2030',
        });
        imageUrl = url;
      }
      return res.status(200).json({ url: imageUrl });
    } catch (error) {
      return res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  async createEvent(
    @Body() body: {
      title: string;
      description: string;
      location: {
        houseNumber: string;
        ward: string;
        district: string;
        province: string;
      };
      event_type: string;
    },
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @UploadedFile() image?: Express.Multer.File,

  ) {
    try {
      const organizer = await this.organizerModel.findOne({
        account_id: new Types.ObjectId(req.user.userId)
      });
      console.log('req.user:', req.user);
      console.log('Searching Organizer with account_id:', req.user?.userId);

      if (!organizer) {
        return res.status(403).json({ message: 'Organizer not found' });
      }

      const organizerId = (organizer._id as Types.ObjectId).toString();
      if (!organizerId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      let imageUrl = '';
      if (image && image.buffer) {
        try {
          const fileName = `event/${Date.now()}-${image.originalname}`;
          const file = bucket.file(fileName);

          console.log('Uploading file to Firebase:', fileName);

          await file.save(image.buffer, {
            metadata: {
              contentType: image.mimetype,
            },
            predefinedAcl: 'publicRead',
          });

          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-01-2030',
          });
          imageUrl = url;
          console.log('File uploaded successfully. URL:', imageUrl);
        } catch (error) {
          console.error('Error uploading image to Firebase:', error);
          throw new Error('Failed to upload image');
        }
      }

      const event = await this.eventService.createEvent({
        ...body,
        image: imageUrl,
        organizer_id: organizerId
      });
      return res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
      console.log("Request body:", body);
      console.error('Create Event Error:', error);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }


  @Get(':eventId/dashboard')
  async getDashboard(@Param('eventId') eventId: string) {
    return await this.eventService.getEventDashboard(eventId);
  }



  @Get('admin-list')
  //@UseGuards(JwtAuthGuard) // Chỉ cho admin, có thể thêm guard kiểm tra role
  async getAdminEvents(
    @Query('tab') tab: 'approval' | 'selling' | 'past' = 'approval',
    @Query('search') search?: string,
  ) {
    return this.eventService.getAdminEvents(tab, search);
  }


  @Get('admin-refund-list')
  @UseGuards(JwtAuthGuard)
  async getAdminRefundList() {
    // 1. Lấy tất cả event có status cancel/cancelled/approved
    const events = await this.eventModel.find({
      status: { $in: ['cancel', 'cancelled', 'approved'] }
    }).lean();

    const eventIds = events.map(e => e._id);

    // 2. Lấy tất cả session thuộc các event này
    const sessions = await this.sessionModel.find({ event_id: { $in: eventIds } }).lean();

    // 3. Lấy tất cả ticket thuộc các session này
    const sessionIds = sessions.map(s => s._id);
    const tickets = await this.ticketModel.find({ session_id: { $in: sessionIds } }).lean();
    const ticketIds = tickets.map(t => t._id);

    // 4. Lấy tất cả order có chứa ticket thuộc ticketIds
    const orders = await this.orderModel.find({
      'tickets.ticket_id': { $in: ticketIds },
      status: { $in: ['paid', 'refunded', 'cancel', 'cancelled'] }
    })
      .populate('user_id', 'name email')
      .lean();

    // 5. Gom order theo event và session
    const ordersByEvent: Record<string, Map<string, any>> = {};
    const ordersBySession: Record<string, Map<string, any>> = {};

    for (const order of orders) {
      if (order.tickets && Array.isArray(order.tickets)) {
        for (const ticket of order.tickets) {
          const sessionId = ticket.session_id ? ticket.session_id.toString() : "";
          if (!sessionId) continue;

          // --- Gom theo session ---
          if (!ordersBySession[sessionId]) ordersBySession[sessionId] = new Map();
          ordersBySession[sessionId].set(order._id.toString(), {
            _id: order._id,
            user_name: (order.user_id as any)?.name || "",
            email: (order.user_id as any)?.email || order.email,
            total_amount: order.total_amount,
            status: order.status
          });

          // --- Gom theo event ---
          const session = sessions.find(s => s._id.toString() === sessionId);
          const eventId = session?.event_id?.toString();
          if (eventId) {
            if (!ordersByEvent[eventId]) ordersByEvent[eventId] = new Map();
            ordersByEvent[eventId].set(order._id.toString(), {
              _id: order._id,
              user_name: (order.user_id as any)?.name || "",
              email: (order.user_id as any)?.email || order.email,
              total_amount: order.total_amount,
              status: order.status
            });
          }
        }
      }
    }

    // 6. Chuẩn bị kết quả
    const result: any[] = [];

    // Trường hợp 1: Sự kiện cancel/cancelled
    for (const ev of events) {
      const evOrders = Array.from(ordersByEvent[ev._id.toString()]?.values() || []);
      if (['cancel', 'cancelled'].includes(ev.status) && evOrders.length > 0) {
        result.push({
          _id: ev._id,
          title: ev.title,
          status: ev.status,
          info: "Hoàn tất cả",
          orders: evOrders
        });
      }
    }

    // Trường hợp 2: Duyệt từng session bị cancel, truy ngược lên event
    const cancelledSessions = sessions.filter(
      s => s.status === 'cancel' || s.status === 'refunded'
    );

    for (const session of cancelledSessions) {
      const event = events.find(ev => ev._id.toString() === session.event_id.toString());
      if (!event || event.status !== 'approved') continue;

      const sesOrders = Array.from(ordersBySession[session._id.toString()]?.values() || []);
      if (sesOrders.length === 0) continue;

      result.push({
        _id: event._id,
        title: event.title,
        status: event.status,
        status_session: session.status,
        session_id: session._id,
        info: `Hoàn vé xuất (${session.start_time
          ? new Date(session.start_time).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          : session._id
          })`,
        orders: sesOrders
      });
    }

    return { events: result };
  }

  @Put(':eventId/refund')
  @UseGuards(JwtAuthGuard)
  async refundEvent(@Param('eventId') eventId: string, @Body() body: any) {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new Error('Event not found');

    // Trường hợp 1: event.status === 'cancel' (hoàn tiền toàn bộ event)
    if (event.status === 'cancel') {
      const sessions = await this.sessionModel.find({
        event_id: new Types.ObjectId(eventId),
      }).lean();
      console.log('Sessions found:', sessions);
      if (!sessions.length) {
        console.log('No sessions found for event:', eventId);
        throw new Error('No sessions found for this event');
      }
      const sessionIds = sessions.map(s => s._id);

      // Tìm đơn hàng dựa trên session_id trong tickets
      const orders = await this.orderModel
        .find({
          'tickets.session_id': { $in: sessionIds },
          status: 'paid' // Chỉ lấy đơn hàng đã thanh toán
        })
        .populate('user_id', 'name email')
        .populate('tickets.ticket_id', 'ticket_name') // Populate thêm ticket để lấy ticket_name
        .populate('tickets.session_id', 'start_time') // Populate thêm session để lấy start_time
        .lean();

      console.log('All orders:', orders);
      console.log('Số order cần hoàn:', orders.length);

      if (!orders.length) {
        console.log('No orders found to refund for event:', eventId);
        // Vẫn cập nhật trạng thái event, nhưng ghi log để debug
        await this.eventModel.updateOne({ _id: eventId }, { $set: { status: 'cancelled' } });
        return { success: true, message: 'No orders to refund, event status updated to cancelled' };
      }

      for (const order of orders) {
        console.log('Refunding order:', order._id);
        const refundResult = await vnpayRefund(order, order.total_amount);
        console.log('Refund result:', refundResult);

        if (refundResult.success) {
          await this.orderModel.updateOne(
            { _id: order._id },
            {
              $set: {
                status: 'refunded',
                'payment.refundStatus': 'refunded',
                'payment.refundTxnNo': refundResult.refundTxnNo,
                'payment.refundTime': refundResult.refundTime
              }
            }
          );

          // Lấy thông tin chi tiết cho email
          const firstTicket = order.tickets[0];
          const session = await this.sessionModel.findById(firstTicket.session_id);
          const ticket = await this.ticketModel.findById(firstTicket.ticket_id);
          console.log('Sending refund mail to:', (order.user_id as any)?.email || order.email);
          await this.mailService.sendRefundEmail(
            (order.user_id as any)?.email || order.email,
            {
              userName: (order.user_id as any)?.name || "Khách hàng",
              eventTitle: event.title,
              sessionTime: session ? new Date(session.start_time).toLocaleString('vi-VN') : '',
              ticketName: ticket?.ticket_name || '',

              ticketPrice: order.total_amount,
              ticketQuantity: order.tickets.length,
              orderId: order._id.toString(),
              refundAmount: order.total_amount,
              paymentMethod: order.payment_method || "VNPay",
              refundTxnNo: refundResult.refundTxnNo,
              refundTime: refundResult.refundTime || new Date(),
            }
          );
        } else {
          console.error(`Refund failed for order ${order._id}: ${refundResult.error}`);
          // Có thể throw error hoặc ghi log để xử lý sau
        }
      }
      await this.eventModel.updateOne({ _id: eventId }, { $set: { status: 'cancelled' } });
      return { success: true };
    }

    // Trường hợp 2: event.status === 'approved' && có session cancel
    if (event.status === 'approved' && body.sessionId) {
      const session = await this.sessionModel.findById(body.sessionId);
      if (!session || session.status !== 'cancel') throw new Error('Session not found or not cancel');

      // Tìm đơn hàng dựa trên session_id
      const orders = await this.orderModel
        .find({
          'tickets.session_id': session._id,
          status: 'paid' // Chỉ lấy đơn hàng đã thanh toán
        })
        .populate('user_id', 'name email')
        .populate('tickets.ticket_id', 'ticket_name')
        .populate('tickets.session_id', 'start_time')
        .lean();

      console.log('All orders for session:', orders);
      console.log('Số order cần hoàn:', orders.length);

      if (!orders.length) {
        console.log('No orders found to refund for session:', body.sessionId);
        await this.sessionModel.updateOne({ _id: session._id }, { $set: { status: 'refunded' } });
        return { success: true, message: 'No orders to refund, session status updated to refunded' };
      }

      for (const order of orders) {
        console.log('Refunding order:', order._id);
        const refundResult = await vnpayRefund(order, order.total_amount);
        console.log('Refund result:', refundResult);

        if (refundResult.success) {
          await this.orderModel.updateOne(
            { _id: order._id },
            {
              $set: {
                status: 'refunded',
                'payment.refundStatus': 'refunded',
                'payment.refundTxnNo': refundResult.refundTxnNo,
                'payment.refundTime': refundResult.refundTime
              }
            }
          );

          // Lấy thông tin chi tiết cho email
          const firstTicket = order.tickets[0];
          const ticket = await this.ticketModel.findById(firstTicket.ticket_id);
          console.log('Sending refund mail to:', (order.user_id as any)?.email || order.email);
          await this.mailService.sendRefundEmail(
            (order.user_id as any)?.email || order.email,
            {
              userName: (order.user_id as any)?.name || "Khách hàng",
              eventTitle: event.title,
              sessionTime: session ? new Date(session.start_time).toLocaleString('vi-VN') : '',
              ticketName: ticket?.ticket_name || '',
              // ticketType: ticket?.description_ticket || '', // Giả sử description_ticket là type
              ticketPrice: order.total_amount,
              ticketQuantity: order.tickets.length,
              orderId: order._id.toString(),
              refundAmount: order.total_amount,
              paymentMethod: order.payment_method || "VNPay",
              refundTxnNo: refundResult.refundTxnNo,
              refundTime: refundResult.refundTime || new Date(),
            }
          );
        } else {
          console.error(`Refund failed for order ${order._id}: ${refundResult.error}`);
        }
      }
      await this.sessionModel.updateOne({ _id: session._id }, { $set: { status: 'refunded' } });
      return { success: true };
    }

    throw new Error('Không hợp lệ');
  }


  @Put('session/:sessionId/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelSession(@Param('sessionId') sessionId: string) {
    const session = await this.sessionModel.findByIdAndUpdate(
      sessionId,
      { status: 'cancel' },
      { new: true }
    );
    if (!session) throw new Error('Session not found');
    return { success: true, session };
  }










  @Get(':id')
  async getEventDetail(@Res() res: Response, @Param('id') id: string) {
    try {
      const event = await this.eventService.getEventDetail(id);
      return res.status(200).json(event);
    } catch (error) {
      return res.status(404).json({ message: 'Event not found' });
    }
  }
}



// Hàm gọi refund VNPay sandbox
async function vnpayRefund(order: any, refundAmount: number) {
  const tmnCode = "LJYY9O98";
  const secretKey = "LXFTAXSAI5Q78JTNZRS7F8K5FWVIWY94";
  const apiUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

  const now = new Date();
  const createDate = formatDateVNPay(now);

  // Nếu có payDate thì dùng, fallback createdAt
  const transactionDate = order.payment?.payDate
    ? formatDateVNPay(new Date(order.payment.payDate))
    : formatDateVNPay(order.createdAt || now);

  const params: Record<string, string> = {
    vnp_RequestId: "REFUND_" + Date.now(),
    vnp_Version: "2.1.0",
    vnp_Command: "refund",
    vnp_TmnCode: tmnCode,
    vnp_TransactionType: "02", // 02: toàn phần, 03: một phần
    vnp_TxnRef: order.payment?.txnRef || order._id.toString(),
    vnp_Amount: (refundAmount * 100).toString(),
    vnp_OrderInfo: `Hoan tien don hang ${order._id}`,
    vnp_TransactionNo: order.payment?.transactionNo || "",
    vnp_TransactionDate: transactionDate,
    vnp_CreateBy: "admin",
    vnp_CreateDate: createDate,
    vnp_IpAddr: "127.0.0.1",
  };

  // 🔑 Quy tắc tạo checksum
  const data =
    params.vnp_RequestId +
    "|" +
    params.vnp_Version +
    "|" +
    params.vnp_Command +
    "|" +
    params.vnp_TmnCode +
    "|" +
    params.vnp_TransactionType +
    "|" +
    params.vnp_TxnRef +
    "|" +
    params.vnp_Amount +
    "|" +
    params.vnp_TransactionNo +
    "|" +
    params.vnp_TransactionDate +
    "|" +
    params.vnp_CreateBy +
    "|" +
    params.vnp_CreateDate +
    "|" +
    params.vnp_IpAddr +
    "|" +
    params.vnp_OrderInfo;

  const secureHash = crypto
    .createHmac("sha512", secretKey)
    .update(data)
    .digest("hex");

  params.vnp_SecureHash = secureHash;

  try {
    const response = await axios.post(apiUrl, params, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.data.vnp_ResponseCode === "00") {
      return {
        success: true,
        refundTxnNo: response.data.vnp_TransactionNo,
        refundTime: new Date(),
        vnp_Response: response.data,
      };
    } else {
      return {
        success: false,
        error: response.data.vnp_Message || "Hoàn tiền thất bại",
        vnp_Response: response.data,
      };
    }
  } catch (error: any) {
    console.error("VNPay refund error:", error);
    return {
      success: false,
      error: error.message || "Lỗi kết nối VNPay",
    };
  }
}