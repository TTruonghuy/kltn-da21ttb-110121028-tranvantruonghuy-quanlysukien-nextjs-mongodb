import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document<Types.ObjectId>;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event_id: Types.ObjectId;

  @Prop({ required: true })
  start_time: Date;

  @Prop({ required: true })
  end_time: Date;

  @Prop({ default: 'active', enum: ['active', 'inactive'] })
  status: string;
}


export const SessionSchema = SchemaFactory.createForClass(Session);