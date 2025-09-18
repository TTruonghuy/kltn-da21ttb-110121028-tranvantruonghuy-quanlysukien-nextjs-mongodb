"use client";
import { TiLocation, TiTime, TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import axios from "axios";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

type DailySale = { date: string; tickets: number; revenue: number };
type TicketTypeStat = { ticketId: string; type: string; sold: number; total: number; status: string };
type SessionStat = {
    sessionId: string;
    startTime: string;
    endTime: string;
    soldTickets: number;
    totalTickets: number;
    revenue: number;
    checkin: number;
    notCheckin: number;
    checkinPercent: number;
    ticketTypes: TicketTypeStat[];
    status: string;

};

export default function EventDashboard({ eventId }: { eventId: string }) {
    const [data, setData] = useState<any>(null);
    const [expandedSession, setExpandedSession] = useState<string | null>(null);
    //const isPastSession = new Date(session.endTime) < new Date();
    const [reloadFlag, setReloadFlag] = useState(0);
    const [editQuantities, setEditQuantities] = useState<{ [ticketId: string]: number }>({});

    // Khi load data, đồng bộ state editQuantities:
    useEffect(() => {
        if (data) {
            setEditQuantities(prev => {
                // Chỉ cập nhật những vé mới hoặc số lượng gốc thay đổi
                const newQuantities = { ...prev };
                data.sessions.forEach((session: SessionStat) => {
                    session.ticketTypes.forEach((t: any) => {
                        if (
                            !(t.ticketId in newQuantities) ||
                            newQuantities[t.ticketId] !== t.total
                        ) {
                            newQuantities[t.ticketId] = t.total;
                        }
                    });
                });
                return newQuantities;
            });
        }
    }, [data]);

    useEffect(() => {
        fetch(`http://localhost:5000/event/${eventId}/dashboard`)
            .then(res => res.json())
            .then(setData);
    }, [eventId, reloadFlag]);

    useEffect(() => {
        fetch(`http://localhost:5000/event/${eventId}/dashboard`)
            .then(res => res.json())
            .then(setData);
    }, [eventId]);

    if (!data) return <div>Đang tải...</div>;

    return (
        <div className="p-6 pt-0 space-y-6">
            {/* Tiêu đề và nút trở lại */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold mt-4">{data.title}</h2>

            </div>

            {/* Thông tin tổng quan */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white shadow rounded-lg p-4">
                    <div className="text-sm text-gray-500">Tổng doanh thu</div>
                    <div className="text-xl font-bold text-green-600">
                        {data.totalRevenue.toLocaleString()} đ
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                    <div className="text-sm text-gray-500">Vé đã bán</div>
                    <div className="text-xl font-bold">
                        {data.soldTickets}/{data.totalTickets} ({data.soldPercent}%)
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                    <div className="text-sm text-gray-500">Doanh thu tuần này</div>
                    <div className="text-xl font-bold text-blue-600">
                        {data.weeklyRevenue.at(-1)?.revenue.toLocaleString()} đ
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                    <div className="text-sm text-gray-500">Tổng loại vé</div>
                    <div className="text-xl font-bold">{data.sessions.reduce((sum: number, s: SessionStat) => sum + s.ticketTypes.length, 0)}

                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-semibold mb-2">Thống kê từng xuất</h3>
                {data.sessions.map((session: SessionStat) => {
                    const isPastSession = new Date(session.endTime) < new Date();
                    return (
                        <div key={session.sessionId} className="bg-white shadow rounded-lg mb-4 ">
                            <div className={`h-full p-2 px-4 rounded-t-lg flex items-center cursor-pointer ${session.status === "cancel" ? "bg-red-100" : "bg-blue-50"
                                }`}
                                onClick={() => setExpandedSession(expandedSession === session.sessionId ? null : session.sessionId)}>
                                {expandedSession === session.sessionId ? <TiArrowSortedUp /> : <TiArrowSortedDown />}
                                <span className="flex"><b>Xuất:</b>{" "}
                                    {new Date(session.startTime).toLocaleString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })}
                                    {" "} - {" "}
                                    {new Date(session.endTime).toLocaleString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })}
                                </span>
                                {data.status !== "cancel" && session.status !== "cancel" && (
                                    <button
                                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 ml-128"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (window.confirm("Bạn có chắc chắn muốn huỷ xuất này?")) {
                                                await axios.put(`http://localhost:5000/event/session/${session.sessionId}/cancel`, {}, { withCredentials: true });
                                                setReloadFlag(f => f + 1);
                                            }
                                        }}
                                    >
                                        Huỷ xuất
                                    </button>
                                )}

                                { session.status === "cancel" && (
                                    <span className="text-red-600 font-bold ml-120">Đã huỷ</span>
                                )}
                            </div>
                            {expandedSession === session.sessionId && (
                                <>
                                    <div className="px-4 py-1 pt-2">Vé đã bán: <b>{session.soldTickets}/{session.totalTickets}</b></div>
                                    <div className="px-4 pb-1">Doanh thu xuất: <b>{session.revenue.toLocaleString()} đ</b></div>
                                    <div className="px-4 pb-1">Khách đã check-in: <b>{session.checkin}/{session.soldTickets}</b> ({session.checkinPercent}%)</div>
                                    <div className="">
                                        <div className="px-4 pb-2">
                                            {session.ticketTypes.map((t: any) => {
                                                //const [editQuantity, setEditQuantity] = useState(t.total);
                                                const isStopped = t.status === "stopped";

                                                return (
                                                    <div key={t.type} className="border rounded-lg mb-1 text-[14px] flex items-center justify-between">
                                                        <span className="pl-4 py-2">{t.type}: {t.sold}/{t.total}</span>
                                                        <div className="flex items-center">
                                                            <p>Còn lại: </p>
                                                            <input
                                                                type="text"
                                                                value={editQuantities[t.ticketId] ?? t.total}
                                                                disabled={isPastSession || isStopped}
                                                                onChange={e => setEditQuantities(q => ({ ...q, [t.ticketId]: Number(e.target.value) }))}
                                                                className="w-20 border rounded-[8px] px-2 py-1 text-sm mr-2 ml-1 hover:border-gray-400 focus:outline-none focus:border-gray-400"
                                                            />
                                                            <button
                                                                disabled={isPastSession || isStopped || (editQuantities[t.ticketId] === undefined || editQuantities[t.ticketId] === t.total)}
                                                                className={`px-2 py-1 text-white border rounded-[8px] ${isPastSession || isStopped || (editQuantities[t.ticketId] === undefined || editQuantities[t.ticketId] === t.total)
                                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                                    : 'bg-blue-950 hover:scale-102 hover:bg-blue-800'
                                                                    }`}
                                                                onClick={async () => {
                                                                    if (editQuantities[t.ticketId] !== t.total) {
                                                                        await axios.put(`http://localhost:5000/ticket/${t.ticketId}`, { ticket_quantity: editQuantities[t.ticketId] }, { withCredentials: true });
                                                                        setReloadFlag(f => f + 1);
                                                                    }
                                                                }}
                                                            >
                                                                Xác nhận
                                                            </button>
                                                            <div className="h-7 border-l-2 mx-4"></div>
                                                            {isStopped ? (
                                                                <button
                                                                    disabled={isPastSession}
                                                                    className={`mr-2 px-4 py-1 text-white border rounded-[8px] ${isPastSession ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:scale-102 hover:bg-green-400'}`}
                                                                    onClick={async () => {
                                                                        if (window.confirm("Bạn có chắc chắn muốn bán lại vé này?")) {
                                                                            await axios.put(`http://localhost:5000/ticket/${t.ticketId}`, { status: "available" }, { withCredentials: true });
                                                                            setReloadFlag(f => f + 1);
                                                                        }
                                                                    }}
                                                                >
                                                                    Bán lại
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    disabled={isPastSession}
                                                                    className={`mr-2 px-2 py-1 text-white border rounded-[8px] ${isPastSession ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-400 hover:scale-102 hover:bg-red-300'}`}
                                                                    onClick={async () => {
                                                                        if (window.confirm("Bạn có chắc chắn muốn dừng bán vé này?")) {
                                                                            await axios.put(`http://localhost:5000/ticket/${t.ticketId}`, { status: "stopped" }, { withCredentials: true });
                                                                            setReloadFlag(f => f + 1);
                                                                        }
                                                                    }}
                                                                >
                                                                    Dừng bán
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>)}
                        </div>
                    );
                })}
            </div>

            {/* Biểu đồ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Số vé bán mỗi ngày</h3>
                    <div className="h-64">
                        <Line
                            data={{
                                labels: data.dailySales.map((d: DailySale) => d.date),
                                datasets: [{
                                    label: "Vé bán",
                                    data: data.dailySales.map((d: DailySale) => d.tickets),
                                    borderColor: "blue",
                                    backgroundColor: "rgba(0,0,255,0.1)"
                                }]
                            }}
                            options={{ maintainAspectRatio: false }}
                        />
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Doanh thu theo ngày</h3>
                    <div className="h-64">
                        <Bar
                            data={{
                                labels: data.dailySales.map((d: DailySale) => d.date),
                                datasets: [{
                                    label: "Doanh thu",
                                    data: data.dailySales.map((d: DailySale) => d.revenue),
                                    backgroundColor: "green"
                                }]
                            }}
                            options={{ maintainAspectRatio: false }}
                        />
                    </div>
                </div>
            </div>

            {/* Lịch sử check-in */}
            <div className="bg-white shadow rounded-lg p-4 mt-6">
                <h3 className="font-semibold mb-2">Lịch sử check-in</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr>
                                <th className="px-2 py-1 text-left">Thời gian</th>
                                <th className="px-2 py-1 text-left">Tên vé</th>
                                <th className="px-2 py-1 text-left">Khách</th>
                                <th className="px-2 py-1 text-left">Xuất</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.checkinHistory && data.checkinHistory.length > 0 ? (
                                data.checkinHistory.map((item: any, idx: number) => (
                                    <tr key={idx} className="border-b">
                                        <td className="px-2 py-1">{item.checkinTime ? new Date(item.checkinTime).toLocaleString("vi-VN") : ""}</td>
                                        <td className="px-2 py-1">{item.ticketName}</td>
                                        <td className="px-2 py-1">{item.userName}</td>
                                        <td className="px-2 py-1">{item.sessionStart ? new Date(item.sessionStart).toLocaleString("vi-VN") : ""}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-2 py-2 text-gray-500 text-center">Chưa có lượt check-in nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div >
    );
}
