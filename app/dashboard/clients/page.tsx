"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Users, ExternalLink } from "lucide-react";

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState("All Clients");
  const clients = [
    { id: "CL001", name: "Automotive Solutions Ltd", industry: "Manufacturing", status: "Active" },
    { id: "CL002", name: "Velocity Spare Parts", industry: "Retail", status: "Active" },
  ];

  const tabs = ["All Clients", "Active Clients", "Inactive Clients"];

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
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#1c5ba9] flex items-center gap-2 uppercase tracking-wide">
              <Users size={20} />
              Design Clients List
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search clients..." 
                className="pl-10 pr-4 py-2 border border-blue-100 bg-gray-50 font-semibold rounded focus:ring-1 focus:ring-[#1c5ba9]/30 focus:outline-none transition-all text-sm w-64" 
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-[#f0f4f8] text-gray-700 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-6 py-4 border-r border-gray-200">ID</th>
                  <th className="px-6 py-4 border-r border-gray-200">Company Name</th>
                  <th className="px-6 py-4 border-r border-gray-200">Industry</th>
                  <th className="px-6 py-4 border-r border-gray-200 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((client) => (
                  <tr 
                    key={client.id} 
                    className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-5 border-r border-gray-100 text-blue-600 font-bold font-mono">
                       {client.id}
                    </td>
                    <td className="px-6 py-5 border-r border-gray-100 font-bold text-gray-800">
                       {client.name}
                    </td>
                    <td className="px-6 py-5 border-r border-gray-100 font-semibold text-gray-600">
                       {client.industry}
                    </td>
                    <td className="px-6 py-5 border-r border-gray-100 text-center">
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ring-1 ring-emerald-200/50">
                            {client.status}
                        </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                        <Link 
                          href={`/dashboard/clients/${client.id}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1c5ba9] hover:bg-[#154682] text-white font-bold rounded shadow-sm text-xs transition-colors"
                        >
                            Open Dashboard <ExternalLink size={14} />
                        </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
