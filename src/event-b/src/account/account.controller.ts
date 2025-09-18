import { Controller, Get, Param } from '@nestjs/common';
import { AccountService } from './account.service';
import { Module } from '@nestjs/common';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get(':id') // Lấy thông tin tài khoản theo ID
  async getAccount(@Param('id') id: string) {
    return this.accountService.findById(id);
  }
}
