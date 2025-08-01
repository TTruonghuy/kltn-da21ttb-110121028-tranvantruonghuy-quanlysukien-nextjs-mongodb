import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import { Button } from "@/app/components/ui/button"; // Sử dụng component Button từ thư viện UI của bạn

interface EventItem {
    _id: string;
    title: string;
    image?: string;
    status?: string;
    start_time?: string;
    end_time?: string;
}


export default function OrganizerEventList({
    filterStatus,
    filterTime,
    onSelectEvent,
}: {
    filterStatus?: string;
    filterTime?: "upcoming" | "ongoing" | "past";
    onSelectEvent?: (eventId: string) => void;
}) {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);





    useEffect(() => {
        axios.get("/event/my-events", { withCredentials: true })
            .then(res => {
                console.log("API response:", res.data);
                const rawEvents = res.data.events || [];
                console.log("Raw events:", rawEvents);
                const events = rawEvents.map((event: any) => ({
                    _id: event._id || event.id,
                    title: event.title,
                    image: event.image,
                    status: event.status,
                    start_time: event.min_start_time,
                    end_time: event.max_end_time,
                }));
                console.log("Mapped events:", events);
                setEvents(events);
            })
            .catch((err) => {
                console.error("API error:", err);
                setEvents([]);
            })
            .finally(() => setLoading(false));
    }, []);

    // Sau khi setEvents, log lại state
    useEffect(() => {
        console.log("Current events state:", events);
    }, [events]);

    if (loading) return <div>Đang tải...</div>;
    if (!events.length) {
        console.warn("events.length === 0, events:", events);
        return <div>Không có sự kiện nào.</div>;
    }



    const handleApprove = async (eventId: string) => {
        try {
            await axios.put(`/event/${eventId}/status`, { status: "approved" }, { withCredentials: true });
            // Sau khi cập nhật thành công, cập nhật lại state để giao diện đổi màu và ẩn nút
            setEvents(prev =>
                prev.map(ev =>
                    ev._id === eventId ? { ...ev, status: "approved" } : ev
                )
            );
        } catch (err) {
            alert("Cập nhật trạng thái thất bại!");
        }
    };

    const handleRejected = async (eventId: string) => {
        try {
            await axios.put(`/event/${eventId}/status`, { status: "rejected" }, { withCredentials: true });
            // Sau khi cập nhật thành công, cập nhật lại state để giao diện đổi màu và ẩn nút
            setEvents(prev =>
                prev.map(ev =>
                    ev._id === eventId ? { ...ev, status: "rejected" } : ev
                )
            );
        } catch (err) {
            alert("Cập nhật trạng thái thất bại!");
        }
    };


    const handlePending = async (eventId: string) => {
        try {
            await axios.put(`/event/${eventId}/status`, { status: "pending" }, { withCredentials: true });
            // Sau khi cập nhật thành công, cập nhật lại state để giao diện đổi màu và ẩn nút
            setEvents(prev =>
                prev.map(ev =>
                    ev._id === eventId ? { ...ev, status: "pending" } : ev
                )
            );
        } catch (err) {
            alert("Cập nhật trạng thái thất bại!");
        }
    };


    let filteredEvents = filterStatus
        ? events.filter(ev => ev.status === filterStatus)
        : events;

    if (loading) return <div>Đang tải...</div>;
    if (filterTime) {
        const now = new Date();
        filteredEvents = filteredEvents.filter(ev => {
            const start = ev.start_time ? new Date(ev.start_time) : null;
            const end = ev.end_time ? new Date(ev.end_time) : null;
            if (!start || !end) return false;
            if (filterTime === "upcoming") return start > now;
            if (filterTime === "ongoing") return start <= now && end >= now;
            if (filterTime === "past") return end < now;
            return true;
        });
        if (!filteredEvents.length) {
            console.warn("events.length === 0, events:", filteredEvents);
            return <div>Không có sự kiện nào.</div>;
        }
    }

    if (filterStatus === "rejected") {
        return (
            <div className="flex flex-col gap-3">
                {filteredEvents.map(event => (
                    <div key={event._id} className="flex items-center justify-between border border-red-200 rounded-lg py-2 px-4 mx-20">
                        <span>{event.title}</span>
                        <div className="flex gap-2">
                            <Button
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-400"
                                onClick={() => handlePending(event._id)}
                            >
                                Khôi phục
                            </Button>
                            <Button
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400"
                                onClick={() => handlePending(event._id)}
                            >
                                Xoá vĩnh viễn
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (filterStatus === "approved") {
        const now = new Date();
        const ongoingEvents = filteredEvents.filter(ev => {
            const start = ev.start_time ? new Date(ev.start_time) : null;
            const end = ev.end_time ? new Date(ev.end_time) : null;
            return start && end && start <= now && end >= now;
        });
        const pastEvents = filteredEvents.filter(ev => {
            const end = ev.end_time ? new Date(ev.end_time) : null;
            return end && end < now;
        });

        return (
            <div>
                {ongoingEvents.length > 0 && (
                    <>
                        <div className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                            <span>Sự kiện đang diễn ra</span>
                            <div className="flex-1 border-t border-gray-300 ml-2"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {ongoingEvents.map(event => (
                                <div
                                    key={event._id}
                                    className="border rounded-lg flex flex-col items-center bg-blue-100"
                                    onClick={() => onSelectEvent?.(event._id)}
                                >
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-30 object-cover rounded mb-2"
                                    />
                                    <div className="font-semibold text-center text-[12px] p-2">{event.title}</div>
                                    <div className="text-xs text-gray-600 mb-2">
                                        {event.start_time && event.end_time
                                            ? `${new Date(event.start_time).toLocaleDateString("vi-VN")} - ${new Date(event.end_time).toLocaleDateString("vi-VN")}`
                                            : ""}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {pastEvents.length > 0 && (
                    <>
                        <div className="font-semibold text-gray-500 mb-2 mt-6 flex items-center gap-2">
                            <span>Sự kiện đã qua</span>
                            <div className="flex-1 border-t border-gray-300 ml-2"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {pastEvents.map(event => (
                                <div
                                    key={event._id}
                                    className="border rounded-lg flex flex-col items-center bg-blue-100"
                                    onClick={() => onSelectEvent?.(event._id)}
                                >
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-30 object-cover rounded mb-2"
                                    />
                                    <div className="font-semibold text-center text-[12px] p-2">{event.title}</div>
                                    <div className="text-xs text-gray-600 mb-2">
                                        {event.start_time && event.end_time
                                            ? `${new Date(event.start_time).toLocaleDateString("vi-VN")} - ${new Date(event.end_time).toLocaleDateString("vi-VN")}`
                                            : ""}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {ongoingEvents.length === 0 && pastEvents.length === 0 && (
                    <div>Không có sự kiện nào.</div>
                )}
            </div>
        );
    }


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map(event => (
                <div key={event._id}
                    className={`border rounded-lg flex flex-col items-center 
                    ${event.status === "pending" ? "bg-green-100" : ""}
                    ${event.status === "approved" ? "bg-blue-100" : ""}
                `}
                    onClick={() => onSelectEvent?.(event._id)}
                >
                    <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-30 object-cover rounded mb-2"
                    />
                    <div className="font-semibold text-center text-[12px] p-2">{event.title}</div>

                    <div className="mt-auto">
                        {event.status === "pending" && (
                            <Button className="bg-blue-500 hover:bg-blue-400 text-white rounded mb-3 mr-2"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleApprove(event._id);
                                }}>
                                Đăng
                            </Button>
                        )}

                        {event.status === "pending" && (
                            <Button className="bg-red-500 text-white px-4 py-1 rounded mb-3"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleRejected(event._id);
                                }}>
                                Xóa
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}