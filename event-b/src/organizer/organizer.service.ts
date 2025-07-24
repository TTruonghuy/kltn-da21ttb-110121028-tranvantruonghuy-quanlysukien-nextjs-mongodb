import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Organizer } from '../database/schemas/organizer.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class OrganizerService {
  constructor(
    @InjectModel(Organizer.name) private readonly organizerModel: Model<Organizer>,
  ) {}


async findByUser(user: any) {
  if (!user || !user.userId) throw new Error("Thiếu userId");
  // Chuyển userId sang ObjectId để so sánh với account_id
  return await this.organizerModel.findOne({ account_id: new Types.ObjectId(user.userId) });
}

async updateByUser(user: any, data: any) {
  return await this.organizerModel.findOneAndUpdate(
    { account_id: new Types.ObjectId(user.userId) }, // ép kiểu về ObjectId
    data,
    { new: true }
  );
}
}