"use client"
import { FaChartBar, FaTicketAlt, FaUser, FaUsers, FaCalendarAlt, FaNewspaper, FaExchangeAlt, FaHome } from "react-icons/fa";

const sidebarItems = [
  { label: "Dashboard", icon: <FaHome />, path: "/admin" },
  { label: "Sự kiện", icon: <FaCalendarAlt />, path: "/admin/events" },
  { label: "Vé", icon: <FaTicketAlt />, path: "/admin/tickets" },
  { label: "Giao dịch", icon: <FaExchangeAlt />, path: "/admin/transactions" },
  { label: "Người dùng", icon: <FaUser />, path: "/admin/users" },
  { label: "Ban tổ chức", icon: <FaUsers />, path: "/admin/organizers" },
  { label: "Thống kê", icon: <FaChartBar />, path: "/admin/statistics" },
  { label: "Bản tin", icon: <FaNewspaper />, path: "/admin/news" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r flex flex-col py-6 px-4 min-h-screen">
      <div className="mb-8 flex items-center gap-3">
        <img src="/logoweb.svg" alt="Logo" className="w-10 h-10" />
        <span className="font-bold text-xl text-blue-700">Admin Panel</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-4">
          {sidebarItems.map(item => (
            <li key={item.label}>
              <a
                href={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-100 font-medium transition"
              >
                {item.icon}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}