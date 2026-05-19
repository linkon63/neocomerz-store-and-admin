"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState, useRef } from "react";
import { clearStoreSession, getStoredUser, type StoreUser } from "@/lib/store-api";
import { SearchAutocomplete } from "./search-autocomplete";

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
    { href: "/store/products", label: "সব পণ্য", match: (p: string) => p === "/store/products" },
    { href: "/store/products?status=active", label: "নতুন পণ্য", match: (p: string) => p.includes("status=active") },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--store-bg)", color: "var(--store-text)", fontFamily: "Inter, sans-serif" }}>

      {/* Top announcement bar */}
      <div style={{ backgroundColor: "var(--store-primary)", color: "#fff" }} className="text-[12px] py-2 font-medium">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">COD</span>
            <span>সারাদেশে ক্যাশ অন ডেলিভারি — ২-৩ কর্মদিবসে ডেলিভারি</span>
          </div>
          <div className="flex items-center gap-4 text-white/80 text-[11px]">
            <a href="tel:09612345678" className="hover:text-white transition-colors">হেল্পলাইন: ০৯৬১২-৩৪৫৬৭৮</a>
            <span className="opacity-40">|</span>
            <span className="hidden sm:inline">৭ দিনের রিটার্ন পলিসি</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="glass-panel sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link href="/store" className="flex items-center gap-2 shrink-0 group">
              <div style={{ backgroundColor: "var(--store-primary)" }} className="w-8 h-8 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">N</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[18px] font-black tracking-tight" style={{ color: "var(--store-text)" }}>NeoComerz</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "var(--store-primary)" }}>Online Shop</span>
              </div>
            </Link>

            {/* Search */}
            <div className="hidden md:block flex-1 max-w-xl mx-4">
              <SearchAutocomplete />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              {/* Nav links — desktop */}
              <nav className="hidden lg:flex items-center gap-1 mr-2">
                {navLinks.map((l) => {
                  const active = l.match(pathname);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                        active
                          ? "text-white font-semibold"
                          : "hover:bg-gray-100"
                      }`}
                      style={active ? { backgroundColor: "var(--store-primary)", color: "#fff" } : { color: "var(--store-text-muted)" }}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile search */}
              <Link
                href="/store/search"
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: "var(--store-text)" }}
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </Link>

              {/* Wishlist */}
              {user && (
                <Link
                  href="/store/wishlist"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                  style={{ color: "var(--store-text-muted)" }}
                  aria-label="Wishlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </Link>
              )}

              {/* Cart */}
              <Link
                href="/store/cart"
                className="relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-100"
                style={{ color: "var(--store-text)" }}
                aria-label="Cart"
              >
                <div className="relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.076.721-.506 1.393-1.234 1.393H4.365c-.728 0-1.31-.672-1.234-1.393l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white animate-slide-up" style={{ backgroundColor: "var(--store-primary)" }}>
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col leading-none">
                  <span className="text-[10px]" style={{ color: "var(--store-text-muted)" }}>কার্ট</span>
                  <span className="text-[12px] font-bold">{cartCount} টি</span>
                </div>
              </Link>

              {/* User */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-all cursor-pointer hover:border-orange-300"
                    style={{ borderColor: "var(--store-border)", color: "var(--store-text)", backgroundColor: "var(--store-white)" }}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ backgroundColor: "var(--store-primary)" }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                    <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-xl border py-2 z-50 animate-scale-in" style={{ borderColor: "var(--store-border)" }}>
                      <div className="px-4 py-2.5 border-b mb-1" style={{ borderColor: "var(--store-border)" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--store-text-muted)" }}>লগইন করা আছেন</p>
                        <p className="text-[13px] font-bold truncate" style={{ color: "var(--store-text)" }}>{user.name}</p>
                      </div>
                      {[
                        { href: "/store/account", label: "আমার অ্যাকাউন্ট" },
                        { href: "/store/orders", label: "আমার অর্ডার" },
                        { href: "/store/wishlist", label: "উইশলিস্ট" },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2.5 text-[13px] font-medium transition-all hover:bg-orange-50"
                          style={{ color: "var(--store-text)" }}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <hr className="my-1.5" style={{ borderColor: "var(--store-border)" }} />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                      >
                        লগআউট
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/store/login"
                  className="btn-premium rounded-lg px-4 py-2 text-[13px] font-semibold"
                >
                  লগইন
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Menu"
              >
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t px-4 py-4 flex flex-col gap-2 animate-fade-in bg-white" style={{ borderColor: "var(--store-border)" }}>
            <div className="mb-3">
              <SearchAutocomplete />
            </div>
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block py-2.5 px-3 rounded-lg text-[14px] font-semibold transition-all hover:bg-orange-50"
                style={{ color: "var(--store-text)" }}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <>
                <Link href="/store/account" className="block py-2.5 px-3 rounded-lg text-[14px] font-semibold hover:bg-orange-50 transition-all" style={{ color: "var(--store-text)" }} onClick={() => setMenuOpen(false)}>আমার অ্যাকাউন্ট</Link>
                <Link href="/store/orders" className="block py-2.5 px-3 rounded-lg text-[14px] font-semibold hover:bg-orange-50 transition-all" style={{ color: "var(--store-text)" }} onClick={() => setMenuOpen(false)}>আমার অর্ডার</Link>
              </>
            )}
            {!user && (
              <Link
                href="/store/login"
                className="mt-2 block text-center rounded-lg py-3 text-[14px] font-bold text-white transition-colors"
                style={{ backgroundColor: "var(--store-primary)" }}
                onClick={() => setMenuOpen(false)}
              >
                লগইন করুন
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-12">{children}</main>

      {/* ── REFINED FOOTER ── */}
      <footer style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>
        {/* Trust Bar */}
        <div style={{ backgroundColor: "var(--store-primary)" }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px">
              {[
                { icon: "🚚", title: "ফ্রি ডেলিভারি", desc: "৫০০+ টাকায়" },
                { icon: "💳", title: "ক্যাশ অন ডেলিভারি", desc: "পেয়ে টাকা দিন" },
                { icon: "🔄", title: "৭ দিন রিটার্ন", desc: "সহজ প্রক্রিয়া" },
                { icon: "🛡️", title: "১০০% অরিজিনাল", desc: "গ্যারান্টি সহ" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4" style={{ backgroundColor: "var(--store-primary)" }}>
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-xs" style={{ opacity: 0.8 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-y-12 gap-x-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-12">
            {/* 1. Brand & About */}
            <div className="lg:pr-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--store-primary)" }}>
                  <span className="font-black text-lg text-white">N</span>
                </div>
                <span className="text-xl font-black">NeoComerz</span>
              </div>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "#94A3B8" }}>
                বাংলাদেশের বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। সেরা ব্র্যান্ডের পণ্য সেরা দামে, 
                দ্রুত ডেলিভারি এবং সহজ রিটার্ন পলিসি সহ আমরা আছি আপনার পাশে।
              </p>
              <div className="flex gap-3">
                {[
                  { label: "Facebook", icon: "f" },
                  { label: "Instagram", icon: "i" },
                  { label: "YouTube", icon: "y" },
                  { label: "WhatsApp", icon: "w" },
                ].map((s) => (
                  <button
                    key={s.label}
                    title={s.label}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold uppercase transition-all hover:scale-110 hover:bg-white/20"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#94A3B8" }}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Shopping Links */}
            <div className="lg:mx-auto">
              <h4 className="text-sm font-bold mb-6 uppercase tracking-widest" style={{ color: "#F8FAFC" }}>শপিং</h4>
              <ul className="space-y-4">
                {[
                  { href: "/store/products", label: "সব পণ্য" },
                  { href: "/store/products?status=active", label: "নতুন পণ্য" },
                  { href: "/store/cart", label: "আমার কার্ট" },
                  { href: "/store/wishlist", label: "উইশলিস্ট" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="group flex items-center gap-2.5 text-sm transition-colors hover:text-white" style={{ color: "#CBD5E1", opacity: 0.85 }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 transition-colors group-hover:bg-[var(--store-primary)]" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Account Links */}
            <div className="lg:mx-auto">
              <h4 className="text-sm font-bold mb-6 uppercase tracking-widest" style={{ color: "#F8FAFC" }}>অ্যাকাউন্ট</h4>
              <ul className="space-y-4">
                {[
                  { href: "/store/login", label: "লগইন করুন" },
                  { href: "/store/register", label: "নতুন অ্যাকাউন্ট" },
                  { href: "/store/orders", label: "অর্ডার ট্র্যাক করুন" },
                  { href: "/store/account", label: "আমার প্রোফাইল" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="group flex items-center gap-2.5 text-sm transition-colors hover:text-white" style={{ color: "#CBD5E1", opacity: 0.85 }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 transition-colors group-hover:bg-[var(--store-primary)]" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Contact & Newsletter */}
            <div>
              <h4 className="text-sm font-bold mb-6 uppercase tracking-widest" style={{ color: "#F8FAFC" }}>যোগাযোগ</h4>
              <div className="space-y-5 mb-8">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                    <span className="text-lg">📞</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "#64748B" }}>হেল্পলাইন (২৪/৭)</p>
                    <a href="tel:09612345678" className="text-sm font-bold transition-colors hover:text-white" style={{ color: "#F1F5F9" }}>
                      ০৯৬১২-৩৪৫৬৭৮
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                    <span className="text-lg">📧</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "#64748B" }}>ইমেইল সাপোর্ট</p>
                    <a href="mailto:support@neocomerz.com" className="text-sm font-bold transition-colors hover:text-white" style={{ color: "#F1F5F9" }}>
                      support@neocomerz.com
                    </a>
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="flex rounded-lg overflow-hidden border focus-within:border-[var(--store-primary)] transition-colors" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <input
                  type="email"
                  placeholder="আপনার ইমেইল..."
                  className="flex-1 px-4 py-2.5 text-sm focus:outline-none placeholder-gray-500"
                  style={{ backgroundColor: "rgba(0,0,0,0.2)", color: "#FFFFFF" }}
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold transition-all hover:opacity-90 text-white shrink-0"
                  style={{ backgroundColor: "var(--store-primary)" }}
                >
                  সাবস্ক্রাইব
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#0B1121" }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs" style={{ color: "#64748B" }}>
                © 2026 NeoComerz — সর্বস্বত্ব সংরক্ষিত
              </p>
              <div className="flex items-center gap-4 text-xs" style={{ color: "#475569" }}>
                <Link href="/admin" className="transition-colors hover:text-white">Admin</Link>
                <span>|</span>
                <button className="transition-colors hover:text-white">Privacy</button>
                <span>|</span>
                <button className="transition-colors hover:text-white">Terms</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
