"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { VscOrganization } from "react-icons/vsc";
import { RiUser5Line } from "react-icons/ri";
import { IoClose } from "react-icons/io5";

interface AuthFormProps {
  onClose: () => void; // Thêm prop onClose để đóng form
  setUser: (user: { email: string } | null) => void;
}

export default function AuthForm({ onClose, setUser }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
 
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  //const [user, setUser] = useState<{ email: string } | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", isOrganizer ? "organizer" : "attendee");
      if (!isLogin) {
        formData.append("name", name);
        if (image) formData.append("image", image);
      }

      await axios.post(endpoint, formData, { withCredentials: true });
      if (isLogin) {
        const res = await axios.get("http://localhost:5000/auth/me", { withCredentials: true });
        setUser(res.data.user);
        onClose();
        router.refresh();
      } else {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLogin(true);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-none items-center justify-center p-4">
      <div className="flex bg-white rounded-3xl shadow-xl w-[900px] overflow-hidden">

        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('../auth_image.jpeg')" }} />

        <div className="w-full md:w-1/2 pt-5 p-10 flex flex-col justify-center">
          <button className=" hover:text-red-500" onClick={onClose}>
            <IoClose className="pb-2 ml-[98%] w-8 h-8 " />
          </button>
          <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
            {isLogin ? "Đăng nhập" : isOrganizer ? "Đăng ký Ban tổ chức" : "Đăng ký Người tham gia"}
          </h2>
          {!isLogin && (
            <div className="flex justify-center mb-4 ">
              <Button onClick={() => setIsOrganizer(false)} className={!isOrganizer ? "bg-blue-500 text-white mr-4" : "bg-gray-300"}> <RiUser5Line /> Người tham gia</Button>
              <Button onClick={() => setIsOrganizer(true)} className={isOrganizer ? "bg-blue-500 text-white ml-4" : "bg-gray-300"}> <VscOrganization /> Ban tổ chức</Button>
            </div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <Input type="text" placeholder={isOrganizer ? "Tên tổ chức" : "Họ và tên"} value={name} onChange={(e) => setName(e.target.value)} className="w-full text-lg py-3 h-11" />
            )}
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-lg py-3 h-11" />
            <Input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-lg py-3 h-11" />
            {!isLogin && (
              <div className="flex items-center"><label className="text-gray-700  mr-3 whitespace-nowrap">
                {isOrganizer ? "Logo tổ chức:" : "Ảnh đại diện:"}
              </label><div className="w-full h-11 flex items-center border border-gray-300 rounded-lg px-3 hover:scale-102">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="w-full text-gray-600 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold"
                  />
                </div></div>
            )}
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-xl h-11" disabled={loading}>
              {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
            </Button>
          </form>
          <div className="text-center my-3 text-gray-500 text-lg">Hoặc đăng nhập với</div>
          <div className="flex justify-center space-x-5">
            <Button className="flex items-center px-6 w-[175px] py-3 bg-gray-200 text-gray-800 text-lg hover:bg-gray-300 h-11">
              <FaFacebook className="mr-2 text-2xl text-blue-600" /> Facebook
            </Button>
            <Button className="flex items-center px-6 w-[175px] py-3 bg-gray-200 text-gray-800 text-lg hover:bg-gray-300 h-11">
              <FcGoogle className="mr-2 text-2xl" /> Google
            </Button>
          </div>
          <p className="text-center mt-4 text-lg">
            {isLogin ? "Bạn chưa có tài khoản?" : "Bạn đã có tài khoản?"}
            <span className="text-blue-500 cursor-pointer hover:underline ml-1" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Đăng ký ngay" : "Đăng nhập ngay"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}