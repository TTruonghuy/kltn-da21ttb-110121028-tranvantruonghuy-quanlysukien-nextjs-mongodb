import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";
import { Button } from "@/app/components/ui/button"; // Sử dụng component Button từ thư viện UI của bạn
import { IoTicketOutline } from "react-icons/io5";

interface EventItem {
    _id: string;
    title: string;
    image?: string;
    status?: string;
    start_time?: string;
    end_time?: string;
    total_sold?: number;
    remaining?: number;
    total_revenue?: number;
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
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();




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
                    total_sold: event.total_sold,
                    remaining: event.remaining,
                    total_revenue: event.total_revenue,
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

    const openScanPage = (event: EventItem) => {
        router.push(`/scan/${event._id}`);
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
            if (filterTime === "ongoing") return end >= now;
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
            const end = ev.end_time ? new Date(ev.end_time) : null;
            return ev.status === "approved" && end && end >= now;
        });

        const pastEvents = filteredEvents.filter(ev => {
            const end = ev.end_time ? new Date(ev.end_time) : null;
            return ev.status === "approved" && end && end < now;
        });


        return (
            <div>
                {ongoingEvents.length > 0 && (
                    <>
                        <div className="grid pt-6 flex">
                            {ongoingEvents.map(event => (
                                <div
                                    key={`ongoing-${event._id}`}
                                    className="flex w-full bg-blue-50 rounded mb-4"
                                >
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-[35%] object-cover rounded"
                                    />
                                    <div className=" ml-4 w-100 flex flex-col flex-grow border-r">
                                        <div className="font-semibold text-[14px] pt-2">{event.title}</div>
                                        <div className="text-xs text-gray-600 mb-2">
                                            {event.start_time && event.end_time
                                                ? `${new Date(event.start_time).toLocaleString("vi-VN", {
                                                    day: "2-digit", month: "2-digit", year: "numeric",
                                                    hour: "2-digit", minute: "2-digit", hour12: false
                                                })} 
                                                        - 
                                                    ${new Date(event.end_time).toLocaleString("vi-VN", {
                                                    day: "2-digit", month: "2-digit", year: "numeric",
                                                    hour: "2-digit", minute: "2-digit", hour12: false
                                                })}`
                                                : ""}
                                        </div>
                                        <p className="w-60 px-10 border-1 border-blue-200 ml-20"></p>

                                        <div className="text-gray-700 flex flex-col flex-grow px-2 mb-2 mr-4 mt-1">
                                            <div className="flex justify-between">
                                                <div className="mt-1 border px-2 py-1 rounded flex items-center border-red-200">
                                                    Đã bán: {event.total_sold || 0} <IoTicketOutline className="ml-2" />
                                                </div>

                                                <div className="mt-1 border px-2 py-1 rounded border-blue-200 flex border-blue-200 items-center">
                                                    Còn lại: {event.remaining || 0} <IoTicketOutline className="ml-2" />
                                                </div>
                                            </div>

                                            <div className="mt-1 border px-2 py-1 rounded border-blue-200 flex border-green-200 mb-1">
                                                Tổng doanh thu: {(event.total_revenue || 0).toLocaleString('vi-VN')} đ
                                            </div>

                                            <button
                                                className="rounded bg-blue-950 px-6 py-1 text-white hover:bg-blue-900 ml-auto mt-auto mb-1"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    onSelectEvent?.(event._id);
                                                }}
                                            >
                                                Chi tiết
                                            </button>
                                        </div>
                                    </div>
                                    {/*hiển thị model nút mở quét vé*/}
                                    <div
                                        className="text-gray-500 p-2 ml-4 text-center hover:scale-102 cursor-pointer"
                                        onClick={() => openScanPage(event)}
                                    >
                                        <img src="/qr.png" alt="" className="h-35 w-35 " />
                                        - Quét vé -
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}


                {pastEvents.length > 0 && (
                    <>
                        <div className="grid pt-6 flex">
                            {pastEvents.map(event => (
                                <div
                                    key={`past-${event._id}`}
                                    className="flex w-full bg-gray-50 rounded mb-4"
                                >

                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-[35%] object-cover rounded"
                                    />
                                    <div className=" ml-4 w-100 flex flex-col flex-grow border-r">
                                        <div className="font-semibold text-[14px] pt-2">{event.title}</div>
                                        <div className="text-xs text-gray-600 mb-2">
                                            {event.start_time && event.end_time
                                                ? `${new Date(event.start_time).toLocaleString("vi-VN", {
                                                    day: "2-digit", month: "2-digit", year: "numeric",
                                                    hour: "2-digit", minute: "2-digit", hour12: false
                                                })} 
                                                        - 
                                                    ${new Date(event.end_time).toLocaleString("vi-VN", {
                                                    day: "2-digit", month: "2-digit", year: "numeric",
                                                    hour: "2-digit", minute: "2-digit", hour12: false
                                                })}`
                                                : ""}
                                        </div>
                                        <p className="w-60 px-10 border-1 border-blue-200 ml-20"></p>

                                        <div className="text-gray-700 flex flex-col flex-grow px-2 mb-2 mr-4 mt-1">
                                            <div className="flex justify-between">
                                                <div className="mt-1 border px-2 py-1 rounded flex items-center border-red-200">
                                                    Đã bán: {event.total_sold || 0} <IoTicketOutline className="ml-2" />
                                                </div>

                                                <div className="mt-1 border px-2 py-1 rounded border-blue-200 flex border-blue-200 items-center">
                                                    Còn lại: {event.remaining || 0} <IoTicketOutline className="ml-2" />
                                                </div>
                                            </div>

                                            <div className="mt-1 border px-2 py-1 rounded border-blue-200 flex border-green-200 mb-1">
                                                Tổng doanh thu: {(event.total_revenue || 0).toLocaleString('vi-VN')} đ
                                            </div>

                                            <button
                                                className="rounded bg-blue-950 px-6 py-1 text-white hover:bg-blue-900 ml-auto mt-auto mb-1"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    onSelectEvent?.(event._id);
                                                }}
                                            >
                                                Chi tiết
                                            </button>
                                        </div>
                                    </div>
                                    {/*hiển thị model nút mở quét vé*/}

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
                    ${event.status === "pending" ? "bg-green-50" : ""}
                    ${event.status === "approved" ? "bg-blue-50" : ""}
                `}
                    //onClick={() => onSelectEvent?.(event._id)}
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