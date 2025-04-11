import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ type: Types.ObjectId, ref: 'Organizer', required: true })
  organizer_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  start_time: Date;

  @Prop({ required: true })
  end_time: Date;

  @Prop()
  image: string;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);