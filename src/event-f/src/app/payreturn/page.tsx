'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentReturn() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Lấy toàn bộ params
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        // Gửi params về backend để xác thực và cập nhật order
        if (params.vnp_ResponseCode && params.vnp_TxnRef) {
            fetch(`http://localhost:5000/payment/vnpay-return?${new URLSearchParams(params)}`, {
                method: 'GET',
            })
                .then(res => res.json())
                .then(data => {
                    if (params.vnp_ResponseCode === '00' && data.status === 'success') {
                        alert('Thanh toán thành công! Vé đã được gửi đến email và hiển thị trong "Vé của tôi".');
                        router.push('/users');
                    } else {
                        alert(`Thanh toán thất bại: Mã lỗi ${params.vnp_ResponseCode}`);
                        router.push('/');
                    }
                })
                .catch(() => {
                    alert('Có lỗi khi xác thực thanh toán!');
                    router.push('/');
                });
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-blue-100 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Đang xử lý kết quả thanh toán...</h2>
            </div>
        </div>
    );
}