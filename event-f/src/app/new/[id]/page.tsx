"use client";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Filler from "../../components/Filler";
import Footer from "../../components/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

interface News {
  _id: string;
  title: string;
  image?: string;
  content: string;
  createdAt: string;
}

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [news, setNews] = useState<News | null>(null);
  const [others, setOthers] = useState<News[]>([]);

  useEffect(() => {
    fetch(`http://localhost:5000/new/${id}`)
      .then(res => res.json())
      .then(data => {
        setNews(data.news);
        setOthers(data.others);
      });
  }, [id]);

  if (!news) return <div>Đang tải...</div>;

  return (
    <div>
      <Header user={null} onLogout={() => { }} onShowAuth={() => { }} />
      <div className="px-2 py-1 bg-blue-100 mb-4">
        <button className="pr-1 hover:underline"
          onClick={() => router.push('/')}> Trang chủ</button>
        /<button className="pr-1 pl-1 hover:underline"
          onClick={() => router.push('/new')}>Tin tức</button>
        /<span className="pr-1 pl-1">{news.title}</span>
      </div>
      <div className="max-w-5xl mx-auto py-4 pt-4 px-4 flex gap-8">
        {/* Cột trái: chi tiết bản tin */}
       
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-4">{news.title}</h1>
          {news.image && (
            <img src={news.image} alt="" className="w-full max-h-80 object-cover rounded mb-4" />
          )}
          <div className="prose" dangerouslySetInnerHTML={{ __html: news.content }} />
        </div>
        {/* Cột phải: các bản tin khác */}
        <div className="w-72 border-l pl-4">
          <h2 className="font-semibold mb-3">Bản tin khác</h2>
          <div className="space-y-3">
            {others.map(n => (
              <Link href={`/new/${n._id}`} key={n._id}>
                <div className="border-b pb-4 p-2 hover:bg-blue-50 cursor-pointer mb-2 ">
                  <div>
                    {n.image && <img src={n.image} alt="" className="w-full max-h-40 object-cover rounded" />}
                  </div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString("vi-VN")}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}