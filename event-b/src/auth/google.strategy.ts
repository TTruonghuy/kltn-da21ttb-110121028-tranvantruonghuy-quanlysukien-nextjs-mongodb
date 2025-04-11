import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
      scope: ['email', 'profile'],
      passReqToCallback: true, // Cho phép truy cập req trong validate
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    // Kiểm tra và log cookies
    console.log("Cookies in GoogleStrategy:", req.cookies);

    const role = req.cookies?.oauth_role; // Lấy role từ cookie
    console.log("Google OAuth Role (Cookie):", role); // Log role để kiểm tra

    if (!role) {
      console.error("Role is missing in Google OAuth request."); // Log lỗi chi tiết
      return done(new Error('Role is required'), null); // Xử lý lỗi nếu role không được cung cấp
    }

    const givenName = name?.givenName || ''; // Nếu không có givenName, sử dụng chuỗi rỗng
    const familyName = name?.familyName || ''; // Nếu không có familyName, sử dụng chuỗi rỗng

    const user = {
      email: emails[0].value,
      name: `${givenName} ${familyName}`.trim(),
      avatar: photos[0]?.value || "", // Nếu không có ảnh, sử dụng chuỗi rỗng
      role, // Thêm role vào user
    };
    console.log("Google OAuth User:", user); // Log thông tin user
    done(null, user);
  }
}
