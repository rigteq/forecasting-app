"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Zap,
  Plus,
  Trash2,
  Pencil,
  Copy,
  Check,
  AlertCircle,
  X,
  ShieldCheck,
  Building2,
  Tag,
  Loader2,
  PauseCircle,
  PlayCircle,
  XCircle,
  Download,
  Filter,
  RotateCcw
} from "lucide-react";
import { toast } from "react-toastify";
import api from "@/utils/api";
import Pagination from "@/components/Pagination";

type Subscription = {
  id: string;
  userId: string;
  username: string;
  planName: string;
  durationMonths: number;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
  status: string; // PENDING, ACTIVE, PAUSED, TERMINATED, REJECTED
  startDate?: string;
  endDate?: string;
  paymentReference?: string;
  createdDate: string;
};

type Coupon = {
  id: string;
  name: string;
  code: string;
  discountPercent: number;
  validFrom: string;
  validTill: string;
  isActive: boolean;
};

const PLANS = [
  {
    name: "3 Months",
    durationMonths: 3,
    price: 5999,
    perMonth: "₹1,999/mo",
    description: "Great for seasonal businesses & short-term forecasting needs.",
    features: ["All forecasting models", "Full Excel & PDF exports", "Up to 500 orders/run", "Standard email support"],
    badge: null,
  },
  {
    name: "6 Months",
    durationMonths: 6,
    price: 9999,
    perMonth: "₹1,666/mo",
    description: "Best for growing businesses aiming for consistent inventory turns.",
    features: ["Priority processing queue", "Unlimited order forecasting", "Part price matching cache", "Priority phone & email support"],
    badge: "Most Popular",
  },
  {
    name: "12 Months",
    durationMonths: 12,
    price: 17999,
    perMonth: "₹1,499/mo",
    description: "Maximum savings and dedicated priority support for high-volume enterprises.",
    features: ["All Enterprise features", "Dedicated account manager", "Custom data ingestion", "24/7 priority support"],
    badge: "Best Value",
  },
];

