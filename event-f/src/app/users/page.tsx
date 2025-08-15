"use client"
import { useEffect, useState } from "react";
import UserProfile from "@/app/components/users/Profile";
import MyTickets from "@/app/components/users/Ticketme";
import Sidebar from "@/app/components/users/Sidebar";
import OrderDetails from "@/app/components/users/Order";


export default function UserProfilePage() {
const [user, setUser] = useState<any>(null);
const [tab, setTab] = useState<"profile" | "tickets">("tickets");
const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null); // State mới cho order details

  // Lấy thông tin user hiện tại từ API /auth/me
  useEffect(() => {
    fetch("http://localhost:5000/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);

  if (!user) return <div>Đang tải...</div>;

 return (
    <div className="flex">
      <Sidebar
        isOrganizer={user.role === "organizer"}
        
        onSelectTab={setTab} // truyền hàm đổi tab
        currentTab={tab}
      />
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
      </div>
    </div>
  );
}