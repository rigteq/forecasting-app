"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");

    if (token) {
      console.log("[DEBUG - useEffect] Token found. Retrieved Role from LocalStorage:", role);
      console.log("[DEBUG - useEffect] Checking if role equals 'ROLE_ADMIN' or 'ADMIN'...");
      
      if (role === "ROLE_ADMIN" || role === "ADMIN") {
        console.log("[DEBUG - useEffect] Match successful. Redirecting to /dashboard");
        router.replace("/dashboard");
      } else {
        console.log("[DEBUG - useEffect] Match failed. Redirecting to /user-dashboard");
        router.replace("/user-dashboard");
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Login failed");
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("role", data.role);
      console.log("[DEBUG - handleSubmit] Full Login Response Data:", data);
      console.log("[DEBUG - handleSubmit] Role returned from backend:", data.role);
      
      // Role-based redirect
      if (data.role === "ROLE_ADMIN" || data.role === "ADMIN") {
        console.log("[DEBUG - handleSubmit] Role matched Admin. Redirecting to /dashboard");
        router.replace("/dashboard");
      } else {
        console.log("[DEBUG - handleSubmit] Role did not match Admin. Redirecting to /user-dashboard");
        router.replace("/user-dashboard");
      }

    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900 overflow-hidden">
      <main className="flex-grow flex w-full">
        {/* Left 60% Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center w-[60%] bg-[#1c5ba9] p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>

          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
              <Image
                src="/velogo.png"
                alt="Vardhan Enterprises Logo"
                width={250}
                height={120}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Vardhan Enterprises
            </h1>
            <p className="text-blue-100 text-lg md:text-xl font-medium max-w-lg leading-relaxed">
              Advanced Forecasting & Inventory Management System
            </p>
          </div>
        </div>

        {/* Right 40% Login Form */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center items-center p-8 lg:p-16 bg-white relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
          <div className="w-full max-w-sm flex flex-col">
            <div className="lg:hidden mb-8 flex justify-center">
              <Image
                src="/velogo.png"
                alt="Vardhan Enterprises Logo"
                width={180}
                height={80}
                className="object-contain"
                priority
              />
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-gray-500 font-medium">Please sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1c5ba9] focus:border-transparent transition-all"
                  required
                  autoComplete="username"
                  id="username"
                  name="username"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1c5ba9] focus:border-transparent transition-all"
                    required
                    autoComplete="current-password"
                    id="password"
                    name="password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium mt-1 p-3 bg-red-50 border border-red-100 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 mt-4 text-white text-sm font-bold rounded shadow-lg transition-all duration-200 uppercase tracking-wide ${isLoading
                  ? "bg-[#1c5ba9]/70 cursor-not-allowed"
                  : "bg-[#1c5ba9] hover:bg-[#154682] active:scale-[0.98]"
                  }`}
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="w-full bg-black text-gray-400 py-3 px-6 flex justify-end items-center text-xs font-medium z-20">
        <span>Powered by <a href="https://rigteq.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 font-bold transition-colors">rigteq</a></span>
      </footer>
    </div>
  );
}