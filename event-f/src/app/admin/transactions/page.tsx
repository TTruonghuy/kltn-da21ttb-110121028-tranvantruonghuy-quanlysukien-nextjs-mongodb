"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "@/lib/axiosInstance";
import { Pie, Bar, Line } from "react-chartjs-2";
import {Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Title } from "chart.js";
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Title);

export default function AdminTransactionsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get("/order/admin/summary", { withCredentials: true }).then(res => setData(res.data));
  }, []);

  if (!data) return <div className="p-8">Đang tải dữ liệu...</div>;

  // Chuẩn bị dữ liệu biểu đồ
  const lineData = {
    labels: Object.keys(data.revenueByDate),
    datasets: [{
      label: "Doanh thu",
      data: Object.values(data.revenueByDate),
      borderColor: "#2563eb",
      backgroundColor: "#93c5fd",
      fill: false,
    }]
  };

  const pieData = {
    labels: Object.keys(data.statusCount),
    datasets: [{
      data: Object.values(data.statusCount),
      backgroundColor: ["#22c55e", "#f59e42", "#ef4444", "#a3a3a3"],
    }]
  };

  const truncate = (str: string, n: number) => str.length > n ? str.slice(0, n) + "…" : str;


  const barRevenue = {
  labels: data.topEventsByRevenue.map((e: any) => truncate(e.title, 15)),
  datasets: [{
    label: "Doanh thu",
    data: data.topEventsByRevenue.map((e: any) => e.revenue),
    backgroundColor: "#2563eb"
  }]
};

const barTickets = {
  labels: data.topEventsByTickets.map((e: any) => truncate(e.title, 15)),
  datasets: [{
    label: "Số vé bán ra",
    data: data.topEventsByTickets.map((e: any) => e.count),
    backgroundColor: "#22c55e"
  }]
};

  return (
    <div className="flex min-h-screen bg-[#f6f8fb]">
      <Sidebar onLogout={() => {}} selected="Giao dịch" />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-8">Giao dịch</h1>
        {/* Top row */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-500 mb-1">Tổng đơn hàng</div>
            <div className=" font-bold">{data.totalOrders}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-500 mb-1">Tổng doanh thu</div>
            <div className=" font-bold">{data.totalRevenue.toLocaleString()} VNĐ</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-500 mb-1">Tổng vé đã bán</div>
            <div className=" font-bold">{data.totalTickets}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-500 mb-1">Vé đã check-in</div>
            <div className=" font-bold">{data.checkedInTickets}</div>
          </div>
        </div>

        {/* Middle row: Charts */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="font-semibold mb-2">Doanh thu theo ngày</div>
            <Line data={lineData} />
          </div>
          
        </div>

        {/* Bottom row: Top events */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="font-semibold mb-2">Top 5 sự kiện theo doanh thu</div>
            <Bar data={barRevenue} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="font-semibold mb-2">Top 5 sự kiện theo số vé bán ra</div>
            <Bar data={barTickets} />
          </div>
        </div>
      </main>
    </div>
  );
}