import { Controller, Post, Body, UseGuards, Req, Res, UseInterceptors, UploadedFile, Get } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/auth.controller'; // Import RequestWithUser
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { bucket } from 'src/config/firebase.config';
import { Query } from '@nestjs/common';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) { }

 @Get('list')
  async getEvents(
    @Res() res: Response,
    @Query('event_type') eventType?: string, // Lọc theo loại sự kiện nếu cần
    
  ) {
    try {
      const events = await this.eventService.getEvents(eventType ? { event_type: eventType } : {});
      return res.status(200).send(events);
    } catch (error) {
      console.error('Get Events Error:', error);
      return res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(), // Sử dụng memoryStorage để lưu file trong bộ nhớ
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
      location: string;
      start_time: Date;
      end_time: Date
      event_type: string;
    },
    @UploadedFile() image: Express.Multer.File, // Nhận file upload
    @Req() req: RequestWithUser, // Sử dụng RequestWithUser
    @Res() res: Response,
  ) {
    try {
      const organizerId = req.user?.userId; // Lấy ID của ban tổ chức từ JWT
      if (!organizerId) {
        return res.status(403).send({ message: 'Unauthorized' });
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
        image: imageUrl, // Lưu URL của ảnh vào cơ sở dữ liệu
        organizer_id: organizerId 
      });
      return res.status(201).send({ message: 'Event created successfully', event });
    } catch (error) {
      console.log("Request body:", body);
      console.error('Create Event Error:', error);

      return res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  }

 


};