import { Body, Controller, Post, Get, Param, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { TicketService } from './ticket.service';
import { Ticket } from '../database/schemas/ticket.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { bucket } from 'src/config/firebase.config';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(), // Lưu file trong bộ nhớ tạm
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )


  async createSessionAndTicket(
    @Body() body: {
      event_id: string;
      start_time: Date;
      end_time: Date;
      ticket_data: {
        ticket_name: string;
        ticket_price: number;
        ticket_quantity: number;
        min_per_order: number;
        max_per_order: number;
       // sale_start_time: Date;
       // sale_end_time: Date;
        description_ticket?: string;
      };
    },
    @UploadedFile() image: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {

      const { event_id, start_time, end_time, ticket_data } = body;
      if (new Date(start_time) >= new Date(end_time)) {
        return res.status(400).json({ message: 'Start time must be before end time' });
      }

      // 1.  Tạo Session (xuất diễn)
      const session = await this.ticketService.createSession(event_id, start_time, end_time);


      let imageUrl = '';
      if (image && image.buffer) {
        try {
          const fileName = `ticket/${Date.now()}-${image.originalname}`;
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

      const ticket = await this.ticketService.createTicket({
        ...ticket_data,
        session_id: session._id, // Lưu ID của session vào vé
        //image: imageUrl, // Lưu URL ảnh vào cơ sở dữ liệu
      });
      return res.status(201).json(ticket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }


  @Post('create-session-with-tickets')
  @UseGuards(JwtAuthGuard)
  async createSessionWithTickets(
    @Body() body: {
      event_id: string;
      start_time: Date;
      end_time: Date;
      tickets: Array<{
        ticket_name: string;
        ticket_price: number;
        ticket_quantity: number;
        min_per_order: number;
        max_per_order: number;
        //sale_start_time: Date;
        //sale_end_time: Date;
        description_ticket?: string;
        image?: string; // Nếu muốn upload ảnh, cần xử lý thêm
      }>;
    },
    @Res() res: Response,
  ) {
    try {
      // 1. Tạo session
      const session = await this.ticketService.createSession(body.event_id, body.start_time, body.end_time);

      // 2. Tạo các ticket gắn với session vừa tạo
      const tickets: Ticket[] = [];
      for (const ticketData of body.tickets) {
        const ticket = await this.ticketService.createTicket({
          ...ticketData,
          session_id: session._id,
        });
        tickets.push(ticket);
      }
      return res.status(201).json({ session, tickets });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }




  @Post('create-session-with-seatingchart')
  @UseGuards(JwtAuthGuard)
  async createSessionWithSeatingChart(
    @Body() body: {
      event_id: string;
      start_time: Date;
      end_time: Date;
      seatingChart: {
        seats: Array<{
          seatId: string;
          rowName: string;
          seatNumber: number;
          ticketType: string;
          price: number;
          sold: boolean;
          position: { left: number; top: number };
        }>;
        ticketTypes: Array<{
          type: string;
          label: string;
          color: string;
          price: number;
        }>;
      };
    },
    @Res() res: Response,
  ) {
    try {
      // 1. Tạo session
      const session = await this.ticketService.createSession(body.event_id, body.start_time, body.end_time);

      // 2. Tạo sơ đồ ghế gắn với session
      const chart = await this.ticketService.createSeatingChart({
        session_id: session._id,
        seats: body.seatingChart.seats,
        ticketTypes: body.seatingChart.ticketTypes,
      });

      return res.status(201).json({ session, seatingChart: chart });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }

  // Endpoint mới: check-in
  @Post('check-in')
  @UseGuards(JwtAuthGuard) // Bảo vệ, chỉ organizer/staff quét được
  async checkIn(@Body('qr_data') qrData: string) {
    try {
      return await this.ticketService.checkInTicket(qrData);
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}