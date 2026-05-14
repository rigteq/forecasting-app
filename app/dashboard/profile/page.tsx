"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Mail,
    ShieldCheck,
    CalendarDays,
    Clock3,
    User,
    CheckCircle,
    XCircle,
    Camera,
    Loader2
} from "lucide-react";

type ProfileData = {
    id: string;
    username: string;
    email: string;
    role: string;
    forecastDays: number;
    transitTime: number;
    isValid: boolean;
    createdBy: string;
    validTill: string;
    createdDate: string;
};

export default function ProfilePage() {

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    const BASE_URL = "/api/backend";

    useEffect(() => {

        const fetchProfile = async () => {

            try {

                const token = localStorage.getItem("accessToken");

                const res = await axios.get(
                    `${BASE_URL}/api/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setProfile(res.data);

            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <Loader2 className="animate-spin text-[#1c5ba9]" size={40} />
            </div>
        );
    }

    return (
        <main className="flex-grow p-4 w-full max-w-[1300px] mx-auto flex flex-col gap-4">

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">

                {/* TOP SECTION */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6 pb-6 border-b border-gray-100">

                    <div className="relative">

                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl text-[#1c5ba9] font-black shadow-inner uppercase">

                            {profile?.username?.slice(0, 2)}

                        </div>



                    </div>

                    <div className="flex-grow text-center md:text-left">

                        <h2 className="text-2xl font-bold text-gray-900">
                            {profile?.username}
                        </h2>

                        <p className="text-gray-500 mt-2 flex items-center gap-2 justify-center md:justify-start">

                            <ShieldCheck size={18} className="text-[#1c5ba9]" />

                            <span
                                className={`px-3 py-1 rounded-full text-sm font-bold text-white ${profile?.role === "ROLE_ADMIN"
                                        ? "bg-green-600"
                                        : "bg-green-600"
                                    }`}
                            >
                                {profile?.role === "ROLE_ADMIN" ? "ADMIN" : "USER"}
                            </span>

                        </p>

                    </div>

                </div>

                {/* DETAILS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

                    {/* EMAIL */}
                    <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">

                            <Mail size={14} className="text-[#1c5ba9]" />

                            Email Address

                        </label>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-semibold text-gray-800">
                            {profile?.email}
                        </div>
                    </div>

                    {/* ROLE */}
                    <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">

                            <ShieldCheck size={14} className="text-[#1c5ba9]" />

                            Role

                        </label>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-semibold text-gray-800">
                            {profile?.role}
                        </div>
                    </div>

                    {/* ONLY USER CAN SEE BELOW DETAILS */}
                    {profile?.role !== "ROLE_ADMIN" && (
                        <>
                            {/* FORECAST DAYS */}
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">

                                    <CalendarDays size={14} className="text-[#1c5ba9]" />

                                    Forecast Days

                                </label>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-semibold text-gray-800">
                                    {profile?.forecastDays} Days
                                </div>
                            </div>

                            {/* TRANSIT TIME */}
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">

                                    <Clock3 size={14} className="text-[#1c5ba9]" />

                                    Transit Time

                                </label>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-semibold text-gray-800">
                                    {profile?.transitTime} Days
                                </div>
                            </div>

                            {/* STATUS */}
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">

                                    <User size={14} className="text-[#1c5ba9]" />

                                    Account Status

                                </label>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-semibold text-gray-800 flex items-center gap-2">

                                    {profile?.isValid ? (
                                        <>
                                            <CheckCircle size={18} className="text-green-600" />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={18} className="text-red-600" />
                                            Inactive
                                        </>
                                    )}

                                </div>
                            </div>

                            {/* CREATED DATE */}
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">

                                    <CalendarDays size={14} className="text-[#1c5ba9]" />

                                    Created Date

                                </label>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-semibold text-gray-800">

                                    {profile?.createdDate
                                        ? new Date(profile.createdDate).toLocaleDateString("en-GB").replace(/\//g, "-")
                                        : "-"}

                                </div>
                            </div>

                            {/* VALID TILL */}
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">

                                    <CalendarDays size={14} className="text-[#1c5ba9]" />

                                    Valid Till

                                </label>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-semibold text-gray-800">

                                    {profile?.validTill
                                        ? new Date(profile.validTill).toLocaleDateString("en-GB").replace(/\//g, "-")
                                        : "-"}

                                </div>
                            </div>
                        </>
                    )}

                    {/* BUTTONS */}
                    <div className="mt-14 flex justify-end gap-4 border-t border-gray-100 pt-8">

                        {/* <button className="px-6 py-2.5 border border-[#1c5ba9] text-[#1c5ba9] rounded-lg font-semibold hover:bg-blue-50 transition-all">

                            Update Password

                        </button>

                        <button className="px-6 py-2.5 bg-[#1c5ba9] text-white rounded-lg font-semibold hover:bg-[#154682] transition-all shadow">

                            Save Changes

                        </button> */}

                    </div>

                </div>

            </div>

        </main>
    );
}