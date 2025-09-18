import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Organizer } from '../database/schemas/organizer.schema';
import { Model, Types } from 'mongoose';
import { Event } from 'src/database/schemas/event.schema';
import { Order } from 'src/database/schemas/order.schema';
import { Account } from 'src/database/schemas/account.schema';
import { Session } from 'src/database/schemas/session.schema';

@Injectable()
export class OrganizerService {
  constructor(
    @InjectModel(Organizer.name) private readonly organizerModel: Model<Organizer>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    // @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
  ) { }


  async findByUser(user: any) {
    if (!user || !user.userId) throw new Error("Thiếu userId");
    // Chuyển userId sang ObjectId để so sánh với account_id
    return await this.organizerModel.findOne({ account_id: new Types.ObjectId(user.userId) });
  }

  async updateByUser(user: any, data: any) {
    return await this.organizerModel.findOneAndUpdate(
      { account_id: new Types.ObjectId(user.userId) }, // ép kiểu về ObjectId
      data,
      { new: true }
    );
  }

async getAdminOrganizerSummary() {
    const sessions = await this.sessionModel.find().lean();
    const sessionMap = new Map<string, any>();
    sessions.forEach(s => sessionMap.set(s._id.toString(), s));

    // Lấy danh sách organizer
    const organizers = await this.organizerModel.find().lean();

    // Lấy tất cả event
    const events = await this.eventModel.find().lean();

    // Lấy tất cả order
    const orders = await this.orderModel.find().lean();

    // Gom dữ liệu cho từng organizer
    const result = organizers.map(org => {
      const orgEvents = events.filter(e => e.organizer_id?.toString() === org._id.toString());
      const orgEventIds = orgEvents.map(e => e._id.toString());

      // Tổng doanh thu từ các order liên quan event của organizer này
      const orgOrders = orders.filter(o =>
        o.tickets.some(t => {
          const session = sessionMap.get(t.session_id?.toString?.() || "");
          return session && orgEventIds.includes(session.event_id?.toString?.() || "");
        })
      );

      // Tổng doanh thu
      const totalRevenue = orgOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      // Tổng vé đã bán (tính tổng số ticket của các event này)
      let totalTickets = 0;
      orgOrders.forEach(o => {
        totalTickets += o.tickets.filter(t => {
          const session = sessionMap.get(t.session_id?.toString?.() || "");
          return session && orgEventIds.includes(session.event_id?.toString?.() || "");
        }).length;
      });

      return {
        _id: org._id,
        name: org.name,
        email: org.email,
        description: org.description,
        social_link: org.social_link,
        bank_account_number: org.bank_account_number,
        bank_account_holder: org.bank_account_holder,
        bank_name: org.bank_name,
        status: (typeof org.account_id === "object" && org.account_id)
          ? (org.account_id as any).status || "active"
          : (org as any).status || "active",
        eventCount: orgEvents.length,
        totalRevenue,
        totalTickets,
        createdAt: (org as any).createdAt,
      };
    });

    // Top 5 doanh thu
    const topRevenue = [...result].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
    // Top 5 số sự kiện
    const topEvent = [...result].sort((a, b) => b.eventCount - a.eventCount).slice(0, 5);
    // Đăng ký theo ngày
    const regByDate: Record<string, number> = {};
    organizers.forEach(org => {
      const d = new Date((org as any).createdAt);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      regByDate[key] = (regByDate[key] || 0) + 1;
    });

    return {
      organizers: result,
      total: result.length,
      topRevenue,
      topEvent,
      regByDate,
    };
  }



  // Đổi trạng thái organizer
  async setOrganizerStatus(organizerId: string, status: string) {
    await this.organizerModel.findByIdAndUpdate(organizerId, { status });
    return true;
  }


}