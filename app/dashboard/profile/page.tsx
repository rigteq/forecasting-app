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
                    `${BASE_URL}/api/auth/profile`,
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

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ username: '', email: '', password: '' });

    const handleEdit = () => {
        setEditData({ username: profile?.username || '', email: profile?.email || '', password: '' });
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.put(
                `${BASE_URL}/api/auth/user/${profile?.id}`,
                {
                    username: editData.username,
                    email: editData.email,
                    password: editData.password
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setProfile(prev => prev ? { ...prev, username: editData.username, email: editData.email } : null);
            setIsEditing(false);
            alert("Profile updated successfully");
        } catch (error) {
            alert("Failed to update profile");
        }
    };

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

                        {isEditing ? (
                            <input type="text" className="text-2xl font-bold text-gray-900 border rounded px-2 w-full max-w-xs mb-2" value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} />
                        ) : (
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {profile?.username}
                            </h2>
                        )}

                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <ShieldCheck size={16} className="text-[#1c5ba9]" />
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white bg-green-600 tracking-wide uppercase">
                                {profile?.role === "ROLE_ADMIN" || profile?.role === "ADMIN" ? "ADMIN" : "USER"}
                            </span>
                        </div>

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
                            {isEditing ? (
                                <input type="email" className="w-full bg-white border rounded px-2 py-1" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} />
                            ) : (
                                profile?.email
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                <ShieldCheck size={14} className="text-[#1c5ba9]" />
                                New Password
                            </label>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-semibold text-gray-800">
                                <input type="password" placeholder="Leave blank to keep same" className="w-full bg-white border rounded px-2 py-1" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} />
                            </div>
                        </div>
                    )}
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
                                        ? new Date(profile.createdDate).toLocaleDateString("en-GB").split("/").join("-")
                                        : "-"}

                                </div>
                            </div>
                        </div>

                    {/* BUTTONS */}
                    <div className="mt-14 flex justify-end gap-4 border-t border-gray-100 pt-8">
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} className="px-6 py-2.5 bg-[#1c5ba9] text-white rounded-lg font-semibold hover:bg-[#154682] transition-all shadow">Save Changes</button>
                                <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-all">Cancel</button>
                            </>
                        ) : (
                            <button onClick={handleEdit} className="px-6 py-2.5 bg-[#1c5ba9] text-white rounded-lg font-semibold hover:bg-[#154682] transition-all shadow">Edit Profile</button>
                        )}
                    </div>

                </div>

        </main>
    );
}