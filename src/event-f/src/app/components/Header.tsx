import Image from "next/image";
import { TiHome, TiPlus } from "react-icons/ti";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TbZoom } from "react-icons/tb";
import Link from "next/link";

interface HeaderProps {
  user: {
    email: string;
    name: string;
    avatar?: string;
    logo?: string;
    role?: string;
  } | null;
  onLogout: () => void;
  onShowAuth: () => void;
}

export default function Header({ user, onLogout, onShowAuth }: HeaderProps) {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const listItemClass = "font-semibold flex text-[16px] cursor-pointer";

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/find?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white text-blue-950 pt-2 flex items-center w-full z-40 pl-40 ">
      {/* 1. Logo */}
      <div className="flex-1 flex justify-start mb-2 group relative">
        <Link href="/">
          <Image src="/logoweb.png" alt="Logo" width={90} height={0} className="hover:scale-101" />
        </Link>
        <span className="absolute left-24 top-6 mt-1 text-xs text-gray-400 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
          Trang chủ
        </span>
      </div>


      {/* 2. Tìm kiếm */}
      <div className="flex-1 flex justify-center absolute z-41 left-135">
        <div className="flex items-center relative">
          <div className="flex items-center border border-gray-300 rounded-[10px] h-8">
            <TbZoom className="text-gray-500 w-5 h-5 mr-2 ml-2" />
            <input
              type="text"
              className="outline-none text-sm text-gray-700 w-60"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
            />
          </div>
          <button
            className="hover:scale-102 bg-white absolute text-blue-950 font-semibold ml-[-12px] border border-gray-300 w-20 rounded-[10px] h-9 right-0"
            onClick={handleSearch}
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* 3. Vé của tôi / Quản lý sự kiện */}
      <div className="flex justify-end items-center space-x-2">
        <nav className="">
          <ul className="flex space-x-4">
            {user?.role === "organizer" && (
              <li
                onClick={() => window.open("/event-management", "_blank")}
                className={listItemClass}
              >
                <p className="hover:scale-102 flex"> Quản lý sự kiện </p> <p className="pl-2 text-gray-400">|</p>
              </li>
            )}
            {user?.role === "user" && (
              <li
                onClick={() => router.push("/users?tab=tickets")}
                className={listItemClass}
              >
                <img src="/button.svg" alt="" className="w-28 hover:scale-102" />
              </li>
            )}
          </ul>
        </nav>




        {/* 4. Avatar + Tên / Đăng nhập */}
        <div className="flex">
          {user ? (
            user.role === "admin" ? (
              <button
                onClick={() => router.push("/admin")}
                className="mr-10 text-blue-950 text-sm font-semibold transition hover:underline"
              >
                TRANG QUẢN TRỊ
              </button>
            ) : (
              <div
                ref={menuRef}
                className="flex items-center space-x-1 cursor-pointer menu-container relative"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <img
                  src={user.avatar || user.logo || "/avatar.jpg"}
                  alt="Avatar"
                  width={30}
                  height={30}
                  className="rounded-full border"
                />
                <span className="font-semibold pr-10 flex">{user.name}</span>
                {menuOpen && (
                  <div className="absolute right-8 top-full mt-2 w-36 bg-blue-50 rounded-md shadow-lg z-10">
                    {user?.role === "user" && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          router.push("/users?tab=profile");
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100"
                      >
                        Thông tin
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
                          onLogout();
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="relative mr-11 w-[99px] h-[30px] flex items-center justify-center group">
              <div className="absolute inset-0 bg-[url('/boder-login.svg')] bg-center bg-contain transition group-hover:scale-109"></div>
              <button
                onClick={onShowAuth}
                className="relative text-blue-950 text-center font-semibold text-[14px] group-active:scale-90 duration-150"
              >
                ĐĂNG NHẬP
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );

}
