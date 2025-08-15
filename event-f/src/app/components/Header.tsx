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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const listItemClass = "font-semibold flex text-[13px] cursor-pointer";

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

  return (
    <header className="border-b border-gray-200 bg-white text-blue-950 pt-2 flex justify-between items-center w-full z-40">
      <Link href="/">
        <Image src="/logoweb.png" alt="Logo" width={90} height={0} className="ml-30 mb-2" />
      </Link>
      <nav className="flex items-center">
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
              onClick={() => window.open("/event-management", "_blank")}
              className={listItemClass}
            >
              QUẢN LÝ SỰ KIỆN
            </li>
          )}
        </ul>
      </nav>

      <div className="relative">
        {user ? (
          user.role === "admin" ? (
            // ✅ Nếu là admin thì chỉ hiển thị nút "Tới trang quản trị"
            <button
              onClick={() => router.push("/admin")}
              className="mr-10 text-blue-950 text-sm font-semibold transition hover:underline"
            >
              TRANG QUẢN TRỊ
            </button>
          ) : (
            // ✅ Người dùng bình thường hoặc organizer
            <div
              ref={menuRef}
              className="flex items-center space-x-3 cursor-pointer menu-container relative"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <img
                src={user.avatar || user.logo || "/avatar.jpg"}
                alt="Avatar"
                width={30}
                height={30}
                className="rounded-full border"
              />
              <span className="font-semibold pr-10">{user.name}</span>
              {menuOpen && (
                <div className="absolute right-8 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  {user.role === "organizer" ? (
                    <button
                      onClick={() => {
                        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
                          onLogout();
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          router.push("/users");
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Hồ sơ
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          router.push("/users");
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Vé của tôi
                      </button>
                      <button
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        ) : (
          <div className="relative mr-11 w-[99px] h-[30px] flex items-center justify-center group">
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
