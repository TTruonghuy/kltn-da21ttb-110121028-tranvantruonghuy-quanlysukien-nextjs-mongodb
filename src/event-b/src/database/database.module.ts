import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './schemas/account.schema';
import { User, UserSchema } from './schemas/user.schema';
import { Organizer, OrganizerSchema } from './schemas/organizer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: User.name, schema: UserSchema },
      { name: Organizer.name, schema: OrganizerSchema },
    ]),
  ],
  exports: [MongooseModule], // Export để module khác có thể sử dụng
})
export class DatabaseModule {}
