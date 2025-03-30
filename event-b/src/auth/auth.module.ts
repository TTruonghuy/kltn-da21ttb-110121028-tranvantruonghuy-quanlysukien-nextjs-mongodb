import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from "./jwt.strategy";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../database/schemas/user.schema';
import { Organizer, OrganizerSchema } from '../database/schemas/organizer.schema'; // Import Organizer schema
import { AccountModule } from 'src/account/account.module';
import { AccountService } from 'src/account/account.service';
import { GoogleStrategy } from './google.strategy'; // Import GoogleStrategy

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: "jwt" }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Organizer.name, schema: OrganizerSchema }, // Đăng ký Organizer schema
    ]),
    AccountModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy], // Thêm GoogleStrategy
  exports: [AuthService],
})
export class AuthModule {}
