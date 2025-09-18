import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { News, NewsSchema } from '../database/schemas/new.schema';
import { NewController } from './new.controller';
import { NewService } from './new.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }])],
  controllers: [NewController],
  providers: [NewService],
  exports: [NewService],
})
export class NewModule {}