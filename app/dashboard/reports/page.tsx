"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Package,
  RefreshCw,
  Loader2,
  DollarSign,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import api from "@/utils/api";
import { toast } from "react-toastify";

type ForecastResultDto = {
  partNumber: string;
  description: string;
  salesUnit: number;
  orderQty: number;
  price?: number;
  value?: number;
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

export default function ReportsPage() {
  const [histories, setHistories] = useState<ForecastHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.get("/api/forecast/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const responseData = res.data;
      const historyData = responseData?.data ?? responseData;
      const valid = Array.isArray(historyData) ? historyData : [];
      setHistories(valid);
      if (valid.length > 0 && !selectedJobId) {
        // Default to latest completed run or latest run
        const latestCompleted = valid.find(h => h.status === "COMPLETED") || valid[0];
        setSelectedJobId(latestCompleted.jobId);
      }
    } catch (error) {
      console.error("Failed to load history for reports", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "ROLE_ADMIN" || role === "ADMIN") {
      setIsAdmin(true);
    }
    fetchHistory();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchHistory();
  };

  // Completed histories sorted oldest to newest for chronological trend charting
  const completedRuns = useMemo(() => {
    return histories
      .filter(h => h.status === "COMPLETED" && Array.isArray(h.forecastData) && h.forecastData.length > 0)
      .sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());
  }, [histories]);

  // Aggregate stats per run
  const runSummaries = useMemo(() => {
    return completedRuns.map(run => {
      const data = run.forecastData || [];
      const totalParts = data.length;
      const totalQty = data.reduce((sum, item) => sum + (item.orderQty || 0), 0);
      const totalValue = data.reduce((sum, item) => sum + (item.value || (item.orderQty || 0) * (item.price || 0)), 0);

      const catA = data.filter(i => (i.category || "C") === "A");
      const catB = data.filter(i => (i.category || "C") === "B");
      const catC = data.filter(i => (i.category || "C") === "C");

      const valA = catA.reduce((sum, i) => sum + (i.value || (i.orderQty || 0) * (i.price || 0)), 0);
      const valB = catB.reduce((sum, i) => sum + (i.value || (i.orderQty || 0) * (i.price || 0)), 0);
      const valC = catC.reduce((sum, i) => sum + (i.value || (i.orderQty || 0) * (i.price || 0)), 0);

      return {
        jobId: run.jobId,
        id: run.id,
        createdDate: run.createdDate,
        username: run.username,
        totalParts,
        totalQty,
        totalValue,
        valA,
        valB,
        valC,
        countA: catA.length,
        countB: catB.length,
        countC: catC.length,
      };
    });
  }, [completedRuns]);

  // Currently inspected run
  const activeRun = useMemo(() => {
    if (!selectedJobId) {
      return completedRuns.length > 0 ? completedRuns[completedRuns.length - 1] : null;
    }
    return completedRuns.find(r => r.jobId === selectedJobId) || (completedRuns.length > 0 ? completedRuns[completedRuns.length - 1] : null);
  }, [completedRuns, selectedJobId]);

  const activeRunSummary = useMemo(() => {
    if (!activeRun) return null;
    return runSummaries.find(s => s.jobId === activeRun.jobId) || null;
  }, [activeRun, runSummaries]);

  // Top 5 highest value parts in active run
  const topParts = useMemo(() => {
    if (!activeRun || !Array.isArray(activeRun.forecastData)) return [];
    return [...activeRun.forecastData]
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 5);
  }, [activeRun]);

  // Trend Chart Math
  const maxTrendValue = useMemo(() => {
    if (runSummaries.length === 0) return 1;
    const max = Math.max(...runSummaries.map(r => r.totalValue));
    return max > 0 ? max : 1;
  }, [runSummaries]);

  // CSV Export of Run Summaries
  const exportSummaryCsv = () => {
    if (runSummaries.length === 0) {
      toast.info("No data available to export");
      return;
    }
    const headers = ["Job ID,Date,User,Total Parts,Total Quantity,Total Order Value (INR),Category A Value,Category B Value,Category C Value"];
    const rows = runSummaries.map(r => [
      `"${r.jobId.slice(0, 8)}"`,
      `"${new Date(r.createdDate).toLocaleDateString("en-IN")}"`,
      `"${r.username || "Self"}"`,
      r.totalParts,
      r.totalQty,
      r.totalValue.toFixed(2),
      r.valA.toFixed(2),
      r.valB.toFixed(2),
      r.valC.toFixed(2)
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `forecast_reports_summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Summary report exported successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 size={20} className="animate-spin text-[#1c5ba9]" />
          Loading analytics & live reports...
        </div>
      </div>
    );
  }

  // 0 Histories Empty State
  if (histories.length === 0 || completedRuns.length === 0) {
    return (
      <main className="flex-grow p-6 w-full max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 size={28} className="text-[#1c5ba9]" />
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Analytics & Reports</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center max-w-xl mx-auto mt-6">
          <div className="w-16 h-16 bg-blue-50 text-[#1c5ba9] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">No Forecast History Available</h2>
          <p className="text-sm text-gray-500 mb-6">
            Run your first forecast from the dashboard to generate real-time replenishment trends, order value analytics, and ABC categorization reports.
          </p>
          <Link
            href={isAdmin ? "/dashboard" : "/user-dashboard"}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1c5ba9] hover:bg-[#154682] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <span>Go to Dashboard</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow p-6 w-full max-w-[1200px] mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 size={28} className="text-[#1c5ba9]" />
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Analytics & Reports</h1>
            <p className="text-xs text-gray-500">Live analytics derived from your recent {completedRuns.length} forecast history run(s)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={exportSummaryCsv}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-[#1c5ba9] rounded-lg shadow text-xs font-bold text-white hover:bg-[#154682] transition-colors cursor-pointer"
          >
            <Download size={14} /> Export Summary (CSV)
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      {activeRunSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Order Value</span>
              <div className="p-2 bg-blue-50 text-[#1c5ba9] rounded-lg">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">
              ₹{activeRunSummary.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">For Run {activeRunSummary.jobId.slice(0, 8).toUpperCase()}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Parts to Replenish</span>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Package size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {activeRunSummary.totalParts.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Unique part numbers</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Quantity</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {activeRunSummary.totalQty.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Total aggregate units</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category A Share</span>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <AlertCircle size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {activeRunSummary.totalValue > 0 ? ((activeRunSummary.valA / activeRunSummary.totalValue) * 100).toFixed(1) : "0"}%
            </div>
            <p className="text-[11px] text-gray-500 mt-1">{activeRunSummary.countA} Critical High-Value Parts</p>
          </div>
        </div>
      )}

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CHART 1: Historical Forecast Order Value Trend */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Historical Forecast Order Value</h2>
              <p className="text-xs text-gray-400">Order value progression across completed forecast runs</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {runSummaries.length} Run{runSummaries.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Responsive SVG Bar / Trend Chart */}
          <div className="relative h-64 w-full flex items-end justify-between gap-2 px-2 pt-8 border-b border-gray-200 pb-2">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-8 pt-4 z-0 pointer-events-none opacity-20">
              {[1, 0.75, 0.5, 0.25, 0].map(val => (
                <div key={val} className="w-full border-t border-gray-300"></div>
              ))}
            </div>

            {/* Bars for each run */}
            {runSummaries.map((summary, idx) => {
              const heightPct = Math.max(8, Math.round((summary.totalValue / maxTrendValue) * 100));
              const isSelected = activeRun?.jobId === summary.jobId;
              const formattedDate = new Date(summary.createdDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

              return (
                <div
                  key={summary.jobId}
                  onClick={() => setSelectedJobId(summary.jobId)}
                  className="flex flex-col items-center flex-1 h-full justify-end group relative cursor-pointer z-10"
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg z-30 pointer-events-none whitespace-nowrap text-center">
                    <p className="font-bold">₹{summary.totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                    <p className="text-gray-300 text-[9px]">{new Date(summary.createdDate).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[36px] rounded-t-md transition-all duration-200 ${
                      isSelected
                        ? "bg-[#1c5ba9] ring-2 ring-blue-300 ring-offset-1"
                        : "bg-blue-200 hover:bg-blue-300"
                    }`}
                  ></div>

                  {/* Label */}
                  <span className={`text-[10px] font-semibold mt-2 truncate w-full text-center ${isSelected ? "text-[#1c5ba9] font-bold" : "text-gray-500"}`}>
                    {formattedDate}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-3">
            <span>Click any bar to inspect run details</span>
            <span>Max Value: ₹{maxTrendValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* CHART 2: ABC Priority Category Breakdown */}
        {activeRunSummary && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">ABC Pareto Category Breakdown</h2>
                <p className="text-xs text-gray-400">Value and count split for Run {activeRunSummary.jobId.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <div className="space-y-4 my-auto">
              {/* Category A */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="font-bold text-gray-800">Category A (High Value)</span>
                  </div>
                  <span className="font-mono font-bold text-gray-900">
                    ₹{activeRunSummary.valA.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-gray-400 font-normal ml-1">
                      ({activeRunSummary.totalValue > 0 ? ((activeRunSummary.valA / activeRunSummary.totalValue) * 100).toFixed(1) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-red-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${activeRunSummary.totalValue > 0 ? (activeRunSummary.valA / activeRunSummary.totalValue) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">{activeRunSummary.countA} parts</div>
              </div>

              {/* Category B */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="font-bold text-gray-800">Category B (Medium Value)</span>
                  </div>
                  <span className="font-mono font-bold text-gray-900">
                    ₹{activeRunSummary.valB.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-gray-400 font-normal ml-1">
                      ({activeRunSummary.totalValue > 0 ? ((activeRunSummary.valB / activeRunSummary.totalValue) * 100).toFixed(1) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${activeRunSummary.totalValue > 0 ? (activeRunSummary.valB / activeRunSummary.totalValue) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">{activeRunSummary.countB} parts</div>
              </div>

              {/* Category C */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span className="font-bold text-gray-800">Category C (Low Value / Fast Moving)</span>
                  </div>
                  <span className="font-mono font-bold text-gray-900">
                    ₹{activeRunSummary.valC.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-gray-400 font-normal ml-1">
                      ({activeRunSummary.totalValue > 0 ? ((activeRunSummary.valC / activeRunSummary.totalValue) * 100).toFixed(1) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${activeRunSummary.totalValue > 0 ? (activeRunSummary.valC / activeRunSummary.totalValue) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">{activeRunSummary.countC} parts</div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
              <span>Total Replenishment Items: {activeRunSummary.totalParts}</span>
              <span className="font-semibold text-gray-700">Pareto Cumulative: 70% / 20% / 10%</span>
            </div>
          </div>
        )}
      </div>

      {/* TOP 5 HIGH-VALUE PARTS */}
      {topParts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Top High-Value Parts to Replenish</h2>
              <p className="text-xs text-gray-400">Highest financial impact items in selected run ({activeRun?.jobId.slice(0, 8).toUpperCase()})</p>
            </div>
            <Link
              href="/dashboard/history"
              className="text-xs font-semibold text-[#1c5ba9] hover:underline flex items-center gap-1"
            >
              View Full Item List <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-semibold border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3">Part Number</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Order Qty</th>
                  <th className="px-4 py-3 text-right">Price (₹)</th>
                  <th className="px-4 py-3 text-right">Value (₹)</th>
                  <th className="px-4 py-3 text-center">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topParts.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.partNumber}</td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{item.description || "-"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">{item.orderQty}</td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {item.price != null ? item.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      ₹{item.value != null ? item.value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                        {item.category || "A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORECAST RUN COMPARISON TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Forecast Run Comparisons</h2>
            <p className="text-xs text-gray-400">All recent {runSummaries.length} forecast execution results</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-semibold border-y border-gray-200">
              <tr>
                <th className="px-4 py-3">Job ID</th>
                <th className="px-4 py-3">Run Date</th>
                {isAdmin && <th className="px-4 py-3">User</th>}
                <th className="px-4 py-3 text-right">Parts</th>
                <th className="px-4 py-3 text-right">Total Units</th>
                <th className="px-4 py-3 text-right">Order Value (₹)</th>
                <th className="px-4 py-3 text-center">Critical (Cat A)</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {runSummaries.map((summary) => {
                const isSelected = activeRun?.jobId === summary.jobId;
                return (
                  <tr
                    key={summary.jobId}
                    className={`transition-colors cursor-pointer ${isSelected ? "bg-blue-50/60 font-semibold" : "hover:bg-gray-50"}`}
                    onClick={() => setSelectedJobId(summary.jobId)}
                  >
                    <td className="px-4 py-3 font-mono text-[#1c5ba9]">
                      {summary.jobId.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(summary.createdDate).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-gray-700">
                        {summary.username || "Self"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-gray-700">
                      {summary.totalParts}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {summary.totalQty.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      ₹{summary.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                        {summary.countA}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJobId(summary.jobId);
                        }}
                        className="text-xs text-[#1c5ba9] hover:underline font-bold"
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
