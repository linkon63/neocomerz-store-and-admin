"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState, useRef } from "react";
import { clearStoreSession, getStoredUser, type StoreUser } from "@/lib/store-api";

export function StoreShell({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getStoredUser());
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Update cart count from localStorage
  useEffect(() => {
    const update = () => {
      try {
        const raw = localStorage.getItem("store_cart_count");
        setCartCount(raw ? parseInt(raw, 10) : 0);
      } catch {
        setCartCount(0);
      }
    };
    update();
    window.addEventListener("cart-updated", update);
    return () => window.removeEventListener("cart-updated", update);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogout() {
    clearStoreSession();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/store");
  }

  const navLinks = [
    { href: "/store/products", label: "All Products", match: (p: string) => p === "/store/products" },
    { href: "/store/products?status=active", label: "New Arrivals", match: (p: string) => p.includes("status=active") },
    { href: "/store/cart", label: "Cart", match: (p: string) => p === "/store/cart" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#e8edf4] bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-[1800px] w-full items-center justify-between px-6 py-4 sm:px-12 lg:px-16">
          {/* Logo */}
          <Link href="/store" className="text-lg font-bold tracking-[0.12em] shrink-0 text-slate-800 hover:text-teal-600 transition-colors flex items-center gap-2">
            <span className="bg-teal-600 text-white w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-xs">N</span>
            <span className="font-serif font-extrabold text-slate-900">NeoComerz</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold tracking-wider uppercase text-slate-500">
            {navLinks.map((l) => {
              const active = l.match(pathname);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`transition-all duration-200 hover:text-teal-600 relative py-1 group ${active ? "text-teal-600" : ""}`}
                >
                  {l.label}
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-teal-600 transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"}`} />
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <Link
              href="/store/search"
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100/70 hover:text-teal-600 transition-all duration-200"
              aria-label="Search"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
              </svg>
            </Link>

            {/* Wishlist */}
            {user && (
              <Link
                href="/store/wishlist"
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100/70 hover:text-teal-600 transition-all duration-200"
                aria-label="Wishlist"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/store/cart"
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100/70 hover:text-teal-600 transition-all duration-200"
              aria-label="Cart"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-extrabold text-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 hover:border-teal-400 hover:text-teal-600 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-slate-700 transition-all duration-250 cursor-pointer shadow-xs"
                >
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                  <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center">
                    <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-lg p-2 z-50 border border-slate-100/60 animate-scale-in">
                    <Link
                      href="/store/account"
                      className="block px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/store/orders"
                      className="block px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/store/wishlist"
                      className="block px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Wishlist
                    </Link>
                    <hr className="my-1.5 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/store/login"
                className="rounded-xl bg-teal-600 hover:bg-teal-750 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-650 hover:text-teal-650 transition cursor-pointer"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-2 shadow-xs animate-slide-up">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wider text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/store/search"
              className="block py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wider text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition"
              onClick={() => setMenuOpen(false)}
            >
              Search
            </Link>
            {!user && (
              <Link
                href="/store/login"
                className="mt-3 block text-center rounded-xl bg-teal-600 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-teal-700 transition"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#060d1a] text-slate-400 mt-auto border-t border-slate-800/60">
        <div className="mx-auto max-w-[1800px] w-full px-6 py-16 sm:px-12 lg:px-16 grid gap-10 md:grid-cols-4">
          
          {/* Column 1: Brand Info + Payment Options */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/store" className="text-lg font-bold tracking-[0.12em] text-white flex items-center gap-2">
              <span className="bg-teal-600 text-white w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-xs">N</span>
              <span className="font-serif font-extrabold text-white">NeoComerz</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 max-w-md font-semibold">
              দেশীয় ই-কমার্স মার্কেটপ্লেস ও প্রফেশনাল এডমিন প্যানেল টেস্টিং প্রজেক্ট। এখানে ক্যাশ অন ডেলিভারি, শপিং কার্ট, ইউজার একাউন্ট ও লাইভ অর্ডার প্রসেস স্মুথলি পরীক্ষা করা যাবে।
            </p>
            
            {/* Payment Badges (Vibrant Bangladeshi colors) */}
            <div className="pt-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-3">আমাদের পেমেন্ট পার্টনারস</span>
              <div className="flex flex-wrap gap-2.5">
                <span className="bg-[#e2127a] text-[10px] font-extrabold text-white px-3 py-1 rounded-lg border border-[#e2127a]/20 shadow-xs cursor-default">bKash</span>
                <span className="bg-[#f05a24] text-[10px] font-extrabold text-white px-3 py-1 rounded-lg border border-[#f05a24]/20 shadow-xs cursor-default">Nagad</span>
                <span className="bg-[#8c3494] text-[10px] font-extrabold text-white px-3 py-1 rounded-lg border border-[#8c3494]/20 shadow-xs cursor-default">Rocket</span>
                <span className="bg-[#1a1f71] text-[10px] font-extrabold text-white px-3 py-1 rounded-lg border border-[#1a1f71]/20 shadow-xs cursor-default">Visa</span>
                <span className="bg-teal-750 text-[10px] font-extrabold text-white px-3 py-1 rounded-lg border border-teal-650/20 shadow-xs cursor-default">Cash On Delivery</span>
              </div>
            </div>
          </div>
          
          {/* Column 2: Quick Shop Link Categories */}
          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-teal-400 mb-6">কুইক শপ</h3>
            <div className="grid gap-3.5 text-xs font-semibold text-slate-350">
              <Link href="/store/products" className="hover:text-white hover:underline transition-all">সব প্রোডাক্ট কালেকশন</Link>
              <Link href="/store/products?status=active" className="hover:text-white hover:underline transition-all">নতুন কালেকশন</Link>
              <Link href="/store/cart" className="hover:text-white hover:underline transition-all">শপিং কার্ট</Link>
              <Link href="/store/wishlist" className="hover:text-white hover:underline transition-all">আমার উইশলিস্ট</Link>
            </div>
          </div>
          
          {/* Column 3: Contact & Info */}
          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-teal-400 mb-6">যোগাযোগ ও ঠিকানা</h3>
            <div className="grid gap-3.5 text-xs font-semibold text-slate-350">
              <div className="flex items-center gap-2">
                <span className="text-teal-400">📞</span>
                <span>+৮৮০ ১৭০০-০০০০০০</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-teal-400">✉️</span>
                <span>support@neocomerz.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-teal-400">📍</span>
                <span>গুলশান, ঢাকা, বাংলাদেশ</span>
              </div>
              <hr className="border-slate-800 my-1" />
              <Link href="/admin" className="text-amber-400 font-extrabold hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>এডমিন ড্যাশবোর্ড</span>
                <span className="text-[10px]">↗</span>
              </Link>
            </div>
          </div>
          
        </div>
        
        {/* Bottom copyright bar */}
        <div className="border-t border-slate-800/50 px-6 py-7 text-center text-[10px] text-slate-600 font-semibold tracking-wider">
          © {new Date().getFullYear()} NeoComerz. All Rights Reserved. Designed with absolute precision.
        </div>
      </footer>
    </div>
  );
}
