"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, setAdminSession, type AdminUser } from "../../../lib/admin-api";
import { MangoLogo } from "../../store/_components/store-shell";

type LoginResponse = {
  accessToken: string;
  user: AdminUser;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("david.brown@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

 
    try {
      const response = await apiRequest<LoginResponse>("/auth/login", {
        auth: false,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
 
      if (response.user.role?.name !== "admin") {
        throw new Error("Only admin users can access the admin panel.");
      }
 
      setAdminSession(response.accessToken, response.user);
      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.replace(nextPath?.startsWith("/admin") ? nextPath : "/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-stone-50 text-stone-950 lg:grid-cols-[0.95fr_1.05fr] neocomerz-admin font-sans">
      <section className="hidden bg-[#0F291E] p-10 text-white lg:flex lg:flex-col lg:justify-between border-r border-emerald-950/20">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <MangoLogo light />
        </Link>
        <div>
          <p className="mb-4 inline-flex rounded-full bg-[#2E7D32] px-4 py-2 text-sm font-black tracking-wider uppercase text-white shadow-sm">
            Mango Express Admin
          </p>
          <h1 className="max-w-xl text-6xl font-black leading-[1.03] tracking-normal font-display">
            Manage orders, mango catalog, stock, and customers in one place.
          </h1>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
            {[
              ["৳482k", "sales tracked"],
              ["1.2k", "orders"],
              ["346", "products"],
            ].map(([value, label]) => (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 shadow-xs" key={label}>
                <p className="text-2xl font-black text-[#FFC72C]">{value}</p>
                <p className="mt-1 text-sm font-medium text-stone-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm font-medium text-stone-405/85">
          Connected to `/api/v1/auth/login` and restricted to admin users.
        </p>
      </section>

      <section className="flex items-center justify-center p-5 bg-stone-50/30">
        <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-900/5">
          <div className="mb-8">
            <Link className="lg:hidden block mb-4 transition-opacity hover:opacity-90" href="/">
              <MangoLogo />
            </Link>
            <h2 className="mt-6 text-3xl font-black text-stone-850">Admin login</h2>
            <p className="mt-2 text-base font-medium text-stone-600">
              Sign in with an admin email and password.
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-black text-stone-700">
                Email address
              </span>
              <input
                className="h-13 w-full rounded-xl border border-stone-300 px-4 font-medium outline-none transition focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 text-stone-800 placeholder-stone-400"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-black text-stone-700">
                Password
              </span>
              <input
                className="h-13 w-full rounded-xl border border-stone-300 px-4 font-medium outline-none transition focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 text-stone-800 placeholder-stone-400"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </p>
            )}
            <button
              className="flex h-13 w-full items-center justify-center rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-base font-black text-white shadow-lg shadow-emerald-700/20 disabled:cursor-not-allowed disabled:bg-stone-400 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Signing in..." : "Login to dashboard"}
            </button>
            <p className="rounded-xl bg-stone-50 px-4 py-3 text-xs font-semibold text-stone-500 border border-stone-100">
              Seed admin: david.brown@example.com / password123
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
