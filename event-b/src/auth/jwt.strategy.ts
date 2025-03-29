import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request as ExpressRequest } from 'express';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: (req: ExpressRequest) => {
                const cookies = (req as ExpressRequest).cookies;
                console.log("Cookies:", cookies); // Debug xem có JWT không
                return cookies?.jwt || null; // Lấy JWT từ Cookie
            },
      ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET, // Đảm bảo SECRET đúng
        });
    }

    async validate(payload: any) {
        if (!payload) {
            throw new UnauthorizedException();
        }
        return { userId: payload.sub, email: payload.email };
    }
}