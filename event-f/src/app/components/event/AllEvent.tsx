import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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

interface AlleventProps {
    eventType: string;
    excludeId?: string; // thêm optional prop
}

const Allevent: React.FC<AlleventProps> = ({ eventType, excludeId }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/event/list`, {
                    params: { event_type: eventType },
                });

                const filteredEvents = response.data
                    .map((e: any) => ({
                        ...e,
                        id: e.id || e._id,
                    }))
                    .filter((e: Event) => e.id !== excludeId); // loại bỏ sự kiện hiện tại

                setEvents(filteredEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, [eventType, excludeId]);

    return (      
        <div className="p-4 bg-white rounded-lg w-full">
            <div className="grid grid-cols-4 gap-5 ">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="flex flex-col justify-between bg-blue-50 rounded cursor-pointer hover:opacity-90 hover:bg-blue-20"
                        onClick={() => router.push(`/event/${event.id}`)}
                    >
                        <div>
                            <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-45 object-cover rounded mb-4 border-2 border-blue-50"
                            />
                            <h3
                                className="text-[14px] font-semibold text-left m-2 mb-1  line-clamp-2"
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
                            <p className="text-left mb-1 m-2 text-green-900 font-semibold text-[14px]">
                                {event.min_price.toLocaleString("vi-VN")}đ
                                {event.min_price !== event.max_price && ` - ${event.max_price.toLocaleString("vi-VN")}đ`}
                            </p>
                            <p className="text-gray-500 text-left m-2 mt-0">
                                {event.min_start_time
                                    ? new Date(event.min_start_time).toLocaleDateString("vi-VN", {
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

export default Allevent;
