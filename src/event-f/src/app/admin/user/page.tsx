"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "@/lib/axiosInstance";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Title } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Title);

export default function AdminUsersPage() {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    axios.get("/users/admin/summary", { withCredentials: true }).then(res => setData(res.data));
  }, []);

  if (!data) return <div className="p-8">Đang tải dữ liệu...</div>;

  // Chart data
  const barSpent = {
    labels: data.topSpent.map((u: any) => u.name),
    datasets: [{
      label: "Chi tiêu (VNĐ)",
      data: data.topSpent.map((u: any) => u.totalSpent),
      backgroundColor: "#2563eb"
    }]
  };
  const barOrder = {
    labels: data.topOrder.map((u: any) => u.name),
    datasets: [{
      label: "Số giao dịch",
      data: data.topOrder.map((u: any) => u.orderCount),
      backgroundColor: "#22c55e"
    }]
  };
  const lineReg = {
    labels: Object.keys(data.regByDate),
    datasets: [{
      label: "Đăng ký mới",
      data: Object.values(data.regByDate),
      borderColor: "#2563eb",
      backgroundColor: "#93c5fd",
      fill: false,
    }]
  };

  // Filter table
  const users = data.users.filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  // Đổi trạng thái user
  const handleStatus = async (id: string, status: string) => {
    await axios.patch(`/users/admin/${id}/status`, { status }, { withCredentials: true });
    setData((prev: any) => ({
      ...prev,
      users: prev.users.map((u: any) => u._id === id ? { ...u, status } : u)
    }));
  };

  return (
    <div className="flex min-h-screen bg-[#f6f8fb]">
      <Sidebar onLogout={() => { }} selected="Người dùng" />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-8">Người dùng</h1>
        {/* Top row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <div className="bg-white rounded-lg shadow p-6 text-center mb-4">
              <div className="text-gray-500">Tổng số người dùng</div>
              <div className="text-2xl font-bold">{data.totalUsers}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-gray-500">Đang hoạt động</div>
              <div className="text-2xl font-bold">{data.activeUsers}</div>
            </div>
          </div>
          {/* Top 5 chi tiêu */}
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="font-semibold mb-2">Top 5 chi tiêu</div>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">No.</th>
                  <th className="text-left">Tên</th>
                  <th className="text-right">Chi tiêu</th>
                </tr>
              </thead>
              <tbody>
                {data.topSpent.map((u: any, idx: number) => (
                  <tr key={u.name}>
                    <td>{idx + 1}</td>
                    <td>{u.name}</td>
                    <td className="text-right">{u.totalSpent?.toLocaleString()} VNĐ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Top 5 giao dịch */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="font-semibold mb-2">Top 5 giao dịch</div>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left ">No.</th>
                  <th className="text-left">Tên</th>
                  <th className="text-right">Giao dịch</th>
                </tr>
              </thead>
              <tbody>
                {data.topOrder.map((u: any, idx: number) => (
                  <tr key={u.name}>
                    <td>{idx + 1}</td>
                    <td>{u.name}</td>
                    <td className="text-right">{u.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
        {/* Middle row */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6 col-span-2">
            <div className="font-semibold mb-2">Số người dùng đăng ký theo ngày</div>
            <Line data={lineReg} />
          </div>
        </div>
        {/* Bottom row: Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between mb-4">
            <div className="font-semibold">Danh sách người dùng</div>
            <input
              className="border rounded-lg px-3 py-1"
              placeholder="Tìm theo tên"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 rounded">
                <th className="p-2 text-left">Mail</th>
                <th className="p-2 text-left">Tên</th>
                <th className="p-2 text-left">Trạng thái</th>
                <th className="p-2 text-left">Số giao dịch</th>
                <th className="p-2 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u._id} className="border-b hover:bg-blue-50">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={u.status !== "banned"}
                      onChange={e => handleStatus(u._id, e.target.checked ? "Hoạt động" : "Khóa")}
                    />{" "}
                    {u.status}
                  </td>
                  <td className="p-2">{u.orderCount}</td>
                  <td className="p-2">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => setSelectedUser(u)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Modal chi tiết user */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                onClick={() => setSelectedUser(null)}
              >✕</button>
              <h2 className="text-xl font-bold mb-4">Chi tiết người dùng</h2>
              <div><b>Tên:</b> {selectedUser.name}</div>
              <div><b>Email:</b> {selectedUser.email}</div>
              <div><b>Trạng thái:</b> {selectedUser.status}</div>
              <div><b>Số giao dịch:</b> {selectedUser.orderCount}</div>
              <div><b>Tổng chi tiêu:</b> {selectedUser.totalSpent?.toLocaleString()} VNĐ</div>
              {/* Có thể bổ sung lịch sử giao dịch nếu muốn */}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}