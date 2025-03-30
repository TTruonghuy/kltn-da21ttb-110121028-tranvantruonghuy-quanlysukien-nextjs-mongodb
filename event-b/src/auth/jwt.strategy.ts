import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.jwt, // Lấy token từ cookie
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; role: string; email: string }) {
    console.log("JWT Payload:", payload); // Log thông tin payload từ JWT
    if (!payload || !payload.sub || !payload.role || !payload.email) {
      throw new UnauthorizedException("Invalid JWT payload"); // Xử lý lỗi nếu payload không hợp lệ
    }
    return { userId: payload.sub, role: payload.role, email: payload.email }; // Thêm email vào req.user
  }
}