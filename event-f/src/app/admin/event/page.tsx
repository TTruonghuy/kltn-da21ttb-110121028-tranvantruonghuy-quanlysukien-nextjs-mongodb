"use client";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import axios from "@/lib/axiosInstance";
import React from "react";
import EventDashboard from "./component/DashBoard";
import Eventid from "./component/Eventid";

type EventStatus = "approval" | "approved" | "rejected";
type FilterTab = "approval" | "selling" | "past" | "cancel";

interface EventItem {
    _id: string;
    title: string;
    status: string;
    createdAt: string;
    sessions: Array<{
        _id: string;
        start_time: string;
        end_time: string;
        tickets: Array<{
            ticket_name: string;
            ticket_price: number;
            ticket_quantity: number;
            sold_quantity: number;
        }>;
    }>;
}

export default function AdminEventsPage() {
    const [activeTab, setActiveTab] = useState<FilterTab>("approval");
    const [search, setSearch] = useState("");
    const [events, setEvents] = useState<EventItem[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [statMode, setStatMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState({ approval: 0, selling: 0, past: 0 });
const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    // Lấy danh sách sự kiện theo tab và search
    useEffect(() => {
        setLoading(true);
        axios.get("/event/admin-list", {
            params: { tab: activeTab, search },
            withCredentials: true
        })
            .then((res) => {
                setEvents(res.data.events || []);
                setCounts(res.data.counts || { approval: 0, selling: 0, past: 0 });
            })
            .catch((err) => {
                console.error('Lỗi khi lấy danh sách sự kiện:', err.response?.data || err.message);
                setEvents([]);
                setCounts({ approval: 0, selling: 0, past: 0 });
            })
            .finally(() => setLoading(false));
    }, [activeTab, search]);

    // Duyệt sự kiện
    const approveEvent = async (id: string) => {
        if (!window.confirm("Duyệt sự kiện này?")) return;
        await axios.put(
            `/event/${id}/status`,
            { status: "approved" },
            { withCredentials: true }
        );
        setEvents((prev) => prev.filter((e) => e._id !== id));
    };

    // Gỡ sự kiện
    const removeEvent = async (id: string) => {
        if (!window.confirm("Bạn có chắc chắn gỡ sự kiện này?")) return;
        if (!window.confirm("Sau khi gỡ sẽ tiến hành hoàn vé. Xác nhận tiếp tục?")) return;
        await axios.put(
            `/event/${id}/status`,
            { status: "rejected" },
            { withCredentials: true }
        );
        setEvents((prev) => prev.filter((e) => e._id !== id));
    };

    // Thống kê đơn giản
    const totalTickets = events.reduce(
        (sum, e) => sum + e.sessions.reduce((s, sess) => s + sess.tickets.reduce((t, tk) => t + tk.sold_quantity, 0), 0),
        0
    );
    const totalRevenue = events.reduce(
        (sum, e) =>
            sum +
            e.sessions.reduce(
                (s, sess) =>
                    s +
                    sess.tickets.reduce((t, tk) => t + tk.sold_quantity * tk.ticket_price, 0),
                0
            ),
        0
    );



    const STATUS_LABELS: Record<string, string> = {
        approval: "Chờ duyệt",
        approved: "Đã duyệt",
        rejected: "Đã từ chối",
        selling: "Đang bán vé",
        past: "Đã qua",
    };

   return (
    <div className="flex min-h-screen bg-[#f6f8fb]">
        <Sidebar onLogout={() => { }} selected="Sự kiện" />
        <main className="flex-1 p-8">
            {selectedEventId ? (
                // Hiển thị thống kê chi tiết sự kiện
                <Eventid eventId={selectedEventId} onBack={() => setSelectedEventId(null)} />
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-blue-900">Sự kiện</h1>
                        <div className="flex gap-2">
                            {!statMode && (
                                <>
                                    <input
                                        className="border rounded-lg px-3 py-1"
                                        placeholder="Tìm theo tên sự kiện"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <button
                                        className="bg-green-600 text-white px-4 py-1 rounded-lg"
                                        onClick={() => setStatMode(true)}
                                    >
                                        Thống kê
                                    </button>
                                </>
                            )}
                            {statMode && (
                                <button
                                    className="bg-gray-400 text-white px-4 py-1 rounded"
                                    onClick={() => setStatMode(false)}
                                >
                                    Trở lại
                                </button>
                            )}
                        </div>
                    </div>

                    {statMode ? (
                        <EventDashboard />
                    ) : (
                        <>
                            {/* Bộ lọc */}
                            <div className="flex mb-4 h-11">
                                <button
                                    className={`px-4 py-2 border h-10 rounded-lg mt-auto ${activeTab === "approval" ? "bg-blue-200 font-bold" : "bg-white"}`}
                                    onClick={() => setActiveTab("approval")}
                                >
                                    Chờ duyệt
                                </button>
                                <div className="rounded-full mr-6 border bg-white w-6 h-6 flex items-center justify-center">{counts.approval}</div>

                                <button
                                    className={`px-4 py-2 border h-10 flex mt-auto items-center rounded-lg ${activeTab === "selling" ? "bg-blue-200 font-bold" : "bg-white"}`}
                                    onClick={() => setActiveTab("selling")}
                                >
                                    Đang bán vé
                                </button>
                                <div className="rounded-full mr-6 border bg-white w-6 h-6 flex items-center justify-center">{counts.selling}</div>

                                <button
                                    className={`px-4 py-2 h-10 border rounded-lg mt-auto ${activeTab === "past" ? "bg-blue-200 font-bold" : "bg-white"}`}
                                    onClick={() => setActiveTab("past")}
                                >
                                    Đã qua
                                </button>
                                <div className="rounded-full mr-6 border bg-white w-6 h-6 flex items-center justify-center">{counts.past}</div>
                            </div>
                            {/* Danh sách sự kiện */}
                            <div className="bg-white rounded-lg shadow">
                                {loading ? (
                                    <div className="p-8 text-center text-gray-500">Đang tải...</div>
                                ) : (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-blue-50">
                                                <th className="p-2 pl-4 text-left">Tiêu đề</th>
                                                <th className="p-2 text-left">Trạng thái</th>
                                                <th className="p-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {events.map((event) => (
                                                <React.Fragment key={event._id}>
                                                    <tr
                                                        className="border-b hover:bg-gray-50 cursor-pointer text-[15px] px-4"
                                                        onClick={() => setSelectedEventId(event._id)}
                                                    >
                                                        <td className="p-2 pl-4">{event.title}</td>
                                                        <td className="p-2">
                                                            {STATUS_LABELS[event.status] || "Không rõ"}
                                                        </td>
                                                        <td className="p-2">
                                                            {activeTab === "approval" && (
                                                                <button
                                                                    className="bg-green-500 text-white px-3 py-1 rounded"
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        approveEvent(event._id);
                                                                    }}
                                                                >
                                                                    Duyệt
                                                                </button>
                                                            )}
                                                            {activeTab === "selling" && (
                                                                <button
                                                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        removeEvent(event._id);
                                                                    }}
                                                                >
                                                                    Gỡ
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    {expanded === event._id && (
                                                        <tr>
                                                            <td colSpan={4} className="bg-gray-50 p-4 text-[14px]">
                                                                <div>
                                                                    <ul>
                                                                        {event.sessions.map((s) => (
                                                                            <li key={s._id}>
                                                                                <b>Xuất:</b>  {new Date(s.start_time).toLocaleString("vi-VN")} - {new Date(s.end_time).toLocaleString("vi-VN")}
                                                                                <ul>
                                                                                    {s.tickets.map((t, idx) => (
                                                                                        <li key={idx}
                                                                                            className="pl-2">
                                                                                            {t.ticket_name}: {t.sold_quantity}/{t.ticket_quantity} vé, giá {t.ticket_price.toLocaleString()} VNĐ
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </main>
    </div>
);
}