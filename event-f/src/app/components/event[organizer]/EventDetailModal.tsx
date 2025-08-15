import React, { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import { TiArrowBack, TiEdit, TiChevronLeft} from "react-icons/ti";
import CreateEventForm from "./CreateEventForm"; // Giả sử bạn đã tạo component này
import { EventFormData } from "../types"; // Import kiểu dữ liệu nếu cần
import CreateTicketForm from "../ticket/CreateTicket"; // Import CreateTicketForm để quản lý sessions/tickets
import TicketModal from "../ticket/TicketModal"; // Import TicketModal để edit/add ticket

interface Ticket {
    _id?: string; // Thêm _id nếu có từ API
    name: string;
    price: number;
    quantity?: number;
    min_per_order?: number;
    max_per_order?: number;
    sale_start_time?: string;
    sale_end_time?: string;
    description?: string;
    image_ticket?: File | string | null;
}

interface TicketDraft {
    _id?: string;
    ticketName: string;
    ticketPrice: number;
    ticketQuantity: number;
    minPerOrder: number;
    maxPerOrder: number;
    saleStartTime: string;
    saleEndTime: string;
    description_ticket: string;
    image_ticket: File | string | null;
}

interface Session {
    _id?: string; // Thêm _id nếu có từ API
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
        ticketMode: event.sessions?.length > 0 ? "area" : "none", // Giả định dựa trên sessions
    };
}

function ticketToDraft(ticket: Ticket): TicketDraft {
    return {
        _id: ticket._id,
        ticketName: ticket.name || "",
        ticketPrice: ticket.price || 0,
        ticketQuantity: ticket.quantity ?? 0,
        minPerOrder: ticket.min_per_order ?? 1,
        maxPerOrder: ticket.max_per_order ?? 10,
        saleStartTime: ticket.sale_start_time ? ticket.sale_start_time.slice(0, 16) : "",
        saleEndTime: ticket.sale_end_time ? ticket.sale_end_time.slice(0, 16) : "",
        description_ticket: ticket.description || "",
        image_ticket: ticket.image_ticket || null,
    };
}


function draftToTicket(draft: TicketDraft): Ticket {
    return {
        _id: draft._id,
        name: draft.ticketName,
        price: draft.ticketPrice,
        quantity: draft.ticketQuantity,
        min_per_order: draft.minPerOrder,
        max_per_order: draft.maxPerOrder,
        sale_start_time: draft.saleStartTime,
        sale_end_time: draft.saleEndTime,
        description: draft.description_ticket,
        image_ticket: draft.image_ticket,
    };
}

