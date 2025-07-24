"use client"
import { useEffect, useState } from "react";
import UserProfile from "@/app/components/users/Profile";

export default function UserProfilePage() {
  const [user, setUser] = useState<any>(null);

  // Lấy thông tin user hiện tại từ API /auth/me
  useEffect(() => {
    fetch("http://localhost:5000/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);

  // Cập nhật hồ sơ user
  const handleUpdate = async (data: any) => {
    if (!user) return;
    let res;

    if (user.role === "organizer") {
      if (data instanceof FormData) {
        res = await fetch("http://localhost:5000/organizer/me", {
          method: "PUT",
          credentials: "include",
          body: data,
        });
      } else {
        res = await fetch("http://localhost:5000/organizer/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        });
      }
    } else {
      if (!user._id) return;
      if (data instanceof FormData) {
        res = await fetch(`http://localhost:5000/users/${user._id}`, {
          method: "PUT",
          credentials: "include",
          body: data,
        });
      } else {
        res = await fetch(`http://localhost:5000/users/${user._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        });
      }
    }

    if (res && res.ok) {
      const updated = await res.json();
      setUser(updated); // Cập nhật lại state user
      alert("Cập nhật thành công!"); // Thông báo cho người dùng
    } else {
      alert("Cập nhật thất bại!");
    }
  };


  // Xóa user (nếu cần)
  const handleDelete = async () => {
    if (!user?._id) return;
    await fetch(`http://localhost:5000/users/${user._id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setUser(null);
  };

  if (!user) return <div>Đang tải...</div>;

  return <UserProfile
    user={user}
    onUpdate={updated => setUser(updated)}
    onDelete={handleDelete}
  />;
}