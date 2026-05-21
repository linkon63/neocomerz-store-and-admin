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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/store" className="text-xl font-black tracking-tight shrink-0 text-slate-900">
            NeoComerz
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            {navLinks.map((l) => {
              const active = l.match(pathname);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`transition hover:text-slate-900 ${active ? "text-slate-900" : ""}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link
              href="/store/search"
              className="p-2 rounded-full hover:bg-slate-100 transition"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </Link>

            {/* Wishlist */}
            {user && (
              <Link
                href="/store/wishlist"
                className="p-2 rounded-full hover:bg-slate-100 transition"
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
              className="relative p-2 rounded-full hover:bg-slate-100 transition"
              aria-label="Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-bold hover:border-slate-900 transition"
                >
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black/5 py-1 z-50">
                    <Link
                      href="/store/account"
                      className="block px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/store/orders"
                      className="block px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/store/wishlist"
                      className="block px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Wishlist
                    </Link>
                    <hr className="my-1 border-[#ede8e1]" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-slate-50 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/store/login"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-slate-100 transition"
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

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/store/search"
              className="block py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
              onClick={() => setMenuOpen(false)}
            >
              Search
            </Link>
            {!user && (
              <Link
                href="/store/login"
                className="mt-2 block text-center rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white"
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
      <footer className="bg-slate-900 text-white mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/store" className="text-xl font-black tracking-tight text-white">
              NeoComerz
            </Link>
            <p className="mt-3 text-sm leading-6 text-slate-400 max-w-xs">
              A full-featured ecommerce store for testing all API features — products, cart, orders, reviews, and more.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4">Shop</h3>
            <div className="grid gap-2 text-sm text-slate-400">
              <Link href="/store/products" className="hover:text-white transition">All Products</Link>
              <Link href="/store/cart" className="hover:text-white transition">Cart</Link>
              <Link href="/store/wishlist" className="hover:text-white transition">Wishlist</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4">Account</h3>
            <div className="grid gap-2 text-sm text-slate-400">
              <Link href="/store/login" className="hover:text-white transition">Sign In</Link>
              <Link href="/store/register" className="hover:text-white transition">Register</Link>
              <Link href="/store/orders" className="hover:text-white transition">My Orders</Link>
              <Link href="/admin" className="hover:text-white transition">Admin Panel ↗</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200/10 px-4 py-4 text-center text-xs text-slate-500">
          © 2026 NeoComerz — API Testing Store
        </div>
      </footer>
    </div>
  );
}
