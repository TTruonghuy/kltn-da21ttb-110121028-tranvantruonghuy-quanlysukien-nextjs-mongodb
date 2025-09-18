"use client";
import { useRouter } from "next/navigation";

const eventTypes = [
  "âm nhạc",
  "văn hoá nghệ thuật",
  "thể thao",
  "khác",
];

export default function Filler() {
  const router = useRouter();

  const handleClick = (type: string) => {
    router.push(`/allevent?type=${encodeURIComponent(type)}`);
  };

  return (
    <>
      <div className="flex justify-between pr-10 items-center py-1 ">
        <div className="w-full bg-transparent flex items-center pl-7 space-x-4">
          {eventTypes.map((type) => (
            <button
              key={type}
              className="bg-white text-sm rounded-lg px-6 py-1 font-semibold text-blue-950 hover:bg-blue-50 hover:scale-102 transition border"
              onClick={() => handleClick(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>

          ))}
        </div>
        <div>
          <button className="whitespace-nowrap text-sm flex bg-white rounded-lg px-6 py-1 font-semibold text-blue-950 hover:bg-blue-50 hover:scale-102 transition border"
            onClick={() => router.push('/new')}>
            Bản tin
          </button>
        </div>
      </div>
    </>
  );
}