import { Query, Controller, Get, Post, Put, Delete, Body, Param, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NewService } from './new.service';
import { Response } from 'express';

@Controller('new')
export class NewController {
  constructor(private readonly newService: NewService) { }

  @Get()
  async findAll() {
    return this.newService.findAll();
  }



  @Get('list')
  async getNewsList(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.newService.getNewsList(Number(page), Number(limit));
  }


  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: { title: string; content: string },
    @Res() res: Response
  ) {
    try {
      const news = await this.newService.createWithImage(body, image);
      return res.status(201).json({ message: 'News created successfully', news });
    } catch (error) {
      return res.status(500).json({ message: 'Create news failed', error: error.message });
    }
  }


  @Get(':id')
  async getNewsDetail(@Param('id') id: string) {
    return this.newService.getNewsDetail(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
    @Body() body: { title: string; content: string; image?: string }
  ) {
    return this.newService.updateWithImage(id, body, image);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newService.delete(id);
  }
}