"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/app/components/auth/AuthFrom";
import CreateEventForm from "@/app/components/event/CreateEventForm";
import axios from "@/lib/axiosInstance";
import { TiHome, TiPlus } from "react-icons/ti";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string; avatar?: string; role?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/me", { withCredentials: true })
      .then((res) => {
        if (res.data && res.data.user) {
          setUser(res.data.user); // Đảm bảo user chứa name, email, và avatar
        } else {
          console.error("Invalid user data:");
          setUser(null);
        }
      })
      .catch((err) => {
        //console.error("Error fetching user data:");
        setUser(null);
      });
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/auth/logout", {}, { withCredentials: true });
      setUser(null);
      router.refresh();
    } catch (err) {
      console.error("Lỗi"); // Log lỗi
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".menu-container")) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  const listItemClass = "font-semibold flex text-[13px]";

  return (
    <div className="flex flex-col min-h-screen">
      <Header onLogout={handleLogout} onShowAuth={() => setShowAuth(true)} user={user} />
      {/* Body */}
      <main className="flex-grow flex flex-col items-center justify-center bg-gray-100 text-center p-8">
        <h1 className="text-3xl font-bold mb-6">Chào mừng {user?.name || "bạn"} </h1>
        {user?.avatar && (
          <div className="mb-4">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full border border-gray-300"
            />
          </div>
        )}
        {user?.role === "organizer" && (
          <button
            onClick={() => setShowCreateEvent(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Tạo sự kiện
          </button>
        )}
        {showCreateEvent && (
          <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)]">
            <CreateEventForm onClose={() => setShowCreateEvent(false)} />
          </div>
        )}
        {showAuth && (
          <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)]">
            <AuthForm onClose={() => setShowAuth(false)} setUser={setUser} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}