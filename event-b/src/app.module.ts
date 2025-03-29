import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { UploadController } from './uploads/upload.controller';   
import { UploadService } from './uploads/upload.service';
import { UploadModule } from './uploads/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event-management'),
    AuthModule,
    UsersModule,
    DatabaseModule, 
    UploadModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, UploadService],
  
})
export class AppModule {}
