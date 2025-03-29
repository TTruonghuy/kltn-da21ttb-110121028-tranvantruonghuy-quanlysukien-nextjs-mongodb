import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from 'src/database/schemas/account.schema';

@Injectable()
export class AccountService {
  constructor(@InjectModel(Account.name) private accountModel: Model<AccountDocument>) {}

  async findByEmail(email: string) {
    return this.accountModel.findOne({ email }).exec();
  }

  async findById(id: string) {
    return this.accountModel.findById(id).exec();
  }

  async create(data: Partial<Account>) {
    const newAccount = new this.accountModel(data);
    return newAccount.save();
  }
}
