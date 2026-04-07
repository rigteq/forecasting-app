"use client";

import React, { useState } from "react";
import { User, Mail, Phone, ShieldCheck, MapPin, Camera } from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Profile Details");

  const tabs = ["Profile Details", "Security Settings", "Activity History"];

  return (
    <main className="flex-grow p-6 w-full max-w-[1400px] mx-auto flex flex-col gap-6">
      <div className="flex flex-wrap gap-1 border-b border-gray-300 pb-[1px]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-semibold transition-all duration-200 border-t border-l border-r rounded-t-lg shadow-sm ${
              activeTab === tab
                ? "bg-[#1c5ba9] text-white border-[#1c5ba9] translate-y-[1px]"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
        <div className="flex-grow bg-white border-b border-gray-300 rounded-tr-lg"></div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
            <div className="flex flex-col md:flex-row items-center gap-10 mb-12 pb-10 border-b border-gray-50">
                <div className="relative">
                    <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl text-[#1c5ba9] font-black shadow-inner ring-4 ring-white ring-offset-2 ring-gray-100 uppercase">
                        VE
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2.5 bg-[#1c5ba9] text-white rounded-xl shadow-lg hover:bg-[#154682] transition-all hover:scale-110 active:scale-95">
                        <Camera size={18} />
                    </button>
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Vardhan Admin Portal</h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                        <span className="bg-blue-50 text-[#1c5ba9] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-blue-100">
                            Super Administrator
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-emerald-100">
                            Verified Master Account
                        </span>
                    </div>
                    <p className="text-gray-400 font-medium mt-4 text-sm max-w-lg leading-relaxed italic">Managing global inventory and forecasting parameters for Vardhan Enterprises since 2022.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-1.5 px-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                        <Mail size={12} className="text-[#1c5ba9]" />
                        Professional Email Address
                    </label>
                    <p className="text-base font-bold text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">admin@rigteq.com</p>
                </div>

                <div className="space-y-1.5 px-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                        <Phone size={12} className="text-[#1c5ba9]" />
                        Verified Mobile Number
                    </label>
                    <p className="text-base font-bold text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">+91 88229 91100</p>
                </div>

                <div className="space-y-1.5 px-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                        <ShieldCheck size={12} className="text-[#1c5ba9]" />
                        Access Permission Tier
                    </label>
                    <p className="text-base font-bold text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">Full Administrative Access (Master)</p>
                </div>

                <div className="space-y-1.5 px-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                        <MapPin size={12} className="text-[#1c5ba9]" />
                        Registered Region
                    </label>
                    <p className="text-base font-bold text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">India (Western Division)</p>
                </div>
            </div>

            <div className="mt-16 flex justify-center md:justify-end gap-4 border-t border-gray-50 pt-10">
                 <button className="px-10 py-3 border border-[#1c5ba9] text-[#1c5ba9] font-black rounded text-[10px] uppercase tracking-widest transition-all hover:bg-blue-50 active:scale-95">
                    Update Password
                 </button>
                 <button className="px-10 py-3 bg-[#1c5ba9] text-white font-black rounded text-[10px] uppercase tracking-widest transition-all hover:bg-[#154682] active:scale-95 shadow-lg shadow-blue-100">
                    Save Profile Changes
                 </button>
            </div>
        </div>
      </div>
    </main>
  );
}
