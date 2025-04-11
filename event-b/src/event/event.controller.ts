import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/auth.controller'; // Import RequestWithUser
import { Response } from 'express';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createEvent(
    @Body() body: { title: string; description: string; location: string; start_time: Date; end_time: Date; image?: string },
    @Req() req: RequestWithUser, // Sử dụng RequestWithUser
    @Res() res: Response,
  ) {
    try {
      const organizerId = req.user?.userId; // Lấy ID của ban tổ chức từ JWT
      if (!organizerId) {
        return res.status(403).send({ message: 'Unauthorized' });
      }

      const event = await this.eventService.createEvent({ ...body, organizer_id: organizerId });
      return res.status(201).send({ message: 'Event created successfully', event });
    } catch (error) {
      console.error('Create Event Error:', error.message);
      return res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  }
}
