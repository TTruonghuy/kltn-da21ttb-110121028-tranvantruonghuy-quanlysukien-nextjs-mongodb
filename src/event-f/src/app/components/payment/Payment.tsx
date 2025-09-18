import React from "react";
import { useState } from "react";


interface SelectedTicket {
    _id?: string;
    session_id: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
}

interface PaymentProps {
    email: string;
    tickets: SelectedTicket[];
    total: number;
    user_id?: string;
    onBack: () => void;
}

export default function Payment({ email, tickets, total, user_id, onBack }: PaymentProps) {
    const [loading, setLoading] = useState(false);


    // components/payment/Payment.tsx
    const handlePayment = async () => {
        setLoading(true);
        try {
            // Log để kiểm tra dữ liệu tickets
            console.log('Tickets sent to /order/create:', tickets);

            // 1. Gửi API tạo order
            const resOrder = await fetch("http://localhost:5000/order/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    user_id: user_id ? String(user_id) : undefined,
                    tickets: tickets.map(t => ({
                        ticket_id: t._id,
                        session_id: t.session_id,
                        price: t.price,
                        quantity: t.quantity,
                    })),
                    total_amount: total,
                }),
            });
            const orderData = await resOrder.json();
            if (!resOrder.ok || !orderData.orderId) {
                alert(`Không thể tạo đơn hàng: ${orderData.message || 'Lỗi không xác định'}`);
                setLoading(false);
                return;
            }

            if (total === 0) {
                // Đơn hàng 0 đồng: xác nhận nhận vé
                await fetch("http://localhost:5000/order/confirm-free", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId: orderData.orderId }),
                });
                alert("Nhận vé thành công! Vé đã được gửi đến email và hiển thị trong 'Vé của tôi'.");
                window.location.href = "/users";
                setLoading(false);
                return;
            }

            // 2. Gọi API tạo link thanh toán VNPay
            const resPay = await fetch(`http://localhost:5000/payment/create-payment-url?orderId=${orderData.orderId}&amount=${total}`);
            const payData = await resPay.json();
            if (payData?.paymentUrl) {
                window.location.href = payData.paymentUrl;
            } else {
                alert("Không thể tạo link thanh toán VNPay.");
            }
        } catch (err) {
            alert(`Có lỗi khi kết nối VNPay:`);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="flex flex-col lg:flex-row gap-6 mt-4">
            {/* Cột trái */}
            <div className="lg:w-2/3 w-full space-y-4">
                {/* Thông tin nhận vé */}
                <div className="bg-white rounded-lg p-4">
                    <div className="font-semibold mb-2 border-b pb-1">Thông tin nhận vé</div>
                    <div>Vé điện tử hiển thị trong mục "Vé của tôi" </div>
                    <div className="flex">Vé cũng được gửi đến email <p className="text-blue-600 ml-2">{email}</p></div>
                </div>

                {/* Thông tin đặt vé */}
                <div className="bg-white rounded-lg p-4 border">
                    <div className="font-semibold mb-2 border-b pb-1">Thông tin đặt vé</div>
                    <div className="flex justify-between font-bold text-[15px] mb-2 mx-4">
                        <span>Loại vé</span>
                        <span>Tổng</span>
                    </div>
                    {tickets.map(ticket => (
                        <div key={ticket.name} className="text-[14px] flex justify-between mt-2 px-4 bg-gray-100 rounded-lg py-1">
                            <span className="flex items-center">{ticket.name}</span>
                            <div className="">
                                <div className="text-center">{ticket.quantity}</div>
                                <div>
                                    {ticket.total.toLocaleString("vi-VN")} đ
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cột phải */}
            <div className="lg:w-1/3 w-full space-y-4">
                <div className="bg-gray-100 text-black rounded-lg p-4 border">

                    {/* Phương thức thanh toán */}
                    <div className="mb-10">
                        <div className="font-semibold mb-4">Phương thức thanh toán</div>
                        <div className="flex items-center gap-2 bg-white p-3 rounded-lg">
                            <input type="radio" checked readOnly className="accent-green-600" />
                            <img
                                src="/vnpay.png"
                                alt="VNPAY"
                                className="w-10 h-10"
                            />
                            <span className="font-bold text-gray-700">VNPAY</span>
                        </div></div>
                    <div className="w-50 border-b border-gray-300 mb-10 h-full ml-20"></div>



                    {/* Thông tin đơn hàng  */}

                    <div className="font-semibold mb-2">Thông tin đơn hàng</div>
                    <div className="flex justify-between text-[15px]">
                        <span>Tạm tính</span>
                        <span>{total.toLocaleString("vi-VN")} đ</span>
                    </div>

                    <div className="flex justify-between text-green-600 text-lg mt-10">
                        <span>Tổng tiền</span>
                        <span>{total.toLocaleString("vi-VN")} đ</span>
                    </div>


                    <p className="text-[10px] text-gray-500">
                        Bằng việc tiến hành đặt mua, bạn đã đồng ý với{" "}
                        <a href="#" className="text-blue-600">Điều Kiện Giao Dịch Chung</a>
                    </p>
                    {/* Nút thanh toán */}
                    <button
                        className="w-full py-2 mt-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg"
                        onClick={handlePayment}
                    >
                        {total === 0 ? "Nhận vé" : "Thanh toán"}
                    </button>
                </div>

                {/* Nút quay lại */}
                <button
                    className="w-full py-2 bg-blue-300 hover:bg-blue-200 text-gray-700 font-bold rounded-lg"
                    onClick={onBack}
                >
                    Quay lại
                </button>
            </div>
        </div>
    );



}