"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, UploadCloud, X, Loader2, ArrowLeft, Download, AlertCircle, CheckCircle } from "lucide-react";
import api from "@/utils/api";
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
  { id: "No Forecast", title: "No Forecast", requiredForForecast: false, adminOnly: false, multiple: false, accept: ".csv,.xlsx,.xls,.pdf", typeMap: "NO_FORECAST", helpText: "Optional. 1 File" },
  { id: "Current Stock", title: "Current Stock", requiredForForecast: true, adminOnly: false, multiple: false, accept: ".csv,.xlsx,.xls,.pdf", typeMap: "CURRENT_STOCK", helpText: "Required. 1 File" },
  { id: "Transit", title: "Transit", requiredForForecast: false, adminOnly: false, multiple: false, accept: ".csv,.xlsx,.xls,.pdf", typeMap: "TRANSIT", helpText: "Optional. 1 File" },
  { id: "Back Order", title: "BackOrder", requiredForForecast: false, adminOnly: false, multiple: false, accept: ".csv,.xlsx,.xls,.pdf", typeMap: "BACKORDER", helpText: "Optional. 1 File" },
  { id: "Quarter Consumption", title: "Avg Consumption", requiredForForecast: true, adminOnly: false, multiple: true, accept: ".csv,.xlsx,.xls,.pdf", typeMap: "CONSUMPTION", helpText: "Required. 3-6 Files" },
  { id: "Customer Order", title: "Customer Order", requiredForForecast: false, adminOnly: false, multiple: false, accept: ".csv,.xlsx,.xls,.pdf", typeMap: "CUSTOMER_ORDER", helpText: "Optional. 1 File" },
  { id: "Purchase Order", title: "Purchase Order", requiredForForecast: false, adminOnly: false, multiple: false, accept: ".csv,.xlsx,.xls,.pdf", typeMap: "PURCHASE_ORDER", helpText: "Optional. 1 File" },
];

