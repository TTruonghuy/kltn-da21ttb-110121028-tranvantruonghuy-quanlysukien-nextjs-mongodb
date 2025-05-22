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

  @Prop({
    type: {
      houseNumber: { type: String, required: true },
      ward: { type: String, required: true },
      district: { type: String, required: true },
      province: { type: String, required: true },
    },
    required: true,
  })
  location: {
    houseNumber: string;
    ward: string;
    district: string;
    province: string;
  };

  @Prop()
  image: string;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: string;

  @Prop({ required: true, enum: ['âm nhạc', 'văn hóa nghệ thuật', 'thể thao', 'khác'] })
  event_type: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);