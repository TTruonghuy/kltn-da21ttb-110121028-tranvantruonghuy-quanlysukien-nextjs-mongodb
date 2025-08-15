"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from "react";
//import axios from "axios";
import Header from "@/app/components/Header";
import TicketSelector from '@/app/components/ticket/TicketSelector';
import { TiLocation, TiTime, TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import { Button } from '@/app/components/ui/button';
import axios from "@/lib/axiosInstance";
import Allevent from "@/app/components/event/AllEvent"; // Đã có sẵn component này
import Filler from "@/app/components/Filler";


interface Ticket {
    id: string;
    _id?: string;
    session_id: string;
    name: string;
    price: number;
    description?: string;
    ticket_quantity?: number;
    sold_quantity?: number;
    min_per_order?: number;
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

interface Session {
    id: string;
    _id?: string;
    start_time: string;
    end_time: string;
    tickets: Ticket[];
}

interface EventDetail {
    id: string;
    title: string;
    description: string;
    image: string;
    event_type: string;
    location?: {
        houseNumber?: string;
        ward?: string;
        district?: string;
        province?: string;
    };
    sessions: Session[];
    min_price: number;
    max_price: number;
    organizer?: Organizer;
}

export default function Event() {
    const { id } = useParams();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [showSelector, setShowSelector] = useState(false);
    const [openSessions, setOpenSessions] = useState<number[]>([0]);
    const ticketInfoRef = useRef<HTMLDivElement>(null);
    const [selectedSessionIdx, setSelectedSessionIdx] = useState<number | null>(null);

    //const handleLogout = () => { };
    const handleShowAuth = () => { };

    const [user, setUser] = useState<{ _id?: string; email: string; name: string; avatar?: string; role?: string } | null>(null);
    const [showAuth, setShowAuth] = useState(false);

    useEffect(() => {
        axios
            .get("http://localhost:5000/auth/me", { withCredentials: true })
            .then((res) => {
                if (res.data && res.data.user) {
                    setUser(res.data.user);
                } else {
                    setUser(null);
                }
            })
            .catch(() => setUser(null));
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:5000/auth/logout", {}, { withCredentials: true });
            setUser(null);
            window.location.reload();
        } catch (err) {
            // handle error
        }
    };


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

    const allSessionsSoldOut = event.sessions.every(
        session => session.tickets.every(
            t => {
                const remain = (t.ticket_quantity ?? 0) - (t.sold_quantity ?? 0);
                const minOrder = t.min_per_order ?? 1;
                return remain < minOrder;
            }
        )
    );


    const sessions = event.sessions.map(s => ({
        ...s,
        id: s._id,
        tickets: s.tickets.map(t => ({
            ...t,
            id: t._id ? String(t._id) : `${s._id ? String(s._id) : 'unknown'}-${t.name}`,
            session_id: s._id ? String(s._id) : 'unknown',
        })),
    }));

    return (
        <>
            <div className='bg-blue-100'>
                <Header user={user} onLogout={handleLogout} onShowAuth={handleShowAuth} />
                      <Filler />
                <div className="bg-blue-100 min-h-screen p-6 pt-0">
                    <div className="">
                        {/* Nếu đang chọn vé thì hiển thị TicketSelector */}
                        {showSelector && selectedSessionIdx !== null ? (
                            <TicketSelector
                                eventTitle={event.title}
                                tickets={sessions[selectedSessionIdx]?.tickets || []}
                                session={sessions[selectedSessionIdx]}
                                location={event.location}
                                email={user?.email}
                                user_id={user?._id}
                                onConfirm={selected => { setShowSelector(false); }}
                                onBack={() => setShowSelector(false)}
                            />
                        ) : (
                            <>
                                <div className='flex mb-5 justify-center h-[410px]'>
                                    {/* Thông tin sự kiện bên trái */}
                                    <div className="col-span-1 rounded-lg rounded-r-[0px]
                                    p-4 w-[40%] bg-white h-full flex flex-col justify-between">
                                        {/* Tiêu đề */}
                                        <h1 className="text-[17px] font-bold mb-4 mt-4">{event.title}</h1>
                                        {/*Ảnh Tên ban tổ chức */}

                                        {event.organizer && (
                                            <div className="flex items-center mb-2">
                                                <p className='font-semibold mr-2'>Ban tổ chức:</p>
                                                <div className="flex items-center">
                                                    {/*  <img src={event.organizer.logo || "/avatar.jpg"} alt={event.organizer.name} className=" max-w-[40px] max-h-[40px] object-cover mr-2" />*/}
                                                    <span className="font-semibold text-gray-700 text-[14px]">{event.organizer.name}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center mb-2 ">

                                            <div className='text-gray-700 text-[15px]'>
                                                <div className='flex'>
                                                    <p className='font-semibold text-black mr-2'>Thời gian:</p>
                                                    {event.sessions.length > 0
                                                        ? `${new Date(event.sessions[0].start_time).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })} - ${new Date(event.sessions[0].end_time).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}, ${new Date(event.sessions[0].start_time).toLocaleDateString(
                                                            'vi-VN',
                                                            { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
                                                        )}`
                                                        : ''}
                                                </div>

                                                {event.sessions.length > 1 && (
                                                    <div className='ml-20'>+ {event.sessions.length - 1} ngày khác</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex">
                                            <p className='font-semibold mr-2 whitespace-nowrap'>Địa điểm:</p>
                                            <span className='text-gray-700 text-[15px]'>
                                                {event.location
                                                    ? [
                                                        event.location.houseNumber,
                                                        event.location.ward,
                                                        event.location.district,
                                                        event.location.province
                                                    ].filter(Boolean).join(", ")
                                                    : ""}
                                            </span>
                                        </div>
                                        <div className='mt-auto'>
                                            <div className=" p-2 rounded-lg mb-2 text-sm font-semibold ">
                                                Giá vé từ {event.min_price.toLocaleString("vi-VN")}đ đến {event.max_price.toLocaleString("vi-VN")}đ
                                            </div>
                                            <Button
                                                className={`w-full py-2 rounded-lg font-bold ${allSessionsSoldOut ? "bg-gray-400 text-red-600 cursor-not-allowed" : "bg-blue-950 text-white hover:bg-blue-800"}`}
                                                disabled={allSessionsSoldOut}
                                                onClick={() => {
                                                    if (!allSessionsSoldOut) {
                                                        ticketInfoRef.current?.scrollIntoView({ behavior: "smooth" });
                                                    }
                                                }}
                                            >
                                                {allSessionsSoldOut ? "Hết vé" : "Chọn vé"}
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Ảnh sự kiện bên phải */}
                                    <div className="col-span-1 w-[60%]">
                                        <img src={event.image} alt={event.title} className=" w-full h-full object-cover rounded-lg rounded-l-[0px] " />
                                    </div>
                                </div>
                                <div className=''>
                                    {/* Giới thiệu sự kiện */}
                                    <div className="bg-white rounded-lg p-4 mr-5 min-h-[200px] w-305">
                                        <h2 className="font-semibold mb-4 text-[20px] border-b pb-1">Giới thiệu sự kiện</h2>
                                        <div className="event-description pt-4" dangerouslySetInnerHTML={{ __html: event.description }} />
                                        {/* cần thêm một ô hiển thị ảnh, tên, giới thiệu của ban tổ chức của sự kiện này*/}
                                    </div>


                                    {/* Thông tin vé */}
                                    <div ref={ticketInfoRef} className="col-span-1 bg-white rounded-lg p-4 w-305 mt-5 ">
                                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                                            <h2 className="font-semibold text-[20px]  ">Thông tin vé</h2>
                                        </div>

                                        {event.sessions.map((session, idx) => {
                                            const isOpen = openSessions.includes(idx);
                                            const allTicketsSoldOut = session.tickets.every(
                                                t => {
                                                    const remain = (t.ticket_quantity ?? 0) - (t.sold_quantity ?? 0);
                                                    const minOrder = t.min_per_order ?? 1;
                                                    return remain < minOrder;
                                                }
                                            );
                                            return (
                                                <div key={idx} className="mb-6">
                                                    <div className='flex flex items-center justify-between w-full'>
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

                                                        <Button
                                                            className={`px-10 py-2 rounded-lg font-bold ${allTicketsSoldOut ? "bg-gray-400 text-red-600 cursor-not-allowed" : "bg-blue-950 text-white hover:bg-blue-800"}`}
                                                            disabled={allTicketsSoldOut}
                                                            onClick={() => {
                                                                setSelectedSessionIdx(idx);
                                                                setShowSelector(true);
                                                                setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
                                                            }}
                                                        >
                                                            {allTicketsSoldOut ? "Hết vé" : "Mua vé"}
                                                        </Button>
                                                    </div>


                                                    {isOpen && session.tickets.map((ticket, tIdx) => {
                                                        const remain = (ticket.ticket_quantity ?? 0) - (ticket.sold_quantity ?? 0);
                                                        const minOrder = ticket.min_per_order ?? 1;
                                                        const isSoldOut = remain < minOrder;
                                                        return (
                                                            <div key={tIdx} className="bg-gray-100 rounded-[8px] my-2 p-2 text-[14px] relative">
                                                                <div className="flex justify-between items-center">
                                                                    <span className='font-semibold'>{ticket.name}</span>
                                                                    <span>{ticket.price.toLocaleString("vi-VN")}.đ</span>
                                                                </div>
                                                                {ticket.description && (
                                                                    <div className="text-gray-600 text-xs mt-1">{ticket.description}</div>
                                                                )}
                                                                {isSoldOut && (
                                                                    <div className="absolute inset-0 bg-gray-300/70 bg-opacity-70 flex items-center justify-center rounded-[8px]">
                                                                        <span className="text-red-600 ">Hết vé</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {event.organizer && (
                                        <div className="bg-white rounded-lg p-4 w-305 mt-5">
                                            <div className="flex items-center mr-4 mb-2">
                                                <img src={event.organizer.logo} alt={event.organizer.name} className="max-w-[80px] max-h-[80px] object-cover mr-4" />
                                                <div className="font-semibold text-lg">{event.organizer.name}</div>
                                            </div>
                                            <div className="flex mb-2">
                                                <span className='whitespace-nowrap mr-2' >Giới thiệu: </span>
                                                <div className="text-gray-600">{event.organizer.description}</div>
                                            </div>

                                            <div className="flex mb-2">
                                                <span className='whitespace-nowrap mr-6' >Địa chỉ: </span>
                                                <div className="text-gray-600">{event.organizer.address}</div>
                                            </div>

                                            <div className="flex mb-2">
                                                <span className='whitespace-nowrap mr-2' >Webstite: </span>
                                                <div className="text-gray-600">{event.organizer.weblink}</div>
                                                <span className='whitespace-nowrap mr-2 ml-20' >Số điện thoại: </span>
                                                <div className="text-gray-600">{event.organizer.phone}</div>
                                            </div>
                                        </div>
                                    )}


                                </div>
                                {/* Sự kiện liên quan */}
                                <div className="bg-white rounded-lg p-4 px-2 mt-6">
                                    <h2 className="font-semibold mb-2 text-base text-center text-[20px]">Sự kiện liên quan</h2>
                                     <Allevent eventType={event.event_type} excludeId={event.id} />
                                    
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}