"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FileSpreadsheet, Download, AlertCircle, LogOut, X } from "lucide-react";
import { CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

type SummaryData = {
  forecastCost: number;
  totalPartNo: number;
  totalQuantity: number;
  highPriorityParts: number;
  data: any[];
};


export default function Dashboard() {
  const router = useRouter();
  const [uploadedFileIds, setUploadedFileIds] = useState<Record<string, string>>({});
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/");
    } else {
      setLoading(false);
    }
  }, []);


  const [activeTab, setActiveTab] = useState("Forecasting");
  const [forecastDays, setForecastDays] = useState("15");
  const [transitTime, setTransitTime] = useState("5");
  const [orderFor, setOrderFor] = useState("All Part");
  const [stockType, setStockType] = useState("Below Safety Stock");
  const [tabData, setTabData] = useState<Record<string, File | null>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);


  const [uploadMessage, setUploadMessage] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  const fileTypeMap: Record<string, string> = {
    "Part Price List": "part-price",
    "No Forecast": "no-forecast",
    "Current Stock": "current-stock",
    "Transit": "transit",
    "Back Order": "backorder",
    "Quarter Consumption": "consumption",
  };

  const tabs = [
    "Part Price List",
    "No Forecast",
    "Current Stock",
    "Transit",
    "Back Order",
    "Quarter Consumption",
    "Forecasting",
  ];




  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // store selected file (UI purpose)
    setTabData((prev) => ({
      ...prev,
      [activeTab]: file,
    }));

    setIsUploading(true);
    setUploadMessage("");
    setProgress(0);

    try {
      const fileType = fileTypeMap[activeTab];

      let url = `http://localhost:8080/api/file/upload/${fileType}`;

      if (jobId) {
        url += `?uploadJobId=${encodeURIComponent(jobId)}`;
      }

      const res = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      const data = res.data;

      if (!jobId) {
        setJobId(data.data.uploadJobId);
      }

      setUploadedFileIds((prev) => ({
        ...prev,
        [activeTab]: data.data.uploadJobId,
      }));

      setUploadMessage(data?.message || "Upload successful");
      toast.success(data?.message || "Upload successful");

    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;

        if (status === 409) {
          toast.error("File already present");
          setUploadMessage("File already present");
        } else {
          const message =
            error.response.data?.message || "Something went wrong";
          toast.error(message);
          setUploadMessage(message);
        }
      } else {
        toast.error("Network error");
        setUploadMessage("Network error");
      }

      setProgress(0);
    } finally {
      setIsUploading(false);
      // Reset input value to allow uploading the same file again if it was removed
      e.target.value = '';
    }
  };

  const handleRemoveFile = (tab: string) => {
    setTabData((prev) => {
      const newData = { ...prev };
      delete newData[tab];
      return newData;
    });
    setUploadedFileIds((prev) => {
      const newIds = { ...prev };
      delete newIds[tab];
      return newIds;
    });
    setUploadMessage("");
    setProgress(0);
  };

  const handleForecast = async () => {
    const requiredTabs = [
      "Part Price List",
      "No Forecast",
      "Current Stock",
      "Transit",
      "Back Order",
      "Quarter Consumption",
    ];

    const allUploaded = requiredTabs.every(tab => uploadedFileIds[tab]);

    if (!allUploaded) {
      toast.error("Please upload all required files first");
      return;
    }

    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(
        `http://localhost:8080/api/forecast/${jobId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            forecastDays: Number(forecastDays),
            transitTime: Number(transitTime),
            orderFor,
            stockType,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Forecast failed");
      }

      const data = await res.json();

      console.log("Forecast Data:", data);
      console.log("FULL API RESPONSE ", data);
      console.log("TOTAL QTY FROM BACKEND ", data.totalQuantity);

      setForecastData(data.data || []);
      setSummaryData(data);
      setShowResults(true);

    } catch (error) {
      console.error("Forecast error:", error);
    }
  };

  useEffect(() => {
    if (loading) return;
    const fetchDashboard = async () => {
      const token = localStorage.getItem("accessToken");

      try {
        const res = await fetch("http://localhost:8080/api/dashboard", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          router.replace("/");
          return;
        }

        const data = await res.text();
        console.log("Dashboard API Response:", data);

      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchDashboard();
  }, [loading]);

  const handleDownload = async (type: string) => {
    if (!jobId) return;

    const token = localStorage.getItem("accessToken");

    const res = await fetch(
      `http://localhost:8080/api/download/${type}/${jobId}`,
      {
        method: "POST", // important
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          forecastDays: Number(forecastDays),
          transitTime: Number(transitTime),
          stockType,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Download error:", text);
      toast.error("Download failed");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `forecast.${type === "excel" ? "xlsx" : type}`;
    a.click();
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
                  setShowResults(false);
                  setUploadMessage("");
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
              {!uploadedFileIds[activeTab] && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded border-l-4 border-red-500 font-medium text-sm flex items-center gap-3">
                  <AlertCircle size={18} className="text-red-500 shrink-0" />
                  <span>
                    Please upload file for this tab before proceeding!
                  </span>
                </div>
              )}

              {/* Upload Box (like image) */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center py-10 px-4 bg-gray-50 hover:bg-gray-100 transition-all">

                <p className="text-gray-600 font-medium mb-1">
                  Select File here
                </p>

                <p className="text-xs text-gray-400 mb-4">
                  Files Supported: Excel, CSV
                </p>

                <label className={`cursor-pointer px-5 py-2 bg-[#1c5ba9] text-white rounded shadow transition text-sm font-medium ${isUploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-[#154682]'}`}>

                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>

                {isUploading && (
                  <div className="mt-4 w-full max-w-md">
                    <div className="flex justify-between text-sm text-blue-600 mb-1 font-medium">
                      <span>Uploading...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}

                {tabData[activeTab] && !isUploading && (
                  <div className="mt-4 w-full max-w-md flex flex-col gap-2">
                    <div className="flex items-center justify-between bg-white border border-gray-200 px-3 py-2 rounded-md shadow-sm">
                      <span className="text-sm text-gray-700 truncate max-w-[80%]">{(tabData[activeTab] as File).name}</span>
                      <button
                        onClick={() => handleRemoveFile(activeTab)}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {uploadMessage && !isUploading && (
                  <div className="flex items-center gap-2 mt-4 text-green-600 text-sm font-medium">
                    <CheckCircle size={16} />
                    {uploadMessage}
                  </div>
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
                  onClick={handleForecast}
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
                  <span className="text-lg font-bold">
                    ₹ {summaryData?.forecastCost?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-100">Total Part No.:</span>
                  <span className="text-lg font-bold">
                    {summaryData?.totalPartNo ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-100">Total Part Quantity:</span>
                  <span className="text-lg font-bold">
                    {summaryData?.totalQuantity != null
                      ? Number(summaryData.totalQuantity).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-100">High Priority Parts:</span>
                  <span className="text-lg font-bold">
                    {summaryData?.highPriorityParts ?? 0}
                  </span>
                </div>
              </div>

              {/* Results Table */}
              {/* Results Table */}
              <div className="border-x border-b border-gray-300 rounded-b-lg">

                <div className="overflow-auto max-h-[500px]">

                  <table className="w-full text-sm text-left border border-gray-300">

                    <thead className="bg-[#f0f4f8] text-gray-700 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-2 border">Part Number</th>
                        <th className="px-4 py-2 border">Part Name</th>
                        <th className="px-4 py-2 border text-right">Current Stock</th>
                        <th className="px-4 py-2 border text-right">Average Consumption</th>
                        <th className="px-4 py-2 border text-right">Days of Supply</th>
                        <th className="px-4 py-2 border text-right">Forecast Qty</th>
                        <th className="px-4 py-2 border text-right">Unit MRP ₹</th>
                        <th className="px-4 py-2 border text-right">Total MRP ₹</th>
                        <th className="px-4 py-2 border text-center">Priority</th>
                      </tr>
                    </thead>

                    <tbody>
                      {forecastData.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-4 text-gray-500">
                            No Data Available
                          </td>
                        </tr>
                      ) : (
                        forecastData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border">{item.partNumber}</td>
                            <td className="px-4 py-2 border">{item.partName}</td>
                            <td className="px-4 py-2 border text-right">{item.currentStock}</td>
                            <td className="px-4 py-2 border text-right">{item.avgConsumption}</td>
                            <td className="px-4 py-2 border text-right">{item.daysOfSupply}</td>
                            <td className="px-4 py-2 border text-right">{item.forecastQty}</td>
                            <td className="px-4 py-2 border text-right">{item.unitMrp}</td>
                            <td className="px-4 py-2 border text-right">{item.totalMrp}</td>
                            <td className="px-4 py-2 border text-center">{item.priority}</td>
                          </tr>
                        ))
                      )}
                    </tbody>

                  </table>

                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => handleDownload("excel")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700"
                >
                  <FileSpreadsheet size={16} className="text-green-600" />
                  Download Excel
                </button>
                <button
                  onClick={() => handleDownload("csv")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700"
                >
                  <FileSpreadsheet size={16} className="text-green-600" />
                  Download CSV
                </button>
                <button
                  onClick={() => handleDownload("pdf")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700"
                >
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
