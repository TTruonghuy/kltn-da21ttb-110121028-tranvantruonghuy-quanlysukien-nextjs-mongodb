"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";


interface MyTicketsProps {
  setSelectedOrderId: (orderId: string) => void; // Prop mới
}

export default function MyTickets({ setSelectedOrderId }: MyTicketsProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filter, setFilter] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  //const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null); // State mới cho order details


  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Gọi API với cookie (jwt token nằm trong cookie httpOnly)
        const res = await fetch("http://localhost:5000/order/my-orders", {
          method: "GET",
          credentials: "include", // gửi cookie để backend xác thực
        });

        if (!res.ok) {
          throw new Error("Không thể lấy vé của bạn");
        }

        const data = await res.json();
        console.log("Tickets from API:", data);
        setTickets(data);
      } catch (err: any) {
        setError(err.message || "Lỗi khi lấy vé");
        console.error("Error fetching tickets:", err);
      }
    };

    fetchTickets();
  }, []);

  const now = new Date();

  const filteredTickets = tickets.filter(ticket => {
    const startTime = ticket.sessionTime?.start ? new Date(ticket.sessionTime.start) : null;

    if (filter === "upcoming") {
      return (
        ticket.orderStatus === "paid" &&
        startTime !== null &&
        startTime > now
      );
    }

    if (filter === "past") {
      return (
        ticket.orderStatus === "paid" &&
        startTime !== null &&
        startTime <= now
      );
    }

    if (filter === "cancelled") {
      return (
        ticket.orderStatus === "cancelled" ||
        ticket.orderStatus === "refunded"
      );
    }

    return false;
  });

  const statusLabels: Record<string, string> = {
    pending: "Chờ xử lý",
    paid: "Đã thanh toán",
    cancelled: "Đã hủy",
    refunded: "Đã hoàn tiền",
  };

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 ml-2 mt-3">Vé của tôi: </h1>

      {/* Tabs */}
      <div className="flex space-x-3 mb-6 justify-center">
        <button
          className={clsx(
            "w-40 py-2 rounded-lg font-medium transition",
            filter === "upcoming" ? "bg-blue-500 text-white" : " hover:bg-gray-300 border-blue-600 border"
          )}
          onClick={() => setFilter("upcoming")}
        >
          Sắp diễn ra
        </button>
        <button
          className={clsx(
            "w-40 py-2 rounded-lg font-medium transition",
            filter === "past" ? "bg-green-700 text-white" : "hover:bg-gray-300 border-green-600 border"
          )}
          onClick={() => setFilter("past")}
        >
          Đã diễn ra
        </button>
        <button
          className={clsx(
            "w-40 py-2 rounded-lg font-medium transition",
            filter === "cancelled" ? "bg-red-500 text-white" : "hover:bg-gray-300 border-red-600 border"
          )}
          onClick={() => setFilter("cancelled")}
        >
          Đã hủy
        </button>
      </div>

      {/* Danh sách vé */}
      {filteredTickets.length === 0 ? (
        <p className="text-gray-500">Không có vé nào.</p>
      ) : (
        <div className="space-y-2 mx-10">
          {filteredTickets.map(ticket => (
            <div
              key={ticket.orderId}
              className="bg-white border-t border-blue-600 pb-4 pt-6 px-4 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedOrderId(ticket.orderId)}
            >
              <div className="flex flex-col md:flex-row md:items-stretch">

                <div className="flex">
                <div className=" border rounded-r-lg px-12 bg-blue-50 flex justify-center items-center">
                  <p className="text-[16px] font-bold">
                    {ticket.sessionTime?.start ? (
                      <>
                        {new Date(ticket.sessionTime.start).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                        {" - "}
                        {new Date(ticket.sessionTime.start).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </>
                    ) : (
                      ""
                    )}
                  </p>
                </div>


                <div className="flex-1 border rounded-l-lg py-5 px-6">

                  <h2 className="text-lg font-semibold mb-2">{ticket.eventTitle}</h2>
                  <div className=" text-green-400 mb-1">{statusLabels[ticket.orderStatus]}</div>
                  <div className="text-sm text-gray-600 mb-1 flex"> <p className="text-black flex-shrink-0 mr-2">Địa điểm:</p> {ticket.eventAddress}</div>
                  <div className="text-sm text-gray-600 flex"> <p className="text-black flex-shrink-0 mr-3">Mã đơn:</p> {ticket.orderId}</div>
                </div>
                </div>

              </div>


              <span
                className={clsx(
                  "px-3 py-1 rounded-full text-sm font-medium mt-2 md:mt-0",
                  ticket.orderStatus === "pending" && "bg-blue-100 text-blue-700",
                  ticket.orderStatus === "completed" && "bg-gray-200 text-gray-700",
                  ticket.orderStatus === "cancelled" && "bg-red-100 text-red-700"
                )}
              >
                {ticket.orderStatus === "pending" && "Sắp diễn ra"}
                {ticket.orderStatus === "completed" && "Đã diễn ra"}
                {ticket.orderStatus === "cancelled" && "Đã hủy"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
