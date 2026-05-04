"use client";

import React from "react";
import { CreditCard, Zap } from "lucide-react";

export default function BillingPage() {
  return (
    <main className="flex-grow p-6 w-full max-w-[1200px] mx-auto flex flex-col items-center justify-center h-[80vh]">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 flex flex-col items-center text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CreditCard size={40} className="text-[#1c5ba9]" />
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <Zap size={18} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-black tracking-widest text-[#1c5ba9] uppercase">Coming Soon</span>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Billing & Subscriptions</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          We are working on a comprehensive billing portal where you can manage your subscription plans, view payment history, and update billing methods.
        </p>
        
        <button className="px-6 py-3 bg-gray-100 text-gray-400 font-bold rounded shadow-sm cursor-not-allowed uppercase tracking-wide text-sm">
          Feature in Development
        </button>
      </div>
    </main>
  );
}
