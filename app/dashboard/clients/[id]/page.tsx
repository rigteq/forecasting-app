"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Info, FileSpreadsheet, Download, AlertCircle, Save, CheckCircle2 } from "lucide-react";

export default function ClientDashboard({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("Client Settings");
  const [isSaved, setIsSaved] = useState(false);
  
  // Client specific default values
  const [forecastDays, setForecastDays] = useState("15");
  const [transitTime, setTransitTime] = useState("7");
  const [orderFor, setOrderFor] = useState("All Part");
  const [stockType, setStockType] = useState("Below Safety Stock");

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const clientName = params.id === "CL001" ? "Automotive Solutions Ltd" : "Velocity Spare Parts";

  const tabs = [
    "Overview",
    "Current Stock",
    "Transit",
    "Back Order",
    "Forecasting",
    "Client Settings"
  ];

  return (
    <main className="flex-grow p-6 w-full max-w-[1400px] mx-auto flex flex-col gap-6">
      {/* Back button and page status */}
      <div className="flex items-center justify-between mb-4">
        <Link 
          href="/dashboard/clients"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold text-gray-700 transition-colors shadow-sm"
        >
          <ChevronLeft size={16} />
          Back to Clients
        </Link>
        <div className="flex items-center gap-3">
           <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Viewing Client Dashboard:</span>
           <span className="px-3 py-1 bg-blue-50 text-[#1c5ba9] rounded font-black text-sm uppercase ring-1 ring-blue-100">
             {clientName}
           </span>
        </div>
      </div>

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
        {/* Dynamic client settings section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-4">
             <div className="bg-blue-50/50 text-[#1c5ba9] px-4 py-3 rounded border-l-4 border-blue-500 font-bold text-sm flex items-center gap-3">
               <Info size={18} className="text-[#1c5ba9] shrink-0" />
               <span>
                 Master Configuration: Modify global forecasting parameters for {clientName}.
               </span>
             </div>
             
             {activeTab === "Client Settings" && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-2">
                    <div className="flex items-center mb-6">
                        <h2 className="text-xl font-bold text-[#1c5ba9] whitespace-nowrap uppercase tracking-wide">Client Forecasting Configuration</h2>
                        <div className="ml-4 h-[1px] bg-gray-200 flex-grow"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Safety Stock Days</label>
                            <select 
                                value={forecastDays}
                                onChange={(e) => setForecastDays(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1c5ba9]/50 transition-all cursor-pointer shadow-sm"
                            >
                                <option value="7">7 Days</option>
                                <option value="15">15 Days</option>
                                <option value="30">30 Days</option>
                            </select>
                            <p className="text-[10px] text-gray-400 font-medium italic mt-1 px-1">Used to calculate target inventory levels.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Logistics & Transit Time</label>
                            <select 
                                value={transitTime}
                                onChange={(e) => setTransitTime(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1c5ba9]/50 transition-all cursor-pointer shadow-sm"
                            >
                                <option value="3">3 Days (Express)</option>
                                <option value="7">7 Days (Standard)</option>
                                <option value="14">14 Days (Bulk)</option>
                            </select>
                            <p className="text-[10px] text-gray-400 font-medium italic mt-1 px-1">Account for vendor delivery schedules.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Reorder Channel</label>
                            <select 
                                value={orderFor}
                                onChange={(e) => setOrderFor(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1c5ba9]/50 transition-all cursor-pointer shadow-sm"
                            >
                                <option value="All Part">All Parts</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Counter">Counter</option>
                            </select>
                            <p className="text-[10px] text-gray-400 font-medium italic mt-1 px-1">Default channel for automated order generation.</p>
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 border border-dashed border-gray-300 p-6 rounded-lg self-end">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-black text-gray-900 uppercase tracking-widest italic">Sync Status</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Automated API Sync Enabled</span>
                            </div>
                            <div className="h-2 w-2 bg-[#1c5ba9] rounded-full animate-pulse shadow-[0_0_8px_rgba(28,91,169,0.5)]"></div>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-center pt-8 border-t border-gray-100">
                        <button 
                            onClick={handleSave}
                            className={`flex items-center gap-3 px-12 py-3.5 transition-all duration-500 font-black text-sm uppercase tracking-widest rounded shadow-lg ${
                                isSaved 
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 scale-95" 
                                : "bg-[#1c5ba9] text-white hover:bg-[#154682] shadow-blue-100"
                            }`}
                        >
                            {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                            {isSaved ? "Settings Updated" : "Save All Configuration"}
                        </button>
                    </div>
                </div>
             )}

             {activeTab !== "Client Settings" && (
                <div className="bg-gray-50/50 p-20 flex flex-col items-center justify-center text-center opacity-70 border border-gray-200 border-dashed rounded-lg">
                    <div className="p-5 bg-white rounded-full shadow-sm mb-4">
                        <FileSpreadsheet size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400">{activeTab} for {clientName}</h3>
                    <p className="text-gray-400 text-sm mt-1 max-w-sm">This section is being synchronized with the master database. Please check back shortly.</p>
                </div>
             )}
        </div>
      </div>
    </main>
  );
}
