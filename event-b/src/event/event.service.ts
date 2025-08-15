import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../database/schemas/event.schema';
import { Session, SessionDocument } from '../database/schemas/session.schema';
import { Ticket } from '../database/schemas/ticket.schema';
import { Organizer, OrganizerDocument } from 'src/database/schemas/organizer.schema';
import { stat } from 'fs';
import { MailService } from 'src/mail/mail.service';

type SessionStat = {
  sessionId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  soldTickets: number;
  totalTickets: number;
  revenue: number;
  checkin: number;
  notCheckin: number;
  checkinPercent: number;
  ticketTypes: { type: string; sold: number; total: number }[];
};


@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>,
    @InjectModel(Organizer.name) private readonly organizerModel: Model<OrganizerDocument>,
    private readonly mailService: MailService,
  ) { }



  async createEvent(data: {
    organizer_id: string;
    title: string;
    description: string;
    location: {
      houseNumber: string;
      ward: string;
      district: string;
      province: string;
    };
    event_type: string;
    image?: string
  }) {
    try {
      const event = new this.eventModel({
        ...data,
        pay_time: null,
        organizer_id: new Types.ObjectId(data.organizer_id), // Chuyển thành ObjectId
      });
      return await event.save();
    } catch (error) {
      console.error('Create Event Error:', error);
      throw error;
    }
  }




  async getEvents(filter?: { event_type?: string }) {
    try {
      const query: any = { status: "approved" };
      if (filter?.event_type) {
        query.event_type = filter.event_type;
      }

      const events = await this.eventModel.find(query).lean();
      // Lấy tất cả eventId
      const eventIds = events.map(e => e._id);

      // Lấy tất cả session theo eventIds
      const sessions = await this.sessionModel.find({ event_id: { $in: eventIds } }).lean();

      // Lấy tất cả ticket theo sessionIds
      const sessionIds = sessions.map(s => s._id);
      const tickets = await this.ticketModel.find({ session_id: { $in: sessionIds } }).lean();

      // Gom session theo event_id
      const sessionsByEvent: { [key: string]: any[] } = {};
      sessions.forEach(session => {
        const eid = session.event_id.toString();
        if (!sessionsByEvent[eid]) sessionsByEvent[eid] = [];
        sessionsByEvent[eid].push(session);
      });

      // Gom ticket theo session_id
      const ticketsBySession: { [key: string]: any[] } = {};
      tickets.forEach(ticket => {
        const sid = ticket.session_id.toString();
        if (!ticketsBySession[sid]) ticketsBySession[sid] = [];
        ticketsBySession[sid].push(ticket);
      });

      const now = new Date();

      return events
        .filter(event => {
          const eventSessions = sessionsByEvent[event._id.toString()] || [];
          // Giữ lại nếu có ít nhất 1 session chưa kết thúc
          return eventSessions.some(s => new Date(s.end_time) > now);
        })
        .map(event => {
          const eid = event._id.toString();
          const eventSessions = sessionsByEvent[eid] || [];
          const eventTickets = eventSessions.flatMap(session => ticketsBySession[session._id.toString()] || []);
          const prices = eventTickets.map(t => t.ticket_price);
          const min_price = prices.length ? Math.min(...prices) : 0;
          const max_price = prices.length ? Math.max(...prices) : 0;
          const startTimes = eventSessions.map(s => s.start_time).filter(Boolean);
          const min_start_time = startTimes.length
            ? new Date(Math.min(...startTimes.map(d => new Date(d).getTime())))
            : null;

          return {
            id: event._id,
            title: event.title,
            description: event.description,
            eventType: event.event_type,
            image: event.image,
            min_price,
            max_price,
            min_start_time,
          };
        });
    } catch (error) {
      console.error('Get Events Error:', error);
      throw error;
    }
  }


  async getEventDetail(eventId: string) {
    try {
      // Lấy event
      const event = await this.eventModel.findById(eventId).lean();
      if (!event) return null;

      let organizer: {
        name: string;
        logo: string;
        description: string;
        address?: string;
        weblink?: string;
        phone?: string;
        social_link?: object;
      } | null = null;

      if (event.organizer_id) {
        const org = await this.organizerModel.findById(event.organizer_id).lean();
        if (org) {
          organizer = {
            name: org.name,
            logo: org.logo || "",
            description: org.description || "",
            address: org.address || "",
            weblink: org.weblink || "",
            phone: org.phone || "",
            social_link: org.social_link || "",
          };
        }
      }
      // Lấy các session của event
      const sessions = await this.sessionModel.find({ event_id: event._id }).lean();

      // Lấy vé cho từng session
      const sessionsWithTickets = await Promise.all(
        sessions.map(async (session) => {
          const tickets = await this.ticketModel.find({ session_id: session._id }).lean();
          return {
            ...session,
            tickets: tickets.map(ticket => ({
              _id: ticket._id,
              name: ticket.ticket_name,
              price: ticket.ticket_price,
              description: ticket.description_ticket,
              ticket_quantity: ticket.ticket_quantity,
              min_per_order: ticket.min_per_order,
              max_per_order: ticket.max_per_order,
              sold_quantity: ticket.sold_quantity || 0,
            })),
          };
        })
      );

      // Tính min/max price
      const allTickets = sessionsWithTickets.flatMap(s => s.tickets);
      const prices = allTickets.map(t => t.price);
      const min_price = prices.length ? Math.min(...prices) : 0;
      const max_price = prices.length ? Math.max(...prices) : 0;



      return {
        id: event._id,
        title: event.title,
        description: event.description,
        image: event.image,
        location: {
          houseNumber: event.location.houseNumber,
          ward: event.location.ward,
          district: event.location.district,
          province: event.location.province,
        },
        event_type: event.event_type,
        sessions: sessionsWithTickets,
        min_price,
        max_price,

        status: event.status,
        organizer,
      };
    } catch (error) {
      console.error('Get Event Detail Error:', error);
      throw error;
    }
  }



  async updateStatus(eventId: string, status: string) {
    return this.eventModel.findByIdAndUpdate(eventId, { status }, { new: true });
  }


  async getEventsByOrganizer(organizerId: Types.ObjectId) {
    try {
      const events = await this.eventModel.find({ organizer_id: organizerId }).lean();
      const eventIds = events.map(e => e._id);

      const sessions = await this.sessionModel.find({ event_id: { $in: eventIds } }).lean();
      const sessionIds = sessions.map(s => s._id);

      const tickets = await this.ticketModel.find({ session_id: { $in: sessionIds } }).lean();

      const sessionsByEvent: { [key: string]: any[] } = {};
      sessions.forEach(session => {
        const eid = session.event_id.toString();
        if (!sessionsByEvent[eid]) sessionsByEvent[eid] = [];
        sessionsByEvent[eid].push(session);
      });

      console.log('Tickets found:', tickets.length);
      console.log('Sessions found:', sessions.length);

      return events.map(event => {
        const eid = event._id.toString();
        const eventSessions = sessionsByEvent[eid] || [];
        const eventSessionIds = eventSessions.map(s => s._id.toString());

        // Lấy tất cả vé của event
        const eventTickets = tickets.filter(t => eventSessionIds.includes(t.session_id.toString()));

        // Lấy thời gian bán vé sớm nhất & trễ nhất
        //  const saleStartTimes = eventTickets.map(t => t.sale_start_time).filter(Boolean);
        //  const saleEndTimes = eventTickets.map(t => t.sale_end_time).filter(Boolean);

        //  const min_sale_start_time = saleStartTimes.length
        // ? new Date(Math.min(...saleStartTimes.map(d => new Date(d).getTime())))
        //  : null;

        // Thời gian kết thúc cuối cùng của xuất (dùng để xác định sự kiện đã qua)
        const sessionEndTimes = eventSessions.map(s => s.end_time).filter(Boolean);
        const sessionStartTimes = eventSessions.map(s => s.start_time).filter(Boolean);
        const max_session_end_time = sessionEndTimes.length
          ? new Date(Math.max(...sessionEndTimes.map(d => new Date(d).getTime())))
          : null;
        
        const min_session_start_time = sessionStartTimes.length
          ? new Date(Math.min(...sessionStartTimes.map(d => new Date(d).getTime())))
          : null;

        // Thống kê vé
        //const eventSessionIds = eventSessions.map(s => s._id.toString());
        //const eventTickets = tickets.filter(t => eventSessionIds.includes(t.session_id.toString()));

        const total_sold = eventTickets.reduce((sum, t) => sum + (t.sold_quantity || 0), 0);
        const total_quantity = eventTickets.reduce((sum, t) => sum + (t.ticket_quantity || 0), 0);
        const total_revenue = eventTickets.reduce((sum, t) => sum + (t.ticket_price * (t.sold_quantity || 0)), 0);
        console.log('Tickets found:', tickets.length);
        console.log('Sessions found:', sessions.length);

        return {
          _id: event._id,
          title: event.title,
          image: event.image,
          status: event.status,
          min_start_time: min_session_start_time,
          max_end_time: max_session_end_time,
          total_sold,
          remaining: total_quantity - total_sold,
          total_revenue
        };
      });
    } catch (error) {
      console.error('Get Events By Organizer Error:', error);
      throw error;
    }
  }


  async updateEvent(eventId: string, data: any) {
    return this.eventModel.findByIdAndUpdate(eventId, data, { new: true });
  }


  async getTopEventsByTickets(limit = 6) {
    const now = new Date();

    // Lấy tất cả eventId
    const events = await this.eventModel.find({ status: "approved" }).lean();
    const eventIds = events.map(e => e._id);

    // Lấy tất cả session theo eventIds, CHỈ lấy session chưa qua
    const sessions = await this.sessionModel.find({
      event_id: { $in: eventIds },
      end_time: { $gte: now } // session còn diễn ra hoặc chưa diễn ra
    }).lean();

    const sessionIds = sessions.map(s => s._id);

    if (sessions.length === 0) {
      return []; // Không có sự kiện nào còn phiên diễn
    }

    // Lấy tất cả ticket theo sessionIds
    const tickets = await this.ticketModel.find({
      session_id: { $in: sessionIds }
    }).lean();

    // Gom ticket theo event_id và tính tổng sold_quantity
    const soldByEvent: Record<string, number> = {};
    sessions.forEach(session => {
      const eid = session.event_id.toString();
      const sessionTickets = tickets.filter(t => t.session_id.toString() === session._id.toString());
      const sold = sessionTickets.reduce((sum, t) => sum + (t.sold_quantity || 0), 0);
      soldByEvent[eid] = (soldByEvent[eid] || 0) + sold;
    });

    // Sắp xếp và lấy top
    const topEventIds = Object.entries(soldByEvent)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([eid]) => eid);

    // Lấy thông tin event
    const topEvents = events.filter(e => topEventIds.includes(e._id.toString()));

    // Đảm bảo đúng thứ tự
    topEvents.sort((a, b) => topEventIds.indexOf(a._id.toString()) - topEventIds.indexOf(b._id.toString()));

    return topEvents.map(e => ({
      id: e._id,
      title: e.title,
      image: e.image,
      description: e.description,
    }));
  }


  async getEventDashboard(eventId: string) {
    const eventObjectId = new Types.ObjectId(eventId);

    // 1. Lấy thông tin sự kiện
    const event = await this.eventModel.findById(eventObjectId).lean();
    if (!event) return { error: 'Event not found' };

    // 2. Lấy tất cả session của event
    const sessions = await this.sessionModel.find({ event_id: eventObjectId }).sort({ start_time: 1 }).lean();

    // 3. Lấy tất cả ticket của event (qua session)
    const sessionIds = sessions.map(s => s._id);
    const tickets = await this.ticketModel.find({ session_id: { $in: sessionIds } }).lean();

    // 4. Lấy tất cả order đã thanh toán của event (qua session)
    const OrderModel = (await import('../database/schemas/order.schema')).Order;
    const orders = await this.eventModel.db.model('Order').find({
      status: 'paid',
      'tickets.session_id': { $in: sessionIds }
    }).lean();

    const checkinHistory: {
      ticketId: string;
      ticketName: string;
      userName?: string;
      sessionId: string;
      sessionStart: Date | null;
      checkinTime: Date;
    }[] = [];

    for (const order of orders) {
      for (const ot of order.tickets) {
        if (ot.status === 'used' && ot.check_in_time) {
          // Tìm ticket và session
          const ticketObj = tickets.find(t => t._id.toString() === ot.ticket_id.toString());
          const sessionObj = sessions.find(s => s._id.toString() === ot.session_id.toString());
          checkinHistory.push({
            ticketId: ot.ticket_id,
            ticketName: ticketObj?.ticket_name || '',
            userName: order.name || order.email || '', // tuỳ dữ liệu order
            sessionId: ot.session_id,
            sessionStart: sessionObj?.start_time || null,
            checkinTime: ot.check_in_time,
          });
        }
      }
    }

    // 5. Tổng số vé đã bán, tổng vé
    let soldTickets = 0, totalTickets = 0, totalRevenue = 0;
    let dailySalesMap: Record<string, { tickets: number, revenue: number }> = {};
    let weeklyRevenueMap: Record<string, number> = {};

    for (const order of orders) {
      totalRevenue += order.total_amount;
      const orderDate = new Date(order.createdAt);
      const dateStr = orderDate.toISOString().slice(0, 10);
      const weekStr = `${orderDate.getFullYear()}-W${Math.ceil(orderDate.getDate() / 7)}`;
      dailySalesMap[dateStr] = dailySalesMap[dateStr] || { tickets: 0, revenue: 0 };
      dailySalesMap[dateStr].tickets += order.tickets.length;
      dailySalesMap[dateStr].revenue += order.total_amount;
      weeklyRevenueMap[weekStr] = (weeklyRevenueMap[weekStr] || 0) + order.total_amount;

      soldTickets += order.tickets.length;
    }
    totalTickets = tickets.reduce((sum, t) => sum + (t.ticket_quantity || 0), 0);

    // 6. Thống kê từng phiên/session
    const sessionStats: SessionStat[] = [];
    for (const session of sessions) {
      // Vé của phiên này
      const sessionTickets = tickets.filter(t => t.session_id.toString() === session._id.toString());
      const sessionTotalTickets = sessionTickets.reduce((sum, t) => sum + (t.ticket_quantity || 0), 0);

      // Vé đã bán của phiên này
      let sessionSoldTickets = 0, sessionRevenue = 0, checkin = 0;
      let ticketTypes: Record<string, { sold: number, total: number }> = {};

      for (const t of sessionTickets) {
        ticketTypes[t.ticket_name] = { sold: 0, total: t.ticket_quantity || 0 };
      }

      for (const order of orders) {
        for (const ot of order.tickets) {
          if (ot.session_id.toString() === session._id.toString()) {
            sessionSoldTickets++;
            sessionRevenue += ot.price || 0;
            // Check-in
            if (ot.status === 'used' && ot.check_in_time) checkin++;
            // Loại vé
            const ticketObj = sessionTickets.find(t => t._id.toString() === ot.ticket_id.toString());
            if (ticketObj) {
              ticketTypes[ticketObj.ticket_name].sold++;
            }
          }
        }
      }

      const ticketTypesArr = Object.entries(ticketTypes).map(([type, stat]) => ({
        type,
        sold: stat.sold,
        total: stat.total
      }));


      sessionStats.push({
        sessionId: session._id,
        startTime: session.start_time,
        endTime: session.end_time,
        soldTickets: sessionSoldTickets,
        totalTickets: sessionTotalTickets,
        revenue: sessionRevenue,
        checkin,
        notCheckin: sessionSoldTickets - checkin,
        checkinPercent: sessionSoldTickets ? Math.round((checkin / sessionSoldTickets) * 100) : 0,
        ticketTypes: ticketTypesArr
      });
    }

    // 7. Chuẩn bị dữ liệu cho FE
    return {
      eventId: event._id,
      title: event.title,
      totalRevenue,
      totalTickets,
      soldTickets,
      soldPercent: totalTickets ? Math.round((soldTickets / totalTickets) * 100) : 0,
      dailySales: Object.entries(dailySalesMap).map(([date, stat]) => ({
        date,
        tickets: stat.tickets,
        revenue: stat.revenue
      })),
      weeklyRevenue: Object.entries(weeklyRevenueMap).map(([week, revenue]) => ({
        week,
        revenue
      })),
      sessions: sessionStats,
      checkinHistory,
    };
  }

  async getAdminEvents(
    tab: 'approval' | 'selling' | 'past',
    search?: string,
  ) {
    console.log('Received tab:', tab, 'search:', search);
    const now = new Date();
    const filter: any = {};

    // Lọc theo tab
    if (tab === 'approval') {
      filter.status = 'approval';
    } else if (tab === 'selling') {
      filter.status = 'approved';
    }

    // Lọc theo tên
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // ===== Đếm số lượng từng loại sự kiện =====
    const allSessions = await this.sessionModel.find().lean();

    // Gom session theo event_id
    const sessionsByEventForCount: Record<string, any[]> = {};
    allSessions.forEach(s => {
      const eid = s.event_id.toString();
      if (!sessionsByEventForCount[eid]) sessionsByEventForCount[eid] = [];
      sessionsByEventForCount[eid].push(s);
    });

    // Đếm
    let approvalCount = 0;
    let sellingCount = 0;
    let pastCount = 0;

    // Đếm số lượng sự kiện theo điều kiện giống với filter hiển thị
    const allEvents = await this.eventModel.find().lean();
    allEvents.forEach(e => {
      const sessions = sessionsByEventForCount[e._id.toString()] || [];
      if (e.status === 'approval') {
        approvalCount++;
      }
      if (e.status === 'approved') {
        if (sessions.some(s => new Date(s.end_time) > now)) {
          sellingCount++;
        }
      }
      // Đếm pastCount chỉ dựa vào thời gian, không quan tâm trạng thái
      if (sessions.length > 0 && sessions.every(s => new Date(s.end_time) < now)) {
        pastCount++;
      }
    });

    // Lấy events
    const events = await this.eventModel.find(filter).sort({ createdAt: -1 }).lean();
    console.log('Found events:', events.length);
    // Lấy sessions và tickets cho các event
    const eventIds = events.map(e => e._id);
    const sessions = await this.sessionModel.find({ event_id: { $in: eventIds } }).lean();
    const sessionIds = sessions.map(s => s._id);
    const tickets = await this.ticketModel.find({ session_id: { $in: sessionIds } }).lean();

    // Gom session theo event
    const sessionsByEvent: Record<string, any[]> = {};
    sessions.forEach(s => {
      const eid = s.event_id.toString();
      if (!sessionsByEvent[eid]) sessionsByEvent[eid] = [];
      sessionsByEvent[eid].push(s);
    });

    // Gom ticket theo session
    const ticketsBySession: Record<string, any[]> = {};
    tickets.forEach(t => {
      const sid = t.session_id.toString();
      if (!ticketsBySession[sid]) ticketsBySession[sid] = [];
      ticketsBySession[sid].push(t);
    });

    // Lọc lại theo thời gian cho tab "selling" và "past"
    const filteredEvents = events.filter(event => {
      const eventSessions = sessionsByEvent[event._id.toString()] || [];
      if (tab === 'selling') {
        // Có ít nhất 1 session chưa qua
        return eventSessions.some(s => new Date(s.end_time) > now);
      }
      if (tab === 'past') {
        // Tất cả session đã qua
        return eventSessions.length > 0 && eventSessions.every(s => new Date(s.end_time) < now);
      }
      return true;
    });

    // Chuẩn bị dữ liệu trả về, thêm counts
    const preparedEvents = filteredEvents.map(event => {
      const eventSessions = sessionsByEvent[event._id.toString()] || [];
      return {
        _id: event._id,
        title: event.title,
        status: event.status,
        //createdAt: event.createdAt,
        sessions: eventSessions.map(s => ({
          _id: s._id,
          start_time: s.start_time,
          end_time: s.end_time,
          tickets: (ticketsBySession[s._id.toString()] || []).map(t => ({
            ticket_name: t.ticket_name,
            ticket_price: t.ticket_price,
            ticket_quantity: t.ticket_quantity,
            sold_quantity: t.sold_quantity || 0,
          })),
        })),
      };
    });

    return {
      events: preparedEvents,
      counts: {
        approval: approvalCount,
        selling: sellingCount,
        past: pastCount,
      },
    };
  }


  async getEventsForPayment(showPaid = false) {
    const now = new Date();
    const holdingPeriod = 7 * 24 * 60 * 60 * 1000; // 7 ngày (ms)
    const events = await this.eventModel.find().lean();
    const eventIds = events.map(e => e._id);
    const sessions = await this.sessionModel.find({ event_id: { $in: eventIds } }).lean();
    const tickets = await this.ticketModel.find().lean();
    const organizers = await this.organizerModel.find().lean();

    // Gom session theo event
    const sessionsByEvent: Record<string, any[]> = {};
    sessions.forEach(s => {
      const eid = s.event_id.toString();
      if (!sessionsByEvent[eid]) sessionsByEvent[eid] = [];
      sessionsByEvent[eid].push(s);
    });

    // Gom ticket theo session
    const ticketsBySession: Record<string, any[]> = {};
    tickets.forEach(t => {
      const sid = t.session_id.toString();
      if (!ticketsBySession[sid]) ticketsBySession[sid] = [];
      ticketsBySession[sid].push(t);
    });

    return events
      .filter(event => {
        const eventSessions = sessionsByEvent[event._id.toString()] || [];
        // Chỉ lấy event có ít nhất 1 session và tất cả session đã kết thúc + 7 ngày
        if (eventSessions.length === 0) return false;
        const maxEnd = Math.max(...eventSessions.map(s => new Date(s.end_time).getTime()));
        const allEnded7Days = now.getTime() - maxEnd >= holdingPeriod;
        if (!allEnded7Days) return false;
        if (!showPaid) return event.status !== "paid";
        return true;
      })
      .map(event => {
        const eventSessions = sessionsByEvent[event._id.toString()] || [];
        const eventSessionIds = eventSessions.map(s => s._id.toString());
        const eventTickets = eventSessionIds.flatMap(sid => ticketsBySession[sid] || []);
        const totalRevenue = eventTickets.reduce((sum, t) => sum + (t.ticket_price * (t.sold_quantity || 0)), 0);
        const totalSold = eventTickets.reduce((sum, t) => sum + (t.sold_quantity || 0), 0);
        const minStart = eventSessions.length ? new Date(Math.min(...eventSessions.map(s => new Date(s.start_time).getTime()))) : null;
        const maxEnd = eventSessions.length ? new Date(Math.max(...eventSessions.map(s => new Date(s.end_time).getTime()))) : null;
        const organizer = organizers.find(o => o._id.toString() === event.organizer_id.toString());
        return {
          _id: event._id,
          title: event.title,
          min_start_time: minStart,
          max_end_time: maxEnd,
          totalRevenue,
          totalSold,
          pay_time: event.pay_time,
          status: event.status,
          organizer: organizer
            ? {
              name: organizer.name,
              bank_account_number: organizer.bank_account_number,
              bank_account_holder: organizer.bank_account_holder,
              bank_name: organizer.bank_name,
              email: organizer.email,
            }
            : null,
        };
      });
  }

  async confirmEventPayment(
    eventId: string,
    file: Express.Multer.File

  ) {
    const pay_time = new Date();
    const event = await this.eventModel.findByIdAndUpdate(
      eventId,
      { status: "paid", pay_time },
      { new: true }
    ).lean();

    if (!event) throw new Error("Không tìm thấy sự kiện!");

    // Lấy organizer
    const organizer = await this.organizerModel.findById(event.organizer_id).lean();

    // Lấy sessions và tickets để tính doanh thu, số vé
    const sessions = await this.sessionModel.find({ event_id: event._id }).lean();
    const sessionIds = sessions.map(s => s._id);
    const tickets = await this.ticketModel.find({ session_id: { $in: sessionIds } }).lean();

    const totalRevenue = tickets.reduce((sum, t) => sum + (t.ticket_price * (t.sold_quantity || 0)), 0);
    const totalSold = tickets.reduce((sum, t) => sum + (t.sold_quantity || 0), 0);
    const commission = Math.round(totalRevenue * 0.1);
    const paymentAmount = totalRevenue - commission;

    // Gửi email cho organizer
    if (organizer?.email) {
      await this.mailService.sendPaymentEmail(
        organizer.email,
        {
          eventTitle: event.title,
          organizerName: organizer.name,
          totalRevenue,
          commission,
          paymentAmount,
          //fileUrl,
          pay_time,
          // note,
          bank_account_number: organizer.bank_account_number,
          bank_account_holder: organizer.bank_account_holder,
          bank_name: organizer.bank_name,
        },
        file
      );
    }

    // Có thể lưu fileUrl và note vào bảng riêng nếu muốn
    return { success: true, pay_time };
  }

}




