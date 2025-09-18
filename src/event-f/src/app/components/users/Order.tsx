"use client";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { TiArrowBack } from "react-icons/ti";
import { FaAngleLeft } from "react-icons/fa6";

interface OrderDetailsProps {
    orderId: string; // Prop orderId
    onBack: () => void; // Prop để back
}

export default function OrderDetails({ orderId, onBack }: OrderDetailsProps) {
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const res = await fetch(`http://localhost:5000/order/my-orders/${orderId}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) {
                    throw new Error("Không thể lấy chi tiết đơn hàng");
                }

                const data = await res.json();
                setOrder(data);
            } catch (err: any) {
                setError(err.message || "Lỗi khi lấy chi tiết");
                console.error("Error fetching order details:", err);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    if (error) return <p className="text-red-600">{error}</p>;
    if (!order) return <div>Đang tải...</div>;

    const handleDownloadQRWithInfo = async (ticketId: string, ticketType: string, eventDate: string) => {
        const ticket = order.fullTickets.find((t: any) => t.ticketId === ticketId);
        if (!ticket || !ticket.qrData) {
            alert('Không tìm thấy dữ liệu QR để tải về');
            return;
        }

        // Tạo image từ dataURL QR
        const img = new Image();
        img.src = ticket.qrData;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const width = 400;
            const height = 500;
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) return;

            // Màu nền trắng
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);

            // Vẽ QR code (giữ kích thước 300x300, căn giữa)
            ctx.drawImage(img, (width - 300) / 2, 50, 300, 300);

            // Đặt font chữ
            ctx.fillStyle = 'black';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';

            // Vẽ tên loại vé
            ctx.fillText(`Vé: ${ticketType}`, width / 2, 400);

            // Vẽ ngày diễn ra
            ctx.fillText(`Ngày: ${eventDate}`, width / 2, 440);

            // Tạo link tải ảnh
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `qr-ticket-${ticketId}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };

        img.onerror = () => {
            alert('Lỗi khi tải ảnh QR');
        };
    };


    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <button className="flex items-center text-blue-600 mb-4 hover:bg-blue-50 px-2 py-1 rounded" onClick={onBack}>
              <FaAngleLeft /> Trở lại 
            </button>
            {/* Thông tin cơ bản */}
            <div className="bg-blue-50 rounded-lg mb-6 shadow">
                <div className="">
                    <h2 className="p-2 text-lg bg-blue-200 font-semibold mb-2 rounded-t-lg">{order.eventTitle}</h2>
                </div>


                <div className="px-10 py-2">
                    <p className="text-sm text-gray-600 mb-1">Ngày tạo đơn: {new Date(order.orderDate).toLocaleString("vi-VN")}</p>
                    <p className="text-sm text-gray-600 mb-1">Phương thức thanh toán: {order.paymentMethod || "Chưa xác định"}</p>
                    <p className="text-sm text-gray-600 mb-1">Tên người mua: {order.userName}</p>
                    <p className="text-sm text-gray-600 mb-1">Email: {order.userEmail}</p>
                </div>
            </div>

            {/* Danh sách vé với QR code (full list) */}
            <div className="bg-blue-50 mb-6 rounded-lg shadow">
                <div className="">
                    <h2 className="p-2 text-lg bg-blue-200 font-semibold mb-2 rounded-t-lg">Danh sách vé đã mua</h2>
                </div>
                <div className="space-y-4 px-10 mt-2">
                    {order.fullTickets.map((ticket: any) => (
                        <div key={ticket.ticketId} className="flex items-center justify-between border-b pb-2">
                            <div>
                                <div className="font-medium flex mb-4">Vé {ticket.type} - <p className="ml-1 text-gray-600">{ticket.price}</p></div>
                                <button
                                    className="text-blue-600 text-sm mt-1"
                                    onClick={() => handleDownloadQRWithInfo(ticket.ticketId, ticket.type, new Date(order.sessionTime.start).toLocaleDateString('vi-VN'))}
                                >
                                    Tải về QR
                                </button>
                            </div>
                            <img
                                src={ticket.qrData}
                                alt={`QR code vé ${ticket.ticketId}`}
                                width={128}
                                height={128}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Thông tin đơn hàng (grouped) */}
            <div className="bg-blue-50 rounded-lg shadow mb-6">

                <div className="">
                    <h2 className="p-2 text-lg bg-blue-200 font-semibold mb-2 rounded-t-lg">Danh sách vé đã mua</h2>
                </div>
                <div className="px-10 py-2">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2">Loại vé</th>
                                <th className="text-left py-2">Số lượng</th>
                                <th className="text-left py-2">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.tickets.map((item: any, index: number) => (
                                <tr key={index} className="border-b">
                                    <td className="py-2">{item.type}</td>
                                    <td className="py-2">{item.quantity}</td>
                                    <td className="py-2">{item.total.toLocaleString("vi-VN")} VND</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-right font-bold px-4 py-4">Tổng tiền: {order.totalAmount.toLocaleString("vi-VN")} VND</p>
            </div>
        </div>
    );
}