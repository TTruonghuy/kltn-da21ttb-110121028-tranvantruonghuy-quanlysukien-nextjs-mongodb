"use client"
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Button } from "@/app/components/ui/button";

interface UserProfileProps {
  user: {
    _id?: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    province?: string;
    district?: string;
    ward?: string;
    address?: string;
    role?: string;

    description?: string;
    weblink?: string;
    social_link?: string;
    logo?: string;
    bank_name?: string;            // Thêm
    bank_account_number?: string;  // Thêm
    bank_account_holder?: string;
  };
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

export default function UserProfile({ user, onUpdate, onDelete }: UserProfileProps) {
  const [form, setForm] = useState({ ...user });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);


  useEffect(() => {
    setForm({ ...user });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (
      e.target instanceof HTMLInputElement &&
      e.target.type === "file" &&
      e.target.files
    ) {
      setLogoFile(e.target.files[0]);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };



  // ...existing code...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let res;
      if (form.role === "organizer" && logoFile) {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (value !== undefined && value !== null) formData.append(key, value as string);
        });
        formData.append("logo", logoFile);
        res = await fetch("http://localhost:5000/organizer/me", {
          method: "PUT",
          credentials: "include",
          body: formData,
        });
      } else if (form.role === "organizer") {
        res = await fetch("http://localhost:5000/organizer/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(`http://localhost:5000/users/${user._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
      }

      if (res.ok) {
        const updated = await res.json();
        if (updated && updated._id) {
          setSuccess(true);
          onUpdate(updated);
        } else {
          setSuccess(true);
          // Không gọi onUpdate nếu không có user mới
        }
      } else {
        let msg = "Cập nhật thất bại!";
        try {
          const errData = await res.json();
          if (errData?.message) msg = errData.message;
        } catch { }
        setError(msg);
      }
    } catch (err) {
      setError("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const isChanged = JSON.stringify(form) !== JSON.stringify(user);


  const isOrganizer = user.role === "organizer";


  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Sidebar
      {!isOrganizer && <Sidebar isOrganizer={isOrganizer} />} */}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header user info */}
        {!isOrganizer && (
          <div className="flex items-center px-6 py-4 border-b ">
            <img
              src={form.avatar || "/default-avatar.png"}
              alt="Avatar"
              className="w-14 h-14 rounded-full mr-6 bg-white border"
            />
            <div>
              <div className="font-semibold text-xl">{form.name}</div>
              <div className="text-gray-600 text-sm">{form.email}</div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="flex-1 flex justify-center items-center py-2 flex-col">
          <h2 className="text-2xl font-semibold mt-4 ">
            {isOrganizer ? "Thông tin tổ chức" : "Thông tin cá nhân"}
          </h2>
          {success && <div className="text-green-600 ">Cập nhật thành công!</div>}
          <form className="w-full max-w-2xl space-y-8 bg-white p-8" onSubmit={handleSubmit}>
            {/* Họ tên hoặc tên tổ chức */}
            <div className="flex items-center mb-4">
              <label className="w-40 font-semibold">{isOrganizer ? "Tên tổ chức" : "Họ tên"}</label>
              {isOrganizer ? (
                <input
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="Tên tổ chức"
                />
              ) : (
                <input
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="Tên người dùng"
                />
              )}
            </div>
            {/* Email */}
            <div className="flex items-center mb-4">
              <label className="w-40 font-semibold">Email</label>
              <div className="flex-1 border-b px-3 py-2">{form.email}</div>
            </div>
            {/* Số điện thoại */}
            <div className="flex items-center mb-4">
              <label className="w-40 font-semibold">Số điện thoại</label>
              <input
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                className="flex-1 border rounded-lg px-3 py-2"
                placeholder="Số điện thoại"
              />
            </div>
            {/* Địa chỉ */}
            <div className="flex items-center mb-4">
              <label className="w-40 font-semibold">Địa chỉ</label>
              <input
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                className="flex-1 border rounded-lg px-3 py-2"
                placeholder="Địa chỉ"
              />
            </div>
            {/* Các trường riêng cho organizer */}
            {isOrganizer && (
              <>
                <div className="flex items-center mb-4">
                  <label className="w-40 font-semibold">Giới thiệu</label>
                  <textarea
                    name="description"
                    value={form.description || ""}
                    onChange={handleChange}
                    className="flex-1 border rounded-lg px-3 py-2 h-24 resize-none"
                    placeholder="Mô tả tổ chức"

                  />
                </div>
                <div className="flex items-center mb-4">
                  <label className="w-40 font-semibold">Website</label>
                  <input
                    name="weblink"
                    value={form.weblink || ""}
                    onChange={handleChange}
                    className="flex-1 border rounded-lg px-3 py-2"
                    placeholder="Website"
                  />
                </div>
                <div className="flex items-center mb-4">
                  <label className="w-40 font-semibold">Mạng xã hội</label>
                  <input
                    name="social_link"
                    value={form.social_link || ""}
                    onChange={handleChange}
                    className="flex-1 border rounded-lg px-3 py-2"
                    placeholder="Link mạng xã hội"
                  />
                </div>
                <div className="flex items-center mb-4 ">
                  <label className="w-40 font-semibold">Logo</label>
                  <input
                    className="border text-gray-600 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold text-[12px] w-full flex-1 rounded-lg"
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center mb-4">
                  <label className="w-40 font-semibold">Ngân hàng</label>
                  <input
                    name="bank_name"
                    value={form.bank_name || ""}
                    onChange={handleChange}
                    className="flex-1 border rounded-lg px-3 py-2"
                    placeholder="Tên ngân hàng"
                  />
                </div>
                <div className="flex items-center mb-4">
                  <label className="w-40 font-semibold">Số tài khoản</label>
                  <input
                    name="bank_account_number"
                    value={form.bank_account_number || ""}
                    onChange={handleChange}
                    className="flex-1 border rounded-lg px-3 py-2"
                    placeholder="Số tài khoản"
                  />
                </div>
                <div className="flex items-center mb-4">
                  <label className="w-40 font-semibold">Tên chủ tài khoản</label>
                  <input
                    name="bank_account_holder"
                    value={form.bank_account_holder || ""}
                    onChange={handleChange}
                    className="flex-1 border rounded-lg px-3 py-2"
                    placeholder="Tên chủ tài khoản"
                  />
                </div>
              </>
            )}



            {/* Các trường cho user thường */}
            {!isOrganizer && (
              <>
                <div className="flex items-center mb-4">
                  <label className="w-40 font-semibold">Tỉnh/Thành phố</label>
                  <input
                    name="province"
                    value={form.province || ""}
                    onChange={handleChange}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Tỉnh/Thành phố"
                  />
                </div>
                <div className="flex items-center mb-4">
                  <label className="w-40 font-semibold">Quận/Huyện</label>
                  <input
                    name="district"
                    value={form.district || ""}
                    onChange={handleChange}
                    className="flex-1 border rounded-lg px-3 py-2"
                    placeholder="Quận/Huyện"
                  />
                </div>
                <div className="flex items-center mb-4">
                  <label className="w-40 font-semibold">Phường/Xã</label>
                  <input
                    name="ward"
                    value={form.ward || ""}
                    onChange={handleChange}
                    className="flex-1 border rounded-lg px-3 py-2"
                    placeholder="Phường/Xã"
                  />
                </div>
              </>
            )}
            <div className="flex gap-3 mt-6 justify-end">
              <Button type="submit"
                disabled={loading || !isChanged}
                className="bg-blue-950 text-white hover:bg-blue-800 transition-colors disabled:opacity-50">
                {loading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>

              {error && <div className="text-red-600 mt-2">{error}</div>}

            </div>
          </form>

          {isOrganizer && (
            <div className="flex items-start gap-6 mt-6 w-200  border rounded-xl shadow bg-white p-6">
              <img
                src={form.logo || "/default-avatar.png"}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border"
              />
              <div className="flex flex-col justify-center">
                <div className="text-xl font-bold text-blue-950">{form.name}</div>
                <div className="text-base mt-1">
                  <span className="font-semibold text-blue-950">Giới thiệu: </span>
                  {form.description}
                </div>
                <div className="text-gray-500 mt-1">
                  <span className="font-semibold text-blue-950">Địa chỉ: </span>
                  {form.address}
                </div>
                <div className="text-gray-500 mt-1">
                  <span className="font-semibold text-blue-950">Website: </span>
                  {form.weblink ? (
                    <a href={form.weblink} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">
                      {form.weblink}
                    </a>
                  ) : (
                    <span className="italic text-gray-400">Chưa cập nhật</span>
                  )}
                </div>
                <div className="text-gray-500 mt-1">
                  <span className="font-semibold text-blue-950">Mạng xã hội: </span>
                  {form.social_link ? (
                    <a href={form.social_link} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">
                      {form.social_link}
                    </a>
                  ) : (
                    <span className="italic text-gray-400">Chưa cập nhật</span>
                  )}
                </div>



              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}