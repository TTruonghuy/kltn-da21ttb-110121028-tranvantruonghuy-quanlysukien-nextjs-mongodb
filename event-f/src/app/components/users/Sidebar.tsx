import { TiChevronLeft } from "react-icons/ti";

interface SidebarProps {
  isOrganizer?: boolean;
}

export default function Sidebar({ isOrganizer }: SidebarProps) {
  return (
    <div className="w-56 flex flex-col">
      <div className="mt-4 flex items-center justify-center h-18">
        <button
          className="flex items-center text-blue-700 font-bold text-xl px-8 py-4 rounded-lg hover:text-blue-900 transition"
          style={{ fontSize: "1.35rem" }}
          onClick={() => window.history.back()}
        >
          <TiChevronLeft size={32} className="mr-2" /> Trở lại
        </button>
      </div>
      <div className="h-100 border-r border-t">
        <nav className="flex flex-col gap-2">
          <button className="text-black font-bold border-l-4 border-blue-700 pl-2 bg-blue-100 py-2">
            {isOrganizer ? "Thông tin tổ chức" : "Hồ sơ"}
          </button>
          <button className="text-black pl-2 hover:font-bold hover:border-l-4 hover:border-blue-700 text-left py-2">
            Vé đã đặt
          </button>
        </nav>
      </div>
    </div>
  );
}