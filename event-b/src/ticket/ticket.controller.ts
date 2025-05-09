import { Body, Controller, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { TicketService } from './ticket.service';
import { Ticket } from '../database/schemas/ticket.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { bucket } from 'src/config/firebase.config';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('create')
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
  async createTicket(
    @Body() ticketData: Partial<Ticket>,
    @UploadedFile() image: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
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
        ...ticketData,
        image: imageUrl, // Lưu URL ảnh vào cơ sở dữ liệu
      });
      return res.status(201).json(ticket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
}