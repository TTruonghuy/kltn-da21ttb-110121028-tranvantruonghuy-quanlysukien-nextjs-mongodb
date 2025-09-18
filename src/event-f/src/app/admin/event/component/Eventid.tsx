"use client";
import EventDashboard from "@/app/components/event[organizer]/EventDashboard";

export default function Eventid({ eventId, onBack }: { eventId: string, onBack: () => void }) {
    return (
        <div>
            <button
                className="mb-2 px-4 py-1 ml-6 bg-gray-400 text-white rounded"
                onClick={onBack}
            >
                Trở lại
            </button>
            <EventDashboard eventId={eventId} />
        </div>
    );
}