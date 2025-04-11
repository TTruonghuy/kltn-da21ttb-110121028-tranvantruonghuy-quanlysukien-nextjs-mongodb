import Image from "next/image";
import { TiHome, TiPlus } from "react-icons/ti";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  user: { email: string; name: string; avatar?: string; role?: string } | null;
  onLogout: () => void;
  onShowAuth: () => void;
}

export default function Header({ user, onLogout, onShowAuth }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  console.log("User in Header:", user?.role);
  const listItemClass = "font-semibold flex text-[13px] cursor-pointer";

  return (
    <header className="bg-blue-300 text-white p-3 flex justify-between items-center fixed w-full z-40">
      <Image src="/logoweb.svg" alt="Logo" width={200} height={0} className="ml-20" />
      <nav>
        <ul className="flex space-x-20">
          <li
            onClick={() => router.push("/")}
            className={listItemClass}
          >
            <TiHome className="w-4 h-5 mr-[3px]" /> TRANG CHỦ
          </li>
          <li><a href="#" className={listItemClass}> Page1</a></li>
          {user?.role === "organizer" && (
            <li
              onClick={() => router.push("/event-management")}
              className={listItemClass}
            >
              <TiPlus className="w-5 h-5.5 mr-[3px]" />
              QUẢN LÝ SỰ KIỆN
            </li>
          )}
        </ul>
      </nav>
      <div className="relative">
        {user ? (
          <div className="flex items-center space-x-3 cursor-pointer menu-container" onClick={() => setMenuOpen(!menuOpen)}>
            <img
              src={user.avatar || "/default-avatar.png"}
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-semibold">{user.name}</span>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <button
                  onClick={onLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative mr-20 w-[98px] h-[24px] flex items-center justify-center group">
            <div className="absolute inset-0 bg-[url('/boder-login.svg')] bg-center bg-contain transition group-hover:scale-109"></div>
            <button
              onClick={onShowAuth}
              className="relative text-white text-center font-semibold text-[13px] group-active:scale-90 
                       duration-150"
            >
              ĐĂNG NHẬP
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
