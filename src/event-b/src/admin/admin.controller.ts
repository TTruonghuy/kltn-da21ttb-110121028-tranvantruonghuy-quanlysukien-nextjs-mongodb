import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('revenue-chart')
  async getRevenueChart() {
    return this.adminService.getRevenueChart();
  }

  @Get('events-chart')
  async getEventsChart() {
    return this.adminService.getEventsChart();
  }

  @Get('top-organizers-revenue')
  async getTopOrganizersRevenue() {
    return this.adminService.getTopOrganizersRevenue();
  }

  @Get('top-organizers-events')
  async getTopOrganizersEvents() {
    return this.adminService.getTopOrganizersEvents();
  }

  @Get('top-users-spending')
  async getTopUsersSpending() {
    return this.adminService.getTopUsersSpending();
  }

  @Get('recent-orders')
  async getRecentOrders() {
    return this.adminService.getRecentOrders();
  }

  @Get('upcoming-events')
  async getUpcomingEvents() {
    return this.adminService.getUpcomingEvents();
  }

  @Get('recent-news')
  async getRecentNews() {
    return this.adminService.getRecentNews();
  }
}