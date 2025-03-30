import { Controller, Post, Body, UseGuards, Get, Req, HttpCode, Res, UploadedFile, UseInterceptors, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountService } from 'src/account/account.service'
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from "express";
import { memoryStorage } from 'multer';
import { extname } from 'path';

export interface RequestWithUser extends Request {
  user: any;
  cookies: Record<string, string>;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService
  ) { }

  @Get("me") // http://localhost:5000/auth/me
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: RequestWithUser) {
    console.log("Request User:", req.user); // Log thông tin user từ JWT
    if (!req.user || !req.user.userId || !req.user.role) {
      throw new UnauthorizedException("Invalid user data from JWT"); // Xử lý lỗi nếu dữ liệu không hợp lệ
    }
    const user = await this.authService.getUserDetails(req.user.userId, req.user.role);
    return { message: "Thông tin người dùng", user }; // Trả về thông tin đầy đủ
  }

  @Post('register') // http://localhost:5000/auth/register
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(), // Sử dụng memoryStorage để cung cấp buffer
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  })) // Xử lý file upload
  async register(
    @Body() body: { email: string; password: string; role: string; name: string },
    @UploadedFile() image: Express.Multer.File,
  ) {
    console.log("Register Request Body:", body); // Log thông tin request
    console.log("Uploaded File:", image); // Log thông tin file upload
    return this.authService.register({ ...body, image });
  }

  @Post('login') // http://localhost:5000/auth/login
  @HttpCode(200)
  async login(@Body() loginDto: { email: string; password: string }, @Res() res: Response) {
    console.log("Login Request Body:", loginDto); // Log thông tin request
    if (!loginDto || !loginDto.email || !loginDto.password) {
      throw new Error("Invalid login data"); // Xử lý trường hợp dữ liệu không hợp lệ
    }

    const { email, password } = loginDto;
    const token = await this.authService.login({ email, password });
    res.cookie("jwt", token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 36000000,
    });
    return res.send({ message: "Đăng nhập thành công" });
  }

  @Post("logout")
  logout(@Res() res: Response) {
    res.clearCookie("jwt");
    return res.send({ message: "Đăng xuất thành công" })
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Redirect to Google for authentication
  }

  @Get('google/callback') // Định nghĩa endpoint callback
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    try {
      console.log("Google Callback User:", req.user); // Log thông tin user từ Google

      // Kiểm tra nếu người dùng mới cần cung cấp role
      const token = await this.authService.loginWithGoogle({ ...req.user, role: req.query.role as string });

      res.cookie('jwt', token.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 36000000,
      });

      return res.redirect('http://localhost:3000'); // Redirect to frontend
    } catch (error) {
      console.error("Google Callback Error:", error.message); // Log lỗi chi tiết
      return res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
  }
}