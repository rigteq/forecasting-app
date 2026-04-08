"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FileSpreadsheet, Download, AlertCircle, LogOut } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/");
    }
  }, [router]);

  // const handleLogout = async () => {
  //   const refreshToken = localStorage.getItem("refreshToken");
  //   const accessToken = localStorage.getItem("accessToken");

  //   if (!refreshToken) {
  //     localStorage.clear();
  //     router.replace("/");
  //     return;
  //   }

  //   try {
  //     await fetch("http://localhost:8080/api/auth/logout", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${accessToken}`, //  IMPORTANT
  //       },
  //       body: JSON.stringify({ refreshToken }),
  //     });
  //   } catch (error) {
  //     console.error("Logout failed", error);
  //   } finally {
  //     localStorage.clear();
  //     router.replace("/");
  //   }
  // };

  const [activeTab, setActiveTab] = useState("Forecasting");
  const [forecastDays, setForecastDays] = useState("15");
  const [transitTime, setTransitTime] = useState("5");
  const [orderFor, setOrderFor] = useState("All Part");
  const [stockType, setStockType] = useState("Below Safety Stock");
  const [tabData, setTabData] = useState<Record<string, File | null>>({});
  const [showResults, setShowResults] = useState(false);

  const tabs = [
    "Part Price List",
    "No Forecast",
    "Current Stock",
    "Transit",
    "Back Order",
    "Quarter Consumption",
    "Forecasting",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setTabData((prev) => ({
        ...prev,
        [activeTab]: file,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fa] font-sans text-gray-800 flex flex-col">
      {/* Header */}
      {/* Main Content Area */}
      <main className="flex-grow p-6 w-full max-w-[1400px] mx-auto flex flex-col gap-6">

        {/* Tabs container */}
        <div className="w-full border-b border-gray-300">
          <div className="grid grid-cols-7">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setShowResults(false); // reset when switching tab
                }}
                className={`text-center px-2 py-3 text-sm font-semibold transition-all duration-200 border-t border-l border-r ${activeTab === tab
                  ? "bg-[#1c5ba9] text-white border-[#1c5ba9] -mb-[1px]"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Fills the remaining space to look like the image block */}
          <div className="flex-grow border-b border-gray-300"></div>
        </div>

        {/* Tab Content Wrapper */}
        <div className="flex flex-col gap-6">

          {/* Warning Message Box + Upload UI */}
          {activeTab !== "Forecasting" && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col gap-5">

              {/* Warning */}
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded border-l-4 border-red-500 font-medium text-sm flex items-center gap-3">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <span>
                  Error: Missing data in required tabs. Please upload all files before analysis!
                </span>
              </div>

              {/* Upload Box (like image) */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center py-10 px-4 bg-gray-50 hover:bg-gray-100 transition-all">

                <p className="text-gray-600 font-medium mb-1">
                  Select File here
                </p>

                <p className="text-xs text-gray-400 mb-4">
                  Files Supported: PDF, TEXT, DOC, DOCX
                </p>

                <label className="cursor-pointer px-5 py-2 bg-[#1c5ba9] text-white rounded shadow hover:bg-[#154682] transition text-sm font-medium">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {tabData[activeTab] && (
                  <p className="text-sm text-green-600 mt-3">
                    Selected: {tabData[activeTab].name}
                  </p>
                )}

              </div>
            </div>
          )}

          {/* Forecasting Configuration Box */}
          {activeTab === "Forecasting" && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-5">
                <h2 className="text-lg font-bold text-[#1c5ba9] whitespace-nowrap">Forecasting</h2>
                <div className="ml-4 h-[1px] bg-gray-200 flex-grow"></div>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-medium">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">Forecast Days:</span>
                  <select
                    value={forecastDays}
                    onChange={(e) => setForecastDays(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1c5ba9]/50 bg-white"
                  >
                    <option value="7">7</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="21">21</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-600">Transit Time:</span>
                  <select
                    value={transitTime}
                    onChange={(e) => setTransitTime(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1c5ba9]/50 bg-white"
                  >
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="7">7</option>
                    <option value="10">10</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-600">Order For:</span>
                  <select
                    value={orderFor}
                    onChange={(e) => setOrderFor(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1c5ba9]/50 bg-white min-w-[120px]"
                  >
                    <option value="All Part">All Part</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Counter">Counter</option>
                    <option value="Local Garage">Local Garage</option>
                    <option value="Co dealer">Co dealer</option>
                    <option value="Other">Other</option>
                    <option value="Trader">Trader</option>
                    <option value="Trader/ Retailer / Supplier">Trader/ Retailer / Supplier</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-600">Stock Type:</span>
                  <select
                    value={stockType}
                    onChange={(e) => setStockType(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1c5ba9]/50 bg-white min-w-[150px]"
                  >
                    <option value="Below Safety Stock">Below Safety Stock</option>
                    <option value="Normal Order">Normal Order</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowResults(true)}
                  className="px-8 py-2.5 bg-[#1c5ba9] hover:bg-[#154682] active:bg-[#0e2e56] text-white font-semibold rounded shadow-sm hover:shadow transition-all text-sm"
                >
                  Run Forecast
                </button>
              </div>
            </div>
          )}

          {/* Results Box */}
          {activeTab === "Forecasting" && showResults && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 pb-8 mb-8">

              {/* Results Header */}
              <div className="flex items-center mb-5">
                <h2 className="text-lg font-bold text-[#1c5ba9] whitespace-nowrap">
                  Forecast Results
                </h2>
                <div className="ml-4 h-[1px] bg-gray-200 flex-grow"></div>
              </div>

              {/* Results Summary Header */}
              <div className="bg-gradient-to-r from-[#1c5ba9] to-[#286bd4] text-white rounded-t-lg px-6 py-3 flex flex-wrap justify-between items-center text-sm font-medium shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-blue-100">Forecast Cost:</span>
                  <span className="text-lg font-bold">₹ 1,231,234.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-100">Total Part No.:</span>
                  <span className="text-lg font-bold">123</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-100">Total Part Quantity:</span>
                  <span className="text-lg font-bold">4513</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-100">High Priority Parts:</span>
                  <span className="text-lg font-bold">23</span>
                </div>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto border-x border-b border-gray-300 rounded-b-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f0f4f8] text-gray-700 border-b border-gray-300 font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-r border-gray-300 w-24">Part No.</th>
                      <th className="px-4 py-3 border-r border-gray-300 w-48">Part Name</th>
                      <th className="px-4 py-3 border-r border-gray-300 whitespace-nowrap">Current Stock</th>
                      <th className="px-4 py-3 border-r border-gray-300 whitespace-nowrap">Avg. Consumption</th>
                      <th className="px-4 py-3 border-r border-gray-300 whitespace-nowrap">Days of Supply</th>
                      <th className="px-4 py-3 border-r border-gray-300 whitespace-nowrap">Forecast Qty</th>
                      <th className="px-4 py-3 border-r border-gray-300 whitespace-nowrap">Unit MRP</th>
                      <th className="px-4 py-3 border-r border-gray-300 whitespace-nowrap">Total MRP</th>
                      <th className="px-4 py-3">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Empty rows to match the design (e.g. 5 blank rows) */}
                    {[...Array(5)].map((_, idx) => (
                      <tr key={idx} className="border-b border-gray-200 bg-white hover:bg-gray-50">
                        <td className="px-4 py-4 border-r border-gray-200"></td>
                        <td className="px-4 py-4 border-r border-gray-200"></td>
                        <td className="px-4 py-4 border-r border-gray-200"></td>
                        <td className="px-4 py-4 border-r border-gray-200"></td>
                        <td className="px-4 py-4 border-r border-gray-200"></td>
                        <td className="px-4 py-4 border-r border-gray-200"></td>
                        <td className="px-4 py-4 border-r border-gray-200"></td>
                        <td className="px-4 py-4 border-r border-gray-200"></td>
                        <td className="px-4 py-4"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700">
                  <FileSpreadsheet size={16} className="text-green-600" />
                  Download Excel
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700">
                  <FileSpreadsheet size={16} className="text-green-600" />
                  Download CSV
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700">
                  <Download size={16} className="text-red-500" />
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </main >
    </div >
  );
}
