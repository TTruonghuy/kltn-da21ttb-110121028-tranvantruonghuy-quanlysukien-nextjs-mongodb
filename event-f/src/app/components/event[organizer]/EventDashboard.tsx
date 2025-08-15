"use client";
import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
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
type TicketTypeStat = { type: string; sold: number; total: number };
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
};

export default function EventDashboard({ eventId }: { eventId: string }) {
    const [data, setData] = useState<any>(null);

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
                    <div className="text-xl font-bold">{data.sessions.reduce((sum: number, s: SessionStat) => sum + s.ticketTypes.length, 0)}</div>
                </div>
            </div>

            <div>
                <h3 className="font-semibold mb-2">Thống kê từng xuất</h3>
                {data.sessions.map((session: SessionStat) => (
                    <div key={session.sessionId} className="bg-white shadow rounded-lg mb-4">
                        <div className="bg-blue-50 h-full p-2 px-4 rounded-t-lg"><b>Xuất:</b>{" "}
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
                            })}</div>
                        <div className="px-4 py-1 pt-2">Vé đã bán: <b>{session.soldTickets}/{session.totalTickets}</b></div>
                        <div className="px-4 pb-1">Doanh thu xuất: <b>{session.revenue.toLocaleString()} đ</b></div>
                        <div className="px-4 pb-1">Khách đã check-in: <b>{session.checkin}/{session.soldTickets}</b> ({session.checkinPercent}%)</div>
                        <div className="">

                            <div className="px-4 pb-2">
                                {session.ticketTypes.map((t: TicketTypeStat) => (
                                    <div key={t.type}
                                        className="p-2 border rounded-lg mb-1 text-[14px]"
                                    >
                                        {t.type}: {t.sold}/{t.total}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
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

        </div>
    );
}
