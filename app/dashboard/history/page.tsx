"use client";

import React, { useEffect, useState } from "react";
import { History, CalendarDays, Download } from "lucide-react";
import api from "@/utils/api";

type ForecastHistory = {
  id: string;
  jobId: string;
  createdDate: string;
  username?: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<ForecastHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await api.get("/api/forecast/history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Unpack from UserResponse wrapper
        const responseData = res.data;
        const historyData = responseData?.data ?? responseData;
        setHistory(Array.isArray(historyData) ? historyData : []);
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDownload = async (jobId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.post(
        `/api/download/excel/${jobId}`,
        { forecastDays: 15, transitTime: 7 },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `forecast_${jobId.slice(0, 8)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Download failed. File might be unavailable.");
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading history...</div>;
  }

  return (
    <main className="flex-grow p-6 w-full max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <History size={24} className="text-[#1c5ba9]" />
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Forecast History</h1>
      </div>

      {history.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500 shadow-sm">
          No forecast history found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded tracking-wider">
                  {item.username ? item.username.toUpperCase() : item.jobId.slice(0, 8).toUpperCase()}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                    <CalendarDays size={14} />
                    {new Date(item.createdDate).toLocaleDateString("en-GB")}
                  </div>
                  <button onClick={() => handleDownload(item.jobId)} className="text-[#1c5ba9] hover:bg-blue-50 p-1 rounded transition-colors" title="Download Excel">
                    <Download size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Forecast Job</span>
                  <span className="font-semibold text-gray-900 font-mono">{item.jobId.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Completed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
