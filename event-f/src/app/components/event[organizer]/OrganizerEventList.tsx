import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import EventDetailModal from "./EventDetailModal"; // Tạo component này, xem hướng dẫn bên dưới


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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map(event => (
                <div key={event._id}
                    className={`border rounded-lg flex flex-col items-center 
                    ${event.status === "pending" ? "bg-green-100" : ""}
                    ${event.status === "approved" ? "bg-blue-100" : ""}
                    ${event.status === "rejected" ? "bg-red-100" : ""}
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
                            <button className="bg-blue-500 text-white px-4 py-1 rounded mb-3 mr-2"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleApprove(event._id);
                                }}>
                                Đăng
                            </button>
                        )}

                        {event.status === "pending" && (
                            <button className="bg-red-500 text-white px-4 py-1 rounded mb-3"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleRejected(event._id);
                                }}>
                                Xóa
                            </button>
                        )}


                        {event.status === "rejected" && (
                            <button className="bg-green-500 text-white px-2 py-1 rounded mb-3 mr-2"
                                onClick={() => handlePending(event._id)}>
                                Khôi phục
                            </button>
                        )}
                        {event.status === "rejected" && (
                            <button className="bg-red-500 text-white px-2 py-1 rounded mb-3"
                                onClick={() => handlePending(event._id)}>
                                Xoá vĩnh viễn
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}