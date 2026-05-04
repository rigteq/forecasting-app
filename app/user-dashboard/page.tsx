"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/");
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) return <div className="h-full w-full flex items-center justify-center bg-gray-50 text-[#1c5ba9] font-bold">Loading...</div>;

  return <DashboardClient role="USER" />;
}
