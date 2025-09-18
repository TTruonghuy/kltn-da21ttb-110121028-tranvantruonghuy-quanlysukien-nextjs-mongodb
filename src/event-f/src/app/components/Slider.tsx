import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  image: string;
  description: string;
}

export default function Slider() {
  const [events, setEvents] = useState<Event[]>([]);
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:5000/event/top-events")
      .then(res => res.json())
      .then(data => setEvents(data));
  }, []);

  if (events.length === 0) return <div>Đang tải...</div>;

  const handlePrev = () => setCurrent(prev => (prev === 0 ? events.length - 1 : prev - 1));
  const handleNext = () => setCurrent(prev => (prev === events.length - 1 ? 0 : prev + 1));

  return (
    <div className="relative w-full py-2 px-4 pb-0">
      <div className="flex justify-center items-center gap-6">
        <button className="absolute left-8 top-1/2 -translate-y-1/2  py-2 px-3 rounded-lg  bg-black/40 text-white z-10 hover:bg-black/70" onClick={handlePrev}>
          <span className="text-3xl">&#8249;</span>
        </button>
        <div className="flex gap-6 w-full justify-center">
          {[0, 1].map(offset => {
            const idx = (current + offset) % events.length;
            const event = events[idx];
            return (
              <div
                key={event.id}
                className="relative w-[700px] h-[350px] rounded-2xl overflow-hidden bg-black cursor-pointer group"
                onClick={() => router.push(`/event/${event.id}`)}
              >
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                
              </div>
            );
          })}
        </div>
        <button className="absolute right-8 top-1/2 -translate-y-1/2  py-2 px-3 rounded-lg  bg-black/40 text-white z-10 hover:bg-black/70" onClick={handleNext}>
          <span className="text-3xl">&#8250;</span>
        </button>
      </div>
      <div className="flex justify-center mt-4 gap-2">
        {events.map((_, idx) => (
          <span key={idx} className={`w-2 h-2 rounded-full ${idx === current ? "bg-green-400" : "bg-gray-400"}`} />
        ))}
      </div>
    </div>
  );
}