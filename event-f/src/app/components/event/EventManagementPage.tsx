"use client";
import { useState, useEffect } from "react";
import CreateEventForm from "./CreateEventForm";
import CreateTicketForm from "./CreateTicketForm";
import Header from "@/app/components/Header";
import axios from "@/lib/axiosInstance";

export default function EventManagementPage() {
    const [activeTab, setActiveTab] = useState("create-event"); // Tab mặc định là "Tạo sự kiện"
    const [user, setUser] = useState<{
        email: string;
        name: string;
        avatar?: string;
        role?: string
    } | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        houseNumber: "", // Số nhà
        ward: "", // Phường/Xã
        district: "", // Quận/Huyện
        location: "", // Địa điểm
        province: "",
        start_time: "",
        end_time: "",
        image: null as File | null,
        event_type: "",

        ticketName: "",
        ticketPrice: 0,
        ticketQuantity: 0,
        minPerOrder: 1,
        maxPerOrder: 5,
        saleStartTime: "",
        saleEndTime: "",
        description_ticket: "", // Thêm trường mô tả
        image_ticket: null as File | null, // Thêm trường ảnh
        
        noSale: false, // Thêm trường không bán vé
    });

    // Hàm cập nhật dữ liệu form
    const handleFormDataChange = (data: Partial<typeof formData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
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
            <div className="flex flex-grow bg-blue-200">
                <nav className="w-64 h-[510px] bg-white flex flex-col p-4 rounded-lg m-5 fixed top-25">
                    <button
                        onClick={() => setActiveTab("create-event")}
                        className={`py-2 px-4 mb-2 text-left rounded ${activeTab === "create-event" ? "bg-blue-400 text-white" : "hover:bg-blue-400"
                            }`}
                    >
                        Tạo sự kiện
                    </button>
                </nav>
                <main className="flex-grow p-14 pt-4 bg-white rounded-lg mt-30 mr-5 mb-5 ml-[300px]">
                    {activeTab === "create-event" && (
                      <CreateEventForm
                      formData={formData}
                      onFormDataChange={handleFormDataChange}
                      onNext={() => setActiveTab("create-ticket")}
                  />
                    )}
                    {activeTab === "create-ticket" && (
                        <CreateTicketForm
                            formData={formData}
                            onFormDataChange={handleFormDataChange}
                            onBack={() => setActiveTab("create-event")}
                            onSubmit={() => {
                                if (formData.noSale) {
                                    // Nếu không mở bán vé, chỉ tạo sự kiện
                                    console.log("Chỉ tạo sự kiện, không tạo vé");
                                    // Gọi API tạo sự kiện tại đây
                                } else {
                                    console.log("Tạo vé và sự kiện");
                                    // Gọi API tạo vé tại đây
                                }
                            }}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
