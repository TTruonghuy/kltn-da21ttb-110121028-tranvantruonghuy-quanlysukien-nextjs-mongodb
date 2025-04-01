import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from 'src/account/account.service';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { User } from '../database/schemas/user.schema';
import { Organizer } from '../database/schemas/organizer.schema';
import { bucket } from 'src/config/firebase.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Organizer.name) private readonly organizerModel: Model<Organizer>,
  ) {}

  async register(data: { email: string; password: string; role: string; name: string; image?: Express.Multer.File }) {
    try {
      const { email, password, role, name, image } = data;
      const existingAccount = await this.accountService.findByEmail(email);
      if (existingAccount) throw new Error("Email đã được sử dụng");

      if (!['user', 'organizer', 'admin', 'attendee'].includes(role)) {
        throw new Error(`Role "${role}" is not valid`);
      }

      let avatarUrl = '';
      if (image && image.buffer) {
        const fileName = `avatars/${Date.now()}_${image.originalname}`;
        const file = bucket.file(fileName);
        await file.save(image.buffer, {
          contentType: image.mimetype,
          predefinedAcl: 'publicRead',
        });

        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2030',
        });
        avatarUrl = url;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const account = await this.accountService.create({ email, password: hashedPassword, role });

      if (role === 'user' || role === 'attendee') {
        await this.userModel.create({
          account_id: account._id,
          name,
          email,
          avatar: avatarUrl,
        });
      } else if (role === 'organizer') {
        await this.organizerModel.create({
          account_id: account._id,
          name,
          email,
          logo: avatarUrl,
          events_created: 0,
        });
      }

      return { message: "Đăng ký thành công", account };
    } catch (error) {
      console.error("Register Error:", error.message);
      throw error;
    }
  }

  async login({ email, password }: { email: string; password: string}) {
    try {
      const account = await this.accountService.findByEmail(email);
      if (!account) throw new Error("Tài khoản không tồn tại");

      const isPasswordValid = await bcrypt.compare(password, account.password);
      if (!isPasswordValid) throw new Error("Mật khẩu không đúng");

      const token = this.jwtService.sign({
        sub: account._id!, // Sử dụng toán tử non-null assertion
        role: account.role,
        email: account.email,
      });

      return { accessToken: token };
    } catch (error) {
      console.error("Login Error:", error.message);
      throw error;
    }
  }

  async loginWithGoogle(user: { email: string; name: string; avatar: string; role: string }) {
    try {
      console.log("Google User Data:", user); // Log thông tin user từ Google

      const existingAccount = await this.accountService.findByEmail(user.email);
      if (!existingAccount) {
        console.log("Creating new account for Google user...");
        const newAccount = await this.accountService.create({
          email: user.email,
          password: 'google_oauth_default_password', // Giá trị mặc định cho password
          role: user.role, // Role được xác định từ AuthForm
        });

        if (user.role === 'user') {
          await this.userModel.create({
            account_id: newAccount._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          });
        } else if (user.role === 'organizer') {
          await this.organizerModel.create({
            account_id: newAccount._id,
            name: user.name,
            email: user.email,
            logo: user.avatar,
            events_created: 0,
          });
        }
      }

      const account = existingAccount || (await this.accountService.findByEmail(user.email));
      if (!account) throw new Error("Account not found after creation");

      const token = this.jwtService.sign({
        sub: account._id!,
        role: account.role,
        email: account.email,
      });

      console.log("Generated JWT Token:", token); // Log token
      return { accessToken: token };
    } catch (error) {
      console.error("Login With Google Error:", error.message); // Log lỗi chi tiết
      throw error;
    }
  }

  async getUserDetails(userId: string, role: string) {
    try {
      const objectId = new Types.ObjectId(userId);

      if (role === 'user' || role === 'attendee') {
        const user = await this.userModel.findOne({ account_id: objectId }).exec();
        if (!user) throw new Error("User not found");
        return {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role,
        };
      } else if (role === 'organizer') {
        const organizer = await this.organizerModel.findOne({ account_id: objectId }).exec();
        if (!organizer) throw new Error("Organizer not found");
        return {
          name: organizer.name,
          email: organizer.email,
          avatar: organizer.logo,
          role,
        };
      }

      throw new Error("Invalid role");
    } catch (error) {
      console.error("Get User Details Error:", error.message);
      throw error;
    }
  }
}