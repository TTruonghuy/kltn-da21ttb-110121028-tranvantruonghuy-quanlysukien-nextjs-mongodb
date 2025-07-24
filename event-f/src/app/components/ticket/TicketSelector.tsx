import React, { useState } from "react";
import { TiChevronLeft } from "react-icons/ti";

interface TicketType {
    name: string;
    price: number;
}

interface TicketSelectorProps {
    tickets: TicketType[];
    onConfirm: (selected: { [name: string]: number }) => void;
    onBack: () => void;
}

export default function TicketSelector({ tickets, onConfirm, onBack }: TicketSelectorProps) {
    const [selected, setSelected] = useState<{ [name: string]: number }>({});

    const handleChange = (name: string, delta: number) => {
        setSelected(prev => ({
            ...prev,
            [name]: Math.max(0, (prev[name] || 0) + delta)
        }));
    };

    const total = tickets.reduce((sum, t) => sum + (selected[t.name] || 0) * t.price, 0);
    return (
        <div className="mt-10">
            <div className="flex items-center mb-6">
                <button
                    className="flex items-center gap-1 text-blue-800 font-bold text-sm px-2 py-1 rounded hover:bg-blue-50"
                    onClick={onBack}
                >
                    <TiChevronLeft className="w-5 h-5" />
                    Trở về
                </button>
                <h2 className="flex-1 text-xl font-bold text-center text-blue-800">Chọn vé</h2>
            </div>
            <div className="mb-6 px-60">
                {tickets.map(ticket => (
                    <div key={ticket.name} className="flex items-center justify-between py-2 border-b border-gray-300">
                        <div>
                            <span className="font-semibold text-green-700 text-[15px]">{ticket.name}</span>
                            <div className="text-gray-600 text-[13px]">{ticket.price.toLocaleString("vi-VN")} đ</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="w-7 h-7 rounded bg-white text-[15px] font-bold flex items-center justify-center"
                                onClick={() => handleChange(ticket.name, -1)}
                                disabled={(selected[ticket.name] || 0) === 0}
                            >-</button>
                            <span className="w-7 text-center font-bold text-[15px]">{selected[ticket.name] || 0}</span>
                            <button
                                className="w-7 h-7 rounded bg-blue-950 text-white text-[15px] font-bold flex items-center justify-center"
                                onClick={() => handleChange(ticket.name, 1)}
                            >+</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center mb-4 px-60 ">
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-[15px]">Tổng tiền:</span>
                    <span className="font-bold text-green-700 text-[16px]">{total.toLocaleString("vi-VN")} đ</span>
                </div>
                <button className=" px-6 bg-green-600 text-white py-2 rounded font-bold text-[15px]" onClick={() => onConfirm(selected)} disabled={total === 0}>Thanh toán</button>

            </div>
        </div>
    );
}