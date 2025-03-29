import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrganizerDocument = Organizer & Document;

@Schema({ timestamps: true })
export class Organizer {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  account_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  description: string;

  @Prop()
  weblink: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop({ type: Object })
  social_link: object;

  @Prop()
  logo: string;

  @Prop({ default: 0 })
  events_created: number;
}

export const OrganizerSchema = SchemaFactory.createForClass(Organizer);
