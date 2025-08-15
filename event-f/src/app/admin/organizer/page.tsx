"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "@/lib/axiosInstance";
import { Line } from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title);


export default function AdminOrganizerPage() {
  const [data, setData] = useState<any>({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    axios.get("/organizer/admin/organizer-summary", { withCredentials: true }).then(res => setData(res.data));
  }, []);

    const organizers = (data.organizers || []).filter((org: any) =>
    org.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatus = async (id: string, status: string) => {
    await axios.patch(`/organizer/admin/organizer/${id}/status`, { status }, { withCredentials: true });
    setData((prev: any) => ({
      ...prev,
      organizers: prev.organizers.map((o: any) => o._id === id ? { ...o, status } : o)
    }));
  };

  // Chart data
  const lineReg = {
    labels: data.regByDate ? Object.keys(data.regByDate) : [],
    datasets: [{
      label: "Đăng ký mới",
      data: data.regByDate ? Object.values(data.regByDate) : [],
      borderColor: "#2563eb",
      backgroundColor: "#93c5fd",
      fill: false,
    }]
  };

  return (
    <div className="flex min-h-screen bg-[#f6f8fb]">
      <Sidebar onLogout={() => {}} selected="Ban tổ chức" />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-8">Ban tổ chức</h1>
        <div className="bg-white p-4 rounded-lg">
        <div className="flex justify-between mb-4 ">
          <div className="font-semibold">Danh sách ban tổ chức</div>
          <input
            className="px-3 py-1 border rounded-lg"
            placeholder="Tìm theo tên"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <table className="w-full text-sm bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Tên ban tổ chức</th>
              <th className="p-2 text-left">Số lượng sự kiện</th>
              <th className="p-2 text-left">Doanh thu tổng</th>
              <th className="p-2 text-left">Tổng vé</th>
              <th className="p-2 text-left">Trạng thái</th>
              <th className="p-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {organizers.map((org: any) => (
              <tr key={org._id} className="border-b hover:bg-blue-50">
                <td className="p-2">{org.name}</td>
                <td className="p-2">{org.eventCount}</td>
                <td className="p-2">{org.totalRevenue?.toLocaleString()} VNĐ</td>
                <td className="p-2">{org.totalTickets}</td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={org.status !== "banned"}
                    onChange={e => handleStatus(org._id, e.target.checked ? "Hoạt động" : "Đã khóa")}
                  />{" "}
                  {org.status}
                </td>
                <td className="p-2">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => setSelected(org)}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>


        {/* Thống kê & biểu đồ */}
        <div className="grid grid-cols-2 gap-6 my-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="font-semibold mb-2">Top 5 doanh thu</div>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">#</th>
                  <th className="text-left">Tên</th>
                  <th className="text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {(data.topRevenue || []).map((org: any, idx: number) => (
                  <tr key={org._id}>
                    <td>{idx + 1}</td>
                    <td>{org.name}</td>
                    <td className="text-right">{org.totalRevenue?.toLocaleString()} VNĐ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="font-semibold mb-2">Top 5 số sự kiện</div>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">#</th>
                  <th className="text-left">Tên</th>
                  <th className="text-right">Sự kiện</th>
                </tr>
              </thead>
              <tbody>
                {(data.topEvent || []).map((org: any, idx: number) => (
                  <tr key={org._id}>
                    <td>{idx + 1}</td>
                    <td>{org.name}</td>
                    <td className="text-right">{org.eventCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></div>
          <div className="bg-white rounded-lg shadow p-6 col-span-1">
            <div className="font-semibold mb-2">Đăng ký theo ngày</div>
            <Line data={lineReg} />
          </div>
        

        
        {/* Modal chi tiết */}
        {selected && (
          <div className="fixed inset-0 bg-black/70 bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full relative mx-2">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                onClick={() => setSelected(null)}
              >✕</button>
              <h2 className="text-xl font-bold mb-4">Chi tiết ban tổ chức</h2>
              <div><b>Tên:</b> {selected.name}</div>
              <div><b>Email:</b> {selected.email}</div>
              <div><b>Mô tả:</b> {selected.description}</div>
              <div><b>Mạng xã hội:</b> {selected.social_link ? JSON.stringify(selected.social_link) : ""}</div>
              <div><b>Tài khoản thanh toán:</b> {selected.bank_account_number} - {selected.bank_account_holder} ({selected.bank_name})</div>
              <div><b>Trạng thái:</b> {selected.status}</div>
              <div><b>Số lượng sự kiện:</b> {selected.eventCount}</div>
              <div><b>Tổng doanh thu:</b> {selected.totalRevenue?.toLocaleString()} VNĐ</div>
              <div><b>Tổng vé:</b> {selected.totalTickets}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}