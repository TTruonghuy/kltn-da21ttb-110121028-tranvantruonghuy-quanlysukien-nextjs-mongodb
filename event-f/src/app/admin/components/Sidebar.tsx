"use client"
import { FaChartBar, FaSignOutAlt, FaUser, FaUsers, FaCalendarAlt, FaNewspaper, FaExchangeAlt, FaHome } from "react-icons/fa";
import { usePathname } from "next/navigation";

interface SidebarProps {
  onLogout: () => void;
  selected?: string;
}

const sidebarItems = [
  { label: "Dashboard", icon: <FaHome />, path: "/admin" },
  { label: "Sự kiện", icon: <FaCalendarAlt />, path: "/admin/event" },
  { label: "Giao dịch", icon: <FaExchangeAlt />, path: "/admin/transactions" },
  { label: "Người dùng", icon: <FaUser />, path: "/admin/user" },
  { label: "Ban tổ chức", icon: <FaUsers />, path: "/admin/organizer" },
  { label: "Thanh toán", icon: <FaChartBar />, path: "/admin/payment" },
  { label: "Bản tin", icon: <FaNewspaper />, path: "/admin/new" },
];

export default function Sidebar({ onLogout, selected }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="w-50 bg-white border-r flex flex-col py-6 px-4 min-h-screen">
      <div className="mb-8 flex items-center gap-3">
        <img src="/logoweb.png" alt="Logo" className="w-15" />
        <span className="font-bold text-xl text-blue-950">Ve++</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-4">
          {sidebarItems.map(item => {
            const isActive =
              item.path === "/admin"
                ? pathname === "/admin" // Dashboard chỉ active khi đúng /admin
                : pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <li key={item.label}>
                <a
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition
                  ${isActive ? "bg-blue-100 text-blue-900 font-bold" : "text-gray-700 hover:bg-blue-100"}`}
                >
                  {item.icon}
                  {item.label}
                </a>
              </li>
            );
          })}
          <li>
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-100 font-medium transition w-full text-left"
            >
              <FaSignOutAlt />
              Đăng xuất
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}