"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiLoader, FiEye, FiEyeOff } from "react-icons/fi";
import { apiRequest, setAdminSession, type AdminUser } from "../../../lib/admin-api";

type LoginResponse = {
  accessToken: string;
  user: AdminUser;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("david.brown@example.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen flex items-center justify-center bg-[#FAF9F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[450px] bg-white border border-stone-200 p-8 shadow-sm flex flex-col items-center rounded-lg animate-fadeIn">
        <Link
          href="/"
          className="font-['Bembo_Std'] text-3xl font-normal text-zinc-800 tracking-wide mb-2"
        >
          NeoComerz
        </Link>
        <h1 className="font-['Bembo_Std'] text-3xl font-normal text-zinc-800 tracking-wide mb-6">
          Admin Login
        </h1>

        <div className="flex mb-8 border-b border-stone-150 w-full justify-center">
          <span className="pb-2 text-xs font-bold tracking-wider uppercase border-b-2 border-stone-850 text-black">
            Administrator Access
          </span>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-stone-200 px-4 py-3 text-sm focus:border-stone-400 outline-none"
              required
              placeholder="Email Address"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-stone-200 px-4 py-3 pr-10 text-sm focus:border-stone-400 outline-none"
                required
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 transition cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold tracking-wide text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1A1A1A] hover:bg-stone-850 text-white font-sans text-xs font-semibold tracking-[0.16em] uppercase py-4 shadow transition duration-200 flex items-center justify-center gap-2 cursor-pointer mt-4 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <FiLoader className="animate-spin text-white w-4 h-4" />
            ) : (
              "Log In"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
