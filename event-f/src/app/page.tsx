"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/app/components/auth/AuthFrom";
import Link from "next/link";
import axios from "@/lib/axiosInstance";
import { IoClose } from "react-icons/io5";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/me", { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await axios.post("http://localhost:5000/auth/logout", {}, { withCredentials: true });
    setUser(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-blue-200 text-white p-3 flex justify-between items-center ">
        <Image src="/logoweb.svg" alt="Logo" width={240} height={80} className="ml-20" />
        <nav>
          <ul className="flex space-x-10">
            <li><a href="#" className="hover:underline">Trang chủ</a></li>
            <li><a href="#" className="hover:underline">Page1</a></li>
            <li><a href="#" className="hover:underline">Page2</a></li>
          </ul>
        </nav>
        <div>
          {user ? (
            <button className="bg-red-500 px-4 py-2 rounded" onClick={handleLogout}>Đăng xuất</button>
          ) : (
            <div className="relative mr-20 w-[122px] h-[30px] flex items-center justify-center group ">
               <div className="absolute inset-0 bg-[url('/boder-login.svg')] bg-center bg-contain  transition  group-hover:scale-109"></div>
              <button
                onClick={() => setShowAuth(!showAuth)}
                className=" relative text-white text-center font-semibold group-active:scale-90 duration-150"
              >
                ĐĂNG NHẬP
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <main className="flex-grow flex items-center justify-center bg-gray-100 text-center p-8">
        <h1 className="text-3xl font-bold">Chào mừng {user?.email || "bạn"} đến với EzZone</h1>
       
        {showAuth && (
          <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)]">
            
            
              <AuthForm onClose={() => setShowAuth(false)} setUser={setUser}/>
            
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