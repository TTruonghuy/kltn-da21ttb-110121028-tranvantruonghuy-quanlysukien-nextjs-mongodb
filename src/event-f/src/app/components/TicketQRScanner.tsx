"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { BrowserQRCodeReader, BrowserCodeReader } from "@zxing/browser";

type Props = {
    eventId?: string;
    onResult?: (text: string) => void;
    onError?: (err: any) => void;
};

const TicketQRScanner = forwardRef<{ stop: () => void }, Props>(({ eventId, onResult, onError }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const controlsRef = useRef<{ stop: () => void } | null>(null);
    const activeRef = useRef(true);

    // Lưu mã và thời gian quét cuối cùng để chống quét trùng liên tục
    const lastResultRef = useRef<string | null>(null);
    const lastScanTimeRef = useRef<number>(0);

    useImperativeHandle(ref, () => ({
        stop: () => {
            activeRef.current = false;
            controlsRef.current?.stop();
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => {
                    track.enabled = false;
                    track.stop();
                });
                videoRef.current.srcObject = null;
            }
        }
    }));

    useEffect(() => {
        activeRef.current = true;

        BrowserCodeReader.listVideoInputDevices()
            .then((devices) => {
                if (!devices.length) throw new Error("Không tìm thấy camera");

                const deviceId = devices[0].deviceId;
                if (!videoRef.current) return;

                const codeReader = new BrowserQRCodeReader();
                codeReader.decodeFromVideoDevice(
                    deviceId,
                    videoRef.current,
                    (result, err, controls) => {
                        controlsRef.current = controls;

                        if (!activeRef.current) return;
                        if (result) {
                            const text = result.getText();
                            if (!text || text.trim() === "") return;

                            // Thử parse xem có phải JSON hợp lệ không
                            try {
                                const parsed = JSON.parse(text);
                                if (!parsed.ticket_id || !parsed.order_id) return; // Không đúng format thì bỏ qua
                            } catch {
                                return; // Không phải JSON, bỏ qua
                            }

                            const now = Date.now();
                            if (text !== lastResultRef.current || now - lastScanTimeRef.current > 2000) {
                                lastResultRef.current = text;
                                lastScanTimeRef.current = now;
                                onResult?.(text);
                            }
                        } else if (err && !(err instanceof DOMException)) {
                            onError?.(err);
                        }
                    }
                );
            })
            .catch(onError);

        return () => {
            activeRef.current = false;
            controlsRef.current?.stop();
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => {
                    track.enabled = false;
                    track.stop();
                });
                videoRef.current.srcObject = null;
            }
        };
    }, [onResult, onError]);

    return (
        <div className="w-full">
            <video
                ref={videoRef}
                style={{
                    width: "100%",
                    height: 360,
                    borderRadius: 8,
                    background: "#000",
                }}
            />
        </div>
    );
});

export default TicketQRScanner;
