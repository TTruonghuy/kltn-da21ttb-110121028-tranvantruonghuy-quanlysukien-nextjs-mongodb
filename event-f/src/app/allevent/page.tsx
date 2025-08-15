"use client";
import { useState, useEffect } from "react";
import Allevent from "../components/event/AllEvent";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSearchParams } from "next/navigation";
import Filler from "../components/Filler"

export default function AlleventPage() {
  const searchParams = useSearchParams();
  const eventType = searchParams.get("type") || "";
  const [user, setUser] = useState<any>(null);

  // Bộ lọc
  const [location, setLocation] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all");

  // Lấy user nếu cần cho Header
  useEffect(() => {
    fetch("http://localhost:5000/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  // Hàm lọc thời gian
  const getTimeRange = () => {
    const now = new Date();
    if (timeFilter === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }
    if (timeFilter === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start, end };
    }
    return null;
  };

  // Truyền props cho Allevent
  const filterProps = {
    eventType,
    location,
    timeRange: getTimeRange(),
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        user={user}
        onLogout={() => {
          fetch("http://localhost:5000/auth/logout", { method: "POST", credentials: "include" })
            .then(() => window.location.reload());
        }}
        onShowAuth={() => window.location.href = "/login"}
      />
           <div className="bg-white">  <Filler /></div>


      <main className="flex-grow py-2 pt-0 bg-white">
        <div className="flex justify-between items-center px-4">
          <p className="font-bold text-[12px]">Sự kiện: {eventType}</p>
          <div className="flex">
            {/* Lọc vị trí */}
            <input
              type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Nhập vị trí"
            className="border rounded-lg px-3 py-1 w-50 mr-2"
          />
          {/* Lọc thời gian */}
          <select
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value as any)}
            className="border rounded-lg px-2 py-1"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
          </select>
        </div>
</div>


        {/* Danh sách sự kiện */}
        <Allevent {...filterProps} />
      </main>
      <Footer />
    </div>
  );
}