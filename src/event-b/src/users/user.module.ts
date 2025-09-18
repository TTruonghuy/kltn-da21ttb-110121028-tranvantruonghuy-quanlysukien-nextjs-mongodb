import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../database/schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Account, AccountSchema } from 'src/database/schemas/account.schema';
import { Order, OrderSchema } from 'src/database/schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Order.name, schema: OrderSchema }
    ])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}