"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export default function OrganizerAuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email, password }
        : { email, password, role: "organizer", name };

      const response = await axios.post(endpoint, payload, { withCredentials: true });
      if (isLogin) {
        document.cookie = `jwt=${response.data.accessToken}; path=/; SameSite=Strict`;
        router.push("/");
      } else {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">{isLogin ? "Đăng nhập Ban tổ chức" : "Đăng ký Ban tổ chức"}</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin && (
          <Input
            type="text"
            placeholder="Tên tổ chức"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
        </Button>
      </form>
      <p className="mt-4">
        {isLogin ? "Bạn chưa có tài khoản?" : "Bạn đã có tài khoản?"}{" "}
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Đăng ký ngay" : "Đăng nhập ngay"}
        </span>
      </p>
    </div>
  );
}
