import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from '../database/schemas/account.schema';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService], // Xuất để module khác dùng
})
export class AccountModule {}
