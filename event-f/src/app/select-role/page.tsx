"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "@/lib/axiosInstance";

export default function SelectRolePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email");
  const name = searchParams.get("name");
  const avatar = searchParams.get("avatar");

  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!role) {
      alert("Vui lòng chọn vai trò!");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/google/callback", { email, name, avatar, role });
      router.push("/"); // Chuyển hướng về trang chủ sau khi chọn vai trò
    } catch (error) {
      console.error("Error selecting role:", error.response?.data || error.message);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Chọn vai trò của bạn</h1>
      <div className="flex space-x-4">
        <button
          onClick={() => setRole("user")}
          className={`px-4 py-2 rounded ${role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Người tham gia
        </button>
        <button
          onClick={() => setRole("organizer")}
          className={`px-4 py-2 rounded ${role === "organizer" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Ban tổ chức
        </button>
      </div>
      <button
        onClick={handleSubmit}
        className="mt-6 px-6 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : "Xác nhận"}
      </button>
    </div>
  );
}
