import React, { useState } from "react";
import { TiChevronLeft } from "react-icons/ti";
import Payment from "../payment/Payment";
import { useEffect } from "react";

interface TicketType {
    _id?: string;
    session_id: string;
    name: string;
    price: number;
    description?: string;
    min_per_order?: number;
    max_per_order?: number;
}

interface TicketSelectorProps {
    tickets: TicketType[];
    eventTitle: string;
    session: {
        id?: string;
        start_time: string;
        end_time: string;
    };
    location?: {
        houseNumber?: string;
        ward?: string;
        district?: string;
        province?: string;
    };
    email?: string;
    user_id?: string;
    onConfirm: (selected: { [name: string]: number }) => void;
    onBack: () => void;
}

export default function TicketSelector({ tickets, eventTitle, session, location, email, user_id, onConfirm, onBack }: TicketSelectorProps) {
    const [selected, setSelected] = useState<{ [name: string]: number }>({});
    const [showPayment, setShowPayment] = useState(false);

    const handleChange = (name: string, delta: number, min = 1, max = 10) => {
        setSelected(prev => {
            const current = prev[name] || 0;
            let next = current + delta;

            // Nếu đang ở min_per_order và bấm trừ thì về 0
            if (delta < 0 && current === min) {
                next = 0;
            } else if (delta > 0 && current === 0) {
                next = min; // Nếu tăng từ 0, set về min_per_order
            }

            if (next > max) next = max;
            if (next < 0) next = 0;
            return { ...prev, [name]: next };
        });
    };

    const total = tickets.reduce((sum, t) => sum + (selected[t.name] || 0) * t.price, 0);

    const totalQuantity = tickets.reduce((sum, t) => sum + (selected[t.name] || 0), 0);

    if (showPayment) {
        const selectedTickets = tickets
            .filter(t => (selected[t.name] || 0) > 0)
            .map(t => ({ 
                _id: t._id,
                session_id: t.session_id, 
                name: t.name,
                price: t.price,
                quantity: selected[t.name],
                total: selected[t.name] * t.price
            }));

        return (
            <Payment
                email={email!}
                tickets={selectedTickets}
                total={total}
                user_id={user_id}
                onBack={() => setShowPayment(false)}
            />
        );
    }

    return (
        <div className="mt-2 flex flex-col-2">
            <div className="w-[70%]">
                <button
                    className="mb-4 flex items-center gap-1 text-blue-950 font-bold text-sm px-2 py-1 rounded hover:bg-blue-50"
                    onClick={onBack}
                >
                    <TiChevronLeft className="w-5 h-5" />
                    Trở về
                </button>


                <div className="bg-white rounded-lg pb-6 min-h-[440px]">

                    <div className=" rounded-t-lg mb-2 py-2 border-b w-full">
                        <h2 className="flex-1 text-xl font-bold text-center ">Chọn vé</h2>
                    </div>

                    {tickets.map(ticket => (
                        <div key={ticket.name} className=" items-center justify-between py-2 border-gray-300 px-20 ">

                            <div className=" items-center gap-2 border-b mt-2 pb-2 w-full">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-green-700 text-[15px]">{ticket.name}</span>
                                    <div className="text-gray-600 text-[13px] ">{ticket.price.toLocaleString("vi-VN")} đ</div>
                                    <div className="flex gap-2 ml-auto  ">
                                        <button
                                            className="w-7 h-7 rounded bg-gray-200 text-[15px] font-bold flex items-center justify-center"
                                            onClick={() => handleChange(ticket.name, -1, ticket.min_per_order || 1, ticket.max_per_order || 10)}
                                            disabled={(selected[ticket.name] || 0) === 0}
                                        >-</button>
                                        <span className="w-7 text-center font-bold text-[15px]">{selected[ticket.name] || 0}</span>

                                        <button
                                            className="w-7 h-7 rounded bg-blue-950 text-white text-[15px] font-bold flex items-center justify-center"
                                            onClick={() => handleChange(ticket.name, 1, ticket.min_per_order || 1, ticket.max_per_order || 10)}
                                            disabled={(selected[ticket.name] || 0) >= (ticket.max_per_order || 10)}
                                        >+</button>
                                    </div>
                                </div>

                                {ticket.description && (
                                    <div className="text-gray-600 text-xs my-1 rounded-md px-2 py-2 bg-gray-50 mt-2">{ticket.description}</div>
                                )}

                            </div>


                        </div>

                    ))}
                </div>
            </div>
            <div className="flex flex-col mb-4 bg-white ml-6 rounded-lg w-88 right-4 h-121">
                <div className=" rounded-t-lg mb-2 py-2 border-b w-full">
                    <h2 className="flex-1 font-bold px-4">{/* Tiêu đề sự kiện */}{eventTitle} </h2>
                </div>
                <div className="px-8 ">
                    <div className=" items-center my-2">
                        <span className="font-semibold text-[15px]">Thời gian: </span>
                        <div className="text-gray-600 text-[14px]">
                            {session && (
                                <>
                                    {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {" - "}
                                    {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {", "}
                                    {new Date(session.start_time).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
                                </>
                            )}
                        </div>
                    </div>

                    <div className=" items-center mb-20 text-[15px]">
                        <span className="font-bold">Địa điểm: </span>
                        <div className="text-gray-600 text-[14px]">
                            {location
                                ? [
                                    location.houseNumber,
                                    location.ward,
                                    location.district,
                                    location.province
                                ].filter(Boolean).join(", ")
                                : ""}
                        </div>
                    </div>
                </div>

                <div className="mt-auto mb-6 ml-8">
                    <div className="flex items-center gap-1 ">
                        <span className="font-semibold text-[15px]">Tổng tiền:</span>
                        <span className="font-bold text-green-700 text-[16px]">{total.toLocaleString("vi-VN")} đ</span>
                    </div>
                    <button
                        className={`mt-2 font-bold py-1 px-24 rounded-lg ${totalQuantity === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-400 text-white"
                            }`}
                        onClick={() => setShowPayment(true)}
                        disabled={totalQuantity === 0}
                    >
                        Thanh toán
                    </button>
                </div>
            </div>
        </div>
    );
}