"use client";

import { useState } from "react";
import { FiLoader, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";
import { useAuth } from "@/app/_providers/auth-provider";

export default function AuthView() {
  const { login, register } = useAuth();

  // Authentication UI view toggling (login / register)
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      toast.error("Please fill in email and password.");
      return;
    }

    setAuthSubmitting(true);
    try {
      if (authView === "login") {
        await login(authEmail, authPassword);
        toast.success("Welcome back!");
      } else {
        if (authPassword !== authConfirmPassword) {
          toast.error("Passwords do not match.");
          return;
        }
        await register(authName, authEmail, authPassword);
        toast.success("Account created successfully!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-[#FAF9F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[450px] bg-white border border-stone-200 p-8 shadow-sm flex flex-col items-center rounded-lg animate-fadeIn">
        <h1 className="font-['Bembo_Std'] text-3xl font-normal text-zinc-800 tracking-wide mb-6">
          {authView === "login" ? "Login" : "Sign Up"}
        </h1>
        
        <div className="flex gap-4 mb-8 border-b border-stone-150 w-full justify-center">
          <button
            onClick={() => setAuthView("login")}
            className={`pb-2 text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
              authView === "login"
                ? "border-b-2 border-stone-850 text-black font-bold"
                : "text-zinc-400 hover:text-zinc-650"
            }`}
          >
            I have an account
          </button>
          <button
            onClick={() => setAuthView("register")}
            className={`pb-2 text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
              authView === "register"
                ? "border-b-2 border-stone-850 text-black font-bold"
                : "text-zinc-400 hover:text-zinc-650"
            }`}
          >
            Create New Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {authView === "register" && (
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                className="w-full border border-stone-200 px-4 py-3 text-sm focus:border-stone-400 outline-none"
                required
                placeholder="Full Name"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
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
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
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

          {authView === "register" && (
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={authConfirmPassword}
                onChange={(e) => setAuthConfirmPassword(e.target.value)}
                className="w-full border border-stone-200 px-4 py-3 text-sm focus:border-stone-400 outline-none"
                required
                placeholder="Confirm password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={authSubmitting}
            className="w-full bg-[#1A1A1A] hover:bg-stone-850 text-white font-sans text-xs font-semibold tracking-[0.16em] uppercase py-4 shadow transition duration-200 flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {authSubmitting ? (
              <FiLoader className="animate-spin text-white w-4 h-4" />
            ) : authView === "login" ? (
              "Log In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
