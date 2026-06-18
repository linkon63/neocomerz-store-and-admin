"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, setAdminSession, type AdminUser } from "../../../lib/admin-api";
import { canEnterAdminPanel } from "../../../lib/admin-sections";

type LoginResponse = {
  accessToken: string;
  user: AdminUser;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      if (!canEnterAdminPanel(response.user)) {
        throw new Error("This account does not have admin panel access.");
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
    <main className="admin-dashboard grid min-h-screen bg-[#f7f8fb] text-slate-950 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link className="text-5xl font-black italic tracking-tight" href="/">
          Mock
        </Link>
        <div>
          <p className="mb-4 inline-flex rounded-full bg-blue-500 px-4 py-2 text-sm font-black">
            NeoComerz Admin
          </p>
          <h1 className="max-w-xl text-6xl font-black leading-[1.03] tracking-normal">
            Manage orders, catalog, stock, and customers in one place.
          </h1>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
            {[
              ["৳482k", "sales tracked"],
              ["1.2k", "orders"],
              ["346", "products"],
            ].map(([value, label]) => (
              <div className="rounded-2xl bg-white/10 p-5" key={label}>
                <p className="text-2xl font-black">{value}</p>
                <p className="mt-1 text-sm font-medium text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm font-medium text-slate-400">
          Connected to `/api/v1/auth/login` and restricted to admin users.
        </p>
      </section>

      <section className="flex items-center justify-center p-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
          <div className="mb-8">
            <Link className="text-4xl font-black italic lg:hidden" href="/">
              Mock
            </Link>
            <h2 className="mt-6 text-3xl font-black">Admin login</h2>
            <p className="mt-2 text-base font-medium text-slate-600">
              Sign in with an admin email and password.
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700">
                Email address
              </span>
              <input
                className="h-13 w-full rounded-xl border border-slate-300 px-4 font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700">
                Password
              </span>
              <input
                className="h-13 w-full rounded-xl border border-slate-300 px-4 font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
              className="flex h-13 w-full items-center justify-center rounded-xl bg-blue-600 text-base font-black text-white shadow-lg shadow-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Signing in..." : "Login to dashboard"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
