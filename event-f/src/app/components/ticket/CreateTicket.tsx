"use client";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { useState, useEffect } from "react";
import TicketModal from "./TicketModal";
import { EventFormData } from "@/app/components/types";
import { TiTrash } from "react-icons/ti";
import SeatEditor from "./SeatEditor";
import TimePicker from 'react-time-picker';

interface TicketDraft {
    ticketName: string;
    ticketPrice: number;
    ticketQuantity: number;
    minPerOrder: number;
    maxPerOrder: number;
    saleStartTime: string;
    saleEndTime: string;
    description_ticket: string;
    image_ticket: File | null;
}

interface CreateTicketFormProps {
    formData: EventFormData;
    onFormDataChange: (data: Partial<EventFormData> | ((prev: EventFormData) => EventFormData)) => void;
    onBack: () => void;
    onSubmit: () => void; // Callback khi tạo vé thành công
}


export default function CreateTicketForm({
    formData,
    onFormDataChange,
    onBack,
    onSubmit,
}: CreateTicketFormProps) {
    const [loading, setLoading] = useState(false);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [editingSessionIndex, setEditingSessionIndex] = useState<number | null>(null);
    const [editingTicketIndex, setEditingTicketIndex] = useState<number | null>(null);
    const [ticketDraft, setTicketDraft] = useState<any>(null);
    const ticketMode = formData.ticketMode || "area";

    const sessions = formData.sessions || [{ start_time: "", end_time: "", tickets: [] }];
    const defaultTicket = {
        ticketName: "",
        ticketPrice: 0,
        ticketQuantity: 0,
        minPerOrder: 1,
        maxPerOrder: 5,
        saleStartTime: "",
        saleEndTime: "",
        description_ticket: "",
        image_ticket: null,
    };
    const [showSeatingChart, setShowSeatingChart] = useState(false);


    const openTicketModal = (sessionIdx: number, ticketIdx?: number) => {
        setEditingSessionIndex(sessionIdx);
        setEditingTicketIndex(ticketIdx ?? null);

        if (ticketIdx !== undefined && ticketIdx !== null) {
            const ticket = sessions[sessionIdx].tickets?.[ticketIdx] ?? defaultTicket;
            let previewUrl = "";
            if (ticket.image_ticket instanceof File) {
                previewUrl = URL.createObjectURL(ticket.image_ticket);
            }
            setTicketDraft({ ...defaultTicket, ...ticket, imagePreviewUrl: previewUrl });
        } else {
            setTicketDraft(defaultTicket);
        }
        setIsTicketModalOpen(true);
    };

    // Khi lưu vé
    const handleSaveTicket = () => {
        if (editingSessionIndex === null || !ticketDraft) return;

        const newSessions = [...sessions];
        if (!newSessions[editingSessionIndex].tickets) newSessions[editingSessionIndex].tickets = [];

        const ticketToSave = { ...defaultTicket, ...ticketDraft };
        const { imagePreviewUrl, ...ticketDataToSave } = ticketDraft;

        if (editingTicketIndex !== null && editingTicketIndex !== undefined) {
            // Sửa vé
            newSessions[editingSessionIndex].tickets[editingTicketIndex] = ticketDraft;
        } else {
            // Thêm vé mới
            newSessions[editingSessionIndex].tickets.push(ticketDraft);
        }
        onFormDataChange({ sessions: newSessions });
        setIsTicketModalOpen(false);
        setEditingSessionIndex(null);
        setEditingTicketIndex(null);
        setTicketDraft(null);
    };

    const handleFormDataChange = (
        data: Partial<EventFormData> | ((prev: EventFormData) => EventFormData)
    ) => {
        onFormDataChange(data); // Sử dụng onFormDataChange để cập nhật formData
    };




    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFormDataChange({ noSale: e.target.checked });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Tạo event
            const eventFormData = new FormData();
            eventFormData.append("title", formData.title);
            eventFormData.append("description", formData.description);
            eventFormData.append("event_type", formData.event_type);
            eventFormData.append("location[houseNumber]", formData.houseNumber);
            eventFormData.append("location[ward]", formData.ward);
            eventFormData.append("location[district]", formData.district);
            eventFormData.append("location[province]", formData.province);
            if (formData.image) eventFormData.append("image", formData.image);

            const eventRes = await axios.post("http://localhost:5000/event/create", eventFormData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
            const eventId = eventRes.data.event?._id || eventRes.data._id;
            if (!eventId) throw new Error("Không lấy được event_id");

            // 2. Nếu không mở bán vé, chỉ tạo event
            if (formData.ticketMode === "none" || formData.noSale) {
                alert("Sự kiện đã được tạo thành công mà không mở bán vé!");
                onSubmit();
                setLoading(false);
                return;
            }

            // 3. Nếu mở bán vé, tạo các session và vé
            for (const session of formData.sessions || []) {
                const payload: any = {
                    event_id: eventId,
                    start_time: session.start_time,
                    end_time: session.end_time,
                };

                // Vé theo khu vực
                if (formData.ticketMode === "area") {
                    payload.tickets = (session.tickets || []).map((ticket: TicketDraft) => ({
                        ticket_name: ticket.ticketName,
                        ticket_price: ticket.ticketPrice,
                        ticket_quantity: ticket.ticketQuantity,
                        min_per_order: ticket.minPerOrder,
                        max_per_order: ticket.maxPerOrder,
                        sale_start_time: ticket.saleStartTime,
                        sale_end_time: ticket.saleEndTime,
                        description_ticket: ticket.description_ticket || "",
                        // Nếu có trường image, cần upload ảnh trước và lấy URL, hoặc bỏ qua nếu chưa hỗ trợ
                    }));
                }

                // Vé theo sơ đồ ghế
                if (formData.ticketMode === "seat" && session.seatingChart) {
                    payload.seatingChart = session.seatingChart; // Đúng schema bạn đã tạo
                }

                // Gửi request tạo session và vé/sơ đồ
                await axios.post(
                    "http://localhost:5000/ticket/create-session-with-seatingchart",
                    payload,
                    { withCredentials: true }
                );
            }

            alert("Tạo sự kiện, xuất diễn và vé thành công!");
            onSubmit();
        } catch (error: any) {
            console.error("Lỗi khi tạo sự kiện/xuất diễn/vé:", error);
            if (error.response) {
                alert("Đã xảy ra lỗi: " + JSON.stringify(error.response.data));
            } else if (error.request) {
                alert("Lỗi request: " + error.request);
            } else {
                alert("Lỗi: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };




    // Handler cho thay đổi session
    const handleSessionChange = (idx: number, field: "start_time" | "end_time", value: string) => {
        const newSessions = [...sessions];
        newSessions[idx][field] = value;
        onFormDataChange({ sessions: newSessions });
    };

    // Handler thêm session mới
    const handleAddSession = () => {
        let newChart = undefined;
        // Nếu session cuối cùng có sơ đồ thì copy sang session mới
        const lastSession = sessions[sessions.length - 1];
        if (lastSession && lastSession.seatingChart) {
            // Deep copy sơ đồ để 2 cái là khác nhau
            newChart = JSON.parse(JSON.stringify(lastSession.seatingChart));
        }
        onFormDataChange({
            sessions: [
                ...sessions,
                {
                    start_time: "",
                    end_time: "",
                    tickets: [],
                    ...(newChart ? { seatingChart: newChart } : {}),
                },
            ],
        });
    };

    // Handler xóa session
    const handleRemoveSession = (idx: number) => {
        const newSessions = sessions.filter((_, i) => i !== idx);
        onFormDataChange({ sessions: newSessions });
    };


    const handleDeleteTicket = (sessionIdx: number, ticketIdx: number) => {
        const newSessions = [...sessions];
        newSessions[sessionIdx].tickets = newSessions[sessionIdx].tickets.filter((_: TicketDraft, i: number) => i !== ticketIdx);
        onFormDataChange({ sessions: newSessions });
    };

    return (
        <>
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <div className="bg-white px-6 py-4 rounded shadow text-lg font-semibold">
                        Đang tạo sự kiện...
                    </div>
                </div>
            )}
            {showSeatingChart ? (
                <div>
                    <SeatEditor
                        onClose={() => setShowSeatingChart(false)}
                        onSave={chartData => {
                            const newSessions = [...sessions];
                            newSessions[editingSessionIndex!].seatingChart = chartData;
                            onFormDataChange({ sessions: newSessions });
                            setShowSeatingChart(false);
                        }}
                        initialChart={sessions[editingSessionIndex!]?.seatingChart}
                    />
                </div>
            ) : (
                <form className="space-y-10" onSubmit={handleSubmit}>
                    <div className="flex mb-5">
                        <h2 className="text-xl font-bold mb-4 mr-20">Tạo vé</h2>
                        <div className="flex gap-8 mb-5">

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="ticketMode"
                                    value="area"
                                    checked={ticketMode === "area"}
                                    onChange={() => onFormDataChange({ ticketMode: "area" })}
                                    style={{ width: 20, height: 20 }}
                                />
                                Vé theo khu vực
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="ticketMode"
                                    value="seat"
                                    checked={ticketMode === "seat"}
                                    onChange={() => onFormDataChange({ ticketMode: "seat" })}
                                    style={{ width: 20, height: 20 }}
                                />
                                Vé theo sơ đồ ghế
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="ticketMode"
                                    value="none"
                                    checked={ticketMode === "none"}
                                    onChange={() => onFormDataChange({ ticketMode: "none" })}
                                    style={{ width: 20, height: 20 }}
                                />
                                Không bán vé
                            </label>
                        </div>
                    </div>

                    {ticketMode !== "none" && (
                        <>
                            {sessions.map((session, idx) => (
                                <div key={idx} className="mb-6 p-5 border-gray-500 border rounded-lg">
                                    <div className="flex">
                                        <p className="flex font-medium text-gray-700 text-[17px] mb-5">Thời gian diễn ra sự kiện</p>
                                        {idx > 0 && (
                                            <button
                                                type="button"
                                                className="flex bg-red-500 px-4 h-8 pt-1 text-white rounded ml-auto"
                                                onClick={() => handleRemoveSession(idx)}>
                                                Xóa
                                            </button>
                                        )}
                                    </div>
                                    <div >
                                        <div className="flex space-x-20">
                                            <div className="w-full">
                                                <label htmlFor={`start_time_${idx}`} className="flex font-medium text-gray-700">
                                                    Bắt đầu <p className="text-red-700 pl-1">*</p>
                                                </label>

                                                <Input
                                                    id={`start_time_${idx}`}
                                                    name="start_time"
                                                    type="datetime-local"
                                                    value={session.start_time}
                                                    onChange={e => handleSessionChange(idx, "start_time", e.target.value)}
                                                    required
                                                />

                                            </div>
                                            <div className="w-full">
                                                <label htmlFor={`end_time_${idx}`} className="flex font-medium text-gray-700">
                                                    Kết thúc <p className="text-red-700 pl-1">*</p>
                                                </label>
                                                <Input
                                                    id={`end_time_${idx}`}
                                                    name="end_time"
                                                    type="datetime-local"
                                                    value={session.end_time}
                                                    onChange={e => handleSessionChange(idx, "end_time", e.target.value)}
                                                    required
                                                />

                                            </div>
                                        </div>

                                        {session.tickets && session.tickets.length > 0 && (
                                            <div className="mb-2">
                                                {session.tickets.map((ticket: TicketDraft, tIdx: number) => (
                                                    <div
                                                        key={tIdx}
                                                        className="cursor-pointer p-2 bg-gray-100 rounded-lg mb-1 flex justify-between items-center mt-1"
                                                        onClick={() => openTicketModal(idx, tIdx)}
                                                    >
                                                        <span className="font-semibold">{ticket.ticketName} : {ticket.ticketPrice}</span>
                                                        <span className="text-xs text-gray-600 ml-14 ">
                                                            {ticket.saleStartTime
                                                                ? new Date(ticket.saleStartTime).toLocaleString("vi-VN")
                                                                : ""}
                                                        </span>
                                                        <button
                                                            className="text-red-500 hover:text-red-600"
                                                            type="button"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                handleDeleteTicket(idx, tIdx);
                                                            }}
                                                        >
                                                            Xoá
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {ticketMode === "area" && (
                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
                                                    className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
                                                    onClick={() => openTicketModal(idx)}
                                                >
                                                    Tạo loại vé
                                                </button>
                                            </div>
                                        )}
                                        
                                       {/*  
                                        {ticketMode === "seat" && (
                                            <div className="flex justify-center">
                                                {session.seatingChart ? (
                                                    <div className="flex items-center bg-gray-200 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-300 w-full mt-2">
                                                        <span
                                                            className="flex-1"
                                                            onClick={() => {
                                                                setEditingSessionIndex(idx);
                                                                setShowSeatingChart(true);
                                                            }}
                                                        >
                                                            {`Sơ đồ ${idx + 1}`}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="ml-4 text-red-500 hover:text-red-600 "
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                // Xoá sơ đồ khỏi session
                                                                const newSessions = [...sessions];
                                                                delete newSessions[idx].seatingChart;
                                                                onFormDataChange({ sessions: newSessions });
                                                            }}
                                                        >
                                                            Xoá
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingSessionIndex(idx);
                                                            setShowSeatingChart(true);
                                                        }}
                                                        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                                                    >
                                                        Tạo sơ đồ
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                         */}



                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                className="ml-103 bg-blue-500 text-white py-2 px-4 rounded"
                                onClick={handleAddSession}
                            >
                                Tạo thêm xuất
                            </button>

                            {/* Modal nhập vé */}
                            {isTicketModalOpen && ticketDraft && (
                                <TicketModal
                                    open={isTicketModalOpen}
                                    onClose={() => {
                                        setIsTicketModalOpen(false);
                                        setEditingSessionIndex(null);
                                        setEditingTicketIndex(null);
                                        //setTicketDraft(null);
                                    }}
                                    formData={ticketDraft}
                                    onFormDataChange={setTicketDraft}

                                    handleFileChange={e => {
                                        const file = e.target.files?.[0] || null;
                                        setTicketDraft((prev: TicketDraft | null) => ({
                                            ...prev,
                                            image_ticket: file, // Lưu ảnh vào ticketDraft
                                        }));
                                    }}
                                    handleChange={e => {
                                        const { name, value } = e.target;
                                        handleFormDataChange(prev => ({
                                            ...prev, // Giữ lại các trường đã nhập trước đó
                                            [name]: value, // Cập nhật trường hiện tại
                                        }));
                                    }}
                                    onSave={handleSaveTicket}
                                />
                            )}
                        </>
                    )}

                    <div className="flex justify-between mt-8">
                        <Button
                            type="button"
                            onClick={onBack}
                            className="bg-gray-400 hover:bg-gray-500 text-white py-3 h-10 flex"
                        >
                            Quay lại
                        </Button>
                        <Button
                            type="submit"
                            // onClick={onSubmit}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-3 h-10 flex"
                        >
                            Hoàn tất
                        </Button>
                    </div>
                </form>)}
        </>
    );
}
