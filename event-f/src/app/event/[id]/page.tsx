"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/app/components/Header";

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
    location: string;
    sessions: Session[];
    min_price: number;
    max_price: number;
}

export default function Event() {
    const { id } = useParams();
    const [event, setEvent] = useState<EventDetail | null>(null);

    const user = null;
    const handleLogout = () => { };
    const handleShowAuth = () => { };

    useEffect(() => {
        axios.get(`http://localhost:5000/event/${id}`).then(res => setEvent(res.data));
    }, [id]);

    if (!event) return <div>Đang tải...</div>;

    return (
        <>
            <Header user={user} onLogout={handleLogout} onShowAuth={handleShowAuth} />
            <div className="bg-blue-100 min-h-screen p-6 pt-30">
                <div className="">

                    <div className='flex mb-10'>
                        {/* Thông tin sự kiện bên trái */}
                        <div className="col-span-1 rounded-lg rounded-r-[0px]
                    p-4 w-110 border-l-3 border-t-3 border-b-3 border-blue-900">
                            <h1 className="text-base font-bold mb-10">{event.title}</h1>
                            <div className="flex items-center mb-2 text-xs">
                                <span className="mr-2">🕒</span>
                                <span>
                                    {event.sessions.length > 0
                                        ? `${new Date(event.sessions[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.sessions[0].end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${new Date(event.sessions[0].start_time).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`
                                        : ""}
                                </span>
                            </div>
                            <div className="mb-10 text-xs ">
                                <span className="mr-2">📍</span>
                                {event.location}
                            </div>
                            <div className="bg-blue-50 p-2 rounded mb-2 text-sm font-semibold">
                                Giá vé từ {event.min_price.toLocaleString("vi-VN")}đ đến {event.max_price.toLocaleString("vi-VN")}đ
                            </div>
                            <button className="w-full bg-blue-700 text-white py-2 rounded font-bold">Mua vé</button>
                        </div>


                        {/* Ảnh sự kiện bên phải */}
                        <div className="col-span-1 w-215 h-75">
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
                            {event.sessions.map((session, idx) => (
                                <div key={idx} className="mb-2">
                                    <div className="font-semibold text-xs mb-1">
                                        ▼ Xuất: {new Date(session.start_time).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
                                    </div>
                                    {session.tickets.map((ticket, tIdx) => (
                                        <div key={tIdx} className="flex justify-between items-center border-b py-1 text-xs">
                                            <span>{ticket.name}</span>
                                            <span>{ticket.price.toLocaleString("vi-VN")}.đ</span>
                                            <button className="bg-blue-700 text-white px-2 py-1 rounded text-xs">Đặt vé</button>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>



                {/* Sự kiện liên quan */}
                <div className="bg-white rounded p-4 mt-6">
                    <h2 className="font-semibold mb-2 text-base text-center">Sự kiện liên quan</h2>
                    {/* Có thể render thêm các sự kiện liên quan ở đây */}
                </div>
            </div>
        </>
    );
}