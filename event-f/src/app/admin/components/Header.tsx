"use client";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const itemNames: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/events": "Sự kiện",
  "/admin/tickets": "Vé",
  "/admin/transactions": "Giao dịch",
  "/admin/users": "Người dùng",
  "/admin/organizers": "Ban tổ chức",
  "/admin/statistics": "Thống kê",
  "/admin/news": "Bản tin",
};

export default function Header() {
  const pathname = usePathname();
  const title = useMemo(() => {
    // Tìm tên item phù hợp với path hiện tại
    const found = Object.entries(itemNames).find(([key]) => pathname?.startsWith(key));
    return found ? found[1] : "";
  }, [pathname]);

  return (
    <div className="flex items-center justify-between mb-8 bg-white p-4">
      <div className="text-2xl font-bold text-blue-900">{title}</div>
      <div className="flex-1 flex justify-center">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>
      <div className="w-40" /> {/* Placeholder cho căn giữa ô tìm kiếm */}
    </div>
  );
}