"use client";
import { useState, useEffect } from "react";
import CreateEventForm from "./CreateEventForm";
import CreateTicketForm from "./CreateTicketForm";
import Header from "@/app/components/Header";
import axios from "@/lib/axiosInstance";

export default function EventManagementPage() {
    const [activeTab, setActiveTab] = useState("create-event"); // Tab mặc định là "Tạo sự kiện"
    const [user, setUser] = useState<{ email: string; name: string; avatar?: string; role?: string } | null>(null);

    // Shared state object for both forms
    const [formData, setFormData] = useState({
        eventName: "",
        address: "",
        ticketName: "", // Ensure ticketName is initialized
        ticketPrice: 0, // Ensure ticketPrice is initialized
    });

    // State để lưu dữ liệu sự kiện
    const [eventData, setEventData] = useState({
        title: "",
        description: "",
        location: "",
        start_time: "",
        end_time: "",
        image: null as File | null,
    });

    // State để lưu dữ liệu vé
    const [ticketData, setTicketData] = useState({
        ticketName: "",
        ticketPrice: 0,
        ticketQuantity: 0,
        minPerOrder: 1,
        maxPerOrder: 5,
        saleStartTime: "",
        saleEndTime: "",
    });

    // Callback để cập nhật dữ liệu sự kiện
    const handleEventDataChange = (data: Partial<typeof eventData>) => {
        setEventData((prev) => ({ ...prev, ...data }));
    };

    // Callback để cập nhật dữ liệu vé
    const handleTicketDataChange = (data: Partial<typeof ticketData>) => {
        setTicketData((prev) => ({ ...prev, ...data }));
    };

    // Gửi toàn bộ dữ liệu lên backend khi nhấn "Hoàn tất"
    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            Object.entries(eventData).forEach(([key, value]) => {
                if (value) formData.append(key, value as string | Blob);
            });

            const eventResponse = await axios.post("/event/create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const eventId = eventResponse.data.id;

            const ticketPayload = {
                ...ticketData,
                event_id: eventId,
            };

            await axios.post("/ticket/create", ticketPayload, {
                withCredentials: true,
            });

            alert("Sự kiện và vé đã được tạo thành công!");
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    // Fetch user data on mount
    useEffect(() => {
        axios
            .get("http://localhost:5000/auth/me", { withCredentials: true })
            .then((res) => {
                if (res.data && res.data.user) {
                    setUser(res.data.user);
                } else {
                    console.error("Invalid user data:");
                    setUser(null);
                }
            })
            .catch((err) => {
                console.error("Error fetching user data:", err);
                setUser(null);
            });
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header
                user={user}
                onLogout={() => {
                    axios.post("http://localhost:5000/auth/logout", {}, { withCredentials: true }).then(() => {
                        setUser(null);
                        window.location.href = "/";
                    });
                }}
                onShowAuth={() => console.log("Show Auth")}
            />
            <div className="flex flex-grow">
                <nav className="w-64 h-[510px] bg-blue-200 flex flex-col p-4 rounded-lg m-5 fixed top-25">
                    <button
                        onClick={() => setActiveTab("create-event")}
                        className={`py-2 px-4 mb-2 text-left rounded ${
                            activeTab === "create-event" ? "bg-blue-400 text-white" : "hover:bg-blue-400"
                        }`}
                    >
                        Tạo sự kiện
                    </button>
                </nav>
                <main className="flex-grow p-14 pt-4 bg-blue-100 rounded-lg mt-30 mr-5 mb-5 ml-[300px]">
                    {activeTab === "create-event" && (
                        <CreateEventForm
                            initialData={eventData}
                            onEventDataChange={handleEventDataChange}
                            onNext={() => setActiveTab("create-ticket")}
                        />
                    )}
                    {activeTab === "create-ticket" && (
                        <CreateTicketForm
                            formData={formData}
                            setFormData={setFormData}
                            initialData={ticketData}
                            onTicketDataChange={handleTicketDataChange}
                            onBack={() => setActiveTab("create-event")}
                            onSubmit={handleSubmit}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
