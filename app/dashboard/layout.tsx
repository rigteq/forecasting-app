"use client";

import React from "react";
import Header from "@/components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f5f8fa] font-sans text-gray-800 flex flex-col">
      <div className="h-[10%] min-h-[60px] flex-shrink-0 border-b border-gray-200 bg-white">
        <Header />
      </div>
      <div className="h-[90%] w-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
