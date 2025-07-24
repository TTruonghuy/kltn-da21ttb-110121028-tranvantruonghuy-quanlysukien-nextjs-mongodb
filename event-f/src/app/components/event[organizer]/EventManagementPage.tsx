"use client";
import { useState, useEffect, useRef } from "react";
import CreateEventForm from "./CreateEventForm";
import CreateTicketForm from "../ticket/CreateTicket";
import Header from "@/app/components/Header";
import axios from "@/lib/axiosInstance";
import { EventFormData } from "@/app/components/types";
import OrganizerEventList from "./OrganizerEventList";
import EventDetailModal from "./EventDetailModal";
import { TiUser } from "react-icons/ti";
import { FaSignOutAlt } from "react-icons/fa";
import Profile from "@/app/components/users/Profile";
//import { useUserUpdate } from "../users/useUserUpdate";

export default function EventManagementPage() {
    const [activeTab, setActiveTab] = useState("create-event"); // Tab mặc định là "Tạo sự kiện"
    const [mainTab, setMainTab] = useState("event"); // "event"
    const [subTab, setSubTab] = useState("create"); // "create" | "saved" | "deleted"
    const [showCreateSubNav, setShowCreateSubNav] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showManageSubNav, setShowManageSubNav] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [showCreateTicketForm, setShowCreateTicketForm] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);



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

    const isCreateTabActive = mainTab === "create" && !showProfile;
    const isManageTabActive = mainTab === "manage" && !showProfile;
    const isInfoTabActive = showProfile;


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
                                <span className="block font-semibold text-blue-900">{user.name}</span>
                                <span className="block text-xs text-gray-500">{user.email}</span>
                            </div>
                        </div>
                    )}

                    {/* Tạo sự kiện */}
                    <button
                        onClick={() => {
                            setMainTab("create");
                            setShowCreateSubNav(!showCreateSubNav);
                            setShowManageSubNav(false);
                            setShowProfile(false);
                        }}
                        className={`block w-full text-left px-4 py-2 mb-2 text-gray-700 hover:bg-gray-100 rounded ${isCreateTabActive ? "bg-blue-100" : "bg-white"} hover:bg-blue-200`}
                    >
                        Tạo sự kiện
                    </button>
                    {showCreateSubNav && isCreateTabActive && (
                        <div className="ml-2 flex flex-col">
                            <button
                                onClick={() => setSubTab("create")}
                                className={`py-2 px-4 mb-2 font-bold hover:font-bold hover:border-l-4 hover:border-blue-700 text-left ${subTab === "create" ? "bg-blue-400 text-white" : "hover:bg-gray-100"}`}
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

                    {/* Quản lý sự kiện */}
                    <button
                        onClick={() => {
                            setMainTab("manage");
                            setShowManageSubNav(!showManageSubNav);
                            setShowCreateSubNav(false);
                            setShowProfile(false);
                        }}
                        className={`block w-full text-left px-4 mb-2 py-2 text-gray-700 hover:bg-gray-100 rounded ${isManageTabActive ? "bg-blue-100" : "bg-white"} hover:bg-blue-200`}
                    >
                        Quản lý sự kiện
                    </button>
                    {showManageSubNav && isManageTabActive && (
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

                    {/* Thông tin */}
                    {user && (
                        <div className="flex flex-col gap-2">
                            <button
                                className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded ${isInfoTabActive ? "bg-blue-100" : "bg-white"} hover:bg-blue-200`}
                                onClick={() => {
                                    setShowProfile(true);
                                    setShowCreateSubNav(false);
                                    setShowManageSubNav(false);
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

                <main className="flex-grow p-10 pt-12 bg-white mr-5 mb-5 ml-[300px]">
                    {showProfile && user ? (
                        <Profile
                            user={user}
                            onUpdate={updated => {
                                setUser({ ...updated, role: user.role });
                                // Không đóng form, giữ lại tab Thông tin
                            }}
                            onDelete={() => setShowProfile(false)}
                        />
                    ) : (
                        <>
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
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