export default function DashboardClient({ role }: { role: "ADMIN" | "USER" }) {
  const router = useRouter();

  const [jobId, setJobId] = useState<string>("");
  const [uploadedFileIds, setUploadedFileIds] = useState<Record<string, string>>({});
  const [tabData, setTabData] = useState<Record<string, File[]>>({});
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const [forecastDays, setForecastDays] = useState<string>("7");
  const [transitTime, setTransitTime] = useState<string>("5");

  const [profileLoaded, setProfileLoaded] = useState(false);

  const [isForecasting, setIsForecasting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [forecastError, setForecastError] = useState("");
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState({});

  const BASE_URL = "/api/backend";

  const activePolls = React.useRef(new Set<string>());
  const [totalRows, setTotalRows] = useState<number>(0);

  useEffect(() => {
    setJobId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    return () => {
      if (jobId) {
        api.delete(`/api/file/upload/clean/${jobId}`).catch(() => {});
      }
    };
  }, [jobId]);




  const pollProgress = async (jobId: string, cardId: string) => {
    if (activePolls.current.has(cardId)) return;

    activePolls.current.add(cardId)

    const token = localStorage.getItem("accessToken");

    const interval = setInterval(async () => {

      try {

        const progressRes = await api.get(
          `/api/file/upload/progress/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const progress = Number(progressRes.data);

        console.log(
          "JOB ID:",
          jobId,
          "CARD:",
          cardId,
          "PROGRESS:",
          progress
        );

        setUploadProgress(prev => ({
          ...prev,
          [cardId]: Math.min(Math.max(progress, 0), 100),
        }));

        // COMPLETE
        if (progress >= 100) {

          clearInterval(interval);

          activePolls.current.delete(cardId);

          setUploadProgress(prev => ({
            ...prev,
            [cardId]: 100,
          }));

          setUploadingState(prev => ({
            ...prev,
            [cardId]: false,
          }));

          toast.success("Upload Completed", {
            toastId: `upload-success-${cardId}`,
          });
        }

      } catch (error) {

        clearInterval(interval);

        activePolls.current.delete(cardId);

        setUploadingState(prev => ({
          ...prev,
          [cardId]: false,
        }));

        console.error(error);
      }

    }, 500); // change 100ms -> 500ms
  };

  const handleFileChange = async (
    cardId: string,
    typeMap: string,
    multiple: boolean,
    files: File[]
  ) => {

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

    files.forEach((f) => formData.append("file", f));

    setTabData((prev) => ({
      ...prev,
      [cardId]: multiple
        ? [...(prev[cardId] || []), ...files]
        : [files[0]],
    }));

    setUploadingState((prev) => ({
      ...prev,
      [cardId]: true,
    }));

    setUploadProgress((prev) => ({
      ...prev,
      [cardId]: 0,
    }));

    try {
      const url = `/api/file/upload/${typeMap}?uploadJobId=${jobId}`;

      pollProgress(jobId, cardId);

      const res = await api.post(url, formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) /
            (progressEvent.total || 1)
          );

          setUploadProgress(prev => ({
            ...prev,
            [cardId]: percent,
          }));
        }
      });

      const data = res.data;

      setUploadedFileIds((prev) => ({
        ...prev,
        [cardId]: jobId,
      }));



    } catch (error: any) {

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Upload failed";

      toast.error(errorMessage);

      setUploadingState((prev) => ({
        ...prev,
        [cardId]: false,
      }));

      setUploadProgress((prev) => ({
        ...prev,
        [cardId]: 0,
      }));

      if (!multiple) {

        setTabData((prev) => {

          const newData = { ...prev };

          delete newData[cardId];

          return newData;
        });
      }
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
      toast.error(
        `Missing required files: ${missing.map(m => m.title).join(", ")}`
      );
      return;
    }

    setIsForecasting(true);
    setForecastError("");

    try {

      const res = await api.post(
        `/api/forecast/${jobId || "dummy-job-id"}`,
        {
          forecastDays: Number(forecastDays),
          transitTime: Number(transitTime),
        }
      );

      const responseData = res.data;
      const forecastResponse = responseData.data;

      setForecastData(forecastResponse?.data || responseData?.data || []);
      setSummaryData(forecastResponse || responseData);
      setShowResults(true);

    } catch (error: any) {

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to generate forecast.";

      setForecastError(message);
      setUploadedFileIds({});
      setTabData({});
      setUploadingState({});
      setUploadProgress({});

    } finally {

      setIsForecasting(false);
    }
  };

  const handleDownload = async (type: string) => {

    if (!jobId) return;

    setDownloadingType(type);

    try {

      const res = await api.post(
        `/api/download/${type}/${jobId}`,
        {
          forecastDays: Number(forecastDays),
          transitTime: Number(transitTime),
        },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data]);

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;

      a.download = `forecast.${type === "excel" ? "xlsx" : type}`;

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Downloaded successfully");

    } catch (err) {

      console.error(err);

      toast.error("Download failed");

    } finally {

      setDownloadingType(null);

    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        const profileData = res.data?.data ?? res.data;
        if (profileData) {
          setForecastDays(String(profileData.forecastDays || 7));
          setTransitTime(String(profileData.transitTime || 5));
        }
      } catch (err) {
        console.error("Failed to load profile for defaults", err);
      } finally {
        setProfileLoaded(true);
      }
    };

    fetchProfile();
  }, []);

  const allRequiredUploaded = CARDS_CONFIG.filter(c => {
    if (c.adminOnly && role !== "ADMIN") return false;
    return c.requiredForForecast;
  }).every(c => {
    if (c.id === "Quarter Consumption") {
      return uploadedFileIds[c.id] && (tabData[c.id]?.length >= 3 && tabData[c.id]?.length <= 6);
    }
    return uploadedFileIds[c.id];
  });

  if (showResults) {

    // Total rows count
    const totalRows = forecastData.length;

    return (
      <div className="bg-gray-50 w-full max-w-7xl mx-auto rounded-lg shadow mt-4 h-[calc(100vh-120px)] overflow-hidden flex flex-col">

        {/* TOP BAR */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (jobId) {
                  api.delete(`/api/file/upload/clean/${jobId}`).catch(() => {});
                }
                setUploadedFileIds({});
                setTabData({});
                setUploadingState({});
                setUploadProgress({});
                setJobId(crypto.randomUUID());
                setShowResults(false);
              }}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <ArrowLeft size={20} /> Back to Dashboard
            </button>

            {/* TOTAL COUNT */}
            <div className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg text-sm font-semibold">
              Total Rows : {totalRows}
            </div>
          </div>

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
                    <th className="px-4 py-3 w-[20%]">Part Number</th>
                    <th className="px-4 py-3 w-[40%]">Description</th>
                    <th className="px-4 py-3 w-[15%] text-right">Sales Unit</th>
                    <th className="px-4 py-3 w-[15%] text-right">Order Qty</th>
                    <th className="px-4 py-3 w-[10%] text-center">Category</th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody className="divide-y divide-gray-100">
                  {forecastData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    forecastData.map((item, idx) => (
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
                  <div className="w-full flex flex-col gap-1.5 max-h-[140px] overflow-y-auto px-1 z-10 custom-scrollbar pointer-events-none">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 p-1.5 rounded shadow-sm text-xs shrink-0 pointer-events-auto">
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
                      <div className="text-center mt-1 shrink-0">
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
        <div className={`flex items-end gap-6 ${role === "ADMIN" ? "justify-between" : "justify-center"}`}>
          {role === "ADMIN" && (
            <div className="flex gap-6">
              {/* Forecasting Days */}
              <div className="flex flex-col gap-1.5 w-40">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Forecasting Days
                </label>
                <select
                  value={forecastDays}
                  onChange={(e) => setForecastDays(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-800 text-sm font-medium focus:ring-1 focus:ring-[#1c5ba9] focus:outline-none w-full"
                >
                  <option value="7">7 Days</option>
                  <option value="10">10 Days</option>
                  <option value="15">15 Days</option>
                  <option value="21">21 Days</option>
                </select>
              </div>

              {/* Transit Time */}
              <div className="flex flex-col gap-1.5 w-40">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Transit Time
                </label>
                <select
                  value={transitTime}
                  onChange={(e) => setTransitTime(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-800 text-sm font-medium focus:ring-1 focus:ring-[#1c5ba9] focus:outline-none w-full"
                >
                  <option value="3">3 Days</option>
                  <option value="5">5 Days</option>
                  <option value="7">7 Days</option>
                  <option value="10">10 Days</option>
                </select>
              </div>
            </div>
          )}

          {/* Button */}
          <div className={`${role === "ADMIN" ? "flex-1 max-w-sm" : "w-64"}`}>
            <button
              onClick={handleForecast}
              disabled={!allRequiredUploaded || isForecasting}
              className={`w-full py-2.5 rounded font-bold text-sm text-white shadow transition-all flex items-center justify-center gap-2 ${!allRequiredUploaded
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
