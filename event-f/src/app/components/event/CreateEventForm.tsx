"use client";
import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { TiImage, TiPencil, TiLocation, TiCalendarOutline } from "react-icons/ti";
import TinyMCEWrapper from "@/app/components/ui/TinyMCEWrapper";
import VietnameseAddressSelector from "@/app/components/ui/VietnameseAddressSelector";
import axios from "@/lib/axiosInstance";


export default function CreateEventForm() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        start_time: "",
        end_time: "",
        image: null as File | null,
    }); const originalConsoleError = console.error;


    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, image: file }));
    };

    const handleLocationChange = (address: string) => {
        setFormData((prev) => ({ ...prev, location: address }));
    };

    const token = localStorage.getItem('token');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.location || !formData.start_time || !formData.end_time) {   
            setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }

        try {

            const formDataToSend = new FormData();
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("location", formData.location);
            formDataToSend.append("start_time", new Date(formData.start_time).toISOString());
            formDataToSend.append("end_time", new Date(formData.end_time).toISOString());
            if (formData.image) {
                formDataToSend.append("image", formData.image);
            } else {
                console.error("No image selected");
            }
            console.log("FormData to send:", Object.fromEntries(formDataToSend.entries()));
            const response = await axios.post("/event/create", formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`, // Thay `token` bằng JWT hợp lệ
                },
            });

            //console.log("FormData to send:", Object.fromEntries(formDataToSend.entries()));
            alert("Sự kiện đã được tạo thành công!");
            console.log("Response:", response.data);
        } catch (err: any) {
            console.error("Error creating event:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Có lỗi xảy ra khi tạo sự kiện.");
        }
    };

    return (
        <form className="space-y-10" onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-4">Thông tin sự kiện </h2>
            {error && <p className="text-red-500">{error}</p>}
            <div>
                <label htmlFor="title" className="font-medium text-gray-700 mb-2 flex">
                    <TiPencil className="mt-1 mr-[2px]" /> Tiêu đề <p className="text-red-700 pl-1">*</p>
                </label>
                <Input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="image" className="block font-medium text-gray-700 mb-2">
                    Ảnh sự kiện
                </label>
                <div className="relative w-full bg-gray-100/50 rounded-md group">
                    <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-30"
                    />
                    {formData.image ? (
                        <div className="w-full aspect-[1280/720] overflow-hidden rounded-md border transition-opacity duration-300 p-5">
                            <img
                                src={URL.createObjectURL(formData.image)}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-0 left-0 w-full h-full bg-gray-200 rounded-md flex flex-col items-center justify-center text-gray-500 opacity-0 group-hover:opacity-80 transition-opacity duration-300 z-20">
                                <TiImage className="text-3xl mb-1 mt-2" />
                                <p className="mb-2">Chọn lại ảnh</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gray-200 rounded-md flex flex-col items-center justify-center text-gray-500 z-10">
                            <TiImage className="text-3xl mb-1 mt-2" />
                            <p className="mb-2">Chọn ảnh</p>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="description" className="font-medium text-gray-700 mb-2">
                    Mô tả
                </label>
                <TinyMCEWrapper value={formData.description}
                    onChange={(value) => handleChange({ target: { name: "description", value } } as React.ChangeEvent<HTMLInputElement>)} />
            </div>

            <div>
                <label htmlFor="location" className="flex font-medium text-gray-700 mb-2">
                    <TiLocation className="mt-1 mr-[2px]" /> Địa điểm <p className="text-red-700 pl-1">*</p>
                </label>
                <VietnameseAddressSelector
                    onAddressChange={handleLocationChange}
                   // initialAddress={formData.location}
                />
            </div>

            <div className="flex space-x-20">
                <div>
                    <label htmlFor="start_time" className="flex font-medium text-gray-700 mb-2">
                        <TiCalendarOutline className="mt-1 mr-[2px]" /> Thời gian bắt đầu <p className="text-red-700 pl-1">*</p>
                    </label>
                    <Input
                        id="start_time"
                        name="start_time"
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="end_time" className="flex font-medium text-gray-700 mb-2">
                        <TiCalendarOutline className="mt-1 mr-[2px]" /> Thời gian kết thúc <p className="text-red-700 pl-1">*</p>
                    </label>
                    <Input
                        id="end_time"
                        name="end_time"
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white py-3 h-10 flex"
                >
                    Tiếp tục
                </Button>
            </div>
        </form>
    );
}
