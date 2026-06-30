"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/app/_providers/auth-provider";
import { LuX, LuEye, LuEyeOff, LuLoader } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";

type AuthView = "login" | "register";

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, register } = useAuth();

  const [view, setView] = useState<AuthView>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!showAuthModal) return null;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchView = () => {
    const next = view === "login" ? "register" : "login";
    setView(next);
    resetForm();
  };

  const handleClose = () => {
    setShowAuthModal(false);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (view === "register") {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (view === "login") {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full bg-[#F5F5DC] shadow-2xl rounded-2xl overflow-hidden flex p-2 gap-2 max-w-200">
        <button
          type="button"
          onClick={handleClose}
          className="absolute bg-white p-2 rounded-full top-4 right-4 z-10 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <LuX className="w-6 h-6" />
        </button>

        {/* Left Form Section */}
        <div className="w-3/4 px-8 py-10 bg-white rounded-2xl">
          <h2 className="text-[40px] text-center font-gotham font-normal text-[#262626] tracking-wide uppercase">
            {view === "login" ? "Log In" : "Sign Up"}
          </h2>
          <p className="mt-2 text-sm text-center text-zinc-600 font-gotham">
            {view === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={switchView}
                  className="font-semibold text-[#B4A676] hover:text-[#9a884c] transition-colors cursor-pointer"
                >
                  CREATE ACCOUNT
                </button>
              </>
            ) : (
              <>
                Already a member?{" "}
                <button
                  type="button"
                  onClick={switchView}
                  className="font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                >
                  LOG IN
                </button>
              </>
            )}
          </p>

          {error && (
            <div className="mt-4 rounded bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700 font-gotham">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {view === "register" && (
              <div>
                <label htmlFor="auth-name" className="block text-sm font-semibold text-zinc-700 font-gotham mb-1">
                  Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-500 transition-colors font-gotham"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-sm font-semibold text-zinc-700 font-gotham mb-1">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-500 transition-colors font-gotham"
              />
            </div>

            <div className={`grid items-center justify-between gap-2 w-full ${view === "login" ? "grid-cols-1" : "xl:grid-cols-2"}`}>
              <div className="w-full">
                <label htmlFor="auth-password" className="block text-sm font-semibold text-zinc-700 font-gotham mb-1">
                  {view === "login" ? "Password" : "Type Password"}
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={view === "login" ? "Enter your password" : "Type new password"}
                    className="w-full border border-zinc-300 px-4 py-2.5 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-500 transition-colors font-gotham"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {view === "register" && (
                <div>
                  <label htmlFor="auth-confirm-password" className="block text-sm font-semibold text-zinc-700 font-gotham mb-1">
                    Re-Type Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full border border-zinc-300 px-4 py-2.5 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-500 transition-colors font-gotham"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {view === "login" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember-login"
                  checked={rememberLogin}
                  onChange={(e) => setRememberLogin(e.target.checked)}
                  className="w-4 h-4 accent-[#B4A676] cursor-pointer text-white"
                />
                <label htmlFor="remember-login" className="text-sm text-zinc-600 font-gotham">
                  Remember login
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 text-white py-3 rounded-full font-gotham font-bold text-sm tracking-wider uppercase hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting && <LuLoader className="w-4 h-4 animate-spin" />}
              {submitting
                ? view === "login"
                  ? "LOGGING IN..."
                  : "SIGNING UP..."
                : view === "login"
                  ? "LOG IN"
                  : "SIGN UP"}
            </button>
          </form>

          {view === "login" && (
            <p className="mt-4 text-center text-sm text-[#B4A676] font-gotham">
              <button type="button" className="hover:text-[#9a884c] transition-colors cursor-pointer">
                Having trouble to log in?
              </button>
            </p>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-zinc-500 font-gotham">Or Continue with</span>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 border border-zinc-300 py-2.5 rounded-lg hover:bg-zinc-50 transition-colors font-gotham text-sm text-zinc-700 cursor-pointer"
              >
                <FcGoogle className="w-5 h-5" />
                Google
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 border border-zinc-300 py-2.5 rounded-lg hover:bg-zinc-50 transition-colors font-gotham text-sm text-zinc-700 cursor-pointer"
              >
                <FaFacebookF className="w-5 h-5 text-blue-600" />
                Facebook
              </button>
            </div>
          </div>

          {view === "register" && (
            <p className="mt-6 text-center text-xs text-zinc-500 font-gotham">
              By sign up, you agree to the{" "}
              <button type="button" className="text-red-600 hover:text-red-700 transition-colors cursor-pointer">
                terms & conditions
              </button>
              .
            </p>
          )}
        </div>

        {/* Right Decorative Image Section */}
        <div className="w-1/4 relative flex items-center justify-center rounded-2xl">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-full h-full rounded-2xl flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 z-0" style={{ backgroundImage: "url('/images/login.webp')", backgroundSize: "cover", backgroundPosition: "center" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
