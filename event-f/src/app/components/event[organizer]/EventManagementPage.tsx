"use client";
import { useState, useEffect } from "react";
import CreateEventForm from "./CreateEventForm";
import CreateTicketForm from "../ticket/CreateTicketForm";
import Header from "@/app/components/Header";
import axios from "@/lib/axiosInstance";
import { EventFormData } from "@/app/components/types";
import OrganizerEventList from "./OrganizerEventList";
import EventDetailModal from "./EventDetailModal";

export default function EventManagementPage() {
    const [activeTab, setActiveTab] = useState("create-event"); // Tab mặc định là "Tạo sự kiện"
    const [mainTab, setMainTab] = useState("event"); // "event"
    const [subTab, setSubTab] = useState("create"); // "create" | "saved" | "deleted"
    const [showCreateSubNav, setShowCreateSubNav] = useState(false);
    const [showManageSubNav, setShowManageSubNav] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [showCreateTicketForm, setShowCreateTicketForm] = useState(false);


    const [user, setUser] = useState<{
        email: string;
        name: string;
        avatar?: string;
        role?: string
    } | null>(null);

    const [formData, setFormData] = useState<EventFormData>({
        title: "",
        description: "",
        houseNumber: "",
        ward: "",
        district: "",
        province: "",
        location: {
            houseNumber: "",
            ward: "",
            district: "",
            province: "",
        },
        image: null as File | null,
        event_type: "",
        noSale: false, // Thêm trường không bán vé
        sessions: [],
    });

    const handleFormDataChange = (
        data: Partial<EventFormData> | ((prev: EventFormData) => EventFormData)
    ) => {
        setFormData(prev => {
            if (typeof data === "function") {
                return data(prev); // Nếu data là hàm callback
            } else {
                return { ...prev, ...data }; // Nếu data là object
            }
        });
    };


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




            <div className="flex flex-grow bg-blue-200 h-full w-full">
                <nav className="w-64 bg-white flex flex-col p-4 rounded-lg m-5 fixed top-25 h-128">
                    {/* Nav cha */}
                    <button
                        onClick={() => {
                            setMainTab("create");
                            setShowCreateSubNav(!showCreateSubNav);
                            setShowManageSubNav(false);
                        }}
                        className={`py-2 px-4 mb-2 text-left rounded-lg font-bold ${mainTab === "create" ? "bg-blue-100" : "bg-white"} hover:bg-blue-200`}
                    >
                        Tạo sự kiện
                    </button>
                    {showCreateSubNav && mainTab === "create" && (
                        <div className="ml-2 flex flex-col">
                            <button
                                onClick={() => setSubTab("create")}
                                className={`py-2 px-4 mb-2 text-left rounded-lg ${subTab === "create" ? "bg-blue-400 text-white" : "hover:bg-gray-100"}`}
                            >
                                Tạo sự kiện
                            </button>
                            <button
                                onClick={() => setSubTab("saved")}
                                className={`py-2 px-4 mb-2 text-left rounded-lg ${subTab === "saved" ? "bg-blue-400 text-white" : "hover:bg-gray-100"}`}
                            >
                                Sự kiện đã lưu
                            </button>
                            <button
                                onClick={() => setSubTab("deleted")}
                                className={`py-2 px-4 mb-2 text-left rounded-lg ${subTab === "deleted" ? "bg-blue-400 text-white" : "hover:bg-gray-100"}`}
                            >
                                Sự kiện đã xoá
                            </button>
                        </div>
                    )}

                    {/* Nav cha: Quản lý sự kiện */}
                    <button
                        onClick={() => {
                            setMainTab("manage");
                            setShowManageSubNav(!showManageSubNav);
                            setShowCreateSubNav(false);
                        }}
                        className={`py-2 px-4 mb-2 text-left rounded-lg font-bold ${mainTab === "manage" ? "bg-blue-100" : "bg-white"} hover:bg-blue-200`}
                    >
                        Quản lý sự kiện
                    </button>
                    {showManageSubNav && mainTab === "manage" && (
                        <div className="ml-2 flex flex-col">
                            <button
                                onClick={() => setSubTab("upcoming")}
                                className={`py-2 px-4 mb-2 text-left rounded-lg ${subTab === "upcoming" ? "bg-blue-400 text-white" : "hover:bg-gray-100"}`}
                            >
                                Chưa diễn ra
                            </button>
                            <button
                                onClick={() => setSubTab("ongoing")}
                                className={`py-2 px-4 mb-2 text-left rounded-lg ${subTab === "ongoing" ? "bg-blue-400 text-white" : "hover:bg-gray-100"}`}
                            >
                                Đang diễn ra
                            </button>
                            <button
                                onClick={() => setSubTab("past")}
                                className={`py-2 px-4 mb-2 text-left rounded-lg ${subTab === "past" ? "bg-blue-400 text-white" : "hover:bg-gray-100"}`}
                            >
                                Đã qua
                            </button>
                        </div>
                    )}
                </nav>

                <main className="flex-grow p-10 pt-4 bg-white rounded-lg mt-30 mr-5 mb-5 ml-[300px]">
                    {subTab === "create" && (
                        showCreateTicketForm ? (
                            <CreateTicketForm
                                formData={formData}
                                onFormDataChange={handleFormDataChange}
                                onBack={() => setShowCreateTicketForm(false)}
                                onSubmit={() => {
                                    setShowCreateTicketForm(false);
                                    setSubTab("saved");
                                }}
                            />
                        ) : (
                            <CreateEventForm
                                formData={formData}
                                onFormDataChange={handleFormDataChange}
                                onNext={() => setShowCreateTicketForm(true)}
                            />
                        )
                    )}


                    {mainTab === "create" && subTab === "saved" && (
                        <div>

                            {selectedEventId ? (
                                <EventDetailModal
                                    eventId={selectedEventId}
                                    onBack={() => setSelectedEventId(null)}
                                />
                            ) : (
                                <>
                                    <h2 className="text-xl font-bold mb-4">Sự kiện đã lưu</h2>
                                    <OrganizerEventList
                                        filterStatus="pending"
                                        onSelectEvent={setSelectedEventId}
                                    />
                                </>
                            )}
                        </div>
                    )}


                    {mainTab === "create" && subTab === "deleted" && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Sự kiện đã xoá</h2>
                            <OrganizerEventList filterStatus="rejected" />
                        </div>
                    )}


                    {mainTab === "manage" && subTab === "upcoming" && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Sự kiện chưa diễn ra</h2>
                            <OrganizerEventList filterStatus="approved" filterTime="upcoming" />
                        </div>
                    )}


                    {mainTab === "manage" && subTab === "ongoing" && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Sự kiện đang diễn ra</h2>
                            <OrganizerEventList filterStatus="approved" filterTime="ongoing" />
                        </div>
                    )}


                    {mainTab === "manage" && subTab === "past" && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Sự kiện đã qua</h2>
                            <OrganizerEventList filterStatus="approved" filterTime="past" />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
