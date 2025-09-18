import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Controller, Post, Get, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { Ticket } from '../database/schemas/ticket.schema';
import * as QRCode from 'qrcode';


interface PopulatedOrder {
  _id: Types.ObjectId;
  createdAt: Date;
  status: string;
  total_amount: number;
  vnp_TxnRef?: string;
  payment_method?: string;
  user_id: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
  tickets: {
    ticket_id: {
      _id: Types.ObjectId;
      ticket_name: string;
      ticket_price: number;
    } | Types.ObjectId;
    session_id: {
      _id: Types.ObjectId;
      start_time: Date;
      end_time: Date;
      event_id: {
        _id: Types.ObjectId;
        title: string;
        location: {
          houseNumber: string;
          ward: string;
          district: string;
          province: string;
        };
      } | Types.ObjectId;
    } | Types.ObjectId;
    price: number;
    qr_code?: string;
    check_in_time?: Date;
    status?: string;
  }[];
}



interface AdminOrderTicket {
  session_id?: {
    event_id?: {
      _id: string;
      title: string;
    };
  };
  price?: number;
  check_in_time?: Date | null;
}

interface AdminOrder {
  _id: string;
  createdAt: Date;
  total_amount?: number;
  status: string;
  tickets?: AdminOrderTicket[];
}



