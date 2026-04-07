"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Settings, User, Users, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const router = useRouter();

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
    <header className="bg-gradient-to-r from-[#1c5ba9] to-[#2b75d6] text-white shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 py-4">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold tracking-wide uppercase shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
            Vardhan Enterprises
          </h1>
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 rounded text-sm font-medium transition-colors shadow-sm"
          >
            <Settings size={18} className={`${isOpen ? 'rotate-90' : ''} transition-transform duration-300`} />
            <span>Settings</span>
            <ChevronDown size={14} className={`${isOpen ? 'rotate-180' : ''} transition-transform duration-300`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200 border border-gray-100">
              <Link
                href="/dashboard/clients"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1c5ba9] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Users size={16} className="text-gray-400" />
                <span className="font-semibold">Clients</span>
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1c5ba9] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User size={16} className="text-gray-400" />
                <span className="font-semibold">Profile</span>
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
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
