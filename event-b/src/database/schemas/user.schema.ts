import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  account_id: Types.ObjectId; // Đảm bảo kiểu dữ liệu là ObjectId

  @Prop({ required: true })
  name: string;

  @Prop()
  phone: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  avatar: string; // Thêm trường avatar

  @Prop()
  dob: Date;

  @Prop({ type: [String] })
  interest: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
