"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import TicketQRScanner from "@/app/components/TicketQRScanner";
import { Button } from "@/app/components/ui/button";
import axios from "@/lib/axiosInstance";

export default function ScanPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const [scanResult, setScanResult] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState<string>("");
  const [loadingTitle, setLoadingTitle] = useState(true);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scannerRef = useRef<{ stop: () => void } | null>(null);

  // Lấy tiêu đề sự kiện
  useEffect(() => {
    if (eventId) {
      axios
        .get(`/event/${eventId}`, { withCredentials: true })
        .then((res) => {
          const title = res.data?.title || "Không tìm thấy tiêu đề";
          setEventTitle(title);
        })
        .catch((err) => {
          console.error("Lỗi khi lấy tiêu đề sự kiện:", err);
          setEventTitle("Lỗi khi tải tiêu đề");
        })
        .finally(() => setLoadingTitle(false));
    }
  }, [eventId]);

  // Dừng scanner khi component unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  // Xử lý khi quét mã QR
  const handleScan = async (text: string) => {
    setLoadingCheckIn(true);
    setError(null);
    setScanResult(null);
     if (!text || text.trim() === "") return;

    try {
      // Gọi API checkInTicket
      const response = await axios.post(
        `/ticket/check-in`,
        { qr_data: text, event_id: eventId },
        { withCredentials: true }
      );

      const { success, message, details } = response.data;

      if (success) {
        setScanResult(
          `✅ Check-in thành công!\n` +
            `Sự kiện: ${details.event_title}\n` +
            `Tên vé: ${details.ticket_name}\n` +
            `Thời gian bắt đầu: ${details.session_start}\n` +
            `Thời gian kết thúc: ${details.session_end}\n` +
            `Thời gian check-in: ${details.check_in_time}`
        );
      } else {
        setError(message || "Lỗi khi check-in vé");
      }
    } catch (err: any) {
      console.error("Lỗi khi check-in:", err);
      setError(err.response?.data?.message || "Lỗi khi check-in vé");
    } finally {
      setLoadingCheckIn(false);
    }
  };

  // Xử lý đóng trang
  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    router.push("/event-management");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Button onClick={handleClose} className="bg-blue-950 text-white">
          Đóng
        </Button>
        <h1 className="text-xl font-bold mb-4">
          Quét vé — Sự kiện {loadingTitle ? "Đang tải..." : eventTitle}
        </h1>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <TicketQRScanner
            ref={scannerRef}
            eventId={eventId}
            onResult={handleScan}
            // onError={(err) => setError(`⚠️ Lỗi camera: ${String(err)}`)}
          />
        </div>

        <div className="p-4 border rounded">
          <div className="font-semibold mb-2">Kết quả</div>
          <div className="min-h-[120px]">
            {loadingCheckIn ? (
              <div className="text-gray-500">Đang xử lý...</div>
            ) : error ? (
              <div className="text-red-500">⚠️ {error}</div>
            ) : scanResult ? (
              <div className="whitespace-pre-wrap">{scanResult}</div>
            ) : (
              <div className="text-gray-500">Chưa quét</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}