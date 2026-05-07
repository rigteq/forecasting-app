"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, UploadCloud, X, Loader2, ArrowLeft, Download, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

type SummaryData = {
  forecastCost: number;
  totalPartNo: number;
  totalQuantity: number;
  highPriorityParts: number;
  data: any[];
};

type FileConfig = {
  id: string;
  title: string;
  requiredForForecast: boolean;
  adminOnly: boolean;
  multiple: boolean;
  accept: string;
  typeMap: string;
  helpText: string;
};

const CARDS_CONFIG: FileConfig[] = [
  { id: "No Forecast", title: "No Forecast", requiredForForecast: true, adminOnly: false, multiple: false, accept: ".csv,.xlsx,.xls,.pdf", typeMap: "NO_FORECAST", helpText: "Required. 1 File" },
  { id: "Current Stock", title: "Current Stock", requiredForForecast: true, adminOnly: false, multiple: false, accept: ".csv,.xlsx,.xls,.pdf", typeMap: "CURRENT_STOCK", helpText: "Required. 1 File" },
  { id: "Transit", title: "Transit", requiredForForecast: false, adminOnly: false, multiple: false, accept: ".csv,.xlsx,.xls,.pdf", typeMap: "TRANSIT", helpText: "Required. 1 File" },
  { id: "Back Order", title: "BackOrder", requiredForForecast: true, adminOnly: false, multiple: false, accept: ".csv,.xlsx,.xls,.pdf", typeMap: "BACKORDER", helpText: "Required. 1 File" },
  { id: "Quarter Consumption", title: "Avg Consumption", requiredForForecast: true, adminOnly: false, multiple: true, accept: ".csv,.xlsx,.xls,.pdf", typeMap: "CONSUMPTION", helpText: "Required. 3-6 Files" },
  { id: "Customer Order", title: "Customer Order", requiredForForecast: false, adminOnly: false, multiple: false, accept: ".csv,.xlsx,.xls,.pdf", typeMap: "CUSTOMER_ORDER", helpText: "Optional. 1 File" },
];

