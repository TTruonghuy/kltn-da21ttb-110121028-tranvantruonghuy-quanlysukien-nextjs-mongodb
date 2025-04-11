"use client";
import { useState, useEffect } from "react";
import CreateEventForm from "./CreateEventForm";
import Header from "@/app/components/Header";
import axios from "@/lib/axiosInstance";

export default function EventManagementPage() {
  const [activeTab, setActiveTab] = useState("create-event"); // Tab mặc định là "Tạo sự kiện"
  const [user, setUser] = useState<{ email: string; name: string; avatar?: string; role?: string } | null>(null);

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
        console.error("Error fetching user data:", err);
        setUser(null);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header
        user={user} // Truyền thông tin người dùng thực tế
        onLogout={() => {
          axios.post("http://localhost:5000/auth/logout", {}, { withCredentials: true }).then(() => {
            setUser(null);
            window.location.href = "/";
          });
        }}
        onShowAuth={() => console.log("Show Auth")}
      />

      {/* Nội dung chính */}
      <div className="flex flex-grow  ">
        {/* Navbar bên trái */}
        <nav className="w-64 h-[510px] bg-blue-200 flex flex-col p-4 rounded-lg m-5 fixed top-25">
          <h2 className="text-xl font-bold mb-6">Quản lý sự kiện</h2>
          <button
            onClick={() => setActiveTab("create-event")}
            className={`py-2 px-4 mb-2 text-left rounded ${
              activeTab === "create-event" ? "bg-blue-400 text-white" : "hover:bg-blue-400"
            }`}
          >
            Tạo sự kiện
          </button>
          <button
            onClick={() => setActiveTab("other-feature-1")}
            className={`py-2 px-4 mb-2 text-left rounded ${
              activeTab === "other-feature-1" ? "bg-blue-400 text-white" : "hover:bg-blue-400"
            }`}
          >
            Khác (làm sau)
          </button>
          <button
            onClick={() => setActiveTab("other-feature-2")}
            className={`py-2 px-4 text-left rounded ${
              activeTab === "other-feature-2" ? "bg-blue-400 text-white" : "hover:bg-blue-400"
            }`}
          >
            Khác (làm sau)
          </button>
        </nav>

        {/* Nội dung chính */}
        <main className="flex-grow p-10 pt-4 bg-blue-100 rounded-lg mt-30 mr-5 mb-5 ml-[300px] ">
          {activeTab === "create-event" && (
            <div>
              <h1 className="text-2xl font-bold mb-5 text-center">Tạo sự kiện</h1>
              <CreateEventForm onClose={() => {}} />
            </div>
          )}
          {activeTab === "other-feature-1" && (
            <div>
              <h1 className="text-2xl font-bold mb-4">Khác (làm sau)</h1>
              <p>Chức năng này sẽ được phát triển sau.</p>
            </div>
          )}
          {activeTab === "other-feature-2" && (
            <div>
              <h1 className="text-2xl font-bold mb-4">Khác (làm sau)</h1>
              <p>Chức năng này sẽ được phát triển sau.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
