"use client";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen bg-[#f6f8fb]">
      <Sidebar />
      <main className="flex-1">
       {/* <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-900">Dashboard</h1>
        </div>
         Nội dung dashboard, biểu đồ, bảng... */}
         <Header />
         <div className="p-10">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500">Số sự kiện</div>
            <div className="text-3xl font-bold">3</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500">Số vé đã bán</div>
            <div className="text-3xl font-bold">-</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500">Tổng giao dịch</div>
            <div className="text-3xl font-bold">-</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <div className="text-lg font-semibold mb-2">Thống kê tổng quan</div>
          <div className="h-40 flex items-center justify-center text-gray-400">[Biểu đồ hoặc bảng thống kê]</div>
        </div>
        </div>
      </main>
    </div>
  );
}