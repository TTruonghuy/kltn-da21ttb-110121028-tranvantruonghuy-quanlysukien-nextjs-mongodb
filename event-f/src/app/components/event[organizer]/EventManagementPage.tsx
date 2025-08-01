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
import OrganizerInfoModal from "../organizer/OrganizerInfoModal";

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
<<<<<<< Updated upstream
    const [showOrganizerInfo, setShowOrganizerInfo] = useState(false);
    const [organizerInfo, setOrganizerInfo] = useState<any>(null);



=======
    const [eventListTab, setEventListTab] = useState<"pending" | "approved" | "rejected">("pending");
    const [approvedTimeFilter, setApprovedTimeFilter] = useState<"all" | "ongoing" | "past">("all");
>>>>>>> Stashed changes


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
                                <span className="block font-semibold text-blue-950">{user.name}</span>
                                <span className="block text-xs text-gray-500">{user.email}</span>
                            </div>
                            {showUserMenu && (
                                <div className="absolute left-10 top-25 bg-white border rounded shadow-lg z-50 min-w-[180px]">
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-blue-100 flex"
                                        onClick={async e => {
                                            e.stopPropagation();
                                            try {
                                                const res = await axios.get("http://localhost:5000/organizer/me", { withCredentials: true });
                                                setOrganizerInfo(res.data);
                                                setShowOrganizerInfo(true);
                                            } catch {
                                                alert("Không lấy được thông tin!");
                                            }
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
                        Sự kiện
                    </button>
                    {showCreateSubNav && mainTab === "create" && (
                        <div className="ml-2 flex flex-col">
                            <button
                                onClick={() => setSubTab("create")}
<<<<<<< Updated upstream
                                className={`py-2 px-4 mb-2 text-left rounded-lg ${subTab === "create" ? "bg-blue-400 text-white" : "hover:bg-gray-100"}`}
=======
                                className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded ${subTab === "create" ? "bg-blue-100" : "hover:bg-gray-100"}`}
>>>>>>> Stashed changes
                            >
                                Tạo sự kiện
                            </button>
                            <button
                                onClick={() => setSubTab("saved")}
                                className={`block w-full text-left px-4 py-2 mt-1 text-gray-700 hover:bg-gray-100 rounded ${subTab === "saved" ? "bg-blue-100" : "hover:bg-gray-100"}`}
                            >
<<<<<<< Updated upstream
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
=======
                                Quản lý sự kiện
>>>>>>> Stashed changes
                            </button>
                        </div>
                    )}

                </nav>







                {showOrganizerInfo && organizerInfo ? (
                    <OrganizerInfoModal
                        open={showOrganizerInfo}
                        onClose={() => setShowOrganizerInfo(false)}
                        organizer={organizerInfo || {}}
                        onSave={async (data) => {
                            try {
                                await axios.put("http://localhost:5000/organizer/me", data, { withCredentials: true });
                                setOrganizerInfo(data);
                                setShowOrganizerInfo(false);
                            } catch {
                                alert("Cập nhật thất bại!");
                            }
                        }}
                    />
                ) : (

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
<<<<<<< Updated upstream
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
                )}
=======
                                    <CreateEventForm
                                        formData={formData}
                                        onFormDataChange={handleFormDataChange}
                                        onNext={() => setShowCreateTicketForm(true)}
                                    />
                                )
                            )}
                            {mainTab === "create" && subTab === "saved" && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4 text-blue-950">Sự kiện đã tạo</h2>
                                    {/* 3 nút chuyển tab */}
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
                                            className={`px-10 border-b-3 border-b-red-100 ${eventListTab === "rejected" ? "text-blue-950 font-bold hover:text-blue-800 hover:scale-101" : "text-gray-700 hover:scale-101"}`}
                                            onClick={() => setEventListTab("rejected")}
                                        >
                                            Đã xoá
                                        </button>
                                    </div>



                                    {eventListTab === "approved" && (
                                        <div className="flex justify-end">

                                            <button
                                                className={`flex items-center mr-4 ${approvedTimeFilter === "all" ? "" : "text-gray-500"}`}
                                                onClick={() => setApprovedTimeFilter("all")}
                                            >
                                                <div className="w-3 h-3 bg-blue-500 mr-1"> </div>
                                                Tất cả
                                            </button>

                                            <button
                                                className={`flex items-center mr-4 ${approvedTimeFilter === "ongoing" ? "" : "text-gray-500"}`}
                                                onClick={() => setApprovedTimeFilter("ongoing")}
                                            >
                                                 <div className="w-3 h-3 bg-green-500 mr-1"> </div>
                                                Đang diễn ra
                                            </button>

                                            <button
                                                className={`flex items-center ${approvedTimeFilter === "past" ? " " : "text-gray-500"}`}
                                                onClick={() => setApprovedTimeFilter("past")}
                                            >
                                                 <div className="w-3 h-3 bg-gray-500 mr-1"> </div>
                                                Đã qua
                                            </button>
                                        </div>
                                    )}



                                    {/* Hiển thị danh sách theo tab */}
                                    <OrganizerEventList
                                        filterStatus={eventListTab}
                                        filterTime={eventListTab === "approved" && approvedTimeFilter !== "all" ? approvedTimeFilter : undefined}
                                    />
                                </div>
                            )}

                        </>
                    )}
                </main>
>>>>>>> Stashed changes
            </div>
        </div>
    );
}