export default function DashboardClient({ role }: { role: "ADMIN" | "USER" }) {
  const router = useRouter();

  const [uploadedFileIds, setUploadedFileIds] = useState<Record<string, string>>({});
  const [tabData, setTabData] = useState<Record<string, File[]>>({});
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const [forecastDays, setForecastDays] = useState<string>("7");
const [transitTime, setTransitTime] = useState<string>("5");

  const [orderFor, setOrderFor] = useState("All");
  const [stockType, setStockType] = useState("Below Safety Stock");

  const [jobId, setJobId] = useState<string | null>(null);

  const [isForecasting, setIsForecasting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [forecastError, setForecastError] = useState("");
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  useEffect(() => {
  const fetchUserConfig = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        "http://localhost:8080/api/auth/user/config",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data;

if (data) {
  setForecastDays(String(data.forecastDays ?? "7"));
  setTransitTime(String(data.transitTime ?? "5"));
} else {
  setForecastDays("7");
  setTransitTime("5");
}

    } catch (err) {
      console.error("Failed to load config", err);

      // fallback values (VERY IMPORTANT)
       setForecastDays("7");
  setTransitTime("5");
    }
  };

  fetchUserConfig();
}, []);

  const handleFileChange = async (cardId: string, typeMap: string, multiple: boolean, files: File[]) => {
    if (files.length === 0) return;

    if (multiple) {
      const existingFiles = tabData[cardId] || [];
      const totalFiles = existingFiles.length + files.length;
      if (totalFiles > 6) {
        toast.warning("Maximum 6 files allowed");
        return;
      }
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/");
      return;
    }

    const formData = new FormData();
    files.forEach(f => formData.append("file", f));

    setTabData((prev) => ({
      ...prev,
      [cardId]: multiple ? [...(prev[cardId] || []), ...files] : [files[0]],
    }));

    setUploadingState(prev => ({ ...prev, [cardId]: true }));
    setUploadProgress(prev => ({ ...prev, [cardId]: 0 }));

    try {
      const newJobId = jobId || crypto.randomUUID();
      if (!jobId) setJobId(newJobId);

      let url = `http://localhost:8080/api/file/upload/${typeMap}?uploadJobId=${newJobId}`;

      const res = await axios.post(url, formData, {
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [cardId]: percentCompleted }));
          }
        },
      });

      const data = res.data;

      setUploadedFileIds((prev) => ({
        ...prev,
        [cardId]: newJobId,
      }));

      toast.success(data?.message || "Upload successful");

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Upload failed";
      toast.error(errorMessage);

      if (!multiple) {
        setTabData(prev => {
          const newData = { ...prev };
          delete newData[cardId];
          return newData;
        });
      }
    } finally {
      setUploadingState(prev => ({ ...prev, [cardId]: false }));
    }
  };

  const handleRemoveSingleFile = (cardId: string, index: number) => {
    setTabData((prev) => {
      const updatedFiles = [...(prev[cardId] || [])];
      updatedFiles.splice(index, 1);
      return { ...prev, [cardId]: updatedFiles };
    });

    if ((tabData[cardId]?.length || 0) <= 1) {
      setUploadedFileIds((prev) => {
        const updated = { ...prev };
        delete updated[cardId];
        return updated;
      });
    }
  };

  const handleForecast = async () => {
    const missing = CARDS_CONFIG.filter(c => {
      if (c.adminOnly && role !== "ADMIN") return false;
      return c.requiredForForecast && !uploadedFileIds[c.id];
    });

    if (missing.length > 0) {
      toast.error(`Missing required files: ${missing.map(m => m.title).join(", ")}`);
      return;
    }

    const token = localStorage.getItem("accessToken");
    setIsForecasting(true);
    setForecastError("");

    try {
      const res = await fetch(`http://localhost:8080/api/forecast/${jobId || "dummy-job-id"}`, {
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
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Forecast failed");
      }

      const data = await res.json();
      setForecastData(data.data || []);
      setSummaryData(data);
      setShowResults(true);

    } catch (error: any) {
      setForecastError(error.message || "Failed to generate forecast.");
    } finally {
      setIsForecasting(false);
    }
  };

  const handleDownload = async (type: string) => {
    if (!jobId) return;
    const token = localStorage.getItem("accessToken");
    setDownloadingType(type); 
    try {
      const res = await fetch(`http://localhost:8080/api/download/${type}/${jobId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          forecastDays: Number(forecastDays),
          transitTime: Number(transitTime),
          stockType,
        }),
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `forecast.${type === "excel" ? "xlsx" : type}`;
      a.click();
    } catch (err) {
      toast.error("Download failed");
    } finally {
    setDownloadingType(null); // stop loader
  }
  };

  const allRequiredUploaded = CARDS_CONFIG.filter(c => {
    if (c.adminOnly && role !== "ADMIN") return false;
    return c.requiredForForecast;
  }).every(c => uploadedFileIds[c.id]);

  if (showResults) {
    return (
     <div className="bg-gray-50 w-full max-w-7xl mx-auto rounded-lg shadow mt-4 h-[calc(100vh-120px)] overflow-hidden flex flex-col">
         <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setShowResults(false)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>

          <div className="flex gap-3">

                {/* Excel */}
                <button
                  onClick={() => handleDownload("excel")}
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
                  onClick={() => handleDownload("csv")}
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
                  onClick={() => handleDownload("pdf")}
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

   <div className="overflow-y-auto h-[calc(100vh-240px)] rounded-xl">
              <table className="w-full text-xs text-left table-fixed">
    
              {/* HEADER */}
              <thead className="bg-gray-100 text-gray-700 uppercase text-[10px] font-semibold sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2 w-[10%]">Part No</th>
                  <th className="px-2 py-2 w-[18%]">Name</th>
                  <th className="px-2 py-2 w-[8%] text-right">Stock</th>
                  <th className="px-2 py-2 w-[8%] text-right">Avg </th>
                  <th className="px-2 py-2 w-[8%] text-right">Days</th>
                  <th className="px-2 py-2 w-[8%] text-right">Transit</th>
                  <th className="px-2 py-2 w-[10%] text-right">Forecast</th>
                  <th className="px-2 py-2 w-[8%] text-right">MRP</th>
                  <th className="px-2 py-2 w-[10%] text-right">Total</th>
                  <th className="px-2 py-2 w-[10%] text-center">Priority</th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody className="divide-y divide-gray-100">
                {forecastData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-2 py-6 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  forecastData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors">

                      <td className="px-2 py-2 font-medium break-words">
                        {item.partNumber || item.partNo || '-'}
                      </td>

                      <td className="px-2 py-2 break-words">
                        {item.partName || '-'}
                      </td>

                      <td className="px-2 py-2 text-right">
                        {item.currentStock || 0}
                      </td>

                      <td className="px-2 py-2 text-right">
                        {item.avgConsumption || 0}
                      </td>

                      <td className="px-2 py-2 text-right">
                        {item.daysOfSupply || 0}
                      </td>

                      <td className="px-2 py-2 text-right">
  {item.transitTime ?? transitTime}
</td>

                      <td className="px-2 py-2 text-right font-semibold text-blue-600">
                        {item.forecastQty || 0}
                      </td>

                      <td className="px-2 py-2 text-right">
                        ₹{item.unitMrp || 0}
                      </td>

                      <td className="px-2 py-2 text-right font-semibold">
                        ₹{item.totalMrp || 0}
                      </td>

                      <td className="px-2 py-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.priority === 'A' || item.priority === 'HIGH'
                              ? 'bg-red-100 text-red-700'
                              : item.priority === 'B' || item.priority === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {item.priority || 'C'}
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
    <main className="flex flex-col p-4 overflow-hidden max-w-[1200px] mx-auto w-full h-full">
      {/* Failure Popup */}
      {forecastError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[400px] animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Forecast Failed</h3>
              <p className="text-sm text-gray-500 mb-4">{forecastError}</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setForecastError("")} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                  Close
                </button>
                <button onClick={() => { setForecastError(""); handleForecast(); }} className="flex-1 px-4 py-2 bg-[#1c5ba9] text-white font-semibold rounded-lg hover:bg-[#154682] transition-colors">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Cards Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 pb-2 content-start pr-2">
        {CARDS_CONFIG.map(config => {
          const isDisabled = config.adminOnly && role !== "ADMIN";
          const isUploaded = !!uploadedFileIds[config.id];
          const isUploading = uploadingState[config.id];
          const files = tabData[config.id] || [];

          return (
            <div key={config.id} className={`bg-white rounded-lg shadow-sm border ${isUploaded ? 'border-[#1c5ba9]/40 ring-1 ring-[#1c5ba9]/10' : 'border-gray-200'} p-4 flex flex-col transition-all h-full ${isDisabled ? 'opacity-60 bg-gray-50 pointer-events-none' : 'hover:shadow'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800 text-sm">{config.title}</h3>
                {isUploaded && <CheckCircle size={16} className="text-[#1c5ba9]" />}
                {isDisabled && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Admin Only</span>}
              </div>

              <div className="flex-1 border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center bg-gray-50/50 p-3 relative overflow-hidden group">
                <input
                  type="file"
                  multiple={config.multiple}
                  accept={config.accept}
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files || []);
                    handleFileChange(config.id, config.typeMap, config.multiple, selectedFiles);
                    e.target.value = '';
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  disabled={isDisabled || isUploading || (!config.multiple && isUploaded)}
                />

                {isUploading ? (
                  <div className="flex flex-col items-center text-[#1c5ba9]">
                    <Loader2 size={24} className="animate-spin mb-1" />
                    <span className="text-[11px] font-medium">Uploading {uploadProgress[config.id]}%</span>
                  </div>
                ) : files.length > 0 ? (
                  <div className="w-full flex flex-col gap-1.5 max-h-[140px] overflow-y-auto px-1 z-10 custom-scrollbar">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 p-1.5 rounded shadow-sm text-xs shrink-0">
                        <span className="truncate flex-1 text-gray-700 pr-2">{file.name}</span>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveSingleFile(config.id, idx); }}
                          className="text-red-500 hover:text-red-700 p-0.5"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {config.multiple && files.length < 6 && (
                      <div className="text-center mt-1 pointer-events-none shrink-0">
                        <span className="text-[#1c5ba9] text-[10px] font-semibold underline">Add more ({files.length}/6)</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400 group-hover:text-[#1c5ba9] transition-colors pointer-events-none">
                    <UploadCloud size={32} className="mb-1.5" />
                    <p className="font-medium text-xs">Click or drag file(s)</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{config.helpText}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Controls Footer */}
      <div className="flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky bottom-0 z-10">
  <div className="grid gap-4 items-end grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    {(role === "ADMIN" || role === "USER") && (
      <>
        {/* Forecasting Days */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Forecasting Days
          </label>

          {role === "ADMIN" ? (
            <select
              value={forecastDays}
              onChange={(e) => setForecastDays(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-800 text-sm font-medium focus:ring-1 focus:ring-[#1c5ba9] focus:outline-none"
            >
              <option value="7">7 Days</option>
              <option value="10">10 Days</option>
              <option value="15">15 Days</option>
              <option value="21">21 Days</option>
            </select>
          ) : (
            <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-700 text-sm">
              {forecastDays} Days
            </div>
          )}
        </div>

        {/* Transit Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Transit Time
          </label>

          {role === "ADMIN" ? (
            <select
              value={transitTime}
              onChange={(e) => setTransitTime(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-800 text-sm font-medium focus:ring-1 focus:ring-[#1c5ba9] focus:outline-none"
            >
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">7 Days</option>
              <option value="10">10 Days</option>
            </select>
          ) : (
            <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-700 text-sm">
              {transitTime} Days
            </div>
          )}
        </div>

        {/* Order For */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Order For
          </label>

          {role === "ADMIN" ? (
            <select
              value={orderFor}
              onChange={(e) => setOrderFor(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-800 text-sm font-medium focus:ring-1 focus:ring-[#1c5ba9] focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Workshop">Workshop</option>
              <option value="Counter">Counter</option>
            </select>
          ) : (
            <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-700 text-sm">
              {orderFor}
            </div>
          )}
        </div>
      </>
    )}

    {/* Button */}
    <div className={`flex items-end h-full w-full ${role !== "ADMIN" ? "justify-center" : ""}`}>
      <button
        onClick={handleForecast}
        disabled={!allRequiredUploaded || isForecasting}
        className={`w-full py-2.5 rounded font-bold text-sm text-white shadow transition-all flex items-center justify-center gap-2 ${
          !allRequiredUploaded
            ? "bg-gray-300 cursor-not-allowed shadow-none"
            : "bg-[#1c5ba9] hover:bg-[#154682] active:scale-[0.98]"
        }`}
      >
        {isForecasting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Processing...
          </>
        ) : (
          "Start Forecast"
        )}
      </button>
    </div>
  </div>
</div>
    </main>
  );
}
