import { Controller, Get, Patch, Param, Body, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../database/schemas/user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}



  @Get('/admin/summary')
async getAdminUserSummary() {
  return this.userService.getAdminUserSummary();
}

@Patch('/admin/:id/status')
async setUserStatus(@Param('id') id: string, @Body() body: { status: string }) {
  await this.userService.setUserStatus(id, body.status);
  return { success: true };
}


  // Lấy thông tin hồ sơ người dùng
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Cập nhật thông tin hồ sơ người dùng
  @Patch(':id')
  async patchUser(@Param('id') id: string, @Body() data: Partial<User>) {
    const user = await this.userService.updateUser(id, data);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }


}