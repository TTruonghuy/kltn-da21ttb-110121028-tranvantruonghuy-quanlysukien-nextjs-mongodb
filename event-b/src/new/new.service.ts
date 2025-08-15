import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { News, NewsDocument } from '../database/schemas/new.schema';
import { Model } from 'mongoose';
import { bucket } from 'src/config/firebase.config';

@Injectable()
export class NewService {
  constructor(
    @InjectModel(News.name) private readonly newsModel: Model<NewsDocument>,
  ) { }


  async getNewsList(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.newsModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.newsModel.countDocuments()
    ]);
    return { items, total, page, limit };
  }

  async getNewsDetail(id: string) {
    const news = await this.newsModel.findById(id).lean();
    if (!news) throw new Error('Not found');
    // Lấy 5 bản tin khác (trừ bản tin hiện tại)
    const others = await this.newsModel.find({ _id: { $ne: id } })
      .sort({ createdAt: -1 }).limit(5).lean();
    return { news, others };
  }

  async findAll() {
    return this.newsModel.find().sort({ createdAt: -1 }).lean();
  }

  async createWithImage(
    data: { title: string; content: string },
    image?: Express.Multer.File
  ) {
    let imageUrl = '';
    if (image && image.buffer) {
      const fileName = `news/${Date.now()}-${image.originalname}`;
      const file = bucket.file(fileName);

      await file.save(image.buffer, {
        metadata: { contentType: image.mimetype },
        predefinedAcl: 'publicRead',
      });

      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2030',
      });
      imageUrl = url;
    }
    const news = new this.newsModel({ ...data, image: imageUrl });
    return await news.save();
  }

  async updateWithImage(
    id: string,
    data: { title: string; content: string; image?: string },
    image?: Express.Multer.File
  ) {

    // Lấy tin tức hiện tại để biết ảnh cũ
    const existing = await this.newsModel.findById(id).lean();
    if (!existing) throw new Error('News not found');

    let imageUrl = existing.image; // mặc định giữ ảnh cũ



    if (image && image.buffer) {
      const fileName = `news/${Date.now()}-${image.originalname}`;
      const file = bucket.file(fileName);

      await file.save(image.buffer, {
        metadata: { contentType: image.mimetype },
        predefinedAcl: 'publicRead',
      });

      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2030',
      });
      imageUrl = url;
    }
    if (data.image) {
      imageUrl = data.image;
    }

    return this.newsModel.findByIdAndUpdate(id, { ...data, image: imageUrl }, { new: true });
  }

  async delete(id: string) {
    return this.newsModel.findByIdAndDelete(id);
  }
}