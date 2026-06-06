"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, setStoreSession } from "@/lib/store-api";
import { MangoLogo } from "../_components/store-shell";

export default function StoreRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("পাসওয়ার্ড মিলছে না"); return; }
    if (form.password.length < 6) { setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.register({ name: form.name, email: form.email, password: form.password });
      setStoreSession(res.accessToken, res.user);
      router.push("/store");
    } catch (err) {
      setError(err instanceof Error ? err.message : "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 font-sans bg-stone-50/50">
      <div className="w-full max-w-md">
        <div className="bg-white overflow-hidden shadow-md border border-stone-200/60">
          {/* Top accent */}
          <div className="h-1.5 w-full bg-linear-to-r from-[#15803d] to-emerald-600" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-7">
              <Link href="/store" className="mb-4 transition-opacity hover:opacity-90">
                <MangoLogo className="scale-110" />
              </Link>
              <h1 className="text-[24px] font-extrabold text-stone-850">অ্যাকাউন্ট খুলুন</h1>
              <p className="text-[14px] mt-1 text-stone-500 font-semibold text-center">আম এক্সপ্রেস-এ যোগ দিন এবং ফ্রেশ আম অর্ডার করুন</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[13px] font-bold mb-1.5 text-stone-750">পূর্ণ নাম</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="আপনার নাম লিখুন"
                  className="w-full px-4 py-3 text-[14px] outline-none border border-stone-200 bg-stone-50 focus:border-[#15803d] text-stone-800 placeholder-stone-400 font-semibold transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[13px] font-bold mb-1.5 text-stone-750">ইমেইল ঠিকানা</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 text-[14px] outline-none border border-stone-200 bg-stone-50 focus:border-[#15803d] text-stone-800 placeholder-stone-400 font-semibold transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] font-bold mb-1.5 text-stone-750">পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  className="w-full px-4 py-3 text-[14px] outline-none border border-stone-200 bg-stone-50 focus:border-[#15803d] text-stone-800 placeholder-stone-400 font-semibold transition"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[13px] font-bold mb-1.5 text-stone-750">পাসওয়ার্ড নিশ্চিত করুন</label>
                <input
                  type="password"
                  required
                  value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  placeholder="পাসওয়ার্ড আবার লিখুন"
                  className="w-full px-4 py-3 text-[14px] outline-none border border-stone-200 bg-stone-50 focus:border-[#15803d] text-stone-800 placeholder-stone-400 font-semibold transition"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 text-[13px] font-bold bg-red-50 border border-red-100 text-red-650">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-[15px] font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2 btn-premium cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    অ্যাকাউন্ট তৈরি হচ্ছে...
                  </>
                ) : "অ্যাকাউন্ট তৈরি করুন"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-stone-150" />
              <span className="text-[12px] font-bold text-stone-400">অথবা</span>
              <div className="flex-1 h-px bg-stone-150" />
            </div>

            <p className="text-center text-[14px] text-stone-550 font-medium">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
              <Link href="/store/login" className="font-bold text-[#15803d] hover:text-[#166534] hover:underline">
                লগইন করুন
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