@Controller('order')
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) { }

  async getOrderDetailsByUser(userId: Types.ObjectId) {
    const orders = await this.orderModel
      .find({ user_id: userId })
      .populate({ path: 'user_id', select: 'name email' })
      .populate({ path: 'tickets.ticket_id', select: 'ticket_name ticket_price' })
      .populate({
        path: 'tickets.session_id',
        populate: { path: 'event_id', select: 'title location' },
      })
      .lean<any>();
    console.log(`Found ${orders.length} orders for userId: ${userId}`);

    return orders.map(order => {
      const firstTicket = order.tickets[0];
      const session = firstTicket?.session_id;
      const event = session?.event_id;

      const ticketsGrouped = order.tickets.reduce((acc, t) => {
        const ticketName = t.ticket_id?.ticket_name;
        if (!acc[ticketName]) {
          acc[ticketName] = { ticketName, quantity: 0, price: t.price, total: 0 };
        }
        acc[ticketName].quantity += 1;
        acc[ticketName].total += t.price;
        return acc;
      }, {} as Record<string, any>);

      return {
        eventTitle: event?.title,
        sessionTime: {
          start: session?.start_time,
          end: session?.end_time
        },
        eventAddress: `${event?.location?.houseNumber}, ${event?.location?.ward}, ${event?.location?.district}, ${event?.location?.province}`,
        orderId: order._id,
        orderDate: order.createdAt,

        paymentMethod: order.vnp_TxnRef ? 'VNPay' : 'Khác',
        orderStatus: order.status,
        userName: order.user_id?.name,
        userEmail: order.user_id?.email,
        tickets: Object.values(ticketsGrouped),
        totalAmount: order.total_amount,
        qrCode: order.tickets[0]?.qr_code || null
      };
    });
  }

  async getOrderDetailsById(userId: Types.ObjectId, orderId: Types.ObjectId) {
    const order = await this.orderModel
      .findOne({ _id: orderId, user_id: userId }) // Đảm bảo order thuộc user
      .populate({ path: 'user_id', select: 'name email' })
      .populate({ path: 'tickets.ticket_id', select: 'ticket_name ticket_price' })
      .populate({
        path: 'tickets.session_id',
        populate: { path: 'event_id', select: 'title location' },
      })
      .lean<PopulatedOrder>();

    if (!order) {
      throw new NotFoundException('Order not found or not belonging to user');
    }

    const firstTicket = order.tickets[0];
    const session = firstTicket?.session_id as any;
    const event = session?.event_id as any;

    // Group tickets cho summary
    const ticketsGrouped = order.tickets.reduce((acc, t) => {
      const ticketName = (t.ticket_id as any)?.ticket_name;
      if (!acc[ticketName]) {
        acc[ticketName] = { type: ticketName, quantity: 0, price: t.price, total: 0 };
      }
      acc[ticketName].quantity += 1;
      acc[ticketName].total += t.price;
      return acc;
    }, {} as Record<string, any>);

    // Full tickets cho QR per vé (sử dụng index làm ticketId unique nếu cần, vì subdoc không có _id)
    const fullTickets = order.tickets.map((t, index) => ({
      ticketId: `${order._id}_${index}`, // Unique ID giả (hoặc dùng t.ticket_id + index)
      type: (t.ticket_id as any)?.ticket_name,
      price: t.price,
      qrData: t.qr_code || '', // qr_code từ schema
    }));

    return {
      eventTitle: event?.title,
      sessionTime: {
        start: session?.start_time,
        end: session?.end_time,
      },
      eventAddress: `${event?.location?.houseNumber}, ${event?.location?.ward}, ${event?.location?.district}, ${event?.location?.province}`,
      orderId: order._id,
      orderDate: order.createdAt,
      paymentMethod: order.payment_method || (order.vnp_TxnRef ? 'VNPay' : 'Khác'),
      orderStatus: order.status,
      userName: (order.user_id as any)?.name,
      userEmail: (order.user_id as any)?.email,
      tickets: Object.values(ticketsGrouped), // Grouped cho summary
      fullTickets, // Full list cho QR
      totalAmount: order.total_amount,
    };
  }

  async getAdminOrderSummary(from?: string, to?: string) {
    const match: any = {};
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    // Lấy tất cả đơn hàng
    const orders: AdminOrder[] = await this.orderModel.find(match)
      .populate({
        path: 'tickets.session_id',
        populate: { path: 'event_id', select: 'title' },
      })
      .lean() as unknown as AdminOrder[];

    // Tổng đơn hàng
    const totalOrders = orders.length;
    // Tổng doanh thu
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    // Tổng vé đã bán
    const totalTickets = orders.reduce((sum, o) => sum + (o.tickets?.length || 0), 0);
    // Vé đã check-in
    const checkedInTickets = orders.reduce(
      (sum, o) => sum + (o.tickets?.filter(t => t.check_in_time)?.length || 0), 0
    );

    // Doanh thu theo ngày
    const revenueByDate: Record<string, number> = {};
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      revenueByDate[key] = (revenueByDate[key] || 0) + (o.total_amount || 0);
    });

    // Tỷ lệ trạng thái đơn hàng
    const statusCount: Record<string, number> = {};
    orders.forEach(o => {
      statusCount[o.status] = (statusCount[o.status] || 0) + 1;
    });

    // Top 5 sự kiện theo doanh thu
    const eventRevenue: Record<string, { title: string, revenue: number }> = {};
    orders.forEach(o => {
      o.tickets?.forEach(t => {
        const event = t.session_id?.event_id;
        if (event && typeof event === 'object') {
          const eid = event._id.toString();
          if (!eventRevenue[eid]) eventRevenue[eid] = { title: event.title, revenue: 0 };
          eventRevenue[eid].revenue += t.price || 0;
        }
      });
    });
    const topEventsByRevenue = Object.values(eventRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top 5 sự kiện theo số vé bán ra
    const eventTickets: Record<string, { title: string, count: number }> = {};
    orders.forEach(o => {
      o.tickets?.forEach(t => {
        const event = t.session_id?.event_id;
        if (event && typeof event === 'object') {
          const eid = event._id.toString();
          if (!eventTickets[eid]) eventTickets[eid] = { title: event.title, count: 0 };
          eventTickets[eid].count += 1;
        }
      });
    });
    const topEventsByTickets = Object.values(eventTickets)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      totalTickets,
      checkedInTickets,
      revenueByDate,
      statusCount,
      topEventsByRevenue,
      topEventsByTickets,
    };
  }



}