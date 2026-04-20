"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

export default function Login() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("USER");

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const url = isSignup
      ? "http://localhost:8080/api/auth/signup"

      : "http://localhost:8080/api/auth/login";

    const body = isSignup
      ? { username, password, role }
      : { username, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error);
        return;
      }

      // Signup flow
      if (isSignup) {
        toast.success("Signup successful! Please login.");
        setIsSignup(false);
        return;
      }

      // Login flow
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("role", data.role);
      console.log("Login Response:", data);
      // Role-based redirect
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
            {isSignup ? "Sign Up" : "Sign In"}
          </h1>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">

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
              {isSignup && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-lg"
            >
              {isSignup ? "Sign Up" : "Login"}
            </button>

            <p className="text-sm text-center text-gray-600">
              {isSignup ? "Already have an account?" : "Don't have an account?"}
              <span
                onClick={() => setIsSignup(!isSignup)}
                className="text-blue-600 cursor-pointer ml-1 font-semibold"
              >
                {isSignup ? "Login" : "Sign Up"}
              </span>
            </p>

          </form>
        </div>
      </main>
    </div>
  );
}