"use client";
import { useState } from "react";
import axios from "@/lib/axiosInstance";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { TiImage } from "react-icons/ti";
import TinyMCEWrapper from "@/app/components/ui/TinyMCEWrapper";
import VietnameseAddressSelector from "@/app/components/ui/VietnameseAddressSelector";

export default function CreateEventForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("start_time", startTime);
      formData.append("end_time", endTime);
      if (image) {
        formData.append("image", image);
      }

      await axios.post("/event/create", formData, { withCredentials: true });
      alert("Sự kiện đã được tạo thành công!");
      onClose();
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title" className="block font-medium text-gray-700 mb-2">
            Tiêu đề
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-30"
            />
            {previewImage ? (
              <div className="w-full aspect-[1280/720] overflow-hidden rounded-md border transition-opacity duration-300 p-5">
                <img
                  src={previewImage}
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
          <label htmlFor="description" className="block font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <TinyMCEWrapper
            value={description}
            onChange={setDescription}
          />
        </div>

        <div>
          <label htmlFor="location" className="block font-medium text-gray-700 mb-2">
            Địa điểm
          </label>
          <VietnameseAddressSelector onAddressChange={(address) => setLocation(address)} />
        </div>

        <div>
          <label htmlFor="start_time" className="block font-medium text-gray-700 mb-2">
            Thời gian bắt đầu
          </label>
          <Input
            id="start_time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="end_time" className="block font-medium text-gray-700 mb-2">
            Thời gian kết thúc
          </label>
          <Input
            id="end_time"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "Tạo sự kiện"}
        </Button>
      </form>
    </div>
  );
}
