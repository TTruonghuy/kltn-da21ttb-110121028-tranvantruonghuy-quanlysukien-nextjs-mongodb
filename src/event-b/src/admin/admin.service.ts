import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../database/schemas/user.schema'; // Thay bằng path schemas của bạn
import { Organizer, OrganizerDocument } from '../database/schemas/organizer.schema';
import { Event, EventDocument } from '../database/schemas/event.schema';
import { News, NewsDocument } from '../database/schemas/new.schema';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { Session, SessionDocument } from '../database/schemas/session.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Organizer.name) private organizerModel: Model<OrganizerDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(News.name) private newsModel: Model<NewsDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async getStats() {
    const usersCount = await this.userModel.countDocuments();
    const organizersCount = await this.organizerModel.countDocuments();
    const eventsCount = await this.eventModel.countDocuments();
    const newsCount = await this.newsModel.countDocuments();
    const totalOrders = await this.orderModel.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } },
    ]);
    const totalRevenue = (totalOrders[0]?.total || 0) * 0.1; // 10% doanh thu web

    return { usersCount, organizersCount, eventsCount, newsCount, totalRevenue };
  }

  async getRevenueChart() {
    // Doanh thu theo tháng (ví dụ 12 tháng gần nhất)
    const revenueData = await this.orderModel.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: '$total_amount' },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);
    const labels = revenueData.map(d => d._id);
    const data = revenueData.map(d => d.total * 0.1); // 10%
    return { labels, data };
  }

  async getEventsChart() {
    // Số sự kiện mới theo tháng
    const eventsData = await this.eventModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);
    const labels = eventsData.map(d => d._id);
    const data = eventsData.map(d => d.count);
    return { labels, data };
  }

  async getTopOrganizersRevenue(top = 5) {
    const topOrgs = await this.orderModel.aggregate([
      { $match: { status: 'paid' } },
      { $unwind: '$tickets' },
      { $lookup: { from: 'sessions', localField: 'tickets.session_id', foreignField: '_id', as: 'session' } },
      { $unwind: '$session' },
      { $lookup: { from: 'events', localField: 'session.event_id', foreignField: '_id', as: 'event' } },
      { $unwind: '$event' },
      {
        $group: {
          _id: '$event.organizer_id',
          total: { $sum: '$tickets.price' },
        },
      },
      { $sort: { total: -1 } },
      { $limit: top },
      { $lookup: { from: 'organizers', localField: '_id', foreignField: '_id', as: 'org' } },
      { $unwind: '$org' },
      { $project: { name: '$org.name', total: 1 } },
    ]);
    const labels = topOrgs.map(o => o.name);
    const data = topOrgs.map(o => o.total);
    return { labels, data };
  }

  async getTopOrganizersEvents(top = 5) {
    const topOrgs = await this.eventModel.aggregate([
      { $group: { _id: '$organizer_id', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: top },
      { $lookup: { from: 'organizers', localField: '_id', foreignField: '_id', as: 'org' } },
      { $unwind: '$org' },
      { $project: { name: '$org.name', count: 1 } },
    ]);
    const labels = topOrgs.map(o => o.name);
    const data = topOrgs.map(o => o.count);
    return { labels, data };
  }

  async getTopUsersSpending(top = 5) {
    const topUsers = await this.orderModel.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$user_id', total: { $sum: '$total_amount' } } },
      { $sort: { total: -1 } },
      { $limit: top },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', total: 1 } },
    ]);
    const labels = topUsers.map(u => u.name);
    const data = topUsers.map(u => u.total);
    return { labels, data };
  }

  async getRecentOrders(limit = 5) {
    return this.orderModel.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async getUpcomingEvents(limit = 5) {
    const now = new Date();
    const upcomingSessions = await this.sessionModel.find({ start_time: { $gte: now } }).sort({ start_time: 1 }).limit(limit).lean();
    const eventIds = upcomingSessions.map(s => s.event_id);
    return this.eventModel.find({ _id: { $in: eventIds } }).lean();
  }

  async getRecentNews(limit = 5) {
    return this.newsModel.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  }
}