import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from 'src/account/account.service';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    @InjectModel('User') private readonly userModel: Model<any>, 
    @InjectModel('Organizer') private readonly organizerModel: Model<any>
  ) {}

  async register(data: { email: string; password: string; role: string; name: string}) {
    const { email, password, role, name } = data;
    const existingAccount = await this.accountService.findByEmail(email);
    if (existingAccount) throw new Error("Email đã được sử dụng");

    const hashedPassword = await bcrypt.hash(password, 10);
    const account = await this.accountService.create({ email, password: hashedPassword, role });
    if (role === 'user') {
      await this.userModel.create({ account_id: account._id, name, email });
    } else if (role === 'organizer') {
      await this.organizerModel.create({ account_id: account._id, name, email, events_created: 0 });
    }
    return { message: "Đăng ký thành công", account };
  }

  async login({ email, password }: { email: string; password: string }) {
    const account = await this.accountService.findByEmail(email);
    if (!account) throw new Error("Tài khoản không tồn tại");

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) throw new Error("Mật khẩu không đúng");

    const token = this.jwtService.sign({ _id: account._id, role: account.role });
    return { accessToken: token };
  }
}