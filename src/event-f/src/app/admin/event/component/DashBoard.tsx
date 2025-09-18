"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

interface Ticket {
  ticket_name: string;
  ticket_price: number;
  ticket_quantity: number;
  sold_quantity: number;
}

interface Session {
  _id: string;
  start_time: string;
  end_time: string;
  tickets: Ticket[];
}

interface Event {
  _id: string;
  title: string;
  status: string;
  sessions: Session[];
}

interface ApiResponse {
  events: Event[];
  counts: {
    approval: number;
    selling: number;
    past: number;
  };
}

export default function EventDashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get<ApiResponse>("/event/admin-list?tab=approval");
    setData(res.data);
  };

  if (!data) return <div>Đang tải dữ liệu...</div>;

  // ====== 1. Card thống kê ======
  const { approval, selling, past } = data.counts;

  // ====== 2. Biểu đồ phân loại sự kiện ======
  const pieData = {
    labels: ["Chờ duyệt", "Đang bán", "Đã qua"],
    datasets: [
      {
        label: "Số lượng sự kiện",
        data: [approval, selling, past],
        backgroundColor: ["#fbbf24", "#22c55e", "#ef4444"],
      },
    ],
  };

  // ====== 3. Doanh thu theo ngày ======
  const revenueMap: Record<string, number> = {};
  data.events.forEach(e => {
    e.sessions.forEach(s => {
      const date = new Date(s.start_time).toLocaleDateString("vi-VN");
      const revenue = s.tickets.reduce(
        (sum, t) => sum + (t.sold_quantity * t.ticket_price),
        0
      );
      revenueMap[date] = (revenueMap[date] || 0) + revenue;
    });
  });

  const lineData = {
    labels: Object.keys(revenueMap),
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: Object.values(revenueMap),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
      },
    ],
  };

  // ====== 4. Top sự kiện bán chạy ======
  const topEvents = [...data.events]
    .map(e => ({
      title: e.title,
      totalSold: e.sessions.reduce(
        (sum, s) => sum + s.tickets.reduce((tsum, t) => tsum + t.sold_quantity, 0),
        0
      ),
    }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  // ====== 5. Hiệu suất bán vé ======
  const barData = {
    labels: data.events.map(e => e.title),
    datasets: [
      {
        label: "Vé đã bán",
        data: data.events.map(e =>
          e.sessions.reduce(
            (sum, s) => sum + s.tickets.reduce((tsum, t) => tsum + t.sold_quantity, 0),
            0
          )
        ),
        backgroundColor: "#22c55e",
      },
      {
        label: "Vé còn lại",
        data: data.events.map(e =>
          e.sessions.reduce(
            (sum, s) => sum + s.tickets.reduce((tsum, t) => tsum + (t.ticket_quantity - t.sold_quantity), 0),
            0
          )
        ),
        backgroundColor: "#f87171",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* 1. Card thống kê */}
      
<div className="flex">
      {/* 2. Pie Chart */}
      <Card className="h-100 w-150">
        <CardHeader><CardTitle>Phân loại sự kiện</CardTitle></CardHeader>
        <CardContent className="w-90 h-90"><Pie data={pieData} /></CardContent>
      </Card>
      

<div className="w-100 ml-4">
        <Card className="mb-2">
          <CardHeader><CardTitle>Chờ duyệt</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-yellow-500">{approval}</CardContent>
        </Card>
        <Card className="mb-2">
          <CardHeader><CardTitle>Đang bán</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-500">{selling}</CardContent>
        </Card>
        <Card  className="">
          <CardHeader><CardTitle>Đã qua</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-red-500">{past}</CardContent>
        </Card>
      </div>
</div>

      {/* 3. Line Chart */}
      <Card className="w-255">
        <CardHeader><CardTitle>Doanh thu theo ngày</CardTitle></CardHeader>
        <CardContent><Line data={lineData} /></CardContent>
      </Card>

      

      {/* 5. Hiệu suất bán vé */}
      <Card className="w-255">
        <CardHeader><CardTitle>Hiệu suất bán vé</CardTitle></CardHeader>
        <CardContent><Bar data={barData} /></CardContent>
      </Card>
    </div>
  );
}
