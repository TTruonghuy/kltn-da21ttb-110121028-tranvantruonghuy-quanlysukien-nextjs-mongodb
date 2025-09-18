import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { TiChevronRight } from "react-icons/ti";


interface Event {
    id: string;
    title: string;
    description: string;
    eventType: string;
    image: string;
    min_price: number;
    max_price: number;
    min_start_time: string;
}

interface EventListProps {
    filterType: string; // Định nghĩa kiểu dữ liệu cho filterType
}

const EventList: React.FC<EventListProps> = ({ filterType }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/event/list`, {
                    params: { event_type: filterType },
                });
                setEvents(response.data.map((e: any) => ({
                    ...e,
                    id: e.id || e._id,
                })));
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, [filterType]);

    return (
        <div className=" p-4 bg-white rounded-lg h-full m-2 ">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-blue-950">
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </h2>
                <button className="text-gray-500 text-sm flex hover:scale-102"
                    onClick={() => router.push(`/allevent?type=${encodeURIComponent(filterType)}`)}>
                    Xem tất cả <TiChevronRight className="w-5 h-5 ml-1" />
                </button>
            </div>
            <div className="grid grid-cols-4 gap-5 ">
                {events.slice(0, 4).map((event) => (
                    <div key={event.id}
                        className="bg-blue-50 rounded cursor-pointer hover:opacity-90 hover:bg-blue-20 flex flex-col justify-between"
                        onClick={() => {
                            console.log("Clicked event:", event); // Log event khi click
                            router.push(`/event/${event.id}`);
                        }}>
                        <div>
                            <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-45 object-cover rounded mb-4 border-2 border-blue-50 "
                            />
                            <h3
                                className="text-[14px] font-semibold text-left m-2 line-clamp-2"
                                style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {event.title}
                            </h3>
                        </div>
                        <div>
                            {/* giá vé nhỏ nhât - giá vé cao nhất (100.000đ - 550.000đ) */}
                            <p className="text-left mb-1 m-2 text-green-900 font-semibold text-[14px]">
                                {event.min_price.toLocaleString("vi-VN")}đ
                                {event.min_price !== event.max_price && ` - ${event.max_price.toLocaleString("vi-VN")}đ`}
                            </p>

                            {/* ngày bắt đầu sớm nhất của session */}
                            <p className="text-gray-500 text-left mx-2 mb-2">
                                {event.min_start_time ?
                                    new Date(event.min_start_time).toLocaleDateString("vi-VN", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })
                                    : "Chưa có thời gian"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventList;