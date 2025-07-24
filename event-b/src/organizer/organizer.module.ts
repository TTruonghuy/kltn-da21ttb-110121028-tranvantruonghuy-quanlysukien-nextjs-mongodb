import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Organizer, OrganizerSchema } from '../database/schemas/organizer.schema';
import { OrganizerController } from './organizer.controller';
import { OrganizerService } from './organizer.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Organizer.name, schema: OrganizerSchema }]),
  ],
  controllers: [OrganizerController],
  providers: [OrganizerService],
  exports: [OrganizerService],
})
export class OrganizerModule {}