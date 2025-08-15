import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from '../database/schemas/ticket.schema';
import { Session, SessionSchema } from '../database/schemas/session.schema';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { SeatingChartSchema } from '../database/schemas/seatingticket.schema';
import { Order, OrderSchema } from '../database/schemas/order.schema'; // Thêm import schema Order

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Ticket', schema: TicketSchema },
      { name: 'Session', schema: SessionSchema },
      { name: 'SeatingChart', schema: SeatingChartSchema },
      { name: Order.name, schema: OrderSchema }, // Thêm Order để inject vào service
    ]),
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule { }