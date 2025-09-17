import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import React from "react";
import { EventFormData } from "@/app/components/types";

interface TicketDraft {
    ticketName: string;
    ticketPrice: number;
    ticketQuantity: number;
    minPerOrder: number;
    maxPerOrder: number;
    //saleStartTime: string;
    //saleEndTime: string;
    description_ticket: string;
    image_ticket: File | string | null;
}



interface TicketModalProps {
    open: boolean;
    onClose: () => void;
    formData: TicketDraft; // Đổi từ EventFormData sang TicketDraft
    onFormDataChange: (data: Partial<TicketDraft> | ((prev: TicketDraft) => TicketDraft)) => void;
    handleFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSave: () => void;
}


const TicketModal: React.FC<TicketModalProps> = ({
    open,
    onClose,
    formData,
    onFormDataChange,
    onSave,
}) => {

    const [previewUrl, setPreviewUrl] = React.useState<string>("");

    const handleSave = () => {
        // Kiểm tra các field bắt buộc
        if (
            !formData.ticketName ||
            formData.ticketPrice === undefined ||
            formData.ticketQuantity === undefined ||
            formData.minPerOrder === undefined ||
            formData.maxPerOrder === undefined
        ) {
            alert("Vui lòng điền đầy đủ thông tin các trường bắt buộc.");
            return;
        }
        onSave();
    };

    React.useEffect(() => {
        if (!formData) return;

        if (formData.image_ticket instanceof File) {
            const url = URL.createObjectURL(formData.image_ticket);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }

        if (typeof formData.image_ticket === "string" && formData.image_ticket !== "") {
            setPreviewUrl(formData.image_ticket);
        } else {
            setPreviewUrl("");
        }
    }, [formData.image_ticket]);

    if (!open || !formData) return null;

    return (
        <>
            {/* Overlay che ngoài modal */}
            <div
                className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-40 z-40 h-full"
                onClick={() => { }} // Không cho click ra ngoài để đóng
            ></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center ">
                <div className="bg-white rounded-lg shadow-lg p-10 w-[1100px] relative mt-10">
                    {/* Nút đóng */}
                    <button
                        type="button"
                        className="absolute top-2 right-4 text-gray-500 hover:text-red-500 text-2xl"
                        onClick={onClose}
                    >
                        ×
                    </button>
                    {/* Các trường nhập vé */}
                    <div className="flex mb-10">
                        <div className="w-152 mr-20">
                            <label htmlFor="ticketName" className="font-medium text-gray-700 mb-2">
                                Tên vé
                            </label>
                            <Input
                                id="ticketName"
                                name="ticketName"
                                type="text"
                                value={formData.ticketName ?? ""}
                                onChange={e => {
                                    const { name, value } = e.target;
                                    onFormDataChange(prev => ({
                                        ...prev,
                                        [name]: value,
                                    }));
                                }}
                                required
                            />
                        </div>
                        <div className="w-83">
                            <label htmlFor="ticketPrice" className="font-medium text-gray-700 mb-2">
                                Giá vé
                            </label>
                            <div className="flex items-end">
                                <Input
                                    id="ticketPrice"
                                    name="ticketPrice"
                                    type="text"
                                    pattern="[0-9.]*"
                                    inputMode="numeric"
                                    value={
                                        formData.ticketPrice !== undefined
                                            ? formData.ticketPrice === 0
                                                ? "0"
                                                : formData.ticketPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                                            : ""
                                    }
                                    onChange={e => {
                                        let raw = e.target.value.replace(/\D/g, "");
                                        raw = raw.replace(/^0+/, "");
                                        onFormDataChange(prev => ({
                                            ...prev, // Giữ lại các trường đã nhập trước đó
                                            ticketPrice: raw === "" ? 0 : Number(raw),
                                        }));
                                    }}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex mb-10">
                        <div className="mr-20 w-150">
                            <label htmlFor="ticketQuantity" className="font-medium text-gray-700 mb-2">
                                Số lượng vé
                            </label>
                            <Input
                                id="ticketQuantity"
                                name="ticketQuantity"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={
                                    formData.ticketQuantity !== undefined
                                        ? formData.ticketQuantity === 0
                                            ? "0"
                                            : formData.ticketQuantity
                                        : ""
                                }
                                onChange={e => {
                                    let raw = e.target.value.replace(/\D/g, "");
                                    raw = raw.replace(/^0+/, "");
                                    onFormDataChange(prev => ({
                                        ...prev,
                                        ticketQuantity: raw === "" ? 0 : Number(raw),
                                    }));
                                }}
                                required
                            />
                        </div>
                        <div className="w-full mr-20">
                            <label htmlFor="minPerOrder" className="font-medium text-gray-700 mb-2">
                                Số lượng tối thiểu mỗi lần đặt
                            </label>
                            <Input
                                id="minPerOrder"
                                name="minPerOrder"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={formData.minPerOrder === 0 ? "" : formData.minPerOrder}
                                onChange={e => {
                                    let raw = e.target.value.replace(/\D/g, "");
                                    raw = raw.replace(/^0+/, "");
                                    onFormDataChange(prev => ({
                                        ...prev, // Giữ lại các trường đã nhập trước đó
                                        minPerOrder: raw === "" ? 0 : Number(raw),
                                    }));
                                }}
                                required
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="maxPerOrder" className="font-medium text-gray-700 mb-2">
                                Số lượng tối đa mỗi lần đặt
                            </label>
                            <Input
                                id="maxPerOrder"
                                name="maxPerOrder"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={formData.maxPerOrder === 0 ? "" : formData.maxPerOrder}
                                onChange={e => {
                                    let raw = e.target.value.replace(/\D/g, "");
                                    raw = raw.replace(/^0+/, "");
                                    onFormDataChange(prev => ({
                                        ...prev, // Giữ lại các trường đã nhập trước đó
                                        maxPerOrder: raw === "" ? 0 : Number(raw),
                                    }));
                                }}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex mb-10">
                        <div className="flex flex-col w-full mr-2 ">
                            <label htmlFor="description_ticket" className="font-medium text-gray-700">
                                Mô tả
                            </label>
                            <textarea
                                className="w-255 h-34 rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 hover:scale-101"
                                id="description_ticket"
                                name="description_ticket"
                                value={formData.description_ticket ?? ""}
                                onChange={e => {
                                    const { name, value } = e.target;
                                    onFormDataChange(prev => ({
                                        ...prev,
                                        [name]: value,
                                    }));
                                }}
                            >
                            </textarea>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button
                            type="button"
                            className="bg-blue-950 hover:bg-blue-800 text-white py-2 px-8"
                            onClick={handleSave}
                        >
                            Lưu
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TicketModal;