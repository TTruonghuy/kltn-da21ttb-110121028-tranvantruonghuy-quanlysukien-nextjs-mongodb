"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSearchParams } from "next/navigation";
import Allevent from "../components/event/AllEvent";
import Filler from "../components/Filler"

export default function FindPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:5000/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        user={user}
        onLogout={() => {
          fetch("http://localhost:5000/auth/logout", { method: "POST", credentials: "include" })
            .then(() => window.location.reload());
        }}
        onShowAuth={() => window.location.href = "/login"}
      />

      <div className="bg-white">  <Filler /></div>
      <main className="flex-grow py-2 pt-1 bg-white">
        <div className="flex justify-between items-center px-4">
          <p className="font-bold text-sm">Kết quả tìm kiếm: <span className="text-blue-700">{search}</span></p>
        </div>
        {/* Danh sách sự kiện */}
        <Allevent
          eventType=""
          province=""
          dates={[]}
          keyword={search}
        />
      </main>
      <Footer />
    </div>
  );
}