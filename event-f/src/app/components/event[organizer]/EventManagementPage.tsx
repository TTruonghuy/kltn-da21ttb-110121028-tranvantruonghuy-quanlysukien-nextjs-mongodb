"use client";
import { useState, useEffect, useRef } from "react";
import CreateEventForm from "./CreateEventForm";
import CreateTicketForm from "../ticket/CreateTicketForm";
import Header from "@/app/components/Header";
import axios from "@/lib/axiosInstance";
import { EventFormData } from "@/app/components/types";
import OrganizerEventList from "./OrganizerEventList";
import EventDetailModal from "./EventDetailModal";
import { TiUser } from "react-icons/ti";
import { FaSignOutAlt } from "react-icons/fa";

export default function EventManagementPage() {
    const [activeTab, setActiveTab] = useState("create-event"); // Tab mặc định là "Tạo sự kiện"
    const [mainTab, setMainTab] = useState("event"); // "event"
    const [subTab, setSubTab] = useState("create"); // "create" | "saved" | "deleted"
    const [showCreateSubNav, setShowCreateSubNav] = useState(false);
    const [showManageSubNav, setShowManageSubNav] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [showCreateTicketForm, setShowCreateTicketForm] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);




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
                <nav className="w-64 bg-white flex flex-col p-4  fixed top-0 h-160 border-r border-gray-200">
                    {/* Nav cha */}
                    {/* Gọi ảnh , tên user organizer ở đây */}
                    {user && (
                        <div className="flex items-center gap-4 mb-8 mt-8 border-b pb-4"
                            onClick={() => setShowUserMenu((prev) => !prev)}
                            ref={userMenuRef}
                        >
                            <img
                                src={user.avatar || "/default-avatar.png"}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border"
                            />
                            <div>
                                <span className="block font-semibold text-blue-900">{user.name}</span>
                                <span className="block text-xs text-gray-500">{user.email}</span>
                            </div>
                            {showUserMenu && (
                                <div className="absolute left-10 top-25 bg-white border rounded shadow-lg z-50 min-w-[180px]">
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-blue-100 flex"
                                        onClick={e => {
                                            e.stopPropagation();
                                            // TODO: Hiển thị thông tin user (có thể mở modal)
                                            alert(`Tên: ${user.name}\nEmail: ${user.email}`);
                                            setShowUserMenu(false);
                                        }}
                                    >
                                        <TiUser className="w-5 h-5 mt-[1px]" />  Thông tin
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-blue-100 text-red-600 flex"
                                        onClick={async e => {
                                            e.stopPropagation();
                                            try {
                                                await axios.post("http://localhost:5000/auth/logout", {}, { withCredentials: true });
                                                setUser(null); // Xoá user ở client
                                                window.location.href = "/";
                                            } catch (error) {
                                                console.error("Error logging out:", error);
                                            }
                                            setShowUserMenu(false);
                                        }}
                                    >
                                        <FaSignOutAlt className="w-4 h-4 mt-1 mr-1 ml-1" />  Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
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

                <main className="flex-grow p-10 pt-12 bg-white mr-5 mb-5 ml-[300px]">
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
