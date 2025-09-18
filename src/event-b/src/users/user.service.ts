import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../database/schemas/user.schema';
import { Account, AccountDocument } from '../database/schemas/account.schema';
import { Order, OrderDocument } from '../database/schemas/order.schema';


interface UserWithAccount {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  account_id?: {
    _id: string;
    status: string;
  };
}


@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) { }

  async getUserById(id: string) {
    return this.userModel.findById(id).lean();
  }


  async updateUser(id: string, data: Partial<User>) {
    if (data.account_id && typeof data.account_id === 'string') {
      // Convert string sang ObjectId
      data.account_id = new Types.ObjectId(data.account_id);
    }
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }



  // Lấy tổng quan và top user
  async getAdminUserSummary() {

    // Tổng số người dùng
    const totalUsers = await this.userModel.countDocuments();

    // Đang hoạt động (có thể dựa vào account.status)
    const activeUsers = await this.userModel.countDocuments({});

    // Lấy tất cả user và populate account
    const users = await this.userModel.find().populate('account_id').lean();

    // Lấy tất cả order
    const orders = await this.orderModel.find().lean();

    // Tính tổng chi tiêu và số giao dịch cho từng user
    const userStats: Record<string, { name: string, email: string, totalSpent: number, orderCount: number, status: string }> = {};
    users.forEach(u => {
      userStats[u._id.toString()] = {
        name: u.name,
        email: u.email,
        totalSpent: 0,
        orderCount: 0,
        status: typeof u.account_id === "object" && u.account_id
          ? (u.account_id as any).status || "active"
          : "active"
      };
    });
    orders.forEach(o => {
      const uid = o.user_id?.toString();
      if (userStats[uid]) {
        userStats[uid].totalSpent += o.total_amount || 0;
        userStats[uid].orderCount += 1;
      }
    });

    // Top 5 người dùng chi tiêu nhiều nhất
    const topSpent = Object.values(userStats)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // Top 5 người dùng nhiều giao dịch nhất
    const topOrder = Object.values(userStats)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    // Đăng ký theo ngày
    const regByDate: Record<string, number> = {};
    users.forEach(u => {
      const d = new Date((u as any).createdAt);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      regByDate[key] = (regByDate[key] || 0) + 1;
    });

    return {
      totalUsers,
      activeUsers,
      topSpent,
      topOrder,
      regByDate,
      users: Object.entries(userStats).map(([id, stat]) => ({ _id: id, ...stat }))
    };
  }

  // Đổi trạng thái user
  async setUserStatus(userId: string, status: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error("User not found");
    await this.accountModel.findByIdAndUpdate(user.account_id, { status });
    return true;
  }

}