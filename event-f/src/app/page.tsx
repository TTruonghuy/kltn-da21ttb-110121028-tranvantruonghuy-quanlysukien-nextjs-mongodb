"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/app/components/auth/AuthFrom";
import axios from "@/lib/axiosInstance";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string; avatar?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/me", { withCredentials: true })
      .then((res) => {
        console.log("User data fetched:", res.data); // Log thông tin user
        setUser(res.data.user); // Đảm bảo user chứa name, email, và avatar
      })
      .catch((err) => {
        console.error("Error fetching user data:", err.response || err.message);
        setUser(null);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/auth/logout", {}, { withCredentials: true });
      setUser(null);
      router.refresh();
    } catch (err) {
      console.error("Error during logout:", err.message); // Log lỗi
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-blue-200 text-white p-3 flex justify-between items-center">
        <Image src="/logoweb.svg" alt="Logo" width={240} height={80} className="ml-20" />
        <nav>
          <ul className="flex space-x-10">
            <li><a href="#" className="hover:underline">Trang chủ</a></li>
            <li><a href="#" className="hover:underline">Page1</a></li>
            <li><a href="#" className="hover:underline">Page2</a></li>
          </ul>
        </nav>
        <div className="relative">
          {user ? (
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
              <img
                src={user.avatar || "/default-avatar.png"} // Thay thế bằng thẻ <img>
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-semibold">{user.name}</span>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative mr-20 w-[122px] h-[30px] flex items-center justify-center group">
              <div className="absolute inset-0 bg-[url('/boder-login.svg')] bg-center bg-contain transition group-hover:scale-109"></div>
              <button
                onClick={() => setShowAuth(!showAuth)}
                className="relative text-white text-center font-semibold group-active:scale-90 duration-150"
              >
                ĐĂNG NHẬP
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <main className="flex-grow flex items-center justify-center bg-gray-100 text-center p-8">
        <h1 className="text-3xl font-bold">Chào mừng {user?.name || "bạn"} đến với EzZone</h1>

        {showAuth && (
          <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)]">
            <AuthForm onClose={() => setShowAuth(false)} setUser={setUser} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-center p-4">
        © 2025 EzZone. All rights reserved.
      </footer>
    </div>
  );
}