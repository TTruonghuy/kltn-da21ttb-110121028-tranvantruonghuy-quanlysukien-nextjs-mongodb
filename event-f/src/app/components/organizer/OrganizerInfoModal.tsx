import React, { useState } from "react";
import { TiChevronLeft } from "react-icons/ti";

interface OrganizerInfoModalProps {
  open: boolean;
  onClose: () => void;
  organizer: any;
  onSave: (data: any) => void;
}

export default function OrganizerInfoModal({ open, onClose, organizer, onSave }: OrganizerInfoModalProps) {
  const [editData, setEditData] = useState(organizer || {});
  const [isEdit, setIsEdit] = useState(false);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editData);
    setIsEdit(false);
  };

  return (
    <div className="fixed inset-0 flex ml-75 mt-7">
      <div className="bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <button onClick={onClose} className="text-gray-500 hover:text-black flex hover:scale-105">
            <TiChevronLeft className="w-6 h-6"/> Trở lại
          </button>
          <h2 className="text-lg font-bold ml-90">Thông tin Ban tổ chức</h2>
          
        </div>
        {!isEdit ? (
          <div>
            <div className="mb-2"><b>Tên:</b> {organizer.name}</div>
            <div className="mb-2"><b>Email:</b> {organizer.email}</div>
            <div className="mb-2"><b>Mô tả:</b> {organizer.description || "--"}</div>
            <div className="mb-2"><b>Web:</b> {organizer.weblink || "--"}</div>
            <div className="mb-2"><b>Điện thoại:</b> {organizer.phone || "--"}</div>
            <div className="mb-2"><b>Địa chỉ:</b> {organizer.address || "--"}</div>
            <button onClick={() => setIsEdit(true)} className="bg-blue-600 text-white rounded px-4 py-2 mt-3">Chỉnh sửa</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input name="name" value={editData.name || ""} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Tên" />
            <input name="email" value={editData.email || ""} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Email" />
            <input name="phone" value={editData.phone || ""} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Điện thoại" />
            <input name="weblink" value={editData.weblink || ""} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Web" />
            <input name="address" value={editData.address || ""} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Địa chỉ" />
            <input name="description" value={editData.description || ""} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Mô tả" />
            <div className="flex gap-3 mt-3">
              <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Lưu</button>
              <button type="button" onClick={() => setIsEdit(false)} className="bg-gray-400 text-white rounded px-4 py-2">Hủy</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}