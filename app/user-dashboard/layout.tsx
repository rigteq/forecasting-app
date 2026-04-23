"use client";

import React from "react";
import Header from "@/components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f8fa] font-sans text-gray-800 flex flex-col">
      <Header />
      {children}
    </div>
  );
}
