"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "@/lib/axiosInstance";

export default function AdminPaymentPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [showPaid, setShowPaid] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState("");
    const [note, setNote] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        axios
            .get("/event/payment-list", {
                params: { showPaid },
                withCredentials: true,
            })
            .then((res) => setEvents(res.data));
    }, [showPaid]);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const form = new FormData();
        form.append("file", file);
        // Giả sử bạn có API /upload trả về { url }
        const res = await axios.post("/upload", form, { withCredentials: true });
        setFileUrl(res.data.url);
        setUploading(false);
    };

    const handleConfirm = async () => {
        if (!file) {
            alert("Vui lòng chọn chứng từ chuyển khoản!");
            return;
        }
        const form = new FormData();
        form.append("file", file);
        form.append("note", note);
        await axios.put(
            `/event/${selected._id}/confirm-payment`,
            form,
            { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
        );
        setSelected(null);
        setFile(null);
        setNote("");
        // Refresh list
        axios
            .get("/event/payment-list", {
                params: { showPaid },
                withCredentials: true,
            })
            .then((res) => setEvents(res.data));
    };
    return (
        <div className="flex min-h-screen bg-[#f6f8fb]">
            <Sidebar onLogout={() => { }} selected="Thanh toán" />
            <main className="flex-1 p-8">
                <h1 className="text-2xl font-bold text-blue-900 mb-8">Thanh toán sự kiện</h1>
                <div className="flex items-center mb-4 gap-4">
                    <label>
                        <input
                            type="checkbox"
                            checked={showPaid}
                            onChange={() => setShowPaid((v) => !v)}
                        />{" "}
                        Hiển thị cả sự kiện đã thanh toán
                    </label>
                </div>
                <table className="w-full text-sm bg-white rounded-lg shadow">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 text-left">Tên sự kiện</th>
                            <th className="p-2 text-left">Thời gian kết thúc</th>
                            <th className="p-2 text-left">Doanh thu</th>
                            <th className="p-2 text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((e) => (
                            <tr key={e._id} className="border-b hover:bg-blue-50">
                                <td className="p-2">{e.title}</td>
                                <td className="p-2">
                                    {e.max_end_time
                                        ? new Date(e.max_end_time).toLocaleString("vi-VN")
                                        : ""}
                                </td>
                                <td className="p-2">{e.totalRevenue?.toLocaleString()} VNĐ</td>
                                <td className="p-2">
                                    {e.status === "paid" ? (
                                        <button
                                            className="text-blue-600 underline"
                                            onClick={() => setSelected(e)}
                                        >
                                            Xem lại
                                        </button>
                                    ) : (
                                        <button
                                            className="bg-green-600 text-white px-3 py-1 rounded"
                                            onClick={() => setSelected(e)}
                                        >
                                            Thanh toán
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Modal thanh toán */}
                {selected && (
                    <div className="fixed inset-0 bg-black/70 bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-8 mx-4 w-full relative max-w-[900px]">
                            <button
                                className="absolute top-2 right-3 text-gray-500 hover:text-red-500"
                                onClick={() => {
                                    setSelected(null);
                                    setFile(null);
                                    setFileUrl("");
                                    setNote("");
                                }}
                            >
                                ✕
                            </button>
                            <div className="p-4 bg-gray-50 rounded-lg mb-4">
                                <h3 className="font-semibold mb-2">{selected.title}</h3>
                                <p><b>Ban tổ chức:</b> {selected.organizer?.name}</p>
                                <div className='grid grid-cols-2 gap-4 mt-2'>
                                    <p><b>Ngày diễn ra:</b>  {selected.min_start_time
                                        ? new Date(selected.min_start_time).toLocaleString("vi-VN")
                                        : ""}</p>
                                    <p><b>Ngày kết thúc:</b>  {selected.max_end_time
                                        ? new Date(selected.max_end_time).toLocaleString("vi-VN")
                                        : ""}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg mb-4 grid grid-cols-2 gap-4">
                                <div><b>Tổng doanh thu:</b> {selected.totalRevenue?.toLocaleString()} VNĐ</div>
                                <div><b>Số vé bán ra:</b> {selected.totalSold}</div>
                                <div><b>Phí nền tảng:</b> {Math.round(selected.totalRevenue * 0.1).toLocaleString()} VNĐ</div>
                                <div><b>Số tiền thanh toán:</b> {(selected.totalRevenue - Math.round(selected.totalRevenue * 0.1)).toLocaleString()} VNĐ</div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg mb-4">
                                <h3 className="font-semibold mb-2">Thông tin thanh toán</h3>
                                <div className='grid grid-cols-2 gap-4 mb-2'>
                                    <p><b>Ngân hàng:</b> {selected.organizer?.bank_name}</p>
                                    <p><b>Tên tài khoản:</b>{selected.organizer?.bank_account_holder}</p>
                                </div>
                                <p><b>Số tài khoản:</b> {selected.organizer?.bank_account_number}</p>
                            </div>

                            {selected.status === "paid" && (
                                <div className=' rounded-lg p-2 bg-gray-50'>
                                    <b>Thời gian thanh toán:</b>{" "}
                                    {selected.pay_time
                                        ? new Date(selected.pay_time).toLocaleString("vi-VN")
                                        : ""}
                                </div>
                            )}
                            {selected.status !== "paid" && (
                                <div className="mt-2">
                                    <b className='mr-2'>Chứng từ chuyển khoản:</b>
                                    {selected.status === "paid" && selected.fileUrl ? (
                                        <div className="ml-2 border p-2 ">
                                            <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer"
                                            >
                                                Xem chứng từ
                                            </a>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                className='border p-2 rounded-lg'
                                            />
                                        </>
                                    )}
                                </div>
                            )}

                            {selected.status !== "paid" && (
                                <button
                                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                                    onClick={handleConfirm}
                                >
                                    Xác nhận thanh toán
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
}