export default function EventDetailModal({ eventId, onBack }: { eventId: string; onBack: () => void }) {
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editFormData, setEditFormData] = useState<EventFormData | null>(null);

    // State cho edit session
    const [showEditSessionModal, setShowEditSessionModal] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [editingSessionIndex, setEditingSessionIndex] = useState<number | null>(null);

    // State cho add/edit ticket trong session
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [editingTicket, setEditingTicket] = useState<TicketDraft | null>(null);
    const [editingTicketIndex, setEditingTicketIndex] = useState<number | null>(null);

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
            <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-200 rounded">
                 Quay lại</button>
            <div>Không tìm thấy sự kiện.</div>
        </div>
    );

    const handleEdit = () => {
        if (!event) return;
        console.log("event trước khi map:", event);
        setEditFormData(mapEventDetailToFormData(event));
        setShowEditForm(true);
    };

    // Hàm mở modal edit session
    const handleEditSession = (session: Session, index: number) => {
        setEditingSession(session);
        setEditingSessionIndex(index);
        setShowEditSessionModal(true);
    };

    // Hàm lưu thay đổi session (gọi API placeholder)
    const handleSaveSession = async () => {
        if (!editingSession || editingSessionIndex === null || !event) return;
        try {
            // Placeholder cho API sửa session (thay bằng API thực khi có)
            // await axios.put(`http://localhost:5000/session/${editingSession._id}`, editingSession, { withCredentials: true });

            // Cập nhật local state
            const updatedSessions = [...(event.sessions || [])];
            updatedSessions[editingSessionIndex] = editingSession;
            setEvent({ ...event, sessions: updatedSessions });
            setShowEditSessionModal(false);
            setEditingSession(null);
            setEditingSessionIndex(null);
        } catch (e) {
            alert("Cập nhật session thất bại!");
        }
    };

    // Hàm thêm session mới
    const handleAddSession = async () => {
        if (!event) return;
        const newSession: Session = {
            start_time: "",
            end_time: "",
            tickets: [],
        };
        setEditingSession(newSession);
        setEditingSessionIndex(event.sessions ? event.sessions.length : 0);
        setShowEditSessionModal(true);
        try {
            // Placeholder cho API tạo session mới (thay bằng API thực khi có)
            // const res = await axios.post(`http://localhost:5000/event/${eventId}/session`, newSession, { withCredentials: true });
            // newSession._id = res.data._id;

            // Cập nhật local state
            const updatedSessions = [...(event.sessions || []), newSession];
            setEvent({ ...event, sessions: updatedSessions });
        } catch (e) {
            alert("Thêm session thất bại!");
        }
    };

    // Hàm mở modal edit/add ticket trong session
    const handleEditTicket = (ticket: Ticket | null, ticketIndex: number | null) => {
        if (ticket) {
            setEditingTicket(ticketToDraft(ticket));
        } else {
            setEditingTicket({
                ticketName: "",
                ticketPrice: 0,
                ticketQuantity: 0,
                minPerOrder: 1,
                maxPerOrder: 10,
                saleStartTime: "",
                saleEndTime: "",
                description_ticket: "",
                image_ticket: null,
            });
        }
        setEditingTicketIndex(ticketIndex);
        setShowTicketModal(true);
    };

    // Hàm lưu ticket (add/edit)
    const handleSaveTicket = async () => {
        if (!editingTicket || !editingSession || editingSessionIndex === null || !event) return;
        try {
            const savedTicket = draftToTicket(editingTicket);
            let updatedTickets = [...editingSession.tickets];
            if (editingTicketIndex !== null) {
                // Edit ticket
                // Placeholder API: await axios.put(`http://localhost:5000/ticket/${savedTicket._id}`, savedTicket, { withCredentials: true });
                updatedTickets[editingTicketIndex] = savedTicket;
            } else {
                // Add new ticket
                // Placeholder API: const res = await axios.post(`http://localhost:5000/session/${editingSession._id}/ticket`, savedTicket, { withCredentials: true });
                // savedTicket._id = res.data._id;
                updatedTickets.push(savedTicket);
            }

            // Cập nhật session
            const updatedSessions = [...(event.sessions || [])];
            updatedSessions[editingSessionIndex] = { ...editingSession, tickets: updatedTickets };
            setEvent({ ...event, sessions: updatedSessions });
            setShowTicketModal(false);
            setEditingTicket(null);
            setEditingTicketIndex(null);
        } catch (e) {
            alert("Cập nhật ticket thất bại!");
        }
    };

    return (
        <div className="bg-white rounded-lg ">
            <div className="flex justify-between items-center  py-2 border-b">
                <button onClick={onBack} className=" mb-4 pr-2 pl-2 py-2 rounded flex font-semibold items-center text-blue-950 hover:scale-102 hover:bg-blue-50">
                    <TiChevronLeft className=""/> Trở lại</button>
               {/*<button onClick={handleEdit} className="bg-green-100 mb-4 px-4 py-2 rounded-lg flex font-semibold items-center text-blue-950 hover:scale-102  "> Chỉnh sửa </button> */} 
            </div>

            <div className="flex mb-10">
                <div className="col-span-1 rounded-lg rounded-r-[0px]
                    p-4 w-100 border-l-3 border-t-3 border-b-3 border-blue-900 flex-col flex">
                    <h1 className="text-base font-bold mb-6">{event.title}</h1>
                    <div className="flex items-center mb-2 text-xs">

                        <span className="flex">
                            <p className="font-bold mr-2" >Thời gian:</p>
                            {event.sessions && event.sessions.length > 0
                                ? `${new Date(event.sessions[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(event.sessions[0].end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}, ${new Date(event.sessions[0].start_time).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`
                                : ""}
                        </span>
                    </div>
                    <div className="mb-6 text-xs flex">
                        <p className="font-bold mr-2 " >Địa điểm:</p>
                        <div className="flex-1">
                            {event.location
                                ? [
                                    event.location.houseNumber,
                                    event.location.ward,
                                    event.location.district,
                                    event.location.province
                                ].filter(Boolean).join(", ")
                                : ""}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="rounded-lg mb-2 text-sm font-semibold">
                            Giá vé từ {event.min_price?.toLocaleString("vi-VN") ?? "?"}đ đến {event.max_price?.toLocaleString("vi-VN") ?? "?"}đ
                        </div>
                        <div className="mb-2 text-sm">
                            <span className="font-semibold">Trạng thái:</span>{" "}
                            <span className="capitalize">{event.status}</span>

                        </div>
                        <div className="mb-2 text-sm">

                            <span className="font-semibold">Thể loại:</span>{" "}
                            <span className="capitalize">{event.event_type}</span>
                        </div>
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
            <div className="mb-4">

                <div className=" rounded-lg p-4 border mb-4">
                    <h2 className="font-semibold mb-4 text-[20px] ">Giới thiệu sự kiện</h2>
                    <div
                        className="event-description"
                        dangerouslySetInnerHTML={{ __html: event.description || "" }}
                    />
                </div>

                <div className=" rounded-lg p-4 border">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold mb-4 text-[20px]">Thông tin vé</h2>
                    </div>
                    {event.sessions && event.sessions.map((session, idx) => (
                        <div key={idx} className="mb-2">
                            <div className="font-semibold text-[14px] mb-1 flex justify-between items-center">
                                Xuất:{" "}
                                {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} -
                                {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })},
                                {" "}
                                {new Date(session.start_time).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}

                                {/* <button onClick={() => handleEditSession(session, idx)} className="bg-green-100 text-blue-950 px-6 py-1 rounded-lg">Sửa</button> */}
                            </div>
                            {session.tickets.map((ticket, tIdx) => (
                                <div key={tIdx} className="flex justify-between items-center bg-gray-100 rounded-[8px] my-2 p-2 text-[14px]">
                                    <span>{ticket.name}</span>
                                    <span>{ticket.price.toLocaleString("vi-VN")}.đ</span>
                                </div>
                            ))}
                        </div>
                    ))}
                    {/* <button onClick={handleAddSession} className="bg-blue-950 text-white px-4 py-2 rounded-lg ml-90">Thêm xuất diễn</button>*/}
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
                                    const res = await axios.get(`http://localhost:5000/event/${eventId}`, { withCredentials: true });
                                    setEvent(res.data);
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

            {/* Modal edit session */}
            {showEditSessionModal && editingSession && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
                    <div className=" bg-white rounded-lg p-6 w-300 max-w-600 max-h-[95vh] overflow-y-auto relative shadow-lg">
                        <button
                            className="absolute top-2 right-3 text-2xl font-bold text-gray-500 hover:text-black"
                            onClick={() => setShowEditSessionModal(false)}
                        >
                            ×
                        </button>
                        <h2 className="text-xl font-bold mb-4">Sửa xuất diễn</h2>

                        <div className="flex">
                            <div className="mr-8 mt-4">
                                <div className="mb-4 ">
                                    <label className="block mb-2">Thời gian bắt đầu:</label>
                                    <input
                                        type="datetime-local"
                                        value={editingSession.start_time ? editingSession.start_time.slice(0, 16) : ""}
                                        onChange={e => setEditingSession({ ...editingSession, start_time: e.target.value })}
                                        className="border border-gray-300 rounded-md p-2 w-full "
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2">Thời gian kết thúc:</label>
                                    <input
                                        type="datetime-local"
                                        value={editingSession.end_time ? editingSession.end_time.slice(0, 16) : ""}
                                        onChange={e => setEditingSession({ ...editingSession, end_time: e.target.value })}
                                        className="border border-gray-300 rounded-md p-2 w-full "
                                    />
                                </div>
                            </div>


                            <div className="mb-2 w-full p-4 pt-2">
                                <h3 className="font-semibold mb-2">Danh sách vé</h3>
                                {editingSession.tickets.map((ticket, idx) => (
                                    <div key={idx} className="flex justify-between mb-2 bg-gray-100 p-2 rounded-lg">
                                        <span className="">{ticket.name} - {ticket.price}đ</span>
                                        {/*<button onClick={() => handleEditTicket(ticket, idx)} className="text-blue-500">Sửa</button>*/}
                                    </div>
                                ))}
                                <button onClick={() => handleEditTicket(null, null)} className="bg-blue-950 text-white px-6 py-2 rounded-lg">Thêm vé</button>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleSaveSession} className="bg-blue-950 text-white px-6 py-2 rounded-lg">Lưu</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal edit/add ticket 
            {showTicketModal && editingTicket && (
                <TicketModal
                    open={showTicketModal}
                    onClose={() => setShowTicketModal(false)}
                    formData={editingTicket}
                    onFormDataChange={data => setEditingTicket(prev => {
                        if (prev === null) return null;
                        return { ...prev, ...(typeof data === "function" ? data(prev) : data) };
                    })}
                    onSave={handleSaveTicket}
                />
            )}*/}
        </div>
    );
}