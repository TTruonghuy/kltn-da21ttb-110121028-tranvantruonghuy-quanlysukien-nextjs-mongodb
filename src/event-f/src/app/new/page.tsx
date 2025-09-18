"use client";
import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";

interface News {
    _id: string;
    title: string;
    image?: string;
    content: string;
    createdAt: string;
}

export default function NewsListPage() {
    const router = useRouter();

    const [news, setNews] = useState<News[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 10;


    useEffect(() => {
        axios
            .get("http://localhost:5000/auth/me", { withCredentials: true })
            .then((res) => {
                if (res.data && res.data.user) {
                    const fetchedUser = res.data.user;
                    setUser(fetchedUser);

                    // Nếu là admin thì chuyển hướng sang /admin
                    if (fetchedUser.role === "admin") {
                        router.push("/admin");
                    }
                }
            })
    }, []);

    useEffect(() => {
        fetch(`http://localhost:5000/new/list?page=${page}&limit=${limit}`)
            .then(res => res.json())
            .then(data => {
                setNews(data.items);
                setTotal(data.total);
            })
            .catch(err => console.error("Lỗi lấy danh sách tin:", err));
    }, [page]);

    const first = news[0];
    const secondAndThird = news.slice(1, 3);
    const remainingNews = news.slice(3);
    const [user, setUser] = useState<{ email: string; name: string; avatar?: string; role?: string } | null>(null);

    return (
        <div>
            <Header user={user} onLogout={() => { }} onShowAuth={() => { }} />
            <div className="px-2 py-1 bg-blue-100">
                <button className="pr-1 hover:underline"
                    onClick={() => router.push('/')}> Trang chủ</button>
                /<button className="pr-1 pl-1 hover:underline"
                    onClick={() => router.push('/new')}>Tin tức</button>
            </div>

            <div className="max-w-5xl mx-auto py-8 pt-4 px-4">
                <h3 className="text-xl font-bold mb-4">Bản tin mới nhất</h3>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    {/* Tin lớn bên trái */}
                    {first && (
                        <Link href={`/new/${first._id}`} className="col-span-2">
                            <div className="bg-white rounded shadow hover:shadow-lg transition cursor-pointer overflow-hidden h-full">
                                {first.image && (
                                    <img src={first.image} alt="" className="w-full h-64 object-cover" />
                                )}
                                <div className="p-4">
                                    <div className="font-bold text-xl">{first.title}</div>
                                    <div className="text-gray-500 text-sm mt-1">
                                        {new Date(first.createdAt).toLocaleString("vi-VN")}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* 2 tin nhỏ bên phải */}
                    <div className="flex flex-col gap-4">
                        {secondAndThird.map(n => (
                            <Link href={`/new/${n._id}`} key={n._id}>
                                <div className="gap-3 bg-white rounded shadow hover:bg-blue-50 cursor-pointer overflow-hidden">
                                    {n.image && (
                                        <img src={n.image} alt="" className="w-full h-30 object-cover" />
                                    )}
                                    <div className="flex flex-col justify-center p-2">
                                        <div className="font-semibold text-sm ">{n.title}</div>
                                        <div className="text-gray-500 text-xs">
                                            {new Date(n.createdAt).toLocaleString("vi-VN")}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {news.slice(3).map(n => (
                        <Link href={`/new/${n._id}`} key={n._id}>
                            <div className="flex h-full items-center gap-4 p-2 bg-white rounded shadow hover:bg-blue-50 cursor-pointer">
                                {n.image && (
                                    <img src={n.image} alt="" className="w-38 h-30 object-cover rounded" />
                                )}
                                <div>
                                    <div className="font-semibold text-[16px]">{n.title}</div>
                                    <div className="text-gray-500 text-xs">
                                        {new Date(n.createdAt).toLocaleString("vi-VN")}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Phân trang */}
                <div className="flex justify-center mt-6 gap-2">
                    {Array.from({ length: Math.ceil(total / limit) }).map((_, i) => (
                        <button
                            key={i}
                            className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-100 text-gray-500" : "bg-gray-200"
                                }`}
                            onClick={() => setPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
