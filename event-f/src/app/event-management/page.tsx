"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";
import EventManagementPage from "@/app/components/event[organizer]/EventManagementPage";
import AuthForm from "@/app/components/auth/AuthForm";

export default function EventManagement() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string; avatar?: string } | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/me", { withCredentials: true })
      .then((res) => {
        if (!res.data || !res.data.user) {
          router.push("/"); // chỉ chuyển về home
        } else {
          setUser(res.data.user);
        }
      })
      .catch(() => {
        router.push("/"); // chỉ chuyển về home
      })
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) return null;

  return (
    <>
      {showAuth && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] z-50">
          <AuthForm onClose={() => setShowAuth(false)} setUser={setUser} />
        </div>
      )}
      {!showAuth && <EventManagementPage />}
    </>
  );
}