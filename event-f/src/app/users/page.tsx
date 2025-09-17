"use client"
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import UserProfile from "@/app/components/users/Profile";
import MyTickets from "@/app/components/users/Ticketme";
import Sidebar from "@/app/components/users/Sidebar";
import OrderDetails from "@/app/components/users/Order";
import Header from "@/app/components/Header";
import Filler from "@/app/components/Filler";
import axios from "@/lib/axiosInstance";


export default function UserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string; avatar?: string; role?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<"profile" | "tickets">(tabParam === "profile" ? "profile" : "tickets");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null); // State mới cho order details

  useEffect(() => {
    if (tabParam === "profile" || tabParam === "tickets") {
      setTab(tabParam);
    }
  }, [tabParam]);

  // Lấy thông tin user hiện tại từ API /auth/me
  useEffect(() => {
    fetch("http://localhost:5000/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);

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
      router.push("/");
    } catch (err) {
      console.error("Lỗi"); // Log lỗi
    }
  };

  if (!user) return <div>Đang tải...</div>;

  return (
    <div>
      <Header onLogout={handleLogout} onShowAuth={() => setShowAuth(true)} user={user} />
      <Filler />
      <div className="flex">

        {/*   <Sidebar
        isOrganizer={user.role === "organizer"}
        onSelectTab={setTab} // truyền hàm đổi tab
        currentTab={tab}
      /> */}
        <div className="flex-1">
          {tab === "tickets" && (
            <>
              {selectedOrderId ? (
                <OrderDetails
                  orderId={selectedOrderId}
                  onBack={() => setSelectedOrderId(null)} // Hàm back để quay lại list tickets
                />
              ) : (
                <MyTickets setSelectedOrderId={setSelectedOrderId} /> // Truyền prop để set orderId khi click
              )}
            </>
          )}
          {tab === "profile" && <UserProfile user={user} onUpdate={(updatedUser) => setUser(updatedUser)} />}
        </div>
      </div>
    </div>
  );
}