"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, setStoreSession } from "@/lib/store-api";

export default function StoreLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(form);
      setStoreSession(res.accessToken, res.user);
      router.push("/store");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--store-border)" }}>
          {/* Top accent bar */}
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, var(--store-primary), var(--store-accent))" }} />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "var(--store-primary)" }}>
                <span className="text-white font-black text-xl">N</span>
              </div>
              <h1 className="text-[24px] font-black tracking-tight" style={{ color: "var(--store-text)" }}>Welcome Back</h1>
              <p className="text-[13px] mt-1 text-center" style={{ color: "var(--store-text-muted)" }}>Sign in to access your premium shopping profile</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--store-text)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: "var(--store-text-muted)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-[14px] outline-none transition-all"
                    style={{
                      border: "1.5px solid var(--store-border)",
                      backgroundColor: "var(--store-bg)",
                      color: "var(--store-text)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--store-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--store-border)")}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-semibold" style={{ color: "var(--store-text)" }}>Password</label>
                  <Link href="#" className="text-[12px] font-bold hover:underline" style={{ color: "var(--store-primary)" }}>
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: "var(--store-text-muted)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full rounded-xl pl-10 pr-10 py-3 text-[14px] outline-none transition-all"
                    style={{
                      border: "1.5px solid var(--store-border)",
                      backgroundColor: "var(--store-bg)",
                      color: "var(--store-text)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--store-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--store-border)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: "var(--store-text-muted)" }}
                  >
                    {showPass ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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
                className="w-full rounded-xl py-3.5 text-[15px] font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                style={{ backgroundColor: "var(--store-primary)" }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ backgroundColor: "var(--store-border)" }} />
              <span className="text-[12px] font-medium" style={{ color: "var(--store-text-muted)" }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "var(--store-border)" }} />
            </div>

            <p className="text-center text-[14px]" style={{ color: "var(--store-text-muted)" }}>
              Don't have an account?{" "}
              <Link href="/store/register" className="font-bold hover:underline" style={{ color: "var(--store-primary)" }}>
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[12px]" style={{ color: "var(--store-text-muted)" }}>
          {["🔒 Secure Checkout", "🛡️ Privacy Protected", "✅ Verified Platform"].map((item, i) => (
            <span key={i} className="font-medium">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
