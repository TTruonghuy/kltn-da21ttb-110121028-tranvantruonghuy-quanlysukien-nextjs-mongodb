"use client";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
//import { Textarea } from "@/app/components/ui/textarea"; // Nếu bạn có component Textarea
import { TiTicket } from "react-icons/ti";
import axios from "axios";
import { useState, useEffect } from "react";

interface CreateTicketFormProps {
    formData: {

        title: string;
        description: string;
        houseNumber: string; // Số nhà
        ward: string; // Phường/Xã
        district: string; // Quận/Huyện
        province: string; // Tỉnh/Thành phố
        location: string;
        start_time: string;
        end_time: string;
        image: File | null;
        event_type: string;


        ticketName: string;
        ticketPrice: number;
        ticketQuantity: number;
        minPerOrder: number;
        maxPerOrder: number;
        saleStartTime: string;
        saleEndTime: string;
        description_ticket: string; // Thêm trường mô tả
        image_ticket: File | null; // Thêm trường ảnh

        noSale: boolean;
    };
    onFormDataChange: (data: Partial<CreateTicketFormProps["formData"]>) => void;
    onBack: () => void;
    onSubmit: () => void; // Callback khi tạo vé thành công
}

export default function CreateTicketForm({
    formData,
    onFormDataChange,
    onBack,
    onSubmit,
}: CreateTicketFormProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onFormDataChange({ [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onFormDataChange({ image_ticket: file });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFormDataChange({ noSale: e.target.checked });
    };

 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const fullLocation = `${formData.houseNumber}, ${formData.ward}, ${formData.district}, ${formData.province}`;
            const formDataToSend = new FormData();
    
            // Gửi thông tin sự kiện
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("location", fullLocation);
            formDataToSend.append("start_time", new Date(formData.start_time).toISOString());
            formDataToSend.append("end_time", new Date(formData.end_time).toISOString());
            formDataToSend.append("event_type", formData.event_type);
            if (formData.image) {
                formDataToSend.append("image", formData.image);
            }
    
            // Nếu chọn "Không mở bán vé", chỉ tạo sự kiện
            if (formData.noSale) {
                const response = await axios.post("http://localhost:5000/event/create", formDataToSend, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true, // Gửi cookie cùng với yêu cầu
                });
                console.log("Event created successfully:", response.data);
                alert("Sự kiện đã được tạo thành công mà không mở bán vé!");
                onSubmit(); // Gọi callback khi thành công
                return;
            }
    
            // Nếu mở bán vé, tạo sự kiện trước, sau đó tạo vé
            const eventResponse = await axios.post("http://localhost:5000/event/create", formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    //Authorization: `Bearer ${token}`, // Gửi token trong header
                },
                withCredentials: true, // Gửi cookie cùng với yêu cầu
            });
            console.log("Event created successfully:", eventResponse.data);
    
            const eventId = eventResponse.data._id; // Lấy ID sự kiện từ phản hồi
    
            // Gửi thông tin vé
            const ticketFormData = new FormData();
            ticketFormData.append("event_id", eventId); // Liên kết vé với sự kiện
            ticketFormData.append("ticket_name", formData.ticketName);
            ticketFormData.append("ticket_price", formData.ticketPrice.toString());
            ticketFormData.append("ticket_quantity", formData.ticketQuantity.toString());
            ticketFormData.append("min_per_order", formData.minPerOrder.toString());
            ticketFormData.append("max_per_order", formData.maxPerOrder.toString());
            ticketFormData.append("sale_start_time", formData.saleStartTime);
            ticketFormData.append("sale_end_time", formData.saleEndTime);
            ticketFormData.append("description_ticket", formData.description_ticket);
            if (formData.image_ticket) {
                ticketFormData.append("image_ticket", formData.image_ticket);
            }
    
            const ticketResponse = await axios.post("http://localhost:5000/ticket/create", ticketFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    //Authorization: `Bearer ${token}`, // Gửi token trong header
                },
                withCredentials: true, // Gửi cookie cùng với yêu cầu
            });
            console.log("Ticket created successfully:", ticketResponse.data);
            alert("Sự kiện và vé đã được tạo thành công!");
            onSubmit(); // Gọi callback khi thành công
        } catch (error) {
            console.error("Error creating event or ticket:", error);
            alert("Đã xảy ra lỗi khi tạo sự kiện hoặc vé. Vui lòng thử lại.");
        }
    };

    return (
        <form className="space-y-10" onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-4">Tạo vé</h2>
            <div>
                <label htmlFor="noSale" className="font-medium text-gray-700 mb-2 flex items-center">
                    <input
                        id="noSale"
                        name="noSale"
                        type="checkbox"
                        checked={formData.noSale || false}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                    />
                    Không mở bán vé
                </label>
            </div>

            {!formData.noSale && (
                <>
                    <div>
                        <label htmlFor="ticketName" className="font-medium text-gray-700 mb-2">

                            Tên vé
                        </label>
                        <Input
                            id="ticketName"
                            name="ticketName"
                            type="text"
                            value={formData.ticketName || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex">
                        <div className="w-60">
                            <div className="mb-10">
                                <label htmlFor="ticketPrice" className="font-medium text-gray-700 mb-2">
                                    Giá vé
                                </label>
                                <Input
                                    id="ticketPrice"
                                    name="ticketPrice"
                                    type="number"
                                    value={formData.ticketPrice || 0}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="ticketQuantity" className="font-medium text-gray-700 mb-2">
                                    Số lượng vé
                                </label>
                                <Input
                                    id="ticketQuantity"
                                    name="ticketQuantity"
                                    type="number"
                                    value={formData.ticketQuantity || 0}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className=" ml-10">
                            <label htmlFor="description_ticket" className="font-medium text-gray-700 mb-2 mr-2">
                                Mô tả
                            </label>
                            <textarea
                                className=" w-160 h-34 rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 hover:scale-101"
                                id="description_ticket"
                                name="description_ticket"
                                value={formData.description_ticket || ""}
                                onChange={handleChange}>
                            </textarea>
                        </div>
                    </div>


                    <div className="flex">
                        <div className="w-56">
                            <label htmlFor="minPerOrder" className="font-medium text-gray-700 mb-2">
                                Số lượng tối thiểu mỗi lần đặt
                            </label>
                            <Input
                                id="minPerOrder"
                                name="minPerOrder"
                                type="number"
                                value={formData.minPerOrder || 0}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="ml-10">
                            <label htmlFor="maxPerOrder" className="font-medium text-gray-700 mb-2">
                                Số lượng tối đa mỗi lần đặt
                            </label>
                            <Input
                                id="maxPerOrder"
                                name="maxPerOrder"
                                type="number"
                                value={formData.maxPerOrder || 0}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex">
                        <div className="w-56">
                            <label htmlFor="saleStartTime" className="font-medium text-gray-700 mb-2">
                                Thời gian bắt đầu bán
                            </label>
                            <Input
                                id="saleStartTime"
                                name="saleStartTime"
                                type="datetime-local"
                                value={formData.saleStartTime || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="ml-10">
                            <label htmlFor="saleEndTime" className="font-medium text-gray-700 mb-2">
                                Thời gian kết thúc bán
                            </label>
                            <Input
                                id="saleEndTime"
                                name="saleEndTime"
                                type="datetime-local"
                                value={formData.saleEndTime || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>

                    <div>
                        <label htmlFor="image_ticket" className="font-medium text-gray-700 mb-2">
                            Ảnh vé
                        </label>
                        <Input
                            id="image_ticket"
                            name="image_ticket"
                            type="file"
                            accept="image_ticket/*"
                            onChange={handleFileChange}
                        />
                    </div>
                </>
            )}

            <div className="flex justify-between">
                <Button
                    type="button"
                    onClick={onBack}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-3 h-10 flex"
                >
                    Quay lại
                </Button>
                <Button
                    type="submit"
                    onClick={onSubmit}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-3 h-10 flex"
                >
                    Hoàn tất
                </Button>
            </div>
        </form>
    );
}