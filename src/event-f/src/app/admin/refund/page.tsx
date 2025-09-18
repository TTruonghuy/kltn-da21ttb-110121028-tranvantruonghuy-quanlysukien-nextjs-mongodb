"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "@/lib/axiosInstance";
import React from "react";

interface RefundOrder {
    _id: string;
    user_name?: string;
    email: string;
    total_amount: number;
    status: string;
}

interface RefundEvent {
    _id: string;
    title: string;
    status: string;
    info: string;
    orders: RefundOrder[];
    status_session: string;
    session_id?: string;
}

type OrderFilter = "cancel" | "cancelled";


export default function AdminRefundPage() {
    const [events, setEvents] = useState<RefundEvent[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [orderFilter, setOrderFilter] = useState<OrderFilter>("cancel");


    useEffect(() => {
        setLoading(true);
        axios.get("/event/admin-refund-list", { withCredentials: true })
            .then(res => {
                console.log("DATA:", res.data.events); // Thêm dòng này
                setEvents(res.data.events || []);
            })
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex min-h-screen bg-[#f6f8fb]">
            <Sidebar onLogout={() => { }} selected="Hoàn vé" />
            <main className="flex-1 p-8">
                <h1 className="text-2xl font-bold text-blue-900 mb-6">Sự kiện cần hoàn vé</h1>
                <div className="mb-4 flex gap-2">
                    <button
                        className={`px-4 py-1 rounded-lg ${orderFilter === "cancel" ? "bg-blue-950 text-white hover:bg-blue-900 hover:scale-102" : "bg-gray-200 hover:bg-gray-100 hover:scale-102"}`}
                        onClick={() => setOrderFilter("cancel")}
                    >
                        Chưa hoàn vé
                    </button>
                    <button
                        className={`px-4 py-1 rounded-lg ${orderFilter === "cancelled" ? "bg-blue-950 text-white hover:bg-blue-900 hover:scale-102" : "bg-gray-200 hover:bg-gray-100 hover:scale-102"}`}
                        onClick={() => setOrderFilter("cancelled")}
                    >
                        Đã hoàn vé
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Đang tải...</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-blue-50">
                                    <th className="p-2 pl-4 text-left">Tiêu đề sự kiện</th>
                                    <th className="p-2 text-left">Số đơn cần hoàn</th>
                                    <th className="p-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {events
                                    .filter(event => {
                                        // Trường hợp 1: event.status === orderFilter (cancel/cancelled)
                                        if (orderFilter === "cancel") {
                                            // Chưa hoàn vé
                                            if (event.status === "cancel") return true;
                                            if (
                                                event.status === "approved" &&
                                                event.status_session === "cancel"// &&
                                                // event.orders.some(order => order.status === "paid")
                                            ) return true;
                                            return false;
                                        }

                                        // Đã hoàn vé
                                        if (orderFilter === "cancelled") {
                                            if (event.status === "cancelled") return true;
                                            // Trường hợp 2: event approved, session refunded
                                            if (
                                                event.status === "approved" &&
                                                event.status_session === "refunded" //&&
                                                // event.orders.some(order => order.status === "paid")
                                            ) return true;
                                            return false;
                                        }
                                        return false;
                                    })
                                    .map(event => (
                                        <React.Fragment key={event._id}>
                                            <tr
                                                className="border-b hover:bg-gray-50 cursor-pointer text-[15px] px-4"
                                                onClick={() => setExpanded(expanded === event._id ? null : event._id)}
                                            >
                                                <td className="p-2 pl-4">{event.title}</td>
                                                <td className="p-2">
                                                    {event.orders.length}
                                                </td>
                                                <td className="p-2">
                                                    {orderFilter === "cancel" && (
                                                        // Trong page.tsx
                                                        <button
                                                            className="bg-blue-950 text-white px-3 py-1 rounded-lg hover:bg-blue-800 hover:scale-102"
                                                            onClick={async () => {
                                                                try {
                                                                    setLoading(true);
                                                                    let sessionId = undefined;
                                                                    // Nếu là trường hợp 2 (event approved, session cancel), truyền sessionId
                                                                    if (event.status === "approved" && event.status_session === "cancel") {
                                                                        sessionId = event.session_id; // Đảm bảo event.session_id có sẵn trong dữ liệu từ API
                                                                    }
                                                                    await axios.put(`/event/${event._id}/refund`, { sessionId }, { withCredentials: true });

                                                                    // Hiển thị thông báo thành công (có thể dùng thư viện như react-toastify hoặc alert)
                                                                    alert('Hoàn tiền thành công!');

                                                                    // Reload dữ liệu
                                                                    const res = await axios.get("/event/admin-refund-list", { withCredentials: true });
                                                                    setEvents(res.data.events || []);
                                                                } catch (error) {
                                                                    console.error('Hoàn tiền thất bại:', error);
                                                                    alert('Hoàn tiền thất bại: ');
                                                                } finally {
                                                                    setLoading(false);
                                                                }
                                                            }}
                                                            disabled={loading} // Vô hiệu hóa button khi đang loading
                                                        >
                                                            {loading ? 'Đang xử lý...' : 'Hoàn tiền'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {expanded === event._id && (
                                                <tr>
                                                    <td colSpan={3} className="bg-gray-100 p-4 pt-1 text-[14px] ">
                                                        <p className=" flex justify-center w-[100%] text-blue-700"> {event.info}</p>
                                                        <table className="w-full ">
                                                            <thead>
                                                                <tr className="border-b border-gray-200">
                                                                    <th className="p-2 text-left">Tên</th>
                                                                    <th className="p-2 text-left">Email</th>
                                                                    <th className="p-2 text-left">Tổng tiền</th>

                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {event.orders.map(order => (
                                                                    <tr key={order._id} className="border-b ">
                                                                        <td className="p-2">{order.user_name || "Không rõ"}</td>
                                                                        <td className="p-2">{order.email}</td>
                                                                        <td className="p-2 font-bold">{order.total_amount.toLocaleString()} VNĐ</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}