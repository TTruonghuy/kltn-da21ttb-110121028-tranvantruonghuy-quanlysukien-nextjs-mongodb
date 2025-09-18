"use client";
import { useState, useEffect } from "react";
import Allevent from "../components/event/AllEvent";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSearchParams } from "next/navigation";
import Filler from "../components/Filler"
import { IoFilter } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import provincesData from "../components/ui/vietnam-provinces.json";
import Calendar, { DateObject } from "react-multi-date-picker";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { vi } from "date-fns/locale";



export default function AlleventPage() {
  const searchParams = useSearchParams();
  const eventType = searchParams.get("type") || "";
  const [user, setUser] = useState<any>(null);

  // Modal filter
  const [showFilter, setShowFilter] = useState(false);
  const [province, setProvince] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const [filter, setFilter] = useState({
    province: "",
    dates: [] as Date[],
    keyword: "",
  });

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
    return null; // Tạm giữ, xóa nếu không cần
  };

  const handleDayClick = (date: Date) => {
    setSelectedDates(prev => {
      const exists = prev.some(d => d.toDateString() === date.toDateString());
      if (exists) {
        return prev.filter(d => d.toDateString() !== date.toDateString());
      } else {
        return [...prev, date];
      }
    });
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
      <main className="flex-grow py-2 pt-1 bg-white">
        <div className="flex justify-between items-center px-4">
          <p className="font-bold text-sm">Sự kiện: {eventType}</p>
          <div
            className="flex text-sm px-2 py-1 border-b hover:scale-102 items-center mr-8 text-blue-950 font-bold cursor-pointer"
            onClick={() => setShowFilter(!showFilter)} // Chuyển đổi trạng thái modal
          >
            {showFilter ? <IoClose className="mr-2" /> : <IoFilter className="mr-2" />} {/* Thay đổi icon dựa trên showFilter */}
            {showFilter ? "Đóng" : "Bộ lọc"} {/* Thay đổi text tùy chọn */}
          </div>
        </div>

        {/* Modal bộ lọc */}
        {showFilter && (
          <div className="fixed inset-0  flex items-center z-50 top-20 left-222"
            onClick={(e) => {
              // Đóng modal khi nhấp vào lớp phủ
              if (e.target === e.currentTarget) {
                setShowFilter(false);
              }
            }}>
            <div className="bg-blue-100 text-sm rounded-lg w-[340px] max-w-[95vw] relative">
              {/* Vị trí */}
              <div className="mb-1 flex items-center pt-4 px-4 justify-between">
                <label className=" mb-1 font-medium">Vị trí:</label>
                <input
                  type="text"
                  className=" rounded-lg p-2 w-62 ml-4 mb-1 bg-white"
                  placeholder="Nhập tên tỉnh/thành"
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                // list="province-list"
                />
                {province && (
                  <ul className="absolute bg-white border rounded-lg mt-1 max-h-60 overflow-y-auto 
                   scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 px-2 z-50 top-12 ml-20">
                    {provincesData
                      .filter((p: any) => p.name.toLowerCase().includes(province.toLowerCase()))
                      .map((p: any) => (
                        <li
                          key={p.name}
                          className="p-2 hover:bg-blue-100 cursor-pointer"
                          onClick={() => setProvince(p.name)}
                        >
                          {p.name}
                        </li>
                      ))}
                  </ul>
                )}
              </div>


              {/* Lịch chọn ngày */}
              <div className="mb-2 px-4">
                <div className="flex justify-between flex-col-2">
                  <DayPicker
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={dates => setSelectedDates(dates || [])}
                    fromDate={new Date()}
                    showOutsideDays
                    className="bg-white rounded-lg shadow p-2"
                    required={false}
                    locale={vi} // nếu muốn tiếng Việt, import locale từ date-fns/locale/vi
                  />
                </div>
              </div>

              {/* Khác */}
              <div className="mb-4 flex items-center px-4 justify-between">
                <label className="block mb-1 font-medium">Khác:</label>
                <input
                  type="text"
                  className="bg-white rounded-lg w-62 ml-4 p-2 "
                  placeholder="Nhập tên ca sĩ, tên sự kiện..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pb-4 px-4">
                <button
                  className="px-4 py-2 rounded-lg bg-white"
                  onClick={() => {
                    setProvince("");
                    setSelectedDates([]);
                    setKeyword("");
                    setFilter({ province: "", dates: [], keyword: "" });
                  }}
                >
                  Thiết lập lại
                </button>

                <button
                  className="px-4 py-2 rounded-lg bg-blue-950 text-white"
                  onClick={() => {
                    setFilter({
                      province,
                      dates: selectedDates,
                      keyword,
                    });
                    setShowFilter(false);
                  }}
                >
                  Áp dụng
                </button>

              </div>
            </div>
          </div>
        )}

        {/* Danh sách sự kiện */}
        <Allevent
          eventType={eventType}
          province={filter.province}
          dates={filter.dates}
          keyword={filter.keyword}
        />
      </main>
      <Footer />
    </div>
  );
}