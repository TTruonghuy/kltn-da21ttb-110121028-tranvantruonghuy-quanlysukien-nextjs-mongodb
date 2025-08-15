import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event, EventSchema } from '../database/schemas/event.schema';
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { AuthModule } from '../auth/auth.module'; // Import AuthModule để sử dụng JwtAuthGuard
import { Session, SessionSchema } from '../database/schemas/session.schema';
import { Ticket, TicketSchema } from '../database/schemas/ticket.schema';
import { Organizer, OrganizerSchema } from '../database/schemas/organizer.schema';
import { MailModule } from '../mail/mail.module'; // <-- THÊM DÒNG NÀY


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Session.name, schema: SessionSchema }, // BẮT BUỘC PHẢI CÓ DÒNG NÀY
      { name: Ticket.name, schema: TicketSchema },
      { name: Organizer.name, schema: OrganizerSchema },
    ]),
    JwtModule.register({}), // Đảm bảo JwtModule được import
    AuthModule, // Import AuthModule để sử dụng JwtAuthGuard
    MailModule,
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule { }
