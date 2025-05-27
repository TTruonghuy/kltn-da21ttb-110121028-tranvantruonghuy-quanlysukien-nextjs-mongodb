"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/app/components/Header";
import { TiLocation, TiTime, TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";

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
    id: string;
    title: string;
    description: string;
    image: string;
    location?: {
        houseNumber?: string;
        ward?: string;
        district?: string;
        province?: string;
    };
    sessions: Session[];
    min_price: number;
    max_price: number;
}

export default function Event() {
    const { id } = useParams();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [openSessions, setOpenSessions] = useState<number[]>([0]);
    const user = null;
    const handleLogout = () => { };
    const handleShowAuth = () => { };

    useEffect(() => {
        axios.get(`http://localhost:5000/event/${id}`).then(res => setEvent(res.data));
    }, [id]);

    if (!event) return <div>Đang tải...</div>;

    const toggleSession = (idx: number) => {
        setOpenSessions(prev =>
            prev.includes(idx)
                ? prev.filter(i => i !== idx)
                : [...prev, idx]
        );
    };

    return (
        <>
            <Header user={user} onLogout={handleLogout} onShowAuth={handleShowAuth} />
            <div className="bg-blue-100 min-h-screen p-6 pt-2">
                <div className="">

                    <div className='flex mb-10 justify-center'>
                        {/* Thông tin sự kiện bên trái */}
                        <div className="col-span-1 rounded-lg rounded-r-[0px]
                    p-4 w-130 border-l-3 border-t-3 border-b-3 border-blue-900">
                            <h1 className="text-[17px] font-bold mb-10 mt-10">{event.title}</h1>
                            <div className="flex items-center mb-2">
                                <TiTime className='w-8 h-8 mr-1 text-yellow-800' />
                                <span>
                                    {event.sessions.length > 0
                                        ? `${new Date(event.sessions[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.sessions[0].end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${new Date(event.sessions[0].start_time).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`
                                        : ""}
                                </span>
                            </div>
                            <div className="mb-10 flex">
                                <TiLocation className='w-8 h-8 mr-2 text-red-800' />
                                {event.location
                                    ? [
                                        event.location.houseNumber,
                                        event.location.ward,
                                        event.location.district,
                                        event.location.province
                                    ].filter(Boolean).join(", ")
                                    : ""}
                            </div>

                            <div className='mt-20'>
                                <div className=" p-2 rounded-lg mb-2 text-sm font-semibold ">
                                    Giá vé từ {event.min_price.toLocaleString("vi-VN")}đ đến {event.max_price.toLocaleString("vi-VN")}đ
                                </div>
                                <button className="w-full bg-blue-700 text-white py-2 rounded-lg font-bold">Mua vé</button>
                            </div>
                        </div>


                        {/* Ảnh sự kiện bên phải */}
                        <div className="col-span-1 w-[60%]">
                            <img src={event.image} alt={event.title} className=" w-full h-full object-cover rounded-lg rounded-l-[0px] " />
                        </div>
                    </div>



                    <div className='flex'>
                        {/* Giới thiệu sự kiện */}
                        <div className="bg-white rounded-lg p-4 mr-10 min-h-[200px] w-240">
                            <h2 className="font-semibold mb-4 text-[20px]">Giới thiệu sự kiện</h2>
                            <div className="event-description" dangerouslySetInnerHTML={{ __html: event.description }} />
                        </div>


                        {/* Thông tin vé */}
                        <div className="col-span-1 bg-white rounded-lg p-4 w-100">
                            <h2 className="font-semibold mb-4 text-[20px]">Thông tin vé</h2>

                            {event.sessions.map((session, idx) => {
                                const isOpen = openSessions.includes(idx);
                                return (
                                    <div key={idx} className="mb-2">
                                        <div
                                            className="font-semibold text-[14px] mb-1 flex items-center cursor-pointer select-none"
                                            onClick={() => toggleSession(idx)}
                                        >
                                            {isOpen ? (
                                                <TiArrowSortedUp className='w-6 h-6' />
                                            ) : (
                                                <TiArrowSortedDown className='w-6 h-6' />
                                            )}
                                            <span className="ml-1">
                                                Xuất:                                                 {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {" - "}
                                                {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {" , "}
                                                {new Date(session.start_time).toLocaleDateString("vi-VN", {day: "numeric", month: "long", year: "numeric"})}
                                            </span>                                        </div>
                                        {isOpen && session.tickets.map((ticket, tIdx) => (
                                            <div key={tIdx} className="flex justify-between items-center bg-gray-100 rounded-[8px] my-2 p-2 text-[14px]">
                                                <span className='font-semibold'>{ticket.name}</span>
                                                <span>{ticket.price.toLocaleString("vi-VN")}.đ</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>



                {/* Sự kiện liên quan */}
                <div className="bg-white rounded p-4 mt-6">
                    <h2 className="font-semibold mb-2 text-base text-center text-[20px]">Sự kiện liên quan</h2>
                    {/* Có thể render thêm các sự kiện liên quan ở đây */}
                    <div className="h-96">

                    </div>
                </div>
            </div>
        </>
    );
}