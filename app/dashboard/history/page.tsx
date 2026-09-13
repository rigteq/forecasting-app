"use client";

import React, { useEffect, useState } from "react";
import { History, CalendarDays, Download, Eye, ArrowLeft, FileSpreadsheet, Loader2, Trash2, RefreshCw } from "lucide-react";
import api from "@/utils/api";
import { toast } from "react-toastify";

type ForecastResultDto = {
  partNumber: string;
  description: string;
  salesUnit: number;
  orderQty: number;
  category: string;
};

type ForecastHistory = {
  id: string;
  jobId: string;
  status?: string;
  errorMessage?: string;
  createdDate: string;
  username?: string;
  forecastData?: ForecastResultDto[];
};

export default function HistoryPage() {
  const [history, setHistory] = useState<ForecastHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<ForecastHistory | null>(null);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.get("/api/forecast/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const responseData = res.data;
      const historyData = responseData?.data ?? responseData;
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchHistory();
  };

  const handleDeleteHistory = async (historyId: string) => {
    if (!confirm("Are you sure you want to delete this forecast history record?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/api/forecast/history/${historyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("History record deleted");
      setHistory((prev) => prev.filter((item) => item.id !== historyId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete history record");
    }
  };

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

  const handleDownloadFormat = async (jobId: string, type: string) => {
    setDownloadingType(type);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.post(
        `/api/download/${type}/${jobId}`,
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
      a.download = `forecast_${jobId.slice(0, 8)}.${type === "excel" ? "xlsx" : type}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Download failed.");
    } finally {
      setDownloadingType(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading history...</div>;
  }

  if (selectedHistory) {
    const data = selectedHistory.forecastData || [];
    const totalRows = data.length;

    return (
      <div className="bg-gray-50 w-full max-w-7xl mx-auto rounded-lg shadow mt-4 h-[calc(100vh-120px)] overflow-hidden flex flex-col">
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border-b border-gray-200 gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setSelectedHistory(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <ArrowLeft size={20} /> Back to History
            </button>
            <div className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
              Total Rows : {totalRows}
            </div>
            <div className="text-sm font-mono text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg">
              Job: {selectedHistory.jobId.slice(0, 8).toUpperCase()}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
            {/* Excel */}
            <button
              onClick={() => handleDownloadFormat(selectedHistory.jobId, "excel")}
              disabled={downloadingType !== null}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-60"
            >
              {downloadingType === "excel" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Downloading...
                </>
              ) : (
                <>
                  <FileSpreadsheet size={16} /> Excel
                </>
              )}
            </button>

            {/* CSV */}
            <button
              onClick={() => handleDownloadFormat(selectedHistory.jobId, "csv")}
              disabled={downloadingType !== null}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-60"
            >
              {downloadingType === "csv" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Downloading...
                </>
              ) : (
                <>
                  <FileSpreadsheet size={16} /> CSV
                </>
              )}
            </button>

            {/* PDF */}
            <button
              onClick={() => handleDownloadFormat(selectedHistory.jobId, "pdf")}
              disabled={downloadingType !== null}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-60"
            >
              {downloadingType === "pdf" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Downloading...
                </>
              ) : (
                <>
                  <Download size={16} /> PDF
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 lg:p-6 flex-1 overflow-hidden">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto overflow-y-auto h-[calc(100vh-240px)] rounded-xl">
              <table className="w-full text-xs text-left table-fixed min-w-[600px] md:min-w-0">
                <thead className="bg-gray-100 text-gray-700 uppercase text-[10px] font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 w-[20%]">Part Number</th>
                    <th className="px-4 py-3 w-[40%]">Description</th>
                    <th className="px-4 py-3 w-[15%] text-right">Sales Unit</th>
                    <th className="px-4 py-3 w-[15%] text-right">Order Qty</th>
                    <th className="px-4 py-3 w-[10%] text-center">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    data.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium break-words">
                          {item.partNumber || '-'}
                        </td>
                        <td className="px-4 py-3 break-words">
                          {item.description || '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.salesUnit || 1}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-600">
                          {item.orderQty || 0}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold ${
                              item.category === 'A'
                                ? 'bg-red-100 text-red-700'
                                : item.category === 'B'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {item.category || 'C'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-grow p-6 w-full max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History size={24} className="text-[#1c5ba9]" />
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Forecast Results</h1>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
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
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                    <CalendarDays size={14} />
                    {new Date(item.createdDate).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
                  </div>
                  <button onClick={() => setSelectedHistory(item)} className="text-[#1c5ba9] hover:bg-blue-50 p-1.5 rounded transition-colors" title="View Details">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => handleDownload(item.jobId)} className="text-[#1c5ba9] hover:bg-blue-50 p-1.5 rounded transition-colors" title="Download Excel">
                    <Download size={16} />
                  </button>
                  <button onClick={() => handleDeleteHistory(item.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="Delete History">
                    <Trash2 size={16} />
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
                  {item.status === "PENDING" ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-1 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Pending
                    </span>
                  ) : item.status === "FAILED" ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-1 rounded" title={item.errorMessage}>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Failed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
