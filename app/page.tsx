"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();

  const [username, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      router.replace("/dashboard");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message);
        return;
      }

      const data = await res.json();

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      router.replace("/dashboard");

    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-10 border border-gray-100 flex flex-col items-center">

          <div className="mb-8">
            <Image
              src="/velogo.png"
              alt="Vardhan Enterprises Logo"
              width={200}
              height={100}
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>

          <h1 className="text-2xl font-bold mb-8 text-gray-800 tracking-tight">
            Sign In
          </h1>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>

              {/* Wrapper must be relative */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 bg-gray-50"
                  required
                />

                {/* Eye Icon */}
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium mt-1">
                  {error}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-lg"
            >
              Login
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}