import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { UserSchema } from '../database/schemas/user.schema'; 
import { OrganizerSchema } from '../database/schemas/organizer.schema';
import { EventSchema } from '../database/schemas/event.schema';
import { NewsSchema } from '../database/schemas/new.schema';
import { OrderSchema } from '../database/schemas/order.schema';
import { SessionSchema } from '../database/schemas/session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Organizer', schema: OrganizerSchema },
      { name: 'Event', schema: EventSchema },
      { name: 'News', schema: NewsSchema },
      { name: 'Order', schema: OrderSchema },
      { name: 'Session', schema: SessionSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}