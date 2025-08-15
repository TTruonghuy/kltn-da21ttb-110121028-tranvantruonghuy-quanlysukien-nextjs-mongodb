import { Controller, Post, Put, Body, UseGuards, Req, Res, UseInterceptors, UploadedFile, Get, Param, Query, Inject } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/auth.controller';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { bucket } from 'src/config/firebase.config';
import { InjectModel } from '@nestjs/mongoose';
import { Organizer, OrganizerDocument } from '../database/schemas/organizer.schema';
import { Model, Types } from 'mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';



@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,private readonly mailService: MailService,
    @InjectModel(Organizer.name) private readonly organizerModel: Model<OrganizerDocument>,
  ) { }


  @Get('payment-list')
  @UseGuards(JwtAuthGuard)
  async getEventsForPayment(@Query('showPaid') showPaid?: string) {
    return this.eventService.getEventsForPayment(showPaid === "true");
  }

  @Put(':id/confirm-payment')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async confirmEventPayment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.eventService.confirmEventPayment(id, file);
  }



  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateEvent(
    @Param('id') id: string,
    @Body() body: any, // Consider using a DTO here
    @Res() res: Response
  ) {
    try {
      const updated = await this.eventService.updateEvent(id, body);
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ message: 'Update failed', error: error.message });
    }
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.eventService.updateStatus(id, body.status);
  }

  @Get('top-events')
  async getTopEvents(@Res() res: Response) {
    try {
      const events = await this.eventService.getTopEventsByTickets(6);
      return res.status(200).json(events);
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }


  @Get('my-events')
  @UseGuards(JwtAuthGuard)
  async getMyEvents(@Req() req: RequestWithUser, @Res() res: Response) {
    try {
      const accountId = req.user?.userId;
      console.log('accountId from token:', accountId);

      // Ép sang ObjectId để tìm kiếm
      const organizer = await this.organizerModel.findOne({
        account_id: new Types.ObjectId(accountId),
      });

      console.log('Found organizer:', organizer);

      if (!organizer) {
        return res.status(404).send({ message: 'Organizer not found' });
      }
      console.log('Calling getEventsByOrganizer with organizerId:', organizer._id);
      const events = await this.eventService.getEventsByOrganizer(organizer._id as Types.ObjectId);

      return res.status(200).send({ events });
    } catch (error) {
      console.error('Error in getMyEvents:', error);
      return res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  }

  @Get('list')
  async getEvents(
    @Query('event_type') eventType?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    try {
      const filter: any = {};
      if (eventType) filter.event_type = eventType;
      if (status) filter.status = status;
      if (search) filter.title = { $regex: search, $options: 'i' };
      const events = await this.eventService.getEvents(filter);
      return events;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }


  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  async uploadImage(
    @Res() res: Response,
    @UploadedFile() image?: Express.Multer.File,

  ) {
    try {
      let imageUrl = '';
      if (image && image.buffer) {
        const fileName = `event/${Date.now()}-${image.originalname}`;
        const file = bucket.file(fileName);

        await file.save(image.buffer, {
          metadata: {
            contentType: image.mimetype,
          },
          predefinedAcl: 'publicRead',
        });

        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2030',
        });
        imageUrl = url;
      }
      return res.status(200).json({ url: imageUrl });
    } catch (error) {
      return res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  async createEvent(
    @Body() body: {
      title: string;
      description: string;
      location: {
        houseNumber: string;
        ward: string;
        district: string;
        province: string;
      };
      event_type: string;
    },
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @UploadedFile() image?: Express.Multer.File,

  ) {
    try {
      const organizer = await this.organizerModel.findOne({
        account_id: new Types.ObjectId(req.user.userId)
      });
      console.log('req.user:', req.user);
      console.log('Searching Organizer with account_id:', req.user?.userId);

      if (!organizer) {
        return res.status(403).json({ message: 'Organizer not found' });
      }

      const organizerId = (organizer._id as Types.ObjectId).toString();
      if (!organizerId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      let imageUrl = '';
      if (image && image.buffer) {
        try {
          const fileName = `event/${Date.now()}-${image.originalname}`;
          const file = bucket.file(fileName);

          console.log('Uploading file to Firebase:', fileName);

          await file.save(image.buffer, {
            metadata: {
              contentType: image.mimetype,
            },
            predefinedAcl: 'publicRead',
          });

          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-01-2030',
          });
          imageUrl = url;
          console.log('File uploaded successfully. URL:', imageUrl);
        } catch (error) {
          console.error('Error uploading image to Firebase:', error);
          throw new Error('Failed to upload image');
        }
      }

      const event = await this.eventService.createEvent({
        ...body,
        image: imageUrl,
        organizer_id: organizerId
      });
      return res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
      console.log("Request body:", body);
      console.error('Create Event Error:', error);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }


  @Get(':eventId/dashboard')
  async getDashboard(@Param('eventId') eventId: string) {
    return await this.eventService.getEventDashboard(eventId);
  }



  @Get('admin-list')
  //@UseGuards(JwtAuthGuard) // Chỉ cho admin, có thể thêm guard kiểm tra role
  async getAdminEvents(
    @Query('tab') tab: 'approval' | 'selling' | 'past' = 'approval',
    @Query('search') search?: string,
  ) {
    return this.eventService.getAdminEvents(tab, search);
  }

















  @Get(':id')
  async getEventDetail(@Res() res: Response, @Param('id') id: string) {
    try {
      const event = await this.eventService.getEventDetail(id);
      return res.status(200).json(event);
    } catch (error) {
      return res.status(404).json({ message: 'Event not found' });
    }
  }

}