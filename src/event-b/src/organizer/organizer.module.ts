import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Organizer, OrganizerSchema } from '../database/schemas/organizer.schema';
import { OrganizerController } from './organizer.controller';
import { OrganizerService } from './organizer.service';
import { Session, SessionSchema } from '../database/schemas/session.schema';
import { Order, OrderSchema } from '../database/schemas/order.schema';
import { Ticket, TicketSchema } from '../database/schemas/ticket.schema';
import { Event, EventSchema } from '../database/schemas/event.schema'
//import { Account } from '../database/schemas/account.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organizer.name, schema: OrganizerSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Ticket.name, schema: TicketSchema },
      { name: Event.name, schema: EventSchema },
      //{ name: Account.name, schema: Account.schema },
    ]),
  ],
  controllers: [OrganizerController],
  providers: [OrganizerService],
  exports: [OrganizerService],
})
export class OrganizerModule {}