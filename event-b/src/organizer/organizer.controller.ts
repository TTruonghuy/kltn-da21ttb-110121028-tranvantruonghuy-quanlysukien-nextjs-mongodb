import { Controller, Get, Put, Body, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { OrganizerService } from './organizer.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { bucket } from '../config/firebase.config';


@Controller('organizer')
export class OrganizerController {
  constructor(private readonly organizerService: OrganizerService) { }
  @UseGuards(AuthGuard('jwt')) // Thêm guard nếu cần, ví dụ: AuthGuard

  @Get('me')
  async getMe(@Req() req) {
    console.log('req.user:', req.user);
    const organizer = await this.organizerService.findByUser(req.user);
    console.log('organizer:', organizer);
    return organizer;
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('me')
  @UseInterceptors(FileInterceptor('logo'))
  async updateMe(
    @Req() req,
    @Body() body,
    @UploadedFile() logo?: Express.Multer.File
  ) {
    let logoUrl = body.logo;
    // Nếu có file logo mới thì upload lên Firebase
    if (logo && logo.buffer) {
      const fileName = `organizer-logos/${Date.now()}_${logo.originalname}`;
      const file = bucket.file(fileName);
      await file.save(logo.buffer, {
        contentType: logo.mimetype,
        predefinedAcl: 'publicRead',
      });
      // Lấy URL public của ảnh
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2030',
      });
      logoUrl = url;
    }
    // Cập nhật thông tin organizer
    const { _id, account_id, ...updateData } = body;

    const updated = await this.organizerService.updateByUser(req.user, {
      ...updateData,
      logo: logoUrl,
    });
    return updated;
  }
}