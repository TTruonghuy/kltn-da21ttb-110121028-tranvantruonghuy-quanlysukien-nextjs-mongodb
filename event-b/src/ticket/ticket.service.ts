import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket } from '../database/schemas/ticket.schema';
import { Session, SessionDocument } from '../database/schemas/session.schema';


@Injectable()
export class TicketService {
  constructor(
    @InjectModel('Ticket') private readonly ticketModel: Model<Ticket>,
    @InjectModel('Session') private readonly sessionModel: Model<SessionDocument>,
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

  async createTicket(data: Partial<Ticket>): Promise<Ticket> {
    try {
      const ticket = new this.ticketModel(data);
      return await ticket.save();
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

}