"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { IoClose } from "react-icons/io5";
import Image from "next/image";

interface AuthFormProps {
  onClose: () => void; // Đóng form
  setUser: (user: { email: string; name: string; avatar?: string } | null) => void; // Cập nhật user
}

export default function AuthForm({ onClose, setUser }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true); // Đăng nhập hay đăng ký
  const [isOrganizer, setIsOrganizer] = useState(false); // Quyền hiện tại
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showVerifyBlock, setShowVerifyBlock] = useState(false);


  const [step, setStep] = useState<"register" | "verify">("register");
  const [sendingCode, setSendingCode] = useState(false);



  const [codeExpire, setCodeExpire] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!codeExpire) return;
    const timer = setInterval(() => {
      const remain = Math.max(0, Math.floor((codeExpire - Date.now()) / 1000));
      setCountdown(remain);
      if (remain === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [codeExpire]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);


    if (!isLogin && password !== confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      setLoading(false);
      return;
    }

    // Kiểm tra mã xác minh trước khi đăng ký
    if (!isLogin) {
      try {
        const res = await axios.post("/auth/verify-email-code", { email, code: verificationCode });
        if (res.data.message !== "Xác minh thành công") {
          alert("Mã xác minh không đúng 1!");
          setLoading(false);
          return;
        }
      } catch (error: any) {
        alert(error.response?.data?.message || "Mã xác minh không đúng 2!");
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email, password }
        : { email, password, role: isOrganizer ? "organizer" : "user", name };

      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", isOrganizer ? "organizer" : "user");
      formData.append("name", name);
      if (image) {
        formData.append("image", image);
      }

      const response = await axios.post(endpoint, isLogin ? payload : formData, {
        withCredentials: true,
        headers: isLogin ? {} : { "Content-Type": "multipart/form-data" },
      });

      if (isLogin) {
        document.cookie = `jwt=${response.data.accessToken}; path=/; SameSite=Strict`;
        const res = await axios.get("/auth/me", { withCredentials: true });
        setUser(res.data.user);
        onClose();
        router.refresh();
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
    <div className="flex flex-col bg-none pt-20 pb-20">
      <div className="flex justify-center">

        <button
          onClick={() => setIsOrganizer(false)}
          className={!isOrganizer ? "bg-white text-gray-700  w-[600px] h-12 rounded-tl-3xl rounded-tr-3xl" : " bg-white w-[200px] h-12 rounded-tl-3xl rounded-tr-3xl text-gray-400"}
        >
          <p className="font-bold">Người tham dự</p>
        </button>

        <button
          onClick={() => setIsOrganizer(true)}
          className={isOrganizer ? "bg-blue-100 text-gray-700 ml-1 w-[600px] h-12 rounded-tl-3xl rounded-tr-3xl" : "ml-1 bg-blue-50 w-[200px] h-12 rounded-tl-3xl rounded-tr-3xl text-gray-400"}
        >
          <p className="font-bold">Ban tổ chức</p>
        </button>
      </div>


      <div
        className={`flex ${isOrganizer ? "bg-blue-100" : "bg-white"
          } rounded-bl-3xl rounded-br-3xl shadow-xl  overflow-hidden justify-between p-4`}
      >
        {/* Thay đổi ảnh nền dựa trên isOrganizer */}
        <div
          className="hidden md:block w-[60%] bg-center"
          style={{
            backgroundRepeat: "no-repeat",
            backgroundImage: isOrganizer
              ? "url('../origanizer.png')" // Ảnh nền cho Ban tổ chức
              : "url('../user1.png')", // Ảnh nền cho Người tham dự
          }}
        />

        <div className="pt-2 p-4 pl-5 w-[366px] flex flex-col justify-center">
          <button className="flex ml-[82%] mr-[-20px] justify-end group text-[0px] hover:scale-110 hover:text-[15px] hover:text-red-700" onClick={onClose}>
            <IoClose className=" flex pb-2 w-8 h-8 " /> Đóng
          </button>

          <h4 className="text-[20px] font-bold text-center mb-2 text-gray-700">
            {isLogin ? (isOrganizer ? "Đăng nhập Ban tổ chức" : "Đăng nhập Người tham gia") : isOrganizer ? "Đăng ký Ban tổ chức" : "Đăng ký Người tham gia"}
          </h4>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {!isLogin && (
              <Input
                type="text"
                placeholder={isOrganizer ? "Tên tổ chức" : "Họ và tên"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="py-3 h-9"
                required
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className=" py-3 h-9"
              required
            />
            <Input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 h-9"
              required
            />

            {!isLogin && (
              <Input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full py-3 h-9"
                required
              />
            )}

            {!isLogin && (
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Mã xác minh"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  className="w-full py-3 h-9"
                  required
                />
                {emailSent && (
                  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                    {countdown > 0 ? `${countdown}s` : "Hết hạn"}
                  </span>
                )}
                <Button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-200 text-black py-2"
                  onClick={async () => {
                    setSendingCode(true);
                    try {
                      await axios.post("/auth/send-verification-code", { email });
                     // alert("Đã gửi mã xác minh!");
                      setEmailSent(true);
                      setCodeExpire(Date.now() + 5 * 60 * 1000);
                    } catch (error) {
                      alert("Gửi mã thất bại!");
                    } finally {
                      setSendingCode(false);
                    }
                  }}
                  disabled={!email || sendingCode}
                >
                  {sendingCode ? "Đang gửi..." : emailSent ? "Gửi lại" : "Nhận mã"}
                </Button>
              </div>
            )}
            <Button type="submit" className="w-full bg-blue-950 hover:bg-blue-800 text-white py-2 text-lg" disabled={loading}>
              {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
            </Button>


          </form>


          <div className="text-center my-2 text-gray-500 text-[14px]">Hoặc đăng nhập với</div>
          <div className="flex justify-center space-x-5">

            <Button
              onClick={() => {
                const role = isOrganizer ? "organizer" : "user"; // Role được xác định từ AuthForm
                console.log("Google OAuth Role (Frontend):", role); // Log role để kiểm tra
                const googleAuthUrl = `http://localhost:5000/auth/google?role=${encodeURIComponent(role)}`; // Gửi role đến backend
                window.location.href = googleAuthUrl; // Chuyển hướng đến backend
              }}
              className="flex items-center px-6 bg-gray-300 text-gray-800 text-lg hover:bg-gray-200 py-2 w-full"
            >
              <FcGoogle className="mr-2 text-lg" /> Google
            </Button>
          </div>
          <p className="text-center mt-4 text-[14px]">
            {isLogin ? "Bạn chưa có tài khoản?" : "Bạn đã có tài khoản?"}{" "}
            <span className="text-blue-500 cursor-pointer hover:underline ml-1" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Đăng ký ngay" : "Đăng nhập ngay"}
            </span>
          </p>


        </div>
      </div>
    </div>
  );
}