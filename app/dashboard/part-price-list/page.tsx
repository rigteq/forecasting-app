"use client";
import React, { useState, useEffect } from "react";
import { UploadCloud, FileSpreadsheet, Download, RefreshCw, CheckCircle, FileText } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { Trash2 } from "lucide-react";

export default function PartPriceListPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastUploaded, setLastUploaded] = useState<Date | null>(new Date());
  const [fileName, setFileName] = useState("No file");


  useEffect(() => {
    axios.get("http://localhost:8080/api/file/upload/current/PART_PRICE")
      .then(res => {
        setFileName(res.data.fileName);
        setLastUploaded(new Date(res.data.createdDate));
      })
      .catch(() => {
        console.log("No file found");
      });
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
      await axios.post(`http://localhost:8080/api/file/upload/PART_PRICE`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      toast.success("Part Price List updated successfully");
      setFileName(file.name);
      setLastUploaded(new Date());
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload part price list");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };


  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.delete(
        "http://localhost:8080/api/file/upload/delete/PART_PRICE",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFileName("No file");
      setLastUploaded(null);

      toast.success("File deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  };


  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        "http://localhost:8080/api/download/PART_PRICE",
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "part_price.xlsx";
      link.setAttribute("download", fileName || "part_price.csv");
      document.body.appendChild(link);
      link.click();

      toast.success("Downloaded successfully");
    } catch (error) {
      console.log(error);
      toast.error("Download failed");
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
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <FileSpreadsheet className="text-green-600" size={32} />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm">{fileName}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lastUploaded ? `Last updated: ${lastUploaded.toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}` : "No file uploaded yet"}
                  </p>
                </div>

                {/* Delete Icon */}
                {lastUploaded && (
                  <Trash2
                    onClick={handleDelete}
                    className="text-red-500 cursor-pointer hover:text-red-700"
                    size={18}
                  />
                )}
                {lastUploaded && <CheckCircle size={20} className="text-green-500" />}
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded shadow-sm hover:bg-gray-50 transition-colors text-sm"
            >
              <Download size={18} /> Download Current File
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
