import { Controller, Post, Body, UseGuards, Get, Req, HttpCode, Res, UploadedFile, UseInterceptors, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountService } from 'src/account/account.service';
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from "express"; // Import Request từ express
import { memoryStorage } from 'multer';
import { HttpException, HttpStatus } from '@nestjs/common';


// Mở rộng kiểu Request để bao gồm thuộc tính user
export interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
    name?: string;
    avatar?: string;
  };
  cookies: Record<string, string>;
  query: Record<string, any>;
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
    console.log("User Details:", user); // Log thông tin user trả về
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
    //console.log("Register Request Body:", body); // Log thông tin request
    // console.log("Uploaded File:", image); // Log thông tin file upload
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
      maxAge: 604800000,
    });
    return res.send({ message: "Đăng nhập thành công" });
  }

  @Post("logout")
  logout(@Res() res: Response) {
    res.clearCookie("jwt");
    return res.send({ message: "Đăng xuất thành công" })
  }

  @Get('google')
  async googleLogin(@Req() req: RequestWithUser, @Res() res: Response) {
    const { role } = req.query; // Lấy role từ query string
    console.log("Google OAuth Role (Frontend):", role); // Log role để kiểm tra

    if (!role) {
      return res.status(400).send({ message: "Role is required" }); // Xử lý lỗi nếu role không được cung cấp
    }

    // Lưu role vào cookie
    res.cookie('oauth_role', role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000, // Cookie tồn tại trong 5 phút
    });

    // Chuyển hướng đến Google
    console.log("Cookie oauth_role set with value:", role);
    return res.redirect('/auth/google/start');
  }

  @Get('google/start')
  @UseGuards(AuthGuard('google'))
  async googleStart() {
    // Redirect to Google for authentication
  }

  @Get('google/callback') // Định nghĩa endpoint callback
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    try {
      // Lấy role từ cookie
      const role = req.cookies['oauth_role'];
      console.log("Google OAuth Role (Cookie):", role); // Log role từ cookie

      if (!role) {
        throw new Error('Role is missing in Google OAuth callback');
      }

      // Đảm bảo các thuộc tính name và avatar luôn có giá trị mặc định
      const user = {
        email: req.user.email,
        name: req.user.name || "Google User", // Giá trị mặc định nếu thiếu
        avatar: req.user.avatar || "", // Giá trị mặc định nếu thiếu
        role,
      };

      console.log("Google Callback User:", user); // Log thông tin user từ Google

      const result = await this.authService.loginWithGoogle(user);

      res.cookie('jwt', result.accessToken, {
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

  @Post('send-verification-code')
  async sendVerificationCode(@Body() body: { email: string }) {
    await this.authService.sendVerificationCode(body.email);
    return { message: "Đã gửi mã xác minh đến email" };
  }

  @Post('verify-email-code')
  async verifyEmailCode(@Body() body: { email: string; code: string }) {
    const isValid = this.authService.verifyCode(body.email, body.code);
    if (!isValid) throw new HttpException("Mã xác minh không đúng", HttpStatus.BAD_REQUEST);
    return { message: "Xác minh thành công" };
  }

}


