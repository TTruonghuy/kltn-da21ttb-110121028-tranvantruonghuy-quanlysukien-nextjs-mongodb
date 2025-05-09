import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from '../database/schemas/ticket.schema';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>,
  ) {}

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