import Image from "next/image";
import { TiHome, TiPlus } from "react-icons/ti";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TbZoom } from "react-icons/tb";
import Link from "next/link";

interface HeaderProps {
  user: { email: string; name: string; avatar?: string; role?: string } | null;
  onLogout: () => void;
  onShowAuth: () => void;
}

export default function Header({ user, onLogout, onShowAuth }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  //console.log("User in Header:", user?.role);
  const listItemClass = "font-semibold flex text-[13px] cursor-pointer";

  return (
    <header className="border-b-2 border-gray-300 bg-white text-blue-950 p-3 flex justify-between items-center fixed w-full z-40">
      <Link href="#">
        <Image src="/logoweb.svg" alt="Logo" width={200} height={0} className="ml-20" />
      </Link>
      <nav>
        <ul className="flex space-x-20">
          <li className={listItemClass}>
            <div className="flex items-center relative">
              <div className="flex items-center border border-gray-300 rounded-[10px] h-8">
                <TbZoom className="text-gray-500 w-5 h-5 mr-2 ml-2" />
                <input
                  type="text"
                  className="outline-none text-sm text-gray-700 w-60"
                />
              </div>

              <button className="hover:scale-102 bg-white absolute text-blue-950 font-semibold ml-[-12px] border border-gray-300 w-20 rounded-[10px] h-9 right-0 ">
                Tìm kiếm
              </button>
            </div>
          </li>
          {user?.role === "organizer" && (
            <li
              onClick={() => router.push("/event-management")}
              className={listItemClass}
            >
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
          <div className="relative mr-20 w-[99px] h-[30px] flex items-center justify-center group">
            <div className="absolute inset-0 bg-[url('/boder-login.svg')] bg-center bg-contain transition group-hover:scale-109"></div>
            <button
              onClick={onShowAuth}
              className="relative text-blue-950 text-center font-semibold text-[14px] group-active:scale-90 
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
