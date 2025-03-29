import { Controller, Post, Body, UseGuards, Get, Req, HttpCode, Res, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountService } from 'src/account/account.service'
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthGuard } from '@nestjs/passport';
import { Response } from "express";


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

  @Get("me")          //http://localhost:5000/auth/me
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: RequestWithUser) {
    console.log("Cookies:", req.cookies);
    console.log("User:", req.user);
    return { message: "Thông tin người dùng", user: req.user };
  }

  @Post('register')  //http://localhost:5000/auth/register
  async register(@Body() body: { email: string; password: string; role: string; name: string }) {
    return this.authService.register({
      email: body.email,
      password: body.password,
      role: body.role,
      name: body.name
    });
  }

  @Post('login')      //http://localhost:5000/auth/login
  @HttpCode(200)
  async login(@Body() loginDto: { email: string; password: string }, @Res() res: Response) {
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
}