"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiHeart, FiLogOut, FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
import humanaLogo from "../../references/logo.png";
import { useAuth } from "./auth-context";
import { useCart } from "./cart-context";
import { useWishlist } from "./wishlist-context";

export default function StorefrontHeader() {
  const { itemCount, items, subtotal } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const { user, login, register, logout } = useAuth();

  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [mounted, setMounted] = useState(false);

  // Auth form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form fields whenever the modal mode changes
  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFormError("");
    setIsSubmitting(false);
  }, [authMode]);

  // Close modal on Escape key
  useEffect(() => {
    if (!authMode) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAuthMode(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [authMode]);

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (authMode === "register" && password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      setAuthMode(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-white">
      {/* Announcement bar */}
      <section className="bg-black px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
        Join our community and get 10% off every piece
      </section>

      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.08em] lg:flex">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="#">New In</Link>
            <Link href="#">Brands</Link>
            <Link href="#">Archive</Link>
            {!user && (
              <button type="button" onClick={() => setAuthMode("login")}>
                Log In
              </button>
            )}
          </nav>

          {/* Logo */}
          <Link href="/" className="mx-auto lg:mx-0" aria-label="Humana Vintage home">
            <Image
              src={humanaLogo}
              alt="Humana Vintage"
              priority
              className="h-9 w-auto sm:h-11"
            />
          </Link>

          {/* Desktop search bar */}
          <Link
            href="/shop"
            className="hidden min-w-[220px] items-center gap-2 border-b border-black pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] xl:flex"
          >
            <FiSearch className="text-sm" />
            <span>Football jerseys</span>
          </Link>

          {/* Desktop icons */}
          <div className="hidden items-center gap-5 text-lg text-black lg:flex">
            {/* User / account */}
            {user ? (
              <div className="group relative">
                <button
                  type="button"
                  aria-label="Account menu"
                  className="flex items-center gap-1.5 text-sm font-bold"
                >
                  <FiUser />
                  <span className="max-w-[90px] truncate text-[11px] uppercase tracking-[0.06em]">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
                <div className="invisible absolute right-0 top-full w-44 translate-y-3 border border-neutral-200 bg-white opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] hover:bg-neutral-50"
                  >
                    My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut className="text-sm" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                aria-label="Open login modal"
              >
                <FiUser />
              </button>
            )}

            {/* Wishlist */}
            <Link href="/wishlist" aria-label="Wishlist" className="relative block">
              <FiHeart />
              {mounted && wishlistItemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                  {wishlistItemCount}
                </span>
              )}
            </Link>

            {/* Cart with hover preview */}
            <div className="group relative">
              <Link href="/cart" aria-label="Cart" className="relative block">
                <FiShoppingBag />
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {mounted ? itemCount : 0}
                </span>
              </Link>

              <div className="invisible absolute right-0 top-full w-80 translate-y-3 border border-neutral-200 bg-white p-4 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <h2 className="text-xs font-black uppercase tracking-[0.12em]">Cart Overview</h2>
                {items.length === 0 ? (
                  <p className="mt-4 text-sm text-neutral-500">Your cart is empty.</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {items.slice(0, 3).map((item) => (
                      <div key={item.slug} className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 bg-neutral-50">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover p-2"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black uppercase">{item.name}</p>
                          <p className="mt-1 text-xs text-neutral-500">
                            Qty {item.quantity} · €{item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-neutral-200 pt-3 text-sm font-black">
                      Subtotal: €{subtotal.toFixed(2)}
                    </div>
                  </div>
                )}
                <Link
                  href="/cart"
                  className="mt-4 block bg-black px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-white"
                >
                  View Cart
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="border-t border-neutral-200 px-4 py-2 xl:hidden">
          <Link
            href="/shop"
            className="mx-auto flex max-w-[520px] items-center gap-2 border-b border-black pb-1 text-[11px] uppercase tracking-[0.08em]"
          >
            <FiSearch className="text-sm" />
            <span>Football jerseys</span>
          </Link>
        </div>
      </header>

      {/* Auth Modal */}
      {authMode && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAuthMode(null);
          }}
        >
          <div ref={modalRef} className="w-full max-w-md bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">
                {authMode === "login" ? "Log in" : "Create account"}
              </h2>
              <button
                type="button"
                className="text-2xl leading-none"
                onClick={() => setAuthMode(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Login / Register tab toggle */}
            <div className="mt-5 grid grid-cols-2 border border-neutral-200 text-sm font-black uppercase">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`px-4 py-3 transition ${
                  authMode === "login" ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-50"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`px-4 py-3 transition ${
                  authMode === "register" ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-50"
                }`}
              >
                Register
              </button>
            </div>

            {formError && (
              <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="mt-5 space-y-4" noValidate>
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Full name *"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
                />
              )}
              <input
                type="email"
                placeholder="Email address *"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
              />
              <input
                type="password"
                placeholder="Password *"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
              />
              {authMode === "register" && (
                <input
                  type="password"
                  placeholder="Confirm password *"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
                />
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-neutral-800 disabled:bg-neutral-400"
              >
                {isSubmitting
                  ? authMode === "login"
                    ? "Logging in…"
                    : "Creating account…"
                  : authMode === "login"
                    ? "Log in"
                    : "Register"}
              </button>
            </form>

            {authMode === "login" && (
              <p className="mt-4 text-center text-xs text-neutral-500">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="font-bold underline hover:text-black"
                >
                  Create one
                </button>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
