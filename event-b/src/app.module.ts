import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { EventModule } from './event/event.module';
import { TicketModule } from './ticket/ticket.module';
import { OrganizerModule } from './organizer/organizer.module'; 
import { OrderModule } from './order/order.module';
import { UserModule } from './users/user.module';
import { MailModule } from './mail/mail.module';
import { NewModule } from './new/new.module';
import { AdminModule } from './admin/admin.module';



@Module({
  imports: [
    ConfigModule.forRoot(), 
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event-management'),
    AuthModule,
    DatabaseModule, 
    EventModule,
    TicketModule,
    OrganizerModule,
    OrderModule,
    UserModule,
    NewModule,
    AdminModule
    //MailModule
  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}
