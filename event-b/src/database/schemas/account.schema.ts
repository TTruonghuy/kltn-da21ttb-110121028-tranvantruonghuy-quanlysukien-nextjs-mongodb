import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccountDocument = Account & Document;
@Schema({timestamps: true})
export class Account {
    @Prop({ required: true, unique: true})
    email: string;

    @Prop({ required: true})
    password: string;

    @Prop({ required: true, enum: ['user','organizer','admin']})
    role: string;

    @Prop({ default: 'active', enum: ['active','inactive','banned']})
    status: string;

    @Prop({ default: false})
    is_verified: boolean;
}

export const AccountSchema = SchemaFactory.createForClass(Account);