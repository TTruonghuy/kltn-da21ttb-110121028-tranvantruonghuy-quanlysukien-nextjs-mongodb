import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Ticket extends Document {
  
  @Prop({ type: Types.ObjectId, ref: 'Session', required: true })
  session_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  ticket_name: string;

  @Prop({ type: Number, required: true })
  ticket_price: number;

  @Prop({ type: Number, required: true })
  ticket_quantity: number;

  @Prop({ type: Number, required: true })
  min_per_order: number;

  @Prop({ type: Number, required: true })
  max_per_order: number;

  @Prop({ type: Date, required: true })
  sale_start_time: Date;

  @Prop({ type: Date, required: true })
  sale_end_time: Date;

  @Prop({ type: String })
  description_ticket: string;

  @Prop({ type: String })
  image: string;

  @Prop({ type: Number, default: 0 })
  sold_quantity: number;

  @Prop({ type: String, })
  qr_code: string;

  @Prop({ type: String, enum: ['active', 'inactive'], default: 'active' })
  status: string;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);