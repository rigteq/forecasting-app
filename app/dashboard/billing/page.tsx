"use client";

import React from "react";
import { CheckCircle2, CreditCard, Clock, Receipt, Zap } from "lucide-react";

export default function BillingPage() {
  return (
    <main className="flex-grow p-6 w-full max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <CreditCard size={28} className="text-[#1c5ba9]" />
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Billing & Subscriptions</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Current Plan */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#1c5ba9] text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-bl-lg">
              Active Plan
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Enterprise Forecasting</h2>
            <p className="text-sm text-gray-500 mb-6">Manage your monthly usage and subscription settings.</p>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#1c5ba9]">
                  <Zap size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Current Usage</div>
                  <div className="text-2xl font-black text-gray-900">42 <span className="text-sm font-semibold text-gray-500 lowercase">/ 100 Forecasts</span></div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Renewal Date</div>
                <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/> 01 Jun 2026</div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {['Unlimited historical data storage', 'Priority queue forecasting', 'Advanced PDF & Excel reports', '24/7 dedicated support'].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button className="px-6 py-2.5 bg-[#1c5ba9] text-white font-bold text-sm rounded shadow hover:bg-[#154682] transition-colors">
                Upgrade Plan
              </button>
              <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded shadow-sm hover:bg-gray-50 transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Invoices */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Receipt size={20} className="text-gray-400"/> Recent Invoices</h2>
          
          <div className="space-y-4">
            {[
              { id: "INV-2026-05", date: "May 01, 2026", amount: "₹4,999", status: "Paid" },
              { id: "INV-2026-04", date: "Apr 01, 2026", amount: "₹4,999", status: "Paid" },
              { id: "INV-2026-03", date: "Mar 01, 2026", amount: "₹4,999", status: "Paid" },
            ].map((inv, idx) => (
              <div key={idx} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-0.5">{inv.id}</div>
                  <div className="text-xs text-gray-500">{inv.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 mb-0.5">{inv.amount}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block">{inv.status}</div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 py-2 border border-gray-200 text-sm font-bold text-gray-600 rounded hover:bg-gray-50 transition-colors">
            View All History
          </button>
        </div>

      </div>
    </main>
  );
}