export default function BillingPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // User State
  const [activeSub, setActiveSub] = useState<Subscription | null>(null);
  const [pendingSub, setPendingSub] = useState<Subscription | null>(null);
  const [myHistory, setMyHistory] = useState<Subscription[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<(typeof PLANS)[0] | "custom">(PLANS[1]);
  const [customMonths, setCustomMonths] = useState(4);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Admin State
  const [allSubs, setAllSubs] = useState<Subscription[]>([]);
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState({
    name: "",
    code: "",
    discountPercent: 10,
    validFrom: new Date().toISOString().split("T")[0],
    validTill: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    isActive: true,
  });

  // Admin Subscriptions Filter & Pagination State
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPlan, setFilterPlan] = useState("ALL");
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const [subPage, setSubPage] = useState(1);
  const [subPageSize, setSubPageSize] = useState(10);

  const [couponPage, setCouponPage] = useState(1);
  const [couponPageSize, setCouponPageSize] = useState(10);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(5);

  const handleResetFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterMinAmount("");
    setFilterMaxAmount("");
    setFilterStatus("ALL");
    setFilterPlan("ALL");
    setSubPage(1);
  };

  const handleExportSubscriptionsExcel = async () => {
    setIsExportingExcel(true);
    try {
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams();
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);
      if (filterMinAmount) params.append("minAmount", filterMinAmount);
      if (filterMaxAmount) params.append("maxAmount", filterMaxAmount);
      if (filterStatus !== "ALL") params.append("status", filterStatus);
      if (filterPlan !== "ALL") params.append("plan", filterPlan);

      const res = await api.get(`/api/subscription/admin/export-excel?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscriptions_summary_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Subscriptions report exported successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export subscriptions report");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const filteredSubs = allSubs.filter((s) => {
    if (filterStartDate) {
      const sDate = s.createdDate ? s.createdDate.split("T")[0] : "";
      if (sDate && sDate < filterStartDate) return false;
    }
    if (filterEndDate) {
      const sDate = s.createdDate ? s.createdDate.split("T")[0] : "";
      if (sDate && sDate > filterEndDate) return false;
    }
    const finalAmt = s.finalAmount != null ? s.finalAmount : s.amount;
    if (filterMinAmount !== "" && finalAmt < Number(filterMinAmount)) return false;
    if (filterMaxAmount !== "" && finalAmt > Number(filterMaxAmount)) return false;
    if (filterStatus !== "ALL" && s.status !== filterStatus) return false;
    if (filterPlan !== "ALL" && !s.planName?.toLowerCase().includes(filterPlan.toLowerCase())) return false;
    return true;
  });

  const paginatedSubs = filteredSubs.slice((subPage - 1) * subPageSize, subPage * subPageSize);
  const paginatedCoupons = allCoupons.slice((couponPage - 1) * couponPageSize, couponPage * couponPageSize);
  const paginatedHistory = myHistory.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const adminCheck = role === "ROLE_ADMIN" || role === "ADMIN";
    setIsAdmin(adminCheck);

    if (adminCheck) {
      fetchAdminData();
    } else {
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/subscription/my");
      const data = res.data?.data || {};
      setActiveSub(data.active || null);
      setPendingSub(data.pending || null);
      setMyHistory(Array.isArray(data.history) ? data.history : []);
    } catch {
      toast.error("Failed to load subscription status");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [subsRes, couponsRes] = await Promise.all([
        api.get("/api/subscription/admin/all"),
        api.get("/api/subscription/admin/coupons"),
      ]);
      setAllSubs(subsRes.data?.data || []);
      setAllCoupons(couponsRes.data?.data || []);
    } catch {
      toast.error("Failed to load admin billing data");
    } finally {
      setLoading(false);
    }
  };

  // Helper for current calculated amounts
  const getPlanDetails = () => {
    if (selectedPlan === "custom") {
      const price = customMonths * 1800;
      return {
        name: `Custom (${customMonths} Months)`,
        durationMonths: customMonths,
        price,
      };
    }
    return {
      name: selectedPlan.name,
      durationMonths: selectedPlan.durationMonths,
      price: selectedPlan.price,
    };
  };

  const currentPlanDetails = getPlanDetails();
  const currentBasePrice = currentPlanDetails.price;
  const currentDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const currentFinalPrice = Math.max(0, currentBasePrice - currentDiscount);

  // Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    try {
      const res = await api.post(
        `/api/subscription/validate-coupon?code=${encodeURIComponent(couponCode.trim())}&amount=${currentBasePrice}`
      );
      const data = res.data?.data;
      setAppliedCoupon(data);
      toast.success(`Coupon "${data.code}" applied: ${data.discountPercent}% OFF!`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Invalid or expired coupon code");
      setAppliedCoupon(null);
    }
  };

  // Copy helper
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.info(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // User submits manual payment
  const handleConfirmSubscribe = async () => {
    setIsSubmittingSub(true);
    try {
      await api.post("/api/subscription/subscribe", {
        planName: currentPlanDetails.name,
        durationMonths: currentPlanDetails.durationMonths,
        amount: currentBasePrice,
        couponCode: appliedCoupon?.code || undefined,
        paymentReference: paymentRef.trim() || undefined,
      });

      toast.success("Subscription requested successfully! Pending admin approval.");
      setIsPayModalOpen(false);
      setPaymentRef("");
      fetchUserData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to submit subscription request");
    } finally {
      setIsSubmittingSub(false);
    }
  };

  // Admin Actions
  const handleUpdateSubStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/subscription/admin/${id}/status?status=${status}`);
      toast.success(`Subscription marked as ${status}`);
      fetchAdminData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || `Failed to update status to ${status}`);
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await api.put(`/api/subscription/admin/coupons/${editingCoupon.id}`, couponForm);
        toast.success("Coupon updated successfully");
      } else {
        await api.post("/api/subscription/admin/coupons", couponForm);
        toast.success("Coupon created successfully");
      }
      setIsCouponModalOpen(false);
      setEditingCoupon(null);
      fetchAdminData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to save coupon");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.delete(`/api/subscription/admin/coupons/${id}`);
      toast.success("Coupon deleted successfully");
      fetchAdminData();
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <main className="flex-grow p-6 w-full max-w-[1300px] mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#1c5ba9]" size={36} />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Loading Billing Details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow p-4 sm:p-6 w-full max-w-[1300px] mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#1c5ba9] rounded-lg">
            <CreditCard size={26} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {isAdmin ? "Admin Subscription & Revenue Management" : "Billing & Subscription"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {isAdmin ? "Manage client subscriptions, approval queue, and promotional coupon codes." : "Manage your license, access tier, and subscription renewal."}
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADMIN VIEW */}
      {/* ======================================================== */}
      {isAdmin ? (
        <div className="flex flex-col gap-8">
          {/* Section 1: Subscriptions List */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1c5ba9] uppercase tracking-wide flex items-center gap-2">
                  <ShieldCheck size={20} />
                  Client Subscriptions ({filteredSubs.length} of {allSubs.length})
                </h2>
                <p className="text-xs text-gray-500">Review pending payments, approve access, pause, or terminate subscriptions.</p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-gray-50/70 border border-gray-200 rounded-lg p-3.5 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <Filter size={14} className="text-[#1c5ba9]" />
                  <span>Filter Subscriptions</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                  <button
                    onClick={handleExportSubscriptionsExcel}
                    disabled={isExportingExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c5ba9] hover:bg-[#154682] text-white text-xs font-bold rounded shadow-sm transition-colors disabled:opacity-60"
                  >
                    {isExportingExcel ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Download size={13} />
                    )}
                    <span>Download Excel Report</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">From Date</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => { setFilterStartDate(e.target.value); setSubPage(1); }}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium focus:ring-1 focus:ring-[#1c5ba9] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">To Date</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => { setFilterEndDate(e.target.value); setSubPage(1); }}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium focus:ring-1 focus:ring-[#1c5ba9] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Min Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={filterMinAmount}
                    onChange={(e) => { setFilterMinAmount(e.target.value); setSubPage(1); }}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium focus:ring-1 focus:ring-[#1c5ba9] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Max Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={filterMaxAmount}
                    onChange={(e) => { setFilterMaxAmount(e.target.value); setSubPage(1); }}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium focus:ring-1 focus:ring-[#1c5ba9] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setSubPage(1); }}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold focus:ring-1 focus:ring-[#1c5ba9] outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="TERMINATED">Terminated</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Plan</label>
                  <select
                    value={filterPlan}
                    onChange={(e) => { setFilterPlan(e.target.value); setSubPage(1); }}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold focus:ring-1 focus:ring-[#1c5ba9] outline-none"
                  >
                    <option value="ALL">All Plans</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="12 Months">12 Months</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#f0f4f8] text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 border-r border-gray-200">User</th>
                    <th className="px-4 py-3 border-r border-gray-200">Plan</th>
                    <th className="px-4 py-3 border-r border-gray-200">Amount Paid</th>
                    <th className="px-4 py-3 border-r border-gray-200">Coupon</th>
                    <th className="px-4 py-3 border-r border-gray-200">Bank / UTR Ref</th>
                    <th className="px-4 py-3 border-r border-gray-200">Period</th>
                    <th className="px-4 py-3 border-r border-gray-200 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400 font-medium">
                        No subscriptions match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedSubs.map((sub) => (
                      <tr key={sub.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-4 py-3 font-bold text-gray-900 border-r border-gray-100">{sub.username}</td>
                        <td className="px-4 py-3 font-semibold text-gray-700 border-r border-gray-100">
                          {sub.planName}
                          <span className="text-xs text-gray-400 block font-normal">{sub.durationMonths} Months</span>
                        </td>
                        <td className="px-4 py-3 font-black text-gray-800 border-r border-gray-100">
                          ₹{sub.finalAmount?.toLocaleString("en-IN")}
                          {sub.discountAmount > 0 && (
                            <span className="block text-[11px] text-emerald-600 font-semibold">
                              Saved ₹{sub.discountAmount}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono font-bold text-gray-600 border-r border-gray-100">
                          {sub.couponCode ? (
                            <span className="bg-blue-50 text-[#1c5ba9] px-2 py-0.5 rounded border border-blue-200">
                              {sub.couponCode}
                            </span>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-700 border-r border-gray-100">
                          {sub.paymentReference ? (
                            <span className="bg-gray-50 px-2 py-1 rounded border border-gray-200 font-bold">
                              {sub.paymentReference}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Not provided</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 border-r border-gray-100">
                          {sub.status === "PENDING" ? (
                            <span className="text-amber-600 font-medium">Awaiting Approval</span>
                          ) : (
                            <div>
                              <span>{formatDate(sub.startDate)}</span>
                              <span className="text-gray-400"> → </span>
                              <span className="font-bold">{formatDate(sub.endDate)}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-100">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              sub.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : sub.status === "PENDING"
                                ? "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
                                : sub.status === "PAUSED"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {sub.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleUpdateSubStatus(sub.id, "ACTIVE")}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded flex items-center gap-1 shadow-sm transition-colors"
                                  title="Approve & Activate"
                                >
                                  <Check size={14} /> Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateSubStatus(sub.id, "REJECTED")}
                                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded flex items-center gap-1 border border-red-200 transition-colors"
                                  title="Reject Payment"
                                >
                                  <X size={14} /> Reject
                                </button>
                              </>
                            )}
                            {sub.status === "ACTIVE" && (
                              <>
                                <button
                                  onClick={() => handleUpdateSubStatus(sub.id, "PAUSED")}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded flex items-center gap-1 border border-amber-200 transition-colors"
                                  title="Pause Access"
                                >
                                  <PauseCircle size={14} /> Pause
                                </button>
                                <button
                                  onClick={() => handleUpdateSubStatus(sub.id, "TERMINATED")}
                                  className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded flex items-center gap-1 border border-red-200 transition-colors"
                                  title="Terminate Access"
                                >
                                  <XCircle size={14} /> Terminate
                                </button>
                              </>
                            )}
                            {sub.status === "PAUSED" && (
                              <>
                                <button
                                  onClick={() => handleUpdateSubStatus(sub.id, "ACTIVE")}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded flex items-center gap-1 border border-emerald-200 transition-colors"
                                  title="Resume Access"
                                >
                                  <PlayCircle size={14} /> Resume
                                </button>
                                <button
                                  onClick={() => handleUpdateSubStatus(sub.id, "TERMINATED")}
                                  className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded flex items-center gap-1 border border-red-200 transition-colors"
                                  title="Terminate Access"
                                >
                                  <XCircle size={14} /> Terminate
                                </button>
                              </>
                            )}
                            {(sub.status === "TERMINATED" || sub.status === "REJECTED") && (
                              <button
                                onClick={() => handleUpdateSubStatus(sub.id, "ACTIVE")}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded transition-colors"
                              >
                                Reactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={subPage}
              totalItems={filteredSubs.length}
              pageSize={subPageSize}
              onPageChange={setSubPage}
              pageSizeOptions={[5, 10, 25, 50]}
              onPageSizeChange={(sz) => { setSubPageSize(sz); setSubPage(1); }}
            />
          </div>

          {/* Section 2: Coupon Codes Management */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1c5ba9] uppercase tracking-wide flex items-center gap-2">
                  <Tag size={20} />
                  Promotional Coupon Codes ({allCoupons.length})
                </h2>
                <p className="text-xs text-gray-500">Create, edit, or disable percentage discount coupons for users.</p>
              </div>
              <button
                onClick={() => {
                  setEditingCoupon(null);
                  setCouponForm({
                    name: "",
                    code: "",
                    discountPercent: 10,
                    validFrom: new Date().toISOString().split("T")[0],
                    validTill: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
                    isActive: true,
                  });
                  setIsCouponModalOpen(true);
                }}
                className="px-4 py-2 bg-[#1c5ba9] hover:bg-[#154682] text-white text-xs font-bold rounded flex items-center gap-2 uppercase tracking-wide shadow-sm transition-colors"
              >
                <Plus size={16} /> Create New Coupon
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#f0f4f8] text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 border-r border-gray-200">Coupon Name</th>
                    <th className="px-4 py-3 border-r border-gray-200">Code</th>
                    <th className="px-4 py-3 border-r border-gray-200">Discount</th>
                    <th className="px-4 py-3 border-r border-gray-200">Valid From</th>
                    <th className="px-4 py-3 border-r border-gray-200">Valid Till</th>
                    <th className="px-4 py-3 border-r border-gray-200 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allCoupons.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400 font-medium">
                        No coupon codes created yet. Click "Create New Coupon" to add one.
                      </td>
                    </tr>
                  ) : (
                    paginatedCoupons.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-gray-800 border-r border-gray-100">{c.name}</td>
                        <td className="px-4 py-3 font-mono font-black text-[#1c5ba9] border-r border-gray-100">
                          <span className="bg-blue-50 px-2.5 py-1 rounded border border-blue-200">{c.code}</span>
                        </td>
                        <td className="px-4 py-3 font-black text-emerald-600 border-r border-gray-100">
                          {c.discountPercent}% OFF
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 border-r border-gray-100">
                          {formatDate(c.validFrom)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 border-r border-gray-100">
                          {formatDate(c.validTill)}
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-100">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                              c.isActive
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {c.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingCoupon(c);
                                setCouponForm({
                                  name: c.name,
                                  code: c.code,
                                  discountPercent: c.discountPercent,
                                  validFrom: c.validFrom,
                                  validTill: c.validTill,
                                  isActive: c.isActive,
                                });
                                setIsCouponModalOpen(true);
                              }}
                              className="p-1.5 text-[#1c5ba9] hover:bg-blue-50 rounded transition-colors"
                              title="Edit Coupon"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(c.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Delete Coupon"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={couponPage}
              totalItems={allCoupons.length}
              pageSize={couponPageSize}
              onPageChange={setCouponPage}
              pageSizeOptions={[5, 10, 20]}
              onPageSizeChange={(sz) => { setCouponPageSize(sz); setCouponPage(1); }}
            />
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* USER VIEW */
        /* ======================================================== */
        <div className="flex flex-col gap-8">
          {/* Status Banner */}
          {activeSub ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active Plan</div>
                  <h2 className="text-lg font-bold text-gray-900">{activeSub.planName} Subscription</h2>
                  <p className="text-xs text-gray-500">
                    Valid from {formatDate(activeSub.startDate)} until{" "}
                    <span className="font-bold text-emerald-800">{formatDate(activeSub.endDate)}</span>.
                  </p>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-sm">
                Active & Verified
              </div>
            </div>
          ) : pendingSub ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <Clock size={24} className="animate-spin" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Verification In Progress</div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {pendingSub.planName} Plan (₹{pendingSub.finalAmount?.toLocaleString("en-IN")})
                  </h2>
                  <p className="text-xs text-gray-600">
                    Your manual payment is awaiting Admin Verification. Reference:{" "}
                    <span className="font-mono font-bold text-gray-800">
                      {pendingSub.paymentReference || "N/A"}
                    </span>
                    . Access will be activated upon approval.
                  </p>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-sm">
                Pending Approval
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#1c5ba9] shrink-0">
                  <Zap size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Current Tier</div>
                  <h2 className="text-lg font-bold text-gray-900">Demo Plan — Free Trial Access</h2>
                  <p className="text-xs text-gray-600">
                    You are currently using the demo version. Subscribe to one of the plans below to avoid losing access to your forecasting workspace.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const elem = document.getElementById("plans-section");
                  elem?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-5 py-2.5 bg-[#1c5ba9] hover:bg-[#154682] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow transition-colors whitespace-nowrap"
              >
                Subscribe Now
              </button>
            </div>
          )}

          {/* Subscription Plans Selection */}
          <div id="plans-section" className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Choose Your Subscription Plan</h2>
              <p className="text-sm text-gray-500">
                Transparent and simple pricing. Select the duration that fits your procurement cycle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {PLANS.map((plan) => {
                const isSelected = selectedPlan !== "custom" && selectedPlan.name === plan.name;
                return (
                  <div
                    key={plan.name}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative bg-white rounded-xl border-2 p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-[#1c5ba9] shadow-md ring-2 ring-[#1c5ba9]/20"
                        : "border-gray-200 hover:border-gray-300 shadow-sm"
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 right-4 bg-[#1c5ba9] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                        {plan.badge}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-[#1c5ba9] bg-[#1c5ba9]" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                      </div>
                      <div className="mb-3">
                        <span className="text-2xl font-black text-gray-900">₹{plan.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-gray-500 font-semibold ml-1.5">{plan.perMonth}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">{plan.description}</p>
                      <div className="space-y-2 border-t border-gray-100 pt-3">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Custom Plan Option */}
              <div
                onClick={() => setSelectedPlan("custom")}
                className={`relative bg-white rounded-xl border-2 p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                  selectedPlan === "custom"
                    ? "border-[#1c5ba9] shadow-md ring-2 ring-[#1c5ba9]/20"
                    : "border-gray-200 hover:border-gray-300 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-gray-900">Custom Plan</h3>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === "custom" ? "border-[#1c5ba9] bg-[#1c5ba9]" : "border-gray-300"
                      }`}
                    >
                      {selectedPlan === "custom" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-black text-gray-900">
                      ₹{(customMonths * 1800).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold ml-1.5">₹1,800/mo</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">Choose custom number of months according to your project timeline.</p>
                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    <label className="text-xs font-bold text-gray-600 uppercase">Duration (Months):</label>
                    <input
                      type="number"
                      min={1}
                      max={36}
                      value={customMonths}
                      onChange={(e) => setCustomMonths(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded font-bold text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1c5ba9]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coupon and Checkout Box - Center Aligned */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-2xl mx-auto w-full">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tag size={18} className="text-[#1c5ba9]" /> Apply Promotional Coupon
            </h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter coupon code (e.g. SAVE10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-[#1c5ba9]/30 focus:border-[#1c5ba9] outline-none"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs uppercase tracking-wide rounded transition-colors"
              >
                Apply
              </button>
            </div>

            {appliedCoupon && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg p-3 text-xs flex items-center justify-between mb-4">
                <span>
                  🎉 Coupon <strong>{appliedCoupon.code}</strong> applied! You get {appliedCoupon.discountPercent}% OFF.
                </span>
                <button
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode("");
                  }}
                  className="text-red-500 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Selected Tier ({currentPlanDetails.name})</span>
                <span>₹{currentBasePrice.toLocaleString("en-IN")}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                  <span>Discount ({appliedCoupon.discountPercent}%)</span>
                  <span>- ₹{currentDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-200 pt-2">
                <span>Total Payable Amount</span>
                <span className="text-[#1c5ba9] text-xl">₹{currentFinalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              onClick={() => setIsPayModalOpen(true)}
              className="w-full py-3 bg-[#1c5ba9] hover:bg-[#154682] text-white font-bold text-sm uppercase tracking-wide rounded-lg shadow transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard size={18} /> Proceed to Pay & Subscribe
            </button>
          </div>

          {/* User's Payment History */}
          {myHistory.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-gray-400" /> Subscription History
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-[#f0f4f8] text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 border-r border-gray-200">Date</th>
                      <th className="px-4 py-3 border-r border-gray-200">Plan</th>
                      <th className="px-4 py-3 border-r border-gray-200">Amount Paid</th>
                      <th className="px-4 py-3 border-r border-gray-200">UTR / Ref</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedHistory.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-xs text-gray-600 border-r border-gray-100">
                          {formatDate(sub.createdDate)}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-800 border-r border-gray-100">{sub.planName}</td>
                        <td className="px-4 py-3 font-black text-gray-800 border-r border-gray-100">
                          ₹{sub.finalAmount?.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-700 border-r border-gray-100">
                          {sub.paymentReference || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                              sub.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : sub.status === "PENDING"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={historyPage}
                totalItems={myHistory.length}
                pageSize={historyPageSize}
                onPageChange={setHistoryPage}
                pageSizeOptions={[5, 10, 20]}
                onPageSizeChange={(sz) => { setHistoryPageSize(sz); setHistoryPage(1); }}
              />
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* USER PAYMENT MODAL (MANUAL BANK TRANSFER) */}
      {/* ======================================================== */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                <Building2 size={18} className="text-[#1c5ba9]" />
                Complete Manual Payment
              </h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-900 flex items-center justify-between">
                <span>
                  Subscribing to: <strong>{currentPlanDetails.name}</strong>
                </span>
                <span className="text-base font-black text-[#1c5ba9]">₹{currentFinalPrice.toLocaleString("en-IN")}</span>
              </div>

              <p className="text-xs text-gray-500">
                Please transfer the final payable amount to the official company bank account below using IMPS, NEFT, RTGS, or UPI NetBanking:
              </p>

              {/* Bank Details Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold">Bank Name:</span>
                  <span className="font-bold text-gray-800">ICICI Bank</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-gray-900 text-sm">426701000971</span>
                    <button
                      onClick={() => handleCopy("426701000971", "Account Number")}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600"
                      title="Copy Account Number"
                    >
                      {copiedField === "Account Number" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold">IFSC Code:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-gray-900 text-sm">ICIC0004267</span>
                    <button
                      onClick={() => handleCopy("ICIC0004267", "IFSC Code")}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600"
                      title="Copy IFSC Code"
                    >
                      {copiedField === "IFSC Code" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-gray-500 font-semibold">Branch Address:</span>
                  <span className="font-medium text-gray-800 text-right max-w-[220px]">
                    Uruli Kanchan, Pune, Maharashtra
                  </span>
                </div>
              </div>

              {/* Payment Reference Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Payment Transaction UTR / Ref Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 238910839201 or UPI Ref ID"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:ring-2 focus:ring-[#1c5ba9]/30 focus:border-[#1c5ba9] outline-none"
                  required
                />
                <p className="text-[11px] text-gray-400">
                  Enter the 12-digit UTR or transaction reference number provided by your bank after transfer.
                </p>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubscribe}
                  disabled={isSubmittingSub || !paymentRef.trim()}
                  className="flex-1 py-2.5 bg-[#1c5ba9] hover:bg-[#154682] text-white text-xs font-bold uppercase rounded shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingSub ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    "I Have Paid — Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADMIN COUPON CREATE/EDIT MODAL */}
      {/* ======================================================== */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                <Tag size={18} className="text-[#1c5ba9]" />
                {editingCoupon ? "Edit Coupon Code" : "Create New Coupon Code"}
              </h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 flex flex-col gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 uppercase">Coupon Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Diwali Discount"
                  value={couponForm.name}
                  onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#1c5ba9]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 uppercase">Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI20"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono font-bold uppercase outline-none focus:border-[#1c5ba9]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 uppercase">Discount Percentage (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={couponForm.discountPercent}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, discountPercent: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#1c5ba9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase">Valid From</label>
                  <input
                    type="date"
                    required
                    value={couponForm.validFrom}
                    onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#1c5ba9]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase">Valid Till</label>
                  <input
                    type="date"
                    required
                    value={couponForm.validTill}
                    onChange={(e) => setCouponForm({ ...couponForm, validTill: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#1c5ba9]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#1c5ba9] rounded"
                />
                <label htmlFor="isActive" className="font-bold text-gray-700 uppercase cursor-pointer">
                  Is Coupon Active?
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold uppercase rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1c5ba9] hover:bg-[#154682] text-white font-bold uppercase rounded shadow transition-colors"
                >
                  {editingCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
