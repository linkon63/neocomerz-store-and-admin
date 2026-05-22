"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, setStoreSession } from "@/lib/store-api";

export default function StoreRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters long"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.register({ name: form.name, email: form.email, password: form.password });
      setStoreSession(res.accessToken, res.user);
      router.push("/store");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please verify your details.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    border: "1.5px solid var(--store-border)",
    backgroundColor: "var(--store-bg)",
    color: "var(--store-text)",
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--store-border)" }}>
          {/* Top accent */}
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, var(--store-primary), var(--store-accent))" }} />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-7">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "var(--store-primary)" }}>
                <span className="text-white font-black text-xl">N</span>
              </div>
              <h1 className="text-[24px] font-black tracking-tight" style={{ color: "var(--store-text)" }}>Create Account</h1>
              <p className="text-[13px] mt-1 text-center" style={{ color: "var(--store-text-muted)" }}>Join NeoComerz and discover premium curated shopping</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--store-text)" }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--store-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--store-border)")}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--store-text)" }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--store-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--store-border)")}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--store-text)" }}>Password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--store-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--store-border)")}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--store-text)" }}>Confirm Password</label>
                <input
                  type="password"
                  required
                  value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--store-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--store-border)")}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] font-medium" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
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
                className="w-full rounded-xl py-3.5 text-[15px] font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2"
                style={{ backgroundColor: "var(--store-primary)" }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </>
                ) : "Create Account"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: "var(--store-border)" }} />
              <span className="text-[12px] font-medium" style={{ color: "var(--store-text-muted)" }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "var(--store-border)" }} />
            </div>

            <p className="text-center text-[14px]" style={{ color: "var(--store-text-muted)" }}>
              Already have an account?{" "}
              <Link href="/store/login" className="font-bold hover:underline" style={{ color: "var(--store-primary)" }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
