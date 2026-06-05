"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState, useRef } from "react";
import { clearStoreSession, getStoredUser, type StoreUser } from "@/lib/store-api";

// Premium Inline SVG Mango Express Logo
export function MangoLogo({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg className="w-8.5 h-8.5 animate-leaf-sway shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Leaf */}
        <path d="M48 32C48 32 56 16 72 13C72 13 74 26 67 36C60 46 48 32 48 32Z" fill="#2E7D32" />
        {/* Mango body */}
        <path d="M35 78C22 68 18 48 25 33C32 18 52 23 65 38C78 53 75 73 60 83C48 91 42 84 35 78Z" fill="url(#mangoGradHeader)" />
        {/* Leaf stem */}
        <path d="M48 32C50 37 55 42 60 37" stroke="#1B5E20" strokeWidth="3" strokeLinecap="round" />
        <defs>
          <linearGradient id="mangoGradHeader" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFA000" />
            <stop offset="50%" stopColor="#FFC72C" />
            <stop offset="100%" stopColor="#FFE082" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col">
        <span className={`text-[15px] font-black uppercase tracking-wider ${light ? 'text-white' : 'text-stone-900'} leading-tight font-display`}>
          Mango<span className="text-[#FFC72C]">Express</span>
        </span>
        <span className={`text-[8px] font-extrabold tracking-[0.25em] uppercase ${light ? 'text-amber-300' : 'text-[#2E7D32]'} leading-none`}>
          Naogaon
        </span>
      </div>
    </div>
  );
}

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
    { href: "/store/products", label: "সকল আম (All Mangoes)", match: (p: string) => p === "/store/products" },
    { href: "/store/products?status=active", label: "সেরা অফার (Premium Harvest)", match: (p: string) => p.includes("status=active") },
    { href: "/store/cart", label: "শপিং কার্ট (Cart)", match: (p: string) => p === "/store/cart" },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#E8E0D4] bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-[1800px] w-full items-center justify-between px-6 py-4.5 sm:px-12 lg:px-16">
          {/* Logo */}
          <Link href="/store" className="shrink-0 transition-opacity hover:opacity-90">
            <MangoLogo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold tracking-wider uppercase text-stone-600">
            {navLinks.map((l) => {
              const active = l.match(pathname);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`transition-all duration-200 hover:text-[#2E7D32] relative py-1 group ${active ? "text-[#2E7D32]" : ""}`}
                >
                  {l.label}
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-[#2E7D32] transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"}`} />
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <Link
              href="/store/search"
              className="p-2 rounded-xl text-stone-600 hover:bg-[#FFF8E7] hover:text-[#2E7D32] transition-all duration-200"
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
                className="p-2 rounded-xl text-stone-600 hover:bg-[#FFF8E7] hover:text-[#2E7D32] transition-all duration-200"
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
              className="relative p-2 rounded-xl text-stone-600 hover:bg-[#FFF8E7] hover:text-[#2E7D32] transition-all duration-200"
              aria-label="Cart"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-extrabold text-white shadow-xs animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-stone-250 hover:border-[#FFC72C] hover:text-[#2E7D32] px-3.5 py-1.5 text-xs font-semibold tracking-wider text-stone-700 transition-all duration-250 cursor-pointer shadow-xs bg-white"
                >
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                  <div className="w-5 h-5 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-lg p-2 z-50 border border-stone-100 animate-scale-in">
                    <Link
                      href="/store/account"
                      className="block px-4 py-2.5 text-xs font-semibold rounded-xl text-stone-700 hover:bg-[#E8F5E9] hover:text-[#2E7D32] transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Profile (আমার প্রোফাইল)
                    </Link>
                    <Link
                      href="/store/orders"
                      className="block px-4 py-2.5 text-xs font-semibold rounded-xl text-stone-700 hover:bg-[#E8F5E9] hover:text-[#2E7D32] transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Orders (আমার অর্ডার)
                    </Link>
                    <Link
                      href="/store/wishlist"
                      className="block px-4 py-2.5 text-xs font-semibold rounded-xl text-stone-700 hover:bg-[#E8F5E9] hover:text-[#2E7D32] transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Wishlist (পছন্দের তালিকা)
                    </Link>
                    <hr className="my-1.5 border-stone-100" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                    >
                      Sign Out (লগ আউট)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/store/login"
                className="rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-stone-100 text-stone-600 hover:text-[#2E7D32] transition cursor-pointer"
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
          <div className="md:hidden border-t border-stone-100 bg-white px-6 py-4 flex flex-col gap-2 shadow-xs animate-slide-up">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wider text-stone-600 hover:bg-[#E8F5E9] hover:text-[#2E7D32] transition"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/store/search"
              className="block py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wider text-stone-600 hover:bg-[#E8F5E9] hover:text-[#2E7D32] transition"
              onClick={() => setMenuOpen(false)}
            >
              Search (অনুসন্ধান)
            </Link>
            {!user && (
              <Link
                href="/store/login"
                className="mt-3 block text-center rounded-xl bg-[#2E7D32] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#1B5E20] transition"
                onClick={() => setMenuOpen(false)}
              >
                Sign In (লগ ইন)
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#0F291E] text-stone-300 mt-auto border-t border-[#1B5E20]/35">
        <div className="mx-auto max-w-[1800px] w-full px-6 py-16 sm:px-12 lg:px-16 grid gap-10 md:grid-cols-4">
          
          {/* Column 1: Brand Info + Payment Options */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/store" className="inline-block transition-opacity hover:opacity-90">
              <MangoLogo light />
            </Link>
            <p className="text-xs leading-relaxed text-stone-300 max-w-md font-medium">
              নওগাঁর সুমিষ্ট ও বিষমুক্ত ল্যাংড়া, ফজলি, আম্রপালি ও ক্ষীরশাপাত আম সরাসরি বাগান থেকে আপনার ঘরে পৌঁছে দিচ্ছে আম এক্সপ্রেস। কোনো ক্ষতিকর কেমিক্যাল বা ফরমালিন ছাড়া সম্পূর্ণ প্রাকৃতিকভাবে পাকানো আম পেতে আমাদের অর্ডার করুন।
            </p>
            
            {/* Payment Badges (Vibrant Bangladeshi colors) */}
            <div className="pt-2">
              <span className="text-[10px] font-extrabold text-amber-400/90 uppercase tracking-widest block mb-3 font-display">আমাদের পেমেন্ট পার্টনারস</span>
              <div className="flex flex-wrap gap-2.5">
                <span className="bg-[#e2127a] text-[10px] font-bold text-white px-3 py-1 rounded-lg shadow-xs cursor-default">bKash (বিকাশ)</span>
                <span className="bg-[#f05a24] text-[10px] font-bold text-white px-3 py-1 rounded-lg shadow-xs cursor-default">Nagad (নগদ)</span>
                <span className="bg-[#8c3494] text-[10px] font-bold text-white px-3 py-1 rounded-lg shadow-xs cursor-default">Rocket (রকেট)</span>
                <span className="bg-[#1a1f71] text-[10px] font-bold text-white px-3 py-1 rounded-lg shadow-xs cursor-default">Visa</span>
                <span className="bg-[#2E7D32] text-[10px] font-bold text-white px-3 py-1 rounded-lg border border-emerald-600/30 shadow-xs cursor-default">Cash On Delivery</span>
              </div>
            </div>
          </div>
          
          {/* Column 2: Quick Shop Link Categories */}
          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#FFC72C] mb-6 font-display">কুইক মেনু</h3>
            <div className="grid gap-3.5 text-xs font-semibold text-stone-350">
              <Link href="/store/products" className="hover:text-white hover:underline transition-all">সকল আম কালেকশন</Link>
              <Link href="/store/products?status=active" className="hover:text-white hover:underline transition-all">নতুন সংগ্রহের আম</Link>
              <Link href="/store/cart" className="hover:text-white hover:underline transition-all">শপিং কার্ট</Link>
              <Link href="/store/wishlist" className="hover:text-white hover:underline transition-all">আমার পছন্দের তালিকা</Link>
            </div>
          </div>
          
          {/* Column 3: Contact & Info */}
          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#FFC72C] mb-6 font-display">যোগাযোগ ও ঠিকানা</h3>
            <div className="grid gap-3.5 text-xs font-semibold text-stone-350">
              <div className="flex items-center gap-2">
                <span className="text-[#FFC72C]">📞</span>
                <span>+৮৮০ ১৭০৭৮১৯৬৭৬</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#FFC72C]">✉️</span>
                <span className="break-all">muhammadabdulla442467@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#FFC72C]">📍</span>
                <span>নওগাঁ, রাজশাহী বিভাগ, বাংলাদেশ</span>
              </div>
              <hr className="border-[#1B5E20]/30 my-1" />
              <Link href="/admin" className="text-amber-400 font-extrabold hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>এডমিন ড্যাশবোর্ড</span>
                <span className="text-[10px]">↗</span>
              </Link>
            </div>
          </div>
          
        </div>
        
        {/* Bottom copyright bar */}
        <div className="border-t border-[#1B5E20]/20 px-6 py-7 text-center text-[10px] text-stone-400/80 font-semibold tracking-wider bg-[#0A1D15]">
          © {new Date().getFullYear()} Mango Express Naogaon. All Rights Reserved. Freshness and trust delivered directly to your doorstep.
        </div>
      </footer>
    </div>
  );
}
