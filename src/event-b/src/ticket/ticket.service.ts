import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket } from '../database/schemas/ticket.schema';
import { Session, SessionDocument } from '../database/schemas/session.schema';
import { SeatingChart, SeatingChartDocument } from '../database/schemas/seatingticket.schema';
import { Order, OrderDocument } from '../database/schemas/order.schema'; // Thêm import

@Injectable()
export class TicketService {
  constructor(
    @InjectModel('Ticket') private readonly ticketModel: Model<Ticket>,
    @InjectModel('Session') private readonly sessionModel: Model<SessionDocument>,
    @InjectModel('SeatingChart') private readonly seatingChartModel: Model<SeatingChartDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>, // Thêm inject Order
  ) { }

  async createSession(event_id: string, start_time: Date, end_time: Date): Promise<SessionDocument> {
    try {
      const session = new this.sessionModel({
        event_id: new Types.ObjectId(event_id),
        start_time,
        end_time,
        status: 'active',
      });
      return await session.save();
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async createTicket(data: any): Promise<Ticket> {
    try {
      // Chuyển session_id sang ObjectId nếu là string
      if (data.session_id && typeof data.session_id === 'string') {
        data.session_id = new Types.ObjectId(data.session_id);
      }
      const ticket = new this.ticketModel(data);
      return await ticket.save();
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  async createSeatingChart(data: Partial<SeatingChart>): Promise<SeatingChart> {
    try {
      const chart = new this.seatingChartModel(data);
      return await chart.save();
    } catch (error) {
      console.error('Error creating seating chart:', error);
      throw error;
    }
  }


  async checkInTicket(qrData: string, eventId?: string): Promise<any> {
    try {
      // Parse dữ liệu QR
      const parsedData = JSON.parse(qrData);
      if (!parsedData.ticket_id || !parsedData.order_id) {
        throw new BadRequestException('Dữ liệu QR không hợp lệ');
      }

      const ticketId = new Types.ObjectId(parsedData.ticket_id);
      const orderId = new Types.ObjectId(parsedData.order_id);

      // Tìm order và populate thông tin cần thiết
      const order = await this.orderModel
        .findOne({
          _id: orderId,
          'tickets.ticket_id': ticketId,
        })
        .populate({ path: 'tickets.ticket_id', select: 'ticket_name ticket_price' })
        .populate({
          path: 'tickets.session_id',
          populate: { path: 'event_id', select: 'title location' },
        });

      if (!order) {
        throw new NotFoundException('Vé không tồn tại hoặc không thuộc đơn hàng');
      }

      // Tìm vé trong order
      const ticketIndex = order.tickets.findIndex((t) => t.ticket_id.equals(ticketId));
      if (ticketIndex === -1) {
        throw new NotFoundException('Vé không tìm thấy trong đơn hàng');
      }

      const ticket = order.tickets[ticketIndex];
      const session = ticket.session_id as any; // Ép kiểu sau populate
      const now = new Date();

      console.log('eventId FE:', eventId);
      console.log('session.event_id._id:', session.event_id?._id);

      if (!session.event_id || !session.event_id._id) {
        throw new BadRequestException('Không lấy được thông tin sự kiện từ session');
      }
      if (eventId && String(session.event_id._id) !== String(eventId)) {
        throw new BadRequestException('Vé không thuộc sự kiện này');
      }

      // Kiểm tra trạng thái vé
      if (ticket.status !== 'valid') {
        throw new BadRequestException(`Vé đã sử dụng`);
      }

      // Tìm tất cả session của event liên quan, chỉ lấy session active
      const sessions = await this.sessionModel
        .find({ event_id: session.event_id._id, status: 'active' })
        .sort({ start_time: 1 }); // Sắp xếp theo start_time tăng dần

      if (!sessions.length) {
        throw new BadRequestException('Không tìm thấy session active nào cho sự kiện này');
      }

      // Tìm session hợp lệ gần nhất
      let nearestSession: SessionDocument | null = null;
      for (const s of sessions) {
        if (now >= new Date(s.start_time) && now <= new Date(s.end_time)) {
          // Session đang diễn ra
          nearestSession = s;
          break;
        } else if (now < new Date(s.start_time) && (!nearestSession || new Date(s.start_time) < new Date(nearestSession.start_time))) {
          // Session chưa diễn ra, chọn session gần nhất trong tương lai
          nearestSession = s;
        }
      }

      // Kiểm tra nếu không có session hợp lệ
      if (!nearestSession) {
        throw new BadRequestException('Không có session active nào hợp lệ tại thời điểm hiện tại');
      }

      // Kiểm tra nếu vé thuộc session hợp lệ gần nhất
      if (!nearestSession._id.equals(session._id)) {
        if (now > new Date(session.end_time)) {
          throw new BadRequestException('Vé thuộc session đã qua');
        } else {
          throw new BadRequestException('Vé thuộc session chưa đến, vui lòng sử dụng vé cho session gần nhất');
        }
      }

      // Kiểm tra thời gian của session hiện tại
      if (now < new Date(nearestSession.start_time)) {
        throw new BadRequestException('Sự kiện chưa bắt đầu');
      }
      if (now > new Date(nearestSession.end_time)) {
        throw new BadRequestException('Vé đã hết hạn (quá thời gian kết thúc session)');
      }

      // Cập nhật trạng thái vé thành 'used'
      order.tickets[ticketIndex].status = 'used';
      order.tickets[ticketIndex].check_in_time = now;
      await order.save();

      // Trả về thông tin check-in
      return {
        success: true,
        message: 'Check-in thành công',
        details: {
          event_title: session.event_id.title,
          ticket_name: (ticket.ticket_id as any).ticket_name,
          session_start: new Date(session.start_time).toLocaleString('vi-VN'),
          session_end: new Date(session.end_time).toLocaleString('vi-VN'),
          check_in_time: now.toLocaleString('vi-VN'),
        },
      };
    } catch (error) {
      console.error('Error in checkInTicket:', error);
      throw new BadRequestException(error.message || 'Lỗi khi check-in vé');
    }
  }

  async updateSession(id: string, data: { start_time: Date; end_time: Date }) {
    return this.sessionModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteSession(id: string) {
    return this.sessionModel.findByIdAndDelete(id);
  }

  async updateTicket(id: string, data: any) {
    return this.ticketModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteTicket(id: string) {
    return this.ticketModel.findByIdAndDelete(id);
  }

}