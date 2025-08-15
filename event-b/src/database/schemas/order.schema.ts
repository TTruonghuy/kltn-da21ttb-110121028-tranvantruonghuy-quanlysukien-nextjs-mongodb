import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type OrderDocument = Order & Document;

@Schema({ timestamps: true })

export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;
  @Prop({ required: true })
  email: string;
  @Prop({ type: Number, required: true })
  total_amount: number;
  @Prop({ type: String, default: 'pending', enum: ['pending', 'paid', 'cancelled', 'refunded'] })
  status: string;
  @Prop({ type: String })
  vnp_TxnRef: string;
  @Prop({ type: Object })
  vnp_Response: any;
  @Prop({
    type: String,
    default: 'VNPay',
    enum: ['VNPay', 'Cash', 'CreditCard', 'Paypal'] // Có thể thêm các phương thức thanh toán khác nếu cần
  })
  payment_method: string;
  @Prop({
    type: [
      {
        ticket_id: { type: Types.ObjectId, ref: 'Ticket', required: true },
        session_id: { type: Types.ObjectId, ref: 'Session', required: true },
        price: { type: Number, required: true },
        qr_code: { type: String }, // QR riêng cho từng vé
        status: { type: String, default: 'pending', enum: ['pending', 'valid', 'used', 'refunded'] },
        check_in_time: { type: Date, default: null },
      },
    ],
    required: true,
  })
  tickets: Array<{
    ticket_id: Types.ObjectId;
    session_id: Types.ObjectId;
    price: number;
    qr_code: string;
    status: string;
    check_in_time: Date | null;
  }>;
}
export const OrderSchema = SchemaFactory.createForClass(Order);