import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../database/schemas/event.schema';
import { Session, SessionDocument } from '../database/schemas/session.schema';
import { Ticket } from '../database/schemas/ticket.schema';
import { stat } from 'fs';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>,
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
        organizer_id: new Types.ObjectId(data.organizer_id), // Chuyển thành ObjectId nếu cần
      });
      return await event.save();
    } catch (error) {
      console.error('Create Event Error:', error);
      throw error;
    }
  }




  async getEvents(filter?: { event_type?: string }) {
    try {
      const query = filter?.event_type ? { event_type: filter.event_type } : {};
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

      // Tính min/max price cho từng event
      return events.map(event => {
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
      if (!event) throw new Error('Event not found');

      // Lấy các session của event
      const sessions = await this.sessionModel.find({ event_id: event._id }).lean();

      // Lấy vé cho từng session
      const sessionsWithTickets = await Promise.all(
        sessions.map(async (session) => {
          const tickets = await this.ticketModel.find({ session_id: session._id }).lean();
          return {
            ...session,
            tickets: tickets.map(ticket => ({
              name: ticket.ticket_name,
              price: ticket.ticket_price,
              // thêm các trường khác nếu cần
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
        event_type: event.event_type, // Thêm dòng này!
        sessions: sessionsWithTickets,
        min_price,
        max_price,
        status: event.status,
      };
    } catch (error) {
      console.error('Get Event Detail Error:', error);
      throw error;
    }
  }





  async updateStatus(eventId: string, status: string) {
    return this.eventModel.findByIdAndUpdate(eventId, { status }, { new: true });
  }




  async getEventsByOrganizer(organizerId: string) {
    try {
      const events = await this.eventModel.find({ organizer_id: new Types.ObjectId(organizerId) }).lean();
      const eventIds = events.map(e => e._id);

      // Lấy tất cả session theo eventIds
      const sessions = await this.sessionModel.find({ event_id: { $in: eventIds } }).lean();

      // Gom session theo event_id
      const sessionsByEvent: { [key: string]: any[] } = {};
      sessions.forEach(session => {
        const eid = session.event_id.toString();
        if (!sessionsByEvent[eid]) sessionsByEvent[eid] = [];
        sessionsByEvent[eid].push(session);
      });

      // Tính min/max thời gian cho từng event
      return events.map(event => {
        const eid = event._id.toString();
        const eventSessions = sessionsByEvent[eid] || [];
        const startTimes = eventSessions.map(s => s.start_time).filter(Boolean);
        const endTimes = eventSessions.map(s => s.end_time).filter(Boolean);

        const min_start_time = startTimes.length
          ? new Date(Math.min(...startTimes.map(d => new Date(d).getTime())))
          : null;
        const max_end_time = endTimes.length
          ? new Date(Math.max(...endTimes.map(d => new Date(d).getTime())))
          : null;

        return {
          id: event._id,
          title: event.title,
          image: event.image,
          status: event.status,
          min_start_time,
          max_end_time,
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

}




