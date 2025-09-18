"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/app/components/auth/AuthForm";
import CreateEventForm from "@/app/components/event[organizer]/CreateEventForm";
import axios from "@/lib/axiosInstance";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import EventList from "@/app/components/event/EventList";
import Slider from "@/app/components/Slider";
import Filler from "@/app/components/Filler";


export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string; avatar?: string; role?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const searchParams = useSearchParams();
  const eventType = searchParams.get("type") || "";


  useEffect(() => {
    if (searchParams.get("showAuth") === "true") {
      setShowAuth(true);
    }
  }, [searchParams]);

  // Fetch user data on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/me", { withCredentials: true })
      .then((res) => {
        if (res.data && res.data.user) {
          const fetchedUser = res.data.user;
          setUser(fetchedUser);

          // Nếu là admin thì chuyển hướng sang /admin
          if (fetchedUser.role === "admin") {
            router.push("/admin");
          }
        } else {
          setUser(null);
          router.push("/");
        }
      })
      .catch(() => {
        setUser(null);
        router.push("/");
      });
  }, []);

  // Handle logout
  const handleLogout = async () => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
    if (!confirmed) return;
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
      <Filler />
      <Slider />
      <main className="flex-grow flex flex-col items-center justify-center text-center pt-1">
        {showAuth && (
          <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] z-41">
            <AuthForm onClose={() => setShowAuth(false)} setUser={setUser} />
          </div>
        )}
        <div className="mt-2">
          <div className="h-96">
            <EventList filterType="âm nhạc" />
          </div>
          <div className="h-96">
            <EventList filterType="văn hóa nghệ thuật" />
          </div>
          <div className="h-96">
            <EventList filterType="thể thao" />
          </div>
          <div className="h-96">
            <EventList filterType="khác" />
          </div>
          </div>
      </main>

      <Footer />
    </div>
  );
}