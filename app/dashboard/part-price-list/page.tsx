"use client";
import React, { useState, useEffect } from "react";
import { UploadCloud, FileSpreadsheet, Download, RefreshCw, CheckCircle, FileText } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/utils/api";
import { Trash2 } from "lucide-react";


const activePolls = new Set<string>();
export default function PartPriceListPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastUploaded, setLastUploaded] = useState<Date | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetchingFile, setIsFetchingFile] = useState(true);


  useEffect(() => {

    const fetchCurrentFile = async () => {

      try {

        setIsFetchingFile(true);

        const token = localStorage.getItem("accessToken");

        const res = await api.get(`/api/file/upload/current/PART_PRICE`);
        const details = res.data?.data ?? res.data;

        if (details?.fileName) {
          setFileName(details.fileName);
          setLastUploaded(
            details.createdDate
              ? new Date(details.createdDate)
              : null
          );
        } else {

          setFileName("");
          setLastUploaded(null);
        }

      } catch (error) {

        console.log("No file found");

        setFileName("");
        setLastUploaded(null);

      } finally {

        setIsFetchingFile(false);
      }
    };

    fetchCurrentFile();

  }, []);

  useEffect(() => {

    const existingJobId = localStorage.getItem("partPriceUploadJobId");

    if (existingJobId) {

      setIsUploading(true);

      pollProgress(existingJobId);
    }

  }, []);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("accessToken");

    try {
      // Assuming same endpoint structure
      const jobId = crypto.randomUUID();

      localStorage.setItem("partPriceUploadJobId", jobId);

      setIsUploading(true);

      pollProgress(jobId);

      await api.post(
        `/api/file/upload/PART_PRICE?uploadJobId=${jobId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFileName(file.name);
      setLastUploaded(new Date());
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload part price list");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };


  const pollProgress = async (jobId: string) => {

    // prevent duplicate polling
    if (activePolls.has(jobId)) return;

    activePolls.add(jobId);

    const token = localStorage.getItem("accessToken");

    const interval = setInterval(async () => {

      try {

        const res = await api.get(
          `/api/file/upload/progress/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const progress = Number(res.data);

        console.log("PART PRICE PROGRESS =", progress);

        setUploadProgress(progress);

        if (progress >= 100) {

          clearInterval(interval);

          activePolls.delete(jobId);

          setUploadProgress(100);

          setIsUploading(false);

          localStorage.removeItem("partPriceUploadJobId");

          toast.success("Upload Completed", {
            toastId: `part-price-upload-success`,
          });
        }

      } catch (err) {

        clearInterval(interval);

        activePolls.delete(jobId);

        setIsUploading(false);

        localStorage.removeItem("partPriceUploadJobId");

        toast.error("Progress failed", {
          toastId: `part-price-upload-failed`,
        });
      }

    }, 500);
  };


  const handleDelete = async () => {

    if (isDeleting) return;

    try {

      setIsDeleting(true);

      const token = localStorage.getItem("accessToken");

      await api.delete(
        `/api/file/upload/delete/PART_PRICE`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFileName("");
      setLastUploaded(null);

      toast.success("File deleted successfully");

    } catch (error) {

      console.log(error);

      toast.error("Delete failed");

    } finally {

      setIsDeleting(false);
    }
  };


  const handleDownload = async () => {

    // No file uploaded
    if (!fileName || !lastUploaded) {
      toast.error("No file available to download");
      return;
    }

    try {

      setIsDownloading(true);

      const token = localStorage.getItem("accessToken");

      const res = await api.get(
        `/api/download/PART_PRICE`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", "PartPriceFile.xlsx");

      document.body.appendChild(link);

      link.click();

      window.URL.revokeObjectURL(url);

      toast.success("Downloaded successfully");

    } catch (error) {

      console.log(error);

      toast.error("Download failed");

    } finally {

      setIsDownloading(false);
    }
  };


  return (
    <main className="flex-grow p-6 w-full max-w-[1000px] mx-auto flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="p-3 bg-blue-50 text-[#1c5ba9] rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Part Price List Management</h1>
            <p className="text-sm text-gray-500">View, download or replace the master part price list</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current File Status */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Current Master File</h3>
              {isFetchingFile ? (

                <div className="flex items-center justify-center bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <RefreshCw size={20} className="animate-spin text-[#1c5ba9]" />
                  <span className="ml-2 text-sm text-gray-500">
                    Fetching file details...
                  </span>
                </div>

              ) : (

                <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">

                  <FileSpreadsheet className="text-green-600" size={32} />

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {fileName || "No file uploaded"}
                    </h4>

                    <p className="text-xs text-gray-500 mt-0.5">
                      {lastUploaded && fileName
                        ? `Last updated: ${lastUploaded.toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}`
                        : "No file uploaded yet"}
                    </p>
                  </div>

                  {fileName && (
                    isDeleting ? (
                      <div className="w-[18px] h-[18px] border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2
                        onClick={handleDelete}
                        className="text-red-500 cursor-pointer hover:text-red-700"
                        size={18}
                      />
                    )
                  )}

                  {fileName && lastUploaded && (
                    <CheckCircle size={20} className="text-green-500" />
                  )}

                </div>
              )}
            </div>

            <button
              onClick={handleDownload}
              disabled={isDownloading || !lastUploaded}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded shadow-sm hover:bg-gray-50 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download Current File
                </>
              )}
            </button>
          </div>

          {/* Upload New File */}
          <div className="border-2 border-dashed border-[#1c5ba9]/30 bg-blue-50/20 rounded-xl p-6 flex flex-col items-center justify-center text-center relative group hover:bg-blue-50/50 transition-colors">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
            />

            {isUploading ? (
              <div className="flex flex-col items-center text-[#1c5ba9]">
                <RefreshCw size={40} className="animate-spin mb-3 text-[#1c5ba9]" />
                <h3 className="font-bold text-gray-800 mb-1">Uploading...</h3>
                <div className="w-full max-w-[200px] h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-[#1c5ba9] transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-xs font-semibold mt-2">{uploadProgress}% Complete</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud size={32} className="text-[#1c5ba9]" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Upload New Price List</h3>
                <p className="text-xs text-gray-500 mb-4 max-w-[250px]">
                  Drag and drop your updated Excel or CSV file here, or click to browse. This will replace the existing price list.
                </p>
                <div className="px-5 py-2 bg-[#1c5ba9] text-white text-sm font-bold rounded shadow-sm uppercase tracking-wider group-hover:bg-[#154682] transition-colors pointer-events-none">
                  Select File
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
