import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SeatingChartDocument = SeatingChart & Document;

@Schema({ timestamps: true })
export class SeatingChart {
  @Prop({ type: Types.ObjectId, ref: 'Session', required: true })
  session_id: Types.ObjectId;

  @Prop({ type: Array, required: true })
  seats: Array<{
    seatId: string; // unique id cho ghế
    rowName: string; // tên hàng
    seatNumber: number; // số ghế trong hàng
    ticketType: string; // loại vé
    price: number; // giá vé
    sold: boolean; // đã bán chưa
    position: { left: number; top: number }; // vị trí trên canvas
  }>;

  @Prop({ type: Array, default: [] })
  ticketTypes: Array<{
    type: string;
    label: string;
    color: string; // màu nền cho loại vé
    price: number;
  }>;
}

export const SeatingChartSchema = SchemaFactory.createForClass(SeatingChart);