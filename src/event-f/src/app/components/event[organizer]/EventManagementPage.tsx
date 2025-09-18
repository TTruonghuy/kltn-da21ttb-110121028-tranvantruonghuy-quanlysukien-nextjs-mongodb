"use client";
import { useState, useEffect, useRef } from "react";
import CreateEventForm from "./CreateEventForm";
import CreateTicketForm from "../ticket/CreateTicket";
import Header from "@/app/components/Header";
import axios from "@/lib/axiosInstance";
import { EventFormData } from "@/app/components/types";
import OrganizerEventList from "./OrganizerEventList";
import EventDetailModal from "./EventDetailModal";
import Profile from "@/app/components/users/Profile";
import EventDashboard from "./EventDashboard";
import { TiChevronLeft } from "react-icons/ti";

export default function EventManagementPage() {
    const [activeTab, setActiveTab] = useState<"create" | "saved">("create");
    const [showProfile, setShowProfile] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [showDashboard, setShowDashboard] = useState(false);
    const [showCreateTicketForm, setShowCreateTicketForm] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const [eventListTab, setEventListTab] = useState<"pending" | "approved" | "cancel">("pending");
    const [approvedTimeFilter, setApprovedTimeFilter] = useState<"all" | "ongoing" | "past">("all");
    const [detailEventId, setDetailEventId] = useState<string | null>(null);

    const [user, setUser] = useState<{
        email: string;
        name: string;
        avatar?: string;
        logo?: string;
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
        noSale: false,
        sessions: [],
        ticketMode: "area",
    });

    const handleFormDataChange = (
        data: Partial<EventFormData> | ((prev: EventFormData) => EventFormData)
    ) => {
        setFormData(prev => {
            if (typeof data === "function") {
                return data(prev);
            } else {
                return { ...prev, ...data };
            }
        });
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        if (showUserMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showUserMenu]);

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
            <div className="flex flex-grow h-full w-full">
                <nav className="w-64 bg-white flex flex-col p-4 fixed top-0 h-160 border-r border-gray-200">
                    {user && (
                        <div className="flex items-center gap-4 mb-8 mt-8 border-b pb-4"
                            onClick={() => setShowUserMenu((prev) => !prev)}
                            ref={userMenuRef}
                        >
                            <img
                                src={user.logo || user.avatar || "/default-avatar.png"}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border"
                            />
                            <div>
                                <span className="block font-semibold text-blue-950">{user.name}</span>
                                <span className="block text-xs text-gray-500">{user.email}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setActiveTab("create");
                            setShowProfile(false);
                        }}
                        className={`block w-full text-left px-4 py-2 mb-2 text-gray-700 hover:bg-gray-100 rounded ${activeTab === "create" && !showProfile ? "bg-blue-100" : "bg-white"} hover:bg-blue-200`}
                    >
                        Tạo sự kiện
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("saved");
                            setShowProfile(false);
                        }}
                        className={`block w-full text-left px-4 py-2 mb-2 text-gray-700 hover:bg-gray-100 rounded ${activeTab === "saved" && !showProfile ? "bg-blue-100" : "bg-white"} hover:bg-blue-200`}
                    >
                        Quản lý sự kiện
                    </button>

                    {user && (
                        <div className="flex flex-col gap-2">
                            <button
                                className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded ${showProfile ? "bg-blue-100" : "bg-white"} hover:bg-blue-200`}
                                onClick={() => {
                                    setShowProfile(true);
                                }}
                            >
                                Thông tin
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                onClick={async () => {
                                    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
                                        try {
                                            await axios.post("http://localhost:5000/auth/logout", {}, { withCredentials: true });
                                            setUser(null);
                                            window.location.href = "/";
                                        } catch (error) {
                                            console.error("Error logging out:", error);
                                        }
                                    }
                                }}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </nav>

                <main className="flex-grow  bg-white mr-5 mb-5 ml-[300px]">
                    {showDashboard && selectedEventId ? (
                        <div className="flex-1 mt-10">
                            <button
                                className=" px-4 pl-0 ml-6 py-1 text-blue-950 rounded hover:bg-blue-100 font-bold flex items-center"
                                onClick={() => {
                                    setShowDashboard(false);
                                    setSelectedEventId(null);
                                }}
                            >
                                <TiChevronLeft className=" w-5 h-5" /> Trở lại
                            </button>
                            <EventDashboard eventId={selectedEventId} />
                        </div>
                    ) : detailEventId ? (
                        <div className="flex-1 ">
                            <button
                                className=" px-2 pl-0 ml-6 py-1 text-blue-950 rounded hover:bg-blue-100 font-bold"
                                onClick={() => setDetailEventId(null)}
                            >
                                
                            </button>
                            <EventDetailModal
                                eventId={detailEventId}
                                onBack={() => setDetailEventId(null)}
                            />
                        </div>
                    ) : showProfile && user ? (
                        <Profile
                            user={user}
                            onUpdate={updated => {
                                setUser({ ...updated, role: user.role });
                            }}
                           // onDelete={() => setShowProfile(false)}
                        />
                    ) : (
                        <>
                            {activeTab === "create" && (
                                showCreateTicketForm ? (
                                    <CreateTicketForm
                                        formData={formData}
                                        onFormDataChange={handleFormDataChange}
                                        onBack={() => setShowCreateTicketForm(false)}
                                        onSubmit={() => {
                                            setShowCreateTicketForm(false);
                                            setActiveTab("saved");
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

                            {activeTab === "saved" && (
                                <div className="pt-14 pr-6">
                                    <h2 className="text-xl font-bold mb-4 text-blue-950">Sự kiện đã tạo</h2>
                                    <div className="flex justify-center mb-6">
                                        <button
                                            className={`px-10 py-1 border-b-3 border-b-green-100 ${eventListTab === "pending" ? " text-blue-950 font-bold hover:text-blue-800 hover:scale-101" : " text-gray-700 hover:scale-101"}`}
                                            onClick={() => setEventListTab("pending")}
                                        >
                                            Đã lưu
                                        </button>
                                        <button
                                            className={`px-10  border-b-3 border-b-blue-100 ${eventListTab === "approved" ? "text-blue-950 font-bold hover:text-blue-800 hover:scale-101" : "text-gray-700 hover:scale-101"}`}
                                            onClick={() => setEventListTab("approved")}
                                        >
                                            Đã đăng
                                        </button>
                                        <button
                                            className={`px-10 border-b-3 border-b-red-100 ${eventListTab === "cancel" ? "text-blue-950 font-bold hover:text-blue-800 hover:scale-101" : "text-gray-700 hover:scale-101"}`}
                                            onClick={() => setEventListTab("cancel")}
                                        >
                                            Đã huỷ
                                        </button>
                                    </div>

                                    {eventListTab === "approved" && (
                                        <div className="flex justify-end">
                                            <button
                                                className={`flex items-center mr-4 ${approvedTimeFilter === "ongoing" ? "" : "text-gray-500"}`}
                                                onClick={() => setApprovedTimeFilter("ongoing")}
                                            >
                                                <div className="w-3 h-3 bg-blue-500 mr-1 rounded"> </div>
                                                Đang mở bán
                                            </button>

                                            <button
                                                className={`flex items-center ${approvedTimeFilter === "past" ? " " : "text-gray-500"}`}
                                                onClick={() => setApprovedTimeFilter("past")}
                                            >
                                                <div className="w-3 h-3 bg-gray-500 mr-1 rounded"> </div>
                                                Đã qua
                                            </button>
                                        </div>
                                    )}

                                    <OrganizerEventList
                                        filterStatus={eventListTab}
                                        filterTime={eventListTab === "approved" && approvedTimeFilter !== "all" ? approvedTimeFilter : undefined}
                                        onSelectEvent={(id) => {
                                            if (eventListTab === "pending") {
                                                setDetailEventId(id); // mở modal chi tiết
                                            } else {
                                                setSelectedEventId(id);
                                                setShowDashboard(true);
                                            }
                                        }}
                                    />
                                    
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}