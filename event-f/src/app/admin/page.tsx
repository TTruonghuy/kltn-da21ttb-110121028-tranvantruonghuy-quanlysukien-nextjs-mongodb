"use client";
import Sidebar from "../admin/components/Sidebar"; // Giả định path đúng
import { useState, useEffect } from "react";
import axios from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions, // Import ChartOptions từ chart.js
} from "chart.js";
import { FaUsers, FaUserTie, FaCalendarAlt, FaNewspaper, FaMoneyBillWave } from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Define interfaces dựa trên schemas (tùy chỉnh nếu cần thêm fields)
interface Stats {
  usersCount: number;
  organizersCount: number;
  eventsCount: number;
  newsCount: number;
  totalRevenue: number;
}

interface ChartData {
  labels: string[];
  data: number[];
}

interface Order {
  _id: string;
  total_amount: number;
  status: string;
  // Thêm fields khác từ order.schema nếu cần, ví dụ: createdAt: Date;
}

interface Event {
  _id: string;
  title: string;
  // Thêm fields khác từ event.schema nếu cần, ví dụ: start_time từ session
}

interface News {
  _id: string;
  title: string;
  createdAt: Date; // Hoặc string nếu parse
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ usersCount: 0, organizersCount: 0, eventsCount: 0, newsCount: 0, totalRevenue: 0 });
  const [revenueChart, setRevenueChart] = useState<ChartData>({ labels: [], data: [] });
  const [eventsChart, setEventsChart] = useState<ChartData>({ labels: [], data: [] });
  const [topOrgsRevenue, setTopOrgsRevenue] = useState<ChartData>({ labels: [], data: [] });
  const [topOrgsEvents, setTopOrgsEvents] = useState<ChartData>({ labels: [], data: [] });
  const [topUsersSpending, setTopUsersSpending] = useState<ChartData>({ labels: [], data: [] });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentNews, setRecentNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const statsRes = await axios.get("/admin/stats");
        setStats(statsRes.data);

        const revenueRes = await axios.get("/admin/revenue-chart");
        setRevenueChart(revenueRes.data);

        const eventsRes = await axios.get("/admin/events-chart");
        setEventsChart(eventsRes.data);

        const topOrgsRevRes = await axios.get("/admin/top-organizers-revenue");
        setTopOrgsRevenue(topOrgsRevRes.data);

        const topOrgsEventsRes = await axios.get("/admin/top-organizers-events");
        setTopOrgsEvents(topOrgsEventsRes.data);

        const topUsersRes = await axios.get("/admin/top-users-spending");
        setTopUsersSpending(topUsersRes.data);

        const ordersRes = await axios.get("/admin/recent-orders");
        setRecentOrders(ordersRes.data);

        const eventsUpcomingRes = await axios.get("/admin/upcoming-events");
        setUpcomingEvents(eventsUpcomingRes.data);

        const newsRes = await axios.get("/admin/recent-news");
        setRecentNews(newsRes.data);
      } catch (error) {
        console.error("Lỗi fetch data:", error);
        // Data giả fallback với types
        setStats({ usersCount: 100, organizersCount: 20, eventsCount: 50, newsCount: 10, totalRevenue: 5000000 });
        setRevenueChart({ labels: ["2025-01", "2025-02"], data: [100000, 200000] });
        setEventsChart({ labels: ["2025-01", "2025-02"], data: [10, 20] });
        setTopOrgsRevenue({ labels: ["Org1", "Org2"], data: [50000, 30000] });
        setTopOrgsEvents({ labels: ["Org1", "Org2"], data: [15, 10] });
        setTopUsersSpending({ labels: ["User1", "User2"], data: [10000, 8000] });
        setRecentOrders([{ _id: "fake1", total_amount: 100000, status: "paid" }]);
        setUpcomingEvents([{ _id: "fake1", title: "Event 1" }]);
        setRecentNews([{ _id: "fake1", title: "News 1", createdAt: new Date() }]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đăng xuất?")) return;
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      router.push("/");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  // Separate options cho line và bar để type chính xác
  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const, // Sử dụng 'as const' để literal type
      },
    },
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const lineChartDataFunc = (labels: string[], data: number[], label: string) => ({
    labels,
    datasets: [{ label, data, borderColor: "rgb(75, 192, 192)", tension: 0.1 }],
  });

  const barChartDataFunc = (labels: string[], data: number[], label: string) => ({
    labels,
    datasets: [{ label, data, backgroundColor: "rgba(153, 102, 255, 0.6)" }],
  });

  return (
    <div className="flex min-h-screen bg-[#f6f8fb]">
      <Sidebar onLogout={handleLogout} selected="Dashboard" />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Dashboard</h1>

        {loading ? (
          <div className="text-center text-gray-500">Đang tải...</div>
        ) : (
          <>
            {/* Top row - Cards */}
            <div className="grid grid-cols-5 gap-4 mb-8">
              <div className="bg-blue-100 px-2 rounded-lg shadow flex items-center gap-4">
                <FaUsers className="text-blue-600 text-3xl" />
                <div>
                  <div className="text-gray-600 text-sm">Tổng người dùng</div>
                  <div className="text-2xl font-bold">{stats.usersCount}</div>
                </div>
              </div>
              <div className="bg-green-100 px-2 p-4 rounded-lg shadow flex items-center gap-4">
                <FaUserTie className="text-green-600 text-3xl" />
                <div>
                  <div className="text-gray-600 text-sm">Tổng ban tổ chức</div>
                  <div className="text-2xl font-bold">{stats.organizersCount}</div>
                </div>
              </div>
              <div className="bg-yellow-100  px-2 rounded-lg shadow flex items-center gap-4">
                <FaCalendarAlt className="text-yellow-600 text-3xl" />
                <div>
                  <div className="text-gray-600 text-sm">Tổng sự kiện</div>
                  <div className="text-2xl font-bold">{stats.eventsCount}</div>
                </div>
              </div>
              <div className="bg-purple-100  px-2 rounded-lg shadow flex items-center gap-4">
                <FaNewspaper className="text-purple-600 text-3xl" />
                <div>
                  <div className="text-gray-600 text-sm">Tổng tin tức</div>
                  <div className="text-2xl font-bold">{stats.newsCount}</div>
                </div>
              </div>
              <div className="bg-red-100 px-2 rounded-lg shadow flex items-center gap-4">
                <FaMoneyBillWave className="text-red-600 text-3xl" />
                <div>
                  <div className="text-gray-600 text-sm">Tổng doanh thu (10%)</div>
                  <div className="text-lg font-bold">{stats.totalRevenue.toLocaleString()} VNĐ</div>
                </div>
              </div>
            </div>

            {/* Middle row - Charts */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Doanh thu theo tháng</h2>
                <Line options={lineChartOptions} data={lineChartDataFunc(revenueChart.labels, revenueChart.data, "Doanh thu")} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Sự kiện mới theo tháng</h2>
                <Line options={lineChartOptions} data={lineChartDataFunc(eventsChart.labels, eventsChart.data, "Số sự kiện")} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Top ban tổ chức theo doanh thu</h2>
                <Bar options={barChartOptions} data={barChartDataFunc(topOrgsRevenue.labels, topOrgsRevenue.data, "Doanh thu")} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Top ban tổ chức theo số sự kiện</h2>
                <Bar options={barChartOptions} data={barChartDataFunc(topOrgsEvents.labels, topOrgsEvents.data, "Số sự kiện")} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow col-span-2">
                <h2 className="text-lg font-semibold mb-2">Top người dùng chi tiêu cao nhất</h2>
                <Bar options={barChartOptions} data={barChartDataFunc(topUsersSpending.labels, topUsersSpending.data, "Chi tiêu")} />
              </div>
            </div>

            {/* Bottom row - Tables */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Đơn hàng mới nhất</h2>
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-100"><th className="p-2">ID</th><th>Tổng</th><th>Trạng thái</th></tr></thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order._id} className="border-b">
                        <td className="p-2">{order._id}</td>
                        <td>{order.total_amount.toLocaleString()} VNĐ</td>
                        <td>{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/*
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Sự kiện sắp diễn ra</h2>
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-100"><th className="p-2">Tiêu đề</th><th>Ngày</th></tr></thead>
                  <tbody>
                    {upcomingEvents.map(event => (
                      <tr key={event._id} className="border-b">
                        <td className="p-2">{event.title}</td>
                        <td>{/* Lấy từ session, ví dụ: new Date(event.start_time).toLocaleString() nếu có field </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div> */}


              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Tin tức mới</h2>
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-100"><th className="p-2">Tiêu đề</th><th>Ngày</th></tr></thead>
                  <tbody>
                    {recentNews.map(news => (
                      <tr key={news._id} className="border-b">
                        <td className="p-2">{news.title}</td>
                        <td>{new Date(news.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}