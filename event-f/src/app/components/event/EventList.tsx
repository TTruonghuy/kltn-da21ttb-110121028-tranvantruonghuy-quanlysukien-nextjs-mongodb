import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Event {
    id: string;
    title: string;
    description: string;
    eventType: string;
    start_time: string;
    end_time: string;
    image: string;
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
        <div className=" ml-2 mr-2 p-4 bg-white rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{filterType}</h2>
                <a href="#" className="text-blue-500 text-sm font-semibold">
                    Xem tất cả &gt;
                </a>
            </div>
            <div className="grid grid-cols-4 gap-5 ">
                {events.map((event) => (
                    <div key={event.id}
                        className=" rounded cursor-pointer hover:opacity-90 hover:bg-gray-100"
                        onClick={() => {
                            console.log("Clicked event:", event); // Log event khi click
                            router.push(`/event/${event.id}`);
                        }}>
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-45 object-cover rounded mb-4"
                        />
                        <h3 className="text-[15px] font-semibold text-left m-2">{event.title}</h3>
                        <p className="text-gray-500 text-left m-2">
                            {new Date(event.start_time).toLocaleDateString("vi-VN", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventList;