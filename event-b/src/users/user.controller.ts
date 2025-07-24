import { Controller, Get, Put, Param, Body, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Lấy thông tin hồ sơ người dùng
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Cập nhật thông tin hồ sơ người dùng
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    const user = await this.userService.updateUser(id, data);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}