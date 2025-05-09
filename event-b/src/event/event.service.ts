import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../database/schemas/event.schema';

@Injectable()
export class EventService {
  constructor(@InjectModel(Event.name) private readonly eventModel: Model<Event>) {}

  async createEvent(data: { 
    organizer_id: string; 
    title: string; 
    description: string; 
    location: string; 
    start_time: Date; 
    end_time: Date; 
    event_type: string;
    image?: string }) {
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

  async getEvents(filter?: { event_type?: string }): Promise<Event[]> {
    try {
      const query = filter?.event_type ? { event_type: filter.event_type } : {};
      return await this.eventModel.find(query).exec();
    } catch (error) {
      console.error('Get Events Error:', error);
      throw error;
    }
  }

  

}
