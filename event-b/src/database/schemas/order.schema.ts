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

  @Prop({ type: String, default: 'pending', enum: ['pending', 'paid', 'cancel', 'refunded'] })
  status: string;

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

  @Prop({
    type: {
      txnRef: { type: String },           // Mã đơn hàng gửi sang VNPay (thường = orderId)
      transactionNo: { type: String },    // Mã giao dịch VNPay trả về
      bankCode: { type: String },         // Ngân hàng thanh toán
      bankTrace: { type: String },        // Số trace của ngân hàng
      payDate: { type: Date },               // Ngày giờ thanh toán
      refundStatus: {                     // Trạng thái hoàn tiền
        type: String,
        enum: ['none', 'pending', 'refunded', 'failed'],
        default: 'none'
      },
      refundTxnNo: { type: String },      // Mã giao dịch hoàn tiền VNPay trả về khi refund
    },
    default: {}
  })
  payment: {
    txnRef?: string;
    transactionNo?: string;
    bankCode?: string;
    bankTrace?: string;
    payDate?: Date;
    refundStatus?: 'none' | 'pending' | 'refunded' | 'failed';
    refundTxnNo?: string;
  };
}

export const OrderSchema = SchemaFactory.createForClass(Order);