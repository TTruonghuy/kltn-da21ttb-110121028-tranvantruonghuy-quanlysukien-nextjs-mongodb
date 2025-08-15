import { TiChevronLeft } from "react-icons/ti";

interface SidebarProps {
  isOrganizer?: boolean;
  onSelectTab?: (tab: "profile" | "tickets") => void;
  currentTab?: "tickets" | "profile";
}

export default function Sidebar({ isOrganizer, onSelectTab, currentTab }: SidebarProps) {
  return (
    <div className="w-56 flex flex-col">
      
      <div className="mt-4 flex items-center justify-center h-18">
        <button
          className="flex items-center text-blue-950 font-bold px-8 py-2 rounded-lg hover:text-blue-900 transition hover:bg-gray-100"
          style={{ fontSize: "1.35rem" }}
          onClick={() => window.history.back()}
        >
          <TiChevronLeft size={25} className="mr-2" /> Trở lại
        </button>
      </div>
      <div className="h-100 border-r border-t">
        <nav className="flex flex-col gap-2">
          <button
            className={`mx-4 mt-2 border text-center px-4 py-2 hover:bg-gray-50 rounded-lg ${currentTab === "tickets" ? "bg-gray-100 font-bold" : ""}`}
            onClick={() => onSelectTab && onSelectTab("tickets")}
          >
            Vé đã đặt
          </button>
          <button
            className={`mx-4 mt border text-center px-4 py-2 hover:bg-gray-50 rounded-lg ${currentTab === "profile" ? "bg-gray-100 font-bold" : ""}`}
            onClick={() => onSelectTab && onSelectTab("profile")}
          >
            {isOrganizer ? "Thông tin tổ chức" : "Hồ sơ"}
          </button>
        </nav>
      </div>
    </div>
  );
}