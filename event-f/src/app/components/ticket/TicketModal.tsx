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
    saleStartTime: string;
    saleEndTime: string;
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
                                        formData.ticketPrice
                                            ? formData.ticketPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
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
                                value={formData.ticketQuantity === 0 ? "" : formData.ticketQuantity}
                                onChange={e => {
                                    let raw = e.target.value.replace(/\D/g, "");
                                    raw = raw.replace(/^0+/, "");
                                    onFormDataChange(prev => ({
                                        ...prev, // Giữ lại các trường đã nhập trước đó
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
                        <div className="flex flex-col mr-20">
                            <div className=" w-full mb-10">
                                <label htmlFor="saleStartTime" className="font-medium text-gray-700 mb-2">
                                    Thời gian bắt đầu bán
                                </label>
                                <Input
                                    id="saleStartTime"
                                    name="saleStartTime"
                                    type="datetime-local"
                                    value={formData.saleStartTime ?? ""}
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





                            <div className="w-full">
                                <label htmlFor="saleEndTime" className="font-medium text-gray-700 mb-2">
                                    Thời gian kết thúc bán
                                </label>
                                <Input
                                    id="saleEndTime"
                                    name="saleEndTime"
                                    type="datetime-local"
                                    value={formData.saleEndTime ?? ""}
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
                        </div>


                        <div className="flex flex-col w-full mr-2 ">
                            <label htmlFor="description_ticket" className="font-medium text-gray-700">
                                Mô tả
                            </label>
                            <textarea
                                className="w-185 h-34 rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 hover:scale-101"
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

                         {/*
                        <div >
                            <label htmlFor="image_ticket" className="font-medium text-gray-700">
                                Ảnh sự vé
                            </label>
                            <div className="relative w-60 h-34 bg-gray-100/50 rounded-md group">
                                <input
                                    id="image_ticket"
                                    name="image_ticket"
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files?.[0] ?? null;
                                        onFormDataChange(prev => ({
                                            ...prev,
                                            image_ticket: file
                                        }));
                                    }}
                                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-30"
                                />
                                {previewUrl ? (
                                    <div className="w-full h-full overflow-hidden rounded-md border transition-opacity duration-300">
                                        <img
                                            src={previewUrl}
                                            alt="Ảnh vé preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-0 left-0 w-full h-full bg-gray-200 rounded-md flex flex-col items-center justify-center text-gray-500 opacity-0 group-hover:opacity-80 transition-opacity duration-300 z-20">
                                            <p className="mb-2">Chọn lại ảnh</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gray-200 rounded-md flex flex-col items-center justify-center text-gray-500 z-10">

                                        <p className="mb-2">Chọn ảnh</p>
                                    </div>
                                )}
                            </div>
                        </div>*/}

                    </div>
                    {/* Nút đóng ở dưới cùng */}
                    <div className="flex justify-end mt-4">
                        <Button
                            type="button"
                            className="bg-blue-950 hover:bg-blue-800 text-white py-2 px-8"
                            onClick={onSave}
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