"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "@/lib/axiosInstance";
import TinyMCEWrapper from "@/app/components/ui/TinyMCEWrapper";
import { useRouter } from "next/navigation";

interface News {
  _id: string;
  title: string;
  content: string;
  image: string;
}

export default function NewsAdminPage() {
  const [news, setNews] = useState<News[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editNews, setEditNews] = useState<News | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy danh sách bản tin
  useEffect(() => {
    axios.get("/new").then(res => setNews(res.data));
  }, []);

  // Xử lý upload ảnh lên Firebase (tham khảo các api khác)
  const handleImageUpload = async () => {
    if (!image) return "";
    const form = new FormData();
    form.append("file", image);
    const res = await axios.post("/upload", form, { withCredentials: true });
    return res.data.url;
  };

  // Mở modal tạo/sửa
  const openModal = (n?: News) => {
    if (n) {
      setEditNews(n);
      setTitle(n.title);
      setContent(n.content);
      setImageUrl(n.image);
    } else {
      setEditNews(null);
      setTitle("");
      setContent("");
      setImageUrl("");
      setImage(null);
    }
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setEditNews(null);
    setTitle("");
    setContent("");
    setImageUrl("");
    setImage(null);
  };

  // Tạo hoặc cập nhật bản tin
  const handleSave = async () => {
    setLoading(true);

    const form = new FormData();
    form.append("title", title);
    form.append("content", content);
    if (image) form.append("image", image);

    if (editNews) {
      // Sửa
      await axios.put(`/new/${editNews._id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Lấy lại danh sách bản tin mới
      const res = await axios.get("/new");
      setNews(res.data);
    } else {
      // Tạo mới
      await axios.post("/new/create", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Lấy lại danh sách bản tin mới
      const res = await axios.get("/new");
      setNews(res.data);
    }
    setLoading(false);
    closeModal();
  };

  // Xóa bản tin
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;
    await axios.delete(`/new/${id}`);
    setNews(news.filter(n => n._id !== id));
  };


    const handleLogout = async () => {
      if (!window.confirm("Bạn có chắc chắn muốn đăng xuất?")) return;
      try {
        await axios.post("/auth/logout", {}, { withCredentials: true });
        router.push("/");
      } catch (error) {
        console.error("Lỗi đăng xuất:", error);
      }
    };

    const router = useRouter();

  return (
    <div className="flex min-h-screen bg-[#f6f8fb]">
      <Sidebar onLogout={handleLogout} selected="Bản tin" />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900">Quản lý bản tin</h1>
          <button
            className="bg-blue-950 text-white px-4 py-2 rounded-lg"
            onClick={() => openModal()}
          >
            + Tạo bản tin
          </button>
        </div>
        <div className="mb-4 font-semibold">
          Tổng số bản tin: <span className="text-blue-600">{news.length}</span>
        </div>
        <table className="w-full text-sm bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 px-4">
              <th className="p-2 text-left pl-4">Ảnh</th>
              <th className="p-2 text-left">Tiêu đề</th>
              <th className="p-2 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {news.map(n => (
              <tr key={n._id} className="border-b hover:bg-blue-50">
                
                <td className="p-2 px-4">
                  {n.image && <img src={n.image} alt="" className="w-24 h-14 object-cover rounded" />}
                </td>
                <td className="p-2">{n.title}</td>
                <td className="p-2">
                  <button
                    className="bg-blue-800 text-white py-1 px-3 mr-2 rounded-lg"
                    onClick={() => openModal(n)}
                  >
                    Sửa
                  </button>
                  <button
                    className="bg-red-400 text-white py-1 px-3 rounded-lg hover:bg-red-200" 
                    onClick={() => handleDelete(n._id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal tạo/sửa bản tin */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="p-4 px-8 bg-white rounded-lg shadow-lg max-w-280 w-full relative">
              <h2 className="text-xl font-bold mb-2">{editNews ? "Sửa bản tin" : "Tạo bản tin"}</h2>


              <div className="mb-3 flex items-center justify-between">
                <div>
                <label className="font-semibold mr-2">Tiêu đề</label>
                <input
                  className="w-130 border rounded-lg p-1 px-2 mt-1"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
</div>
            <div>
                <label className="font-semibold mr-2">Ảnh</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImage(e.target.files?.[0] || null)}
                  className=" mt-1 border rounded-lg p-1 px-2"
                />
                {imageUrl && (
                  <img src={imageUrl} alt="" className="w-32 h-20 object-cover rounded mt-2" />
                )}
</div>
              </div>
              <div className="mb-3">
                <label className="font-semibold">Nội dung</label>
                <TinyMCEWrapper value={content} onChange={setContent} />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={closeModal}
                  type="button"
                >
                  Hủy
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={handleSave}
                  disabled={loading}
                  type="button"
                >
                  {loading ? "Đang lưu..." : (editNews ? "Cập nhật" : "Tạo mới")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}