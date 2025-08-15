'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentReturn() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef');

    useEffect(() => {
        if (vnp_ResponseCode) {
            if (vnp_ResponseCode === '00') {
                alert('Thanh toán thành công! Vé đã được gửi đến email và hiển thị trong "Vé của tôi".');
                router.push('/my-tickets');
            } else {
                alert(`Thanh toán thất bại: Mã lỗi ${vnp_ResponseCode}`);
                router.push('/'); // Chuyển về trang chủ hoặc trang chọn vé
            }
        }
    }, [vnp_ResponseCode, vnp_TxnRef, router]);

    return (
        <div className="min-h-screen bg-blue-100 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Đang xử lý kết quả thanh toán...</h2>
            </div>
        </div>
    );
}