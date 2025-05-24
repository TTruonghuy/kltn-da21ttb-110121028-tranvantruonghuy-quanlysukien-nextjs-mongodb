import React, { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import { TiArrowBack, TiEdit } from "react-icons/ti";
import CreateEventForm from "./CreateEventForm"; // Giả sử bạn đã tạo component này
import { EventFormData } from "../types"; // Import kiểu dữ liệu nếu cần

interface Ticket {
    name: string;
    price: number;
}
interface Session {
    start_time: string;
    end_time: string;
    tickets: Ticket[];
}


interface EventDetail {
    id?: string;
    title: string;
    description?: string;
    image?: string;
    location?: {
        houseNumber?: string;
        ward?: string;
        district?: string;
        province?: string;
    };
    event_type?: string;
    sessions?: Session[];
    min_price?: number;
    max_price?: number;
    status?: string;
}

interface EventDetailModalProps {
    eventId: string;
    onClose: () => void;
}

function mapEventDetailToFormData(event: any): EventFormData {
    return {
        title: event.title || "",
        description: event.description || "",
        houseNumber: event.location?.houseNumber || "",
        ward: event.location?.ward || "",
        district: event.location?.district || "",
        province: event.location?.province || "",
        location: {
            houseNumber: event.location?.houseNumber || "",
            ward: event.location?.ward || "",
            district: event.location?.district || "",
            province: event.location?.province || "",
        },
        image: null, // Để sau
        event_type: event.event_type || "",
        noSale: event.noSale ?? false,
        isOnline: event.isOnline ?? false,
        sessions: event.sessions || [],
    };
}


export default function EventDetailModal({ eventId, onBack }: { eventId: string; onBack: () => void }) {
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editFormData, setEditFormData] = useState<EventFormData | null>(null);

    useEffect(() => {
        if (showEditForm && editFormData) {
            console.log("editFormData:", editFormData);
        }
    }, [showEditForm, editFormData]);

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:5000/event/${eventId}`, { withCredentials: true })
            .then(res => {
                console.log("API response:", res.data);
                setEvent(res.data); // hoặc setEvent(res.data) nếu API trả về object trực tiếp
            })
            .catch(() => setEvent(null))
            .finally(() => setLoading(false));
    }, [eventId])

    if (loading) return <div>Đang tải...</div>;
    if (!event) return (
        <div>
            <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-200 rounded">← Quay lại</button>
            <div>Không tìm thấy sự kiện.</div>
        </div>
    );


    const handleEdit = () => {
        if (!event) return;
        console.log("event trước khi map:", event);
        setEditFormData(mapEventDetailToFormData(event));
        setShowEditForm(true);
    };
    // ...phần render chi tiết như mẫu page.tsx...
    return (
        <div className="bg-white rounded-lg pt-12">
            <div>
                <button onClick={onBack} className="bg-blue-100 top-32 mb-4 px-4 py-2 rounded-lg flex font-semibold items-center text-blue-950 hover:scale-102 fixed "><TiArrowBack className="w-8 h-8" /> Trở lại</button>
                <button onClick={handleEdit} className="bg-green-100 top-32  left-287 mb-4 px-4 py-2 rounded-lg flex font-semibold items-center text-blue-950 hover:scale-102 fixed "><TiEdit className="w-8 h-8" /> Chỉnh sửa </button>
            </div>
            <div className="flex mb-10">
                <div className="col-span-1 rounded-lg rounded-r-[0px]
                    p-4 w-100 border-l-3 border-t-3 border-b-3 border-blue-900">
                    <h1 className="text-base font-bold mb-6">{event.title}</h1>
                    <div className="flex items-center mb-2 text-xs">
                        <span className="mr-2">🕒</span>
                        <span>
                            {event.sessions && event.sessions.length > 0
                                ? `${new Date(event.sessions[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.sessions[0].end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${new Date(event.sessions[0].start_time).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`
                                : ""}
                        </span>
                    </div>
                    <div className="mb-6 text-xs">
                        <span className="mr-2">📍</span>
                        {event.location
                            ? [
                                event.location.houseNumber,
                                event.location.ward,
                                event.location.district,
                                event.location.province
                            ].filter(Boolean).join(", ")
                            : ""}
                    </div>
                    <div className="p-2 rounded-lg mb-2 text-sm font-semibold">
                        Giá vé từ {event.min_price?.toLocaleString("vi-VN") ?? "?"}đ đến {event.max_price?.toLocaleString("vi-VN") ?? "?"}đ
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold">Trạng thái:</span>{" "}
                        <span className="capitalize">{event.status}</span>

                    </div>
                    <div className="mb-2">

                        <span className="font-semibold">Thể loại:</span>{" "}
                        <span className="capitalize">{event.event_type}</span>
                    </div>
                </div>
                <div className="w-[550px] h-full">
                    {event.image && (
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover rounded-r-lg"
                        />
                    )}
                </div>
            </div>
            <div className="flex mb-6">

                <div className=" rounded-lg p-4 mr-10 min-h-[200px] w-[610px] border">
                    <h2 className="font-semibold mb-4 text-[20px]">Giới thiệu sự kiện</h2>
                    <div
                        className="event-description"
                        dangerouslySetInnerHTML={{ __html: event.description || "" }}
                    />
                </div>

                <div className=" rounded-lg p-4 w-[300px] border">
                    <h2 className="font-semibold mb-4 text-[20px]">Thông tin vé</h2>
                    {event.sessions && event.sessions.map((session, idx) => (
                        <div key={idx} className="mb-2">
                            <div className="font-semibold text-[14px] mb-1">
                                ▼ Xuất: {new Date(session.start_time).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
                            </div>
                            {session.tickets.map((ticket, tIdx) => (
                                <div key={tIdx} className="flex justify-between items-center bg-gray-100 rounded-[8px] my-2 p-2 text-[14px]">
                                    <span>{ticket.name}</span>
                                    <span>{ticket.price.toLocaleString("vi-VN")}.đ</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            {showEditForm && editFormData && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-300 max-w-600 max-h-[95vh] overflow-y-auto relative shadow-lg">
                        <button
                            className="absolute top-2 right-2 text-2xl font-bold text-gray-500 hover:text-black"
                            onClick={() => setShowEditForm(false)}
                        >
                            ×
                        </button>

                        {/* Form chỉnh sửa, có thể tái sử dụng CreateEventForm, truyền prop initialValue là event */}
                        <CreateEventForm

                            formData={editFormData}

                            onFormDataChange={data =>
                                setEditFormData(prev => ({
                                    ...prev!,
                                    ...(typeof data === "function" ? data(prev!) : data)
                                }))
                            }

                            isEdit
                            onUpdate={async () => {
                                try {
                                    let imageUrl = event.image; // mặc định dùng ảnh cũ
                                    if (editFormData.image) {
                                        // Nếu có ảnh mới, upload lên server
                                        const formData = new FormData();
                                        formData.append("image", editFormData.image);
                                        // Thêm các trường khác vào formData nếu backend yêu cầu
                                        // Ví dụ: formData.append("title", editFormData.title);

                                        // Gửi request upload ảnh riêng, backend trả về URL
                                        const uploadRes = await axios.post("http://localhost:5000/event/upload-image", formData, {
                                            headers: { "Content-Type": "multipart/form-data" },
                                            withCredentials: true,
                                        });
                                        imageUrl = uploadRes.data.url; // backend trả về { url: "..." }
                                    }

                                    // Gửi request cập nhật event
                                    await axios.put(`http://localhost:5000/event/${event.id}`, {
                                        ...editFormData,
                                        image: imageUrl,
                                    }, { withCredentials: true });

                                    setShowEditForm(false);
                                    // Có thể reload lại event nếu muốn
                                } catch (e) {
                                    alert("Cập nhật thất bại!");
                                }
                            }}
                            onCancel={() => setShowEditForm(false)}
                        />
                        {/* Bạn có thể thêm nút Lưu, Hủy, ... */}
                    </div>
                </div>
            )}
        </div>
    );
}