"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Users, LogOut, ChevronDown, FileText, History } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "ROLE_ADMIN" || role === "ADMIN") {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");

    if (!refreshToken) {
      localStorage.clear();
      router.replace("/");
      return;
    }

    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.clear();
      router.replace("/");
    }
  };

  return (
    <header className="bg-white h-full w-full px-6 flex items-center justify-between shadow-sm relative z-50">
      {/* Left spacer for centering */}
      <div className="w-32 hidden sm:block"></div>

      {/* Center Company Name */}
      <div className="flex-1 text-center">
        <Link href={isAdmin ? "/dashboard" : "/user-dashboard"}>
          <h1 className="text-2xl font-black tracking-widest text-[#1c5ba9] uppercase cursor-pointer hover:opacity-90 transition-opacity">
            Vardhan Enterprises
          </h1>
        </Link>
      </div>

      {/* Right Profile Dropdown */}
      <div className="w-32 flex justify-end relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-[#1c5ba9] rounded-full border border-gray-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1c5ba9]/50"
        >
          <User size={20} />
        </button>

        {isOpen && (
          <div className="absolute top-12 right-0 w-56 bg-white rounded-lg shadow-xl py-2 animate-in fade-in zoom-in duration-200 border border-gray-100">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1c5ba9] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User size={16} className="text-gray-400" />
              <span className="font-semibold">Profile</span>
            </Link>

            {isAdmin && (
              <Link
                href="/dashboard/clients"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1c5ba9] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Users size={16} className="text-gray-400" />
                <span className="font-semibold">Clients</span>
              </Link>
            )}

            <Link
              href="/dashboard/reports"
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1c5ba9] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FileText size={16} className="text-gray-400" />
              <span className="font-semibold">Reports</span>
            </Link>

            <Link
              href="/dashboard/history"
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1c5ba9] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <History size={16} className="text-gray-400" />
              <span className="font-semibold">History</span>
            </Link>

            <div className="h-px bg-gray-100 my-1 mx-2"></div>

            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut size={16} />
              <span className="font-semibold">Log Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
