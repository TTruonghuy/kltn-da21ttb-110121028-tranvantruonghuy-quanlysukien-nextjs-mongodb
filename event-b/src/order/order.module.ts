import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';
import { PaymentController } from './payment.controller';
import { OrdersService } from './order.service';
import { Order, OrderSchema } from '../database/schemas/order.schema';
import { Ticket, TicketSchema } from '../database/schemas/ticket.schema';
import { User, UserSchema } from '../database/schemas/user.schema'; // Thêm dòng này
import { MailService } from 'src/mail/mail.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Ticket.name, schema: TicketSchema },
      { name: User.name, schema: UserSchema },
    ]),
    MailModule  
  ],
  controllers: [OrderController, PaymentController],
  providers: [OrdersService],
  exports: [],
})
export class OrderModule {}
