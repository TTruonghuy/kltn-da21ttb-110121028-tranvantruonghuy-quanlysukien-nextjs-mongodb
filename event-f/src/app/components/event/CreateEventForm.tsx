"use client";
import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { TiImage, TiPencil, TiLocation, TiCalendarOutline } from "react-icons/ti";
import TinyMCEWrapper from "@/app/components/ui/TinyMCEWrapper";
import VietnameseAddressSelector from "@/app/components/ui/VietnameseAddressSelector";
import axios from "@/lib/axiosInstance";

interface CreateEventFormProps {
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
    };
    onFormDataChange: (data: Partial<CreateEventFormProps["formData"]>) => void;
    onNext: () => void;
}

export default function CreateEventForm({ formData, onFormDataChange, onNext }: CreateEventFormProps) {


    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFormDataChange({ [name]: value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onFormDataChange({ image: file });
    };

    const handleLocationChange = (address: string) => {
        onFormDataChange({ location: address });
    };

    const token = localStorage.getItem('token');
    

    return (
        <form className="space-y-10" >
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

            <div className="space-y-2">
                <label className="font-medium text-gray-700 mb-2 flex">
                    <TiPencil className="mt-1 mr-[2px]" /> Loại sự kiện <p className="text-red-700 pl-1">*</p>
                </label>
                <div className="flex space-x-4 justufy-center items-center">
                    <label className={`flex items-center justify-center p-3 h-10 border rounded-lg cursor-pointer ${formData.event_type === "âm nhạc" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}>
                        <input
                            type="radio"
                            name="event_type"
                            value="âm nhạc"
                            checked={formData.event_type === "âm nhạc"}
                            onChange={handleChange}
                            required
                            className="hidden"
                        />
                        <span className=" font-semibold">Âm nhạc</span>
                    </label>

                    <label className={`flex items-center justify-center p-3 h-10 border rounded-lg cursor-pointer ${formData.event_type === "văn hóa nghệ thuật" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}>
                        <input
                            type="radio"
                            name="event_type"
                            value="văn hóa nghệ thuật"
                            checked={formData.event_type === "văn hóa nghệ thuật"}
                            onChange={handleChange}
                            required
                            className="hidden"
                        />
                        <span className=" font-semibold">Văn hóa nghệ thuật</span>
                    </label>

                    <label className={`flex items-center justify-center p-3 h-10 border rounded-lg cursor-pointer ${formData.event_type === "thể thao" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}>
                        <input
                            type="radio"
                            name="event_type"
                            value="thể thao"
                            checked={formData.event_type === "thể thao"}
                            onChange={handleChange}
                            required
                            className="hidden"
                        />
                        <span className=" font-semibold">Thể thao</span>
                    </label>

                    <label className={`flex items-center justify-center p-3 h-10 border rounded-lg cursor-pointer ${formData.event_type === "khác" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}>
                        <input
                            type="radio"
                            name="event_type"
                            value="khác"
                            checked={formData.event_type === "khác"}
                            onChange={handleChange}
                            required
                            className="hidden"
                        />
                        <span className=" font-semibold">Khác</span>
                    </label>

                </div>
            </div>

            <div>
                <label htmlFor="location" className="flex font-medium text-gray-700 mb-2">
                    <TiLocation className="mt-1 mr-[2px]" /> Địa điểm <p className="text-red-700 pl-1">*</p>
                </label>
                <VietnameseAddressSelector
                    houseNumber={formData.houseNumber}
                    ward={formData.ward}
                    district={formData.district}
                    province={formData.province}
                    onAddressChange={(data) => {
                        onFormDataChange({
                            houseNumber: data.houseNumber,
                            ward: data.ward,
                            district: data.district,
                            province: data.province,
                        });
                    }}
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
                    type="button"
                    className="bg-blue-500 hover:bg-blue-600 text-white py-3 h-10 flex"
                    onClick={onNext}
                >
                    Tiếp tục
                </Button>
            </div>
        </form>
    );
}
