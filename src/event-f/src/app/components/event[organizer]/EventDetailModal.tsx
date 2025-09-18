import React, { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import { TiArrowBack, TiEdit, TiChevronLeft, TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
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

interface Organizer {
    name: string;
    logo: string;
    description: string;
    address?: string;
    weblink?: string;
    phone?: string;
    social_link?: string;
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
    organizer?: Organizer;
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

        ticketQuantity: (ticket as any).ticket_quantity ?? ticket.quantity ?? 0,
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


function toDatetimeLocalString(dateStr?: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    // Lấy timezone local
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
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
    const [openSessions, setOpenSessions] = useState<number[]>([0]);

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

    const toggleSession = (idx: number) => {
        setOpenSessions(prev =>
            prev.includes(idx)
                ? prev.filter(i => i !== idx)
                : [...prev, idx]
        );
    };

    const handleEdit = () => {
        if (!event) return;
        console.log("event trước khi map:", event);
        setEditFormData(mapEventDetailToFormData(event));
        setShowEditForm(true);
    };


    const handleAddSession = () => {
        // Chỉ mở modal rỗng, chưa gọi API
        setEditingSession({
            start_time: "",
            end_time: "",
            tickets: [],
        });
        setEditingSessionIndex(null); // null để biết là session mới
        setShowEditSessionModal(true);
    };

    // Hàm mở modal edit session
    const handleEditSession = (session: Session, index: number) => {
        setEditingSession(session);
        setEditingSessionIndex(index);
        setShowEditSessionModal(true);
    };

    // Hàm lưu thay đổi session (gọi API placeholder)
    const handleSaveSession = async () => {
        if (!editingSession || !event) return;
        try {
            if (!editingSession._id) {
                // Tạo session mới
                const res = await axios.post(`http://localhost:5000/ticket/session`, {
                    event_id: event.id,
                    start_time: editingSession.start_time,
                    end_time: editingSession.end_time,
                }, { withCredentials: true });
            } else {
                // Sửa session cũ
                await axios.put(`http://localhost:5000/ticket/session/${editingSession._id}`, {
                    start_time: editingSession.start_time,
                    end_time: editingSession.end_time,
                }, { withCredentials: true });
            }
            // Reload lại event
            const res = await axios.get(`http://localhost:5000/event/${eventId}`, { withCredentials: true });
            setEvent(res.data);
            setShowEditSessionModal(false);
            setEditingSession(null);
            setEditingSessionIndex(null);
        } catch (e) {
            alert("Lưu session thất bại!");
        }
    };

    // Hàm xoá session
    const handleDeleteSession = async (sessionId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xoá xuất này không?")) return;
        try {
            await axios.delete(`http://localhost:5000/ticket/session/${sessionId}`, { withCredentials: true });
            // Reload lại event
            const res = await axios.get(`http://localhost:5000/event/${eventId}`, { withCredentials: true });
            setEvent(res.data);
        } catch (e) {
            alert("Xoá xuất thất bại!");
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
        if (!editingTicket || !editingSession || !event) return;
        try {
            const savedTicket = draftToTicket(editingTicket);
            if (editingTicket._id) {
                // Sửa vé
                await axios.put(`http://localhost:5000/ticket/${editingTicket._id}`, {
                    ticket_name: savedTicket.name,
                    ticket_price: savedTicket.price,
                    ticket_quantity: savedTicket.quantity,
                    min_per_order: savedTicket.min_per_order,
                    max_per_order: savedTicket.max_per_order,
                    description_ticket: savedTicket.description,
                }, { withCredentials: true });
            } else {
                // Thêm vé mới
                await axios.post(`http://localhost:5000/ticket`, {
                    session_id: editingSession._id,
                    ticket_name: savedTicket.name,
                    ticket_price: savedTicket.price,
                    ticket_quantity: savedTicket.quantity,
                    min_per_order: savedTicket.min_per_order,
                    max_per_order: savedTicket.max_per_order,
                    description_ticket: savedTicket.description,
                }, { withCredentials: true });
            }
            // Reload lại event
            const res = await axios.get(`http://localhost:5000/event/${eventId}`, { withCredentials: true });
            setEvent(res.data);

            // Cập nhật lại editingSession nếu đang mở modal session
            if (editingSession._id) {
                const updatedSession = res.data.sessions?.find(
                    (s: any) => s._id === editingSession._id
                );
                if (updatedSession) {
                    setEditingSession(updatedSession);
                }
            }

            setShowTicketModal(false);
            setEditingTicket(null);
            setEditingTicketIndex(null);
        } catch (e) {
            alert("Lưu vé thất bại!");
        }
    };

    // Hàm xoá ticket
    const handleDeleteTicket = async (ticketId: string) => {

        if (!window.confirm("Bạn có chắc chắn muốn xoá vé này không?")) return;

        try {
            await axios.delete(`http://localhost:5000/ticket/${ticketId}`, { withCredentials: true });
            // Reload lại event
            const res = await axios.get(`http://localhost:5000/event/${eventId}`, { withCredentials: true });
            setEvent(res.data);

            if (editingSession?._id) {
                const updatedSession = res.data.sessions?.find(
                    (s: any) => s._id === editingSession._id
                );
                if (updatedSession) {
                    setEditingSession(updatedSession);
                }
            }

        } catch (e) {
            alert("Xoá vé thất bại!");
        }
    };

    return (
        <div className="bg-white rounded-lg ">
            <div className="flex justify-between items-center  py-2 border-b">
                <button onClick={onBack} className=" pr-2 pl-2 py-2 rounded flex font-semibold items-center text-blue-950 hover:scale-102 hover:bg-blue-50">
                    <TiChevronLeft className="w-5 h-5" /> Trở lại</button>
                {/*<button onClick={handleEdit} className="bg-green-100 mb-4 px-4 py-2 rounded-lg flex font-semibold items-center text-blue-950 hover:scale-102  "> Chỉnh sửa </button> */}
            </div>

            <div className="flex mb-4">
                <div className="col-span-1 rounded-lg rounded-r-[0px]
                    p-4 w-100 border-l-3 border-t-3 border-b-3 border-blue-900 flex-col flex">
                    <h1 className="text-base font-bold mb-4">{event.title}</h1>
                    {event.organizer && (
                        <div className="flex items-center mb-2">
                            <p className='font-semibold mr-2'>Ban tổ chức:</p>
                            <div className="flex items-center">
                                <img src={event.organizer.logo || "/avatar.jpg"} alt={event.organizer.name} className=" max-w-[40px] max-h-[40px] object-cover mr-2" />
                                <span className="font-semibold text-gray-700 text-[14px]">{event.organizer.name}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center mb-2 text-[14px]">
                        <span className="flex">
                            <p className="font-bold mr-2" >Thời gian:</p>
                            {event.sessions && event.sessions.length > 0
                                ? `${new Date(event.sessions[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(event.sessions[0].end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}, ${new Date(event.sessions[0].start_time).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`
                                : ""}
                        </span>
                    </div>
                    <div className="mb-6 text-[14px] flex">
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
                        <div className="rounded-lg mb-2 text-[14px] font-semibold">
                            Giá vé từ {event.min_price?.toLocaleString("vi-VN") ?? "?"}đ đến {event.max_price?.toLocaleString("vi-VN") ?? "?"}đ
                        </div>
                        <div className="mb-2 text-[14px]">
                            <span className="font-semibold">Trạng thái:</span>{" "}
                            <span className="capitalize">{event.status}</span>

                        </div>
                        <div className="mb-2 text-[14px]">

                            <span className="font-semibold">Thể loại:</span>{" "}
                            <span className="capitalize">{event.event_type}</span>
                        </div>
                    </div>

                </div>


                <div className="w-[628px] h-full">
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
                <button onClick={handleEdit} className="bg-blue-950 mb-4 px-4 py-2 rounded-lg flex items-center ml-auto text-white hover:scale-102 hover:bg-blue-800">
                    Sửa sự kiện
                </button>

                <div className=" rounded-lg p-4 border">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold mb-4 text-[20px]">Thông tin vé</h2>
                    </div>
                    {event.sessions && event.sessions.map((session, idx) => {
                        const isOpen = openSessions.includes(idx);
                        return (
                            <div key={idx} className="mb-6">
                                <div className='flex items-center justify-between w-full'>
                                    <div
                                        className="font-semibold text-[14px] mb-1 flex items-center cursor-pointer select-none"
                                        onClick={() => toggleSession(idx)}
                                    >
                                        {isOpen ? (
                                            <TiArrowSortedUp className='w-6 h-6' />
                                        ) : (
                                            <TiArrowSortedDown className='w-6 h-6' />
                                        )}
                                        <div className='flex items-center justify-between w-full'>
                                            <span className="ml-1">
                                                Xuất: {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {" - "}
                                                {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {" , "}
                                                {new Date(session.start_time).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
                                            </span>
                                        </div>

                                    </div>
                                    <div className="flex space-x-4">
                                        <button className=" text-sm px-4 py-1.5 bg-blue-950 text-white rounded-lg hover:bg-blue-800 hover:scale-102"
                                            onClick={() => handleEditSession(session, idx)}>
                                            Sửa
                                        </button>
                                        <button className=" text-sm px-4 py-1.5 bg-red-300 text-black rounded-lg hover:bg-red-200 hover:scale-102"
                                            onClick={() => handleDeleteSession(session._id!)}>
                                            Xoá
                                        </button>
                                    </div>
                                </div>


                                {isOpen && session.tickets.map((ticket, tIdx) => {
                                    return (
                                        <div key={tIdx} className="bg-gray-100 rounded-[8px] my-2 p-2 text-[14px] relative">
                                            <div className="flex justify-between items-center">
                                                <span className='font-semibold'>{ticket.name}</span>
                                                <span>{ticket.price.toLocaleString("vi-VN")}.đ</span>
                                            </div>
                                            {ticket.description && (
                                                <div className="text-gray-600 text-xs mt-1">{ticket.description}</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                    <button onClick={handleAddSession} className="bg-blue-950 text-white px-4 py-2 rounded-lg ml-100  hover:bg-blue-800 hover:scale-102">Thêm xuất</button>
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
                        <div className="flex p-4">
                            <div className="">
                                <h3 className="font-semibold">Xuất</h3>
                                <div className="mr-8 mt-2">
                                    <div className="mb-4 ">
                                        <label className="block mb-2">Thời gian bắt đầu:</label>
                                        <input
                                            type="datetime-local"
                                            value={toDatetimeLocalString(editingSession.start_time)}
                                            onChange={e => setEditingSession({ ...editingSession, start_time: e.target.value })}
                                            className="border border-gray-300 rounded-md p-2 w-full "
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block mb-2">Thời gian kết thúc:</label>
                                        <input
                                            type="datetime-local"
                                            value={toDatetimeLocalString(editingSession.end_time)}
                                            onChange={e => setEditingSession({ ...editingSession, end_time: e.target.value })}
                                            className="border border-gray-300 rounded-md p-2 w-full "
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-2 w-full ">
                                <h3 className="font-semibold mb-4 ">Danh sách vé</h3>
                                {editingSession._id ? (
                                    <>
                                        {editingSession.tickets.map((ticket, idx) => (
                                            <div key={idx} className="flex justify-between mb-2 bg-gray-100 p-2 px-4 rounded-lg text-sm" onClick={() => handleEditTicket(ticket, idx)}>
                                                <span className="" >{ticket.name} - {ticket.price}đ</span>
                                                <div className="flex space-x-4">
                                                    <button onClick={() => handleEditTicket(ticket, idx)} className="text-blue-700 hover:underline">Sửa</button>
                                                    <button
                                                        className="text-red-500 hover:underline"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            handleDeleteTicket(ticket._id!);
                                                        }}
                                                    >
                                                        Xoá
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => handleEditTicket(null, null)} className="bg-blue-950 text-white px-6 py-2 rounded-lg ml-90 mt-1 hover:scale-102 hover:bg-blue-800">Thêm vé</button>
                                    </>
                                ) : (
                                    <div className="text-gray-500 italic">Sau khi thêm xuất mới có thể thêm vé *</div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setShowEditSessionModal(false)} className="bg-gray-400 text-black px-6 py-2 rounded-lg hover:scale-102 hover:bg-gray-300">Hủy</button>
                            <button onClick={handleSaveSession} className="bg-blue-950 text-white px-6 py-2 rounded-lg hover:scale-102 hover:bg-blue-800">Lưu</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal edit/add ticket */}
            {showTicketModal && editingTicket && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[1200px] max-h-[95vh] overflow-y-auto relative shadow-lg">
                        <button
                            className="absolute top-2 right-3 text-2xl font-bold text-gray-500 hover:text-black"
                            onClick={() => setShowTicketModal(false)}
                        >
                            ×
                        </button>
                        <h3 className="font-semibold mb-4">{editingTicket._id ? "Sửa vé" : "Thêm vé"}</h3>
                        <div className="w-full">

                            <div className="flex mb-10 w-full justify-between">

                                <div className="w-189 mr-20">
                                    <label className="font-medium text-gray-700 mb-2">Tên vé</label>
                                    <input
                                        type="text"
                                        className="border rounded-lg w-full p-2"
                                        value={editingTicket.ticketName ?? ""}
                                        onChange={e =>
                                            setEditingTicket(prev => prev ? { ...prev, ticketName: e.target.value } : prev)
                                        }
                                        required
                                    />
                                </div>

                                <div className="w-79">
                                    <label className="font-medium text-gray-700 mb-2">Giá vé</label>
                                    <div className="flex items-end">
                                        <input
                                            type="text"
                                            pattern="[0-9.]*"
                                            inputMode="numeric"
                                            className="border rounded-lg w-full p-2"
                                            value={
                                                editingTicket.ticketPrice !== undefined
                                                    ? editingTicket.ticketPrice === 0
                                                        ? "0"
                                                        : editingTicket.ticketPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                                                    : ""
                                            }
                                            onChange={e => {
                                                let raw = e.target.value.replace(/\D/g, "");
                                                raw = raw.replace(/^0+/, "");
                                                setEditingTicket(prev => prev ? {
                                                    ...prev,
                                                    ticketPrice: raw === "" ? 0 : Number(raw),
                                                } : prev);
                                            }}
                                            required
                                        />
                                    </div>
                                </div>

                            </div>



                            <div className="flex mb-10">
                                <div className="flex w-full justify-between">
                                    <div className="mr-20 w-">
                                        <label className="font-medium text-gray-700 mb-2">Số lượng vé</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            className="border rounded-lg w-full p-2"
                                            value={
                                                editingTicket.ticketQuantity !== undefined
                                                    ? editingTicket.ticketQuantity === 0
                                                        ? "0"
                                                        : editingTicket.ticketQuantity
                                                    : ""
                                            }
                                            onChange={e => {
                                                let raw = e.target.value.replace(/\D/g, "");
                                                raw = raw.replace(/^0+/, "");
                                                setEditingTicket(prev => prev ? {
                                                    ...prev,
                                                    ticketQuantity: raw === "" ? 0 : Number(raw),
                                                } : prev);
                                            }}
                                            required
                                        />
                                    </div>

                                    <div className="w- mr-20">
                                        <label className="font-medium text-gray-700 mb-2">Số lượng tối thiểu mỗi lần đặt</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            className="border rounded-lg w-full p-2"
                                            value={editingTicket.minPerOrder === 0 ? "" : editingTicket.minPerOrder}
                                            onChange={e => {
                                                let raw = e.target.value.replace(/\D/g, "");
                                                raw = raw.replace(/^0+/, "");
                                                setEditingTicket(prev => prev ? {
                                                    ...prev,
                                                    minPerOrder: raw === "" ? 0 : Number(raw),
                                                } : prev);
                                            }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="w-">
                                    <label className="font-medium text-gray-700 mb-2">Số lượng tối đa mỗi lần đặt</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="border rounded-lg w-full p-2"
                                        value={editingTicket.maxPerOrder === 0 ? "" : editingTicket.maxPerOrder}
                                        onChange={e => {
                                            let raw = e.target.value.replace(/\D/g, "");
                                            raw = raw.replace(/^0+/, "");
                                            setEditingTicket(prev => prev ? {
                                                ...prev,
                                                maxPerOrder: raw === "" ? 0 : Number(raw),
                                            } : prev);
                                        }}
                                        required
                                    />
                                </div>

                            </div>




                            <div className="flex mb-10 w-full">
                                <div className="flex flex-col w-full mr-2 ">
                                    <label className="font-medium text-gray-700">Mô tả</label>
                                    <textarea
                                        className="w-full h-34 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 hover:scale-101"
                                        value={editingTicket.description_ticket ?? ""}
                                        onChange={e =>
                                            setEditingTicket(prev => prev ? { ...prev, description_ticket: e.target.value } : prev)
                                        }
                                    />
                                </div>
                            </div>
                        </div>


                        <div className="flex justify-end gap-2 space-x-4">
                            <button
                                className="bg-gray-400 px-6 py-2 rounded-lg hover:bg-gray-300 hover:scale-102"
                                onClick={() => setShowTicketModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="bg-blue-950 text-white px-6 py-2 rounded-lg hover:bg-blue-800 hover:scale-102"
                                onClick={handleSaveTicket}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}