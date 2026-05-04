"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Users, ExternalLink, Plus, X, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";

export default function ClientsPage() {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    forecastDays: "15",
    transitTime: "5",
    validTill: "",
  });

  const [clients, setClients] = useState([
    { id: "CL001", name: "Automotive Solutions Ltd", forecastDays: 15, transitTime: 5, status: "Active" },
    { id: "CL002", name: "Velocity Spare Parts", forecastDays: 7, transitTime: 3, status: "Active" },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      // API integration point for creating client
      // const token = localStorage.getItem("accessToken");
      // await axios.post("http://localhost:8080/api/clients", formData, { headers: { Authorization: \`Bearer \${token}\` } });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Adding to dummy list for demo purposes
      setClients([
        ...clients, 
        { 
          id: `CL00${clients.length + 1}`, 
          name: formData.username, 
          forecastDays: parseInt(formData.forecastDays), 
          transitTime: parseInt(formData.transitTime), 
          status: "Active" 
        }
      ]);
      
      toast.success("Client created successfully!");
      setIsAddModalOpen(false);
      setFormData({
        username: "",
        email: "",
        password: "",
        forecastDays: "15",
        transitTime: "5",
        validTill: "",
      });
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || "Failed to create client. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-grow p-6 w-full max-w-[1400px] mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#1c5ba9] flex items-center gap-2 uppercase tracking-wide">
              <Users size={20} />
              Clients List
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="pl-10 pr-4 py-2 border border-blue-100 bg-gray-50 font-semibold rounded focus:ring-1 focus:ring-[#1c5ba9]/30 focus:outline-none transition-all text-sm w-64"
                />
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1c5ba9] hover:bg-[#154682] text-white text-sm font-bold rounded shadow-sm transition-colors uppercase tracking-wide"
              >
                <Plus size={16} /> Add Client
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-[#f0f4f8] text-gray-700 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-6 py-4 border-r border-gray-200">ID</th>
                  <th className="px-6 py-4 border-r border-gray-200">Company Name</th>
                  <th className="px-6 py-4 border-r border-gray-200">Forecasting Days</th>
                  <th className="px-6 py-4 border-r border-gray-200">Transit Time</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                    className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-5 border-r border-gray-100 text-blue-600 font-bold font-mono">
                      {client.id}
                    </td>
                    <td className="px-6 py-5 border-r border-gray-100 font-bold text-gray-800 flex items-center justify-between">
                      <span>{client.name}</span>
                      <ExternalLink size={14} className="text-gray-400 group-hover:text-[#1c5ba9] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                    <td className="px-6 py-5 border-r border-gray-100 font-semibold text-gray-600">
                      {client.forecastDays} Days
                    </td>
                    <td className="px-6 py-5 border-r border-gray-100 font-semibold text-gray-600">
                      {client.transitTime} Days
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ring-1 ring-emerald-200/50">
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                <Users size={18} className="text-[#1c5ba9]" />
                Create New Client
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {submitError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{submitError}</p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Company Name / Username</label>
                <input 
                  type="text" 
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1c5ba9]/50 focus:border-[#1c5ba9] transition-colors outline-none text-sm font-medium"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1c5ba9]/50 focus:border-[#1c5ba9] transition-colors outline-none text-sm font-medium"
                    placeholder="client@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1c5ba9]/50 focus:border-[#1c5ba9] transition-colors outline-none text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Forecasting Days</label>
                  <select 
                    name="forecastDays"
                    value={formData.forecastDays}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1c5ba9]/50 focus:border-[#1c5ba9] transition-colors outline-none text-sm font-medium bg-white"
                  >
                    <option value="7">7 Days</option>
                    <option value="10">10 Days</option>
                    <option value="15">15 Days</option>
                    <option value="21">21 Days</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Transit Time</label>
                  <select 
                    name="transitTime"
                    value={formData.transitTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1c5ba9]/50 focus:border-[#1c5ba9] transition-colors outline-none text-sm font-medium bg-white"
                  >
                    <option value="3">3 Days</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                    <option value="10">10 Days</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Valid Till</label>
                <input 
                  type="datetime-local" 
                  name="validTill"
                  required
                  value={formData.validTill}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1c5ba9]/50 focus:border-[#1c5ba9] transition-colors outline-none text-sm font-medium"
                />
              </div>

              <div className="mt-4 flex gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded hover:bg-gray-200 transition-colors uppercase text-sm tracking-wide"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#1c5ba9] text-white font-bold rounded hover:bg-[#154682] transition-colors uppercase text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
