"use client";

import React from "react";
import { BarChart, TrendingUp, Filter, Download } from "lucide-react";

export default function ReportsPage() {
  return (
    <main className="flex-grow p-6 w-full max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BarChart size={28} className="text-[#1c5ba9]" />
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Analytics & Reports</h1>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1c5ba9] rounded shadow text-sm font-bold text-white hover:bg-[#154682]">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Total Order MRP Chart Mockup */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Total Order MRP (In Lakhs)</h2>
            <div className="text-sm font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">2026-2027</div>
          </div>
          
          <div className="relative h-64 w-full flex items-end justify-between gap-2 px-4 pt-10 border-b border-gray-200 pb-2">
            {/* Absolute Line Mock */}
            <svg className="absolute inset-0 h-[80%] w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M5,40 L15,50 L25,55 L35,58 L45,60 L55,55 L65,65 L75,70 L85,85 L95,88" fill="none" stroke="#1c5ba9" strokeWidth="2" strokeDasharray="4 4" className="opacity-50"/>
              <path d="M5,45 L15,55 L25,58 L35,60 L45,65 L55,60 L65,70 L75,80 L85,88 L95,90" fill="none" stroke="#1c5ba9" strokeWidth="3"/>
            </svg>
            
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-8 pt-4 z-0 pointer-events-none opacity-20">
              {[6, 5, 4, 3, 2, 1, 0].map(val => (
                <div key={val} className="w-full border-t border-gray-300"></div>
              ))}
            </div>
            
            {/* Y Axis Labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between py-2 text-[10px] font-bold text-gray-400 z-10">
              <span>6</span><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span><span>0</span>
            </div>
            
            {/* Data Points */}
            {[
              { m: "Apr-26", v: 5.4 }, { m: "May-26", v: 4.42 }, { m: "Jun-26", v: 4.32 },
              { m: "Jul-26", v: 4.22 }, { m: "Aug-26", v: 4.11 }, { m: "Sep-26", v: 4.01 },
              { m: "Oct-26", v: 4.21 }, { m: "Nov-26", v: 3.81 }, { m: "Dec-26", v: 3.51 },
              { m: "Jan-27", v: 2.70 }, { m: "Feb-27", v: 2.61 }, { m: "Mar-27", v: 2.51 }
            ].map((d, i) => (
              <div key={i} className="flex flex-col items-center z-10 w-full group relative">
                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded z-20 pointer-events-none">{d.v}</div>
                <div className="w-2 h-2 rounded-full bg-white border-2 border-[#1c5ba9] group-hover:scale-150 transition-transform" style={{ marginBottom: `${(d.v / 6) * 100}%` }}></div>
                <div className="text-[9px] font-bold text-gray-400 mt-2 rotate-45 origin-left">{d.m}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Stock Value Chart Mockup */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Current Stock Value (In Lakhs)</h2>
            <div className="text-sm font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">2026-2027</div>
          </div>
          
          <div className="relative h-64 w-full flex items-end justify-between gap-2 px-4 pt-10 border-b border-gray-200 pb-2">
            {/* Absolute Line Mock */}
            <svg className="absolute inset-0 h-[80%] w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M5,20 L15,30 L25,32 L35,38 L45,40 L55,42 L65,41 L75,43 L85,45 L95,65" fill="none" stroke="#1c5ba9" strokeWidth="3"/>
            </svg>
            
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-8 pt-4 z-0 pointer-events-none opacity-20">
              {[12, 10, 8, 6, 4, 2, 0].map(val => (
                <div key={val} className="w-full border-t border-gray-300"></div>
              ))}
            </div>
            
            {/* Y Axis Labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between py-2 text-[10px] font-bold text-gray-400 z-10">
              <span>12</span><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span><span>0</span>
            </div>
            
            {/* Data Points */}
            {[
              { m: "Apr-26", v: 10.5 }, { m: "May-26", v: 9.5 }, { m: "Jun-26", v: 9.3 },
              { m: "Jul-26", v: 8.81 }, { m: "Aug-26", v: 8.68 }, { m: "Sep-26", v: 8.36 },
              { m: "Oct-26", v: 8.33 }, { m: "Nov-26", v: 8.31 }, { m: "Dec-26", v: 8.18 },
              { m: "Jan-27", v: 8.06 }, { m: "Feb-27", v: 7.94 }, { m: "Mar-27", v: 6.5 }
            ].map((d, i) => (
              <div key={i} className="flex flex-col items-center z-10 w-full group relative">
                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded z-20 pointer-events-none">{d.v}</div>
                <div className="w-0 h-0 group-hover:w-2 group-hover:h-2 rounded-full bg-[#1c5ba9] transition-all" style={{ marginBottom: `${(d.v / 12) * 100}%` }}></div>
                <div className="text-[9px] font-bold text-gray-400 mt-2 rotate-45 origin-left">{d.m}</div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
      
      {/* Table Data Preview */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Quarterly Aggregate Data</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-4 py-3 font-bold">Metric</th>
                <th className="px-4 py-3 font-bold text-right">Q1 2026</th>
                <th className="px-4 py-3 font-bold text-right">Q2 2026</th>
                <th className="px-4 py-3 font-bold text-right">Q3 2026</th>
                <th className="px-4 py-3 font-bold text-right">Q4 2026</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-bold text-gray-900">Total Order MRP</td>
                <td className="px-4 py-3 text-right">14.14</td>
                <td className="px-4 py-3 text-right">12.34</td>
                <td className="px-4 py-3 text-right">11.53</td>
                <td className="px-4 py-3 text-right">7.82</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-bold text-gray-900">Current Stock</td>
                <td className="px-4 py-3 text-right">29.30</td>
                <td className="px-4 py-3 text-right">25.85</td>
                <td className="px-4 py-3 text-right">24.82</td>
                <td className="px-4 py-3 text-right">22.50</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
