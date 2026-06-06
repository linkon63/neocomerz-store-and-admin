"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState, useRef } from "react";
import { clearStoreSession, getStoredUser, type StoreUser, cartApi, wishlistApi, getStoreToken, settingsApi, getProxyImageUrl, formatPrice } from "@/lib/store-api";

// Premium Inline SVG Mango Express Logo
export function MangoLogo({ className = "", light = false }: { className?: string; light?: boolean }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    settingsApi.get()
      .then((sett) => {
        if (sett.logo) {
          setLogoUrl(getProxyImageUrl(sett.logo));
        }
      })
      .catch(() => {});
  }, []);

  if (logoUrl) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <img
          src={logoUrl}
          alt="Mango Express"
          className="h-10 w-auto object-contain shrink-0"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg className="w-8.5 h-8.5 animate-leaf-sway shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Leaf */}
        <path d="M48 32C48 32 56 16 72 13C72 13 74 26 67 36C60 46 48 32 48 32Z" fill="#16a34a" />
        {/* Mango body */}
        <path d="M35 78C22 68 18 48 25 33C32 18 52 23 65 38C78 53 75 73 60 83C48 91 42 84 35 78Z" fill="url(#mangoGradHeader)" />
        {/* Leaf stem */}
        <path d="M48 32C50 37 55 42 60 37" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
        <defs>
          <linearGradient id="mangoGradHeader" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff9f00" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col">
        <span className={`text-[15px] font-black uppercase tracking-wider ${light ? 'text-white' : 'text-stone-900'} leading-tight font-display`}>
          Mango<span className="text-[#ff9f00]">Express</span>
        </span>
        <span className={`text-[8px] font-extrabold tracking-[0.25em] uppercase ${light ? 'text-[#ff9f00]' : 'text-[#16a34a]'} leading-none`}>
          Naogaon
        </span>
      </div>
    </div>
  );
}

export function StoreShell({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [shellLoading, setShellLoading] = useState(true);
  const [navLinks, setNavLinks] = useState<{ href: string; label: string; match: (p: string) => boolean }[]>([]);
  const [cart, setCart] = useState<any | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getStoredUser());
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const timer = setTimeout(() => setShellLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // Fetch shop settings & menu configuration
  useEffect(() => {
    settingsApi.get()
      .then((sett) => {
        if (sett.menuConfig && Array.isArray(sett.menuConfig) && sett.menuConfig.length > 0) {
          const links = sett.menuConfig.map((item: any) => ({
            href: item.href,
            label: item.label,
            match: (p: string) => p === item.href || (item.href !== "/store" && p.startsWith(item.href)),
          }));
          setNavLinks(links);
        } else {
          setNavLinks([
            { href: "/store/products", label: "সকল আম (All Mangoes)", match: (p: string) => p === "/store/products" },
            { href: "/store/products?status=active", label: "প্রিমিয়াম আম (Premium)", match: (p: string) => p.includes("status=active") },
            { href: "/store/cart", label: "কার্ট (Cart)", match: (p: string) => p === "/store/cart" },
          ]);
        }
      })
      .catch(() => {
        setNavLinks([
          { href: "/store/products", label: "সকল আম (All Mangoes)", match: (p: string) => p === "/store/products" },
          { href: "/store/products?status=active", label: "প্রিমিয়াম আম (Premium)", match: (p: string) => p.includes("status=active") },
          { href: "/store/cart", label: "কার্ট (Cart)", match: (p: string) => p === "/store/cart" },
        ]);
      });
  }, []);

  // Fetch full cart details when Mini Cart opens
  useEffect(() => {
    if (miniCartOpen && getStoreToken()) {
      setCartLoading(true);
      cartApi.get()
        .then((c) => {
          setCart(c);
          setCartCount(c.items.length);
        })
        .catch(() => {})
        .finally(() => setCartLoading(false));
    }
  }, [miniCartOpen]);

  async function handleMiniCartQty(itemId: string, qty: number) {
    if (qty < 1) return handleMiniCartRemove(itemId);
    try {
      await cartApi.updateItem(itemId, qty);
      const c = await cartApi.get();
      setCart(c);
      setCartCount(c.items.length);
      localStorage.setItem("store_cart_count", String(c.items.length));
      window.dispatchEvent(new Event("cart-updated"));
    } catch {}
  }

  async function handleMiniCartRemove(itemId: string) {
    try {
      await cartApi.removeItem(itemId);
      const c = await cartApi.get();
      setCart(c);
      setCartCount(c.items.length);
      localStorage.setItem("store_cart_count", String(c.items.length));
      window.dispatchEvent(new Event("cart-updated"));
    } catch {}
  }

  // Update cart and wishlist count from localStorage
  useEffect(() => {
    const updateCart = () => {
      try {
        const raw = localStorage.getItem("store_cart_count");
        setCartCount(raw ? parseInt(raw, 10) : 0);
        if (miniCartOpen) {
          cartApi.get().then(setCart).catch(() => {});
        }
      } catch {
        setCartCount(0);
      }
    };
    const updateWishlist = () => {
      try {
        const raw = localStorage.getItem("store_wishlist_count");
        setWishlistCount(raw ? parseInt(raw, 10) : 0);
      } catch {
        setWishlistCount(0);
      }
    };
    updateCart();
    updateWishlist();
    window.addEventListener("cart-updated", updateCart);
    window.addEventListener("wishlist-updated", updateWishlist);
    return () => {
      window.removeEventListener("cart-updated", updateCart);
      window.removeEventListener("wishlist-updated", updateWishlist);
    };
  }, [miniCartOpen]);

  useEffect(() => {
    const handleOpenMiniCart = () => {
      setMiniCartOpen(true);
    };
    window.addEventListener("open-mini-cart", handleOpenMiniCart);
    return () => {
      window.removeEventListener("open-mini-cart", handleOpenMiniCart);
    };
  }, []);

  // Fetch database counts on login session change
  useEffect(() => {
    if (getStoreToken()) {
      cartApi.get()
        .then((c) => {
          localStorage.setItem("store_cart_count", String(c.items.length));
          setCartCount(c.items.length);
        })
        .catch(() => {});
      
      wishlistApi.get()
        .then((w) => {
          localStorage.setItem("store_wishlist_count", String(w.length));
          setWishlistCount(w.length);
        })
        .catch(() => {});
    } else {
      setCartCount(0);
      setWishlistCount(0);
      localStorage.setItem("store_cart_count", "0");
      localStorage.setItem("store_wishlist_count", "0");
    }
  }, [user]);

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

  // Dynamic navLinks are populated from settings state

  if (shellLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-[#16a34a]/10 rounded-full scale-125 animate-ping" />
            <div className="absolute inset-0 bg-[#ff9f00]/10 rounded-full scale-105 animate-pulse" />
            <MangoLogo className="scale-125 relative" />
          </div>
          <div className="w-32 h-1 bg-stone-100 overflow-hidden mt-6" style={{ borderRadius: "2px" }}>
            <div className="h-full bg-linear-to-r from-[#16a34a] to-[#ff9f00] skeleton-shimmer" style={{ width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      <BackToTop />

      {/* Mini Cart Drawer */}
      {miniCartOpen && (() => {
        const subtotal = cart?.items.reduce((s: number, i: any) => s + parseFloat(String(i.variant.price)) * i.quantity, 0) || 0;
        const freeShippingThreshold = 2000;
        const percentToFree = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
        const amountLeft = freeShippingThreshold - subtotal;

        return (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div
              onClick={() => setMiniCartOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity animate-fade-in"
            />
            <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl z-10 drawer-slide-in">
              <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
                <h2 className="text-sm font-black uppercase tracking-widest text-stone-900 font-display">🛒 শপিং কার্ট ({cartCount})</h2>
                <button
                  onClick={() => setMiniCartOpen(false)}
                  className="text-stone-400 hover:text-stone-750 cursor-pointer p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Free Shipping Progress Bar */}
              {cart && cart.items.length > 0 && (
                <div className="px-6 py-3 bg-stone-50 border-b border-stone-100">
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-wide mb-1 text-stone-600">
                    {amountLeft > 0 ? (
                      <span>
                        ফ্রি ডেলিভারি পেতে আর <span className="text-[#15803d] font-black">{amountLeft}৳</span> এর আম কিনুন
                      </span>
                    ) : (
                      <span className="text-[#15803d] flex items-center gap-1">
                        🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন
                      </span>
                    )}
                    <span>{percentToFree}%</span>
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-[#ff9f00] to-[#16a34a] transition-all duration-500 rounded-full"
                      style={{ width: `${percentToFree}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {cartLoading ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-4 p-3 border border-stone-100">
                        <div className="w-16 h-16 bg-stone-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-stone-100 w-3/4" />
                          <div className="h-3 bg-stone-100 w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !cart || cart.items.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-3xl mb-4">🛒</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500">আপনার কার্ট খালি</p>
                    <Link
                      href="/store/products"
                      onClick={() => setMiniCartOpen(false)}
                      className="mt-6 inline-flex bg-[#15803d] hover:bg-[#166534] px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase text-white shadow-xs"
                    >
                      আমসমূহ দেখুন
                    </Link>
                  </div>
                ) : (
                  cart.items.map((item: any) => {
                    const product = item.variant.product;
                    const image = item.variant.product.media?.[0]?.media.url || "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=200&q=80";
                    return (
                      <div key={item.id} className="flex gap-4 p-3 border border-stone-100 bg-stone-50/50 hover:bg-white transition-all rounded-xs">
                        <Link href={`/store/products/${product.slug}`} onClick={() => setMiniCartOpen(false)} className="shrink-0 w-16 h-16 bg-white border border-stone-100 flex items-center justify-center p-1 rounded-sm">
                          <img src={image} alt={product.name} className="w-full h-full object-contain" />
                        </Link>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <Link
                              href={`/store/products/${product.slug}`}
                              onClick={() => setMiniCartOpen(false)}
                              className="font-bold text-[11px] text-stone-900 hover:text-[#15803d] transition hover:underline line-clamp-2"
                            >
                              {product.name}
                            </Link>
                            <button
                              onClick={() => handleMiniCartRemove(item.id)}
                              className="text-stone-400 hover:text-red-500 cursor-pointer p-0.5 shrink-0 transition"
                              aria-label="Remove item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
                          <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">{item.variant.sku}</p>
                          
                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center bg-stone-150 rounded-sm p-0.5 h-7 border border-stone-100">
                              <button
                                onClick={() => handleMiniCartQty(item.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-xs hover:bg-white hover:shadow-xs transition cursor-pointer text-stone-600 active:scale-90"
                              >−</button>
                              <span className="w-7 text-center text-[10px] font-extrabold text-stone-900">{item.quantity}</span>
                              <button
                                onClick={() => handleMiniCartQty(item.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-xs hover:bg-white hover:shadow-xs transition cursor-pointer text-stone-600 active:scale-90"
                              >+</button>
                            </div>
                            <span className="text-xs font-extrabold text-stone-850">{formatPrice(parseFloat(String(item.variant.price)) * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cart && cart.items.length > 0 && (
                <div className="p-6 border-t border-stone-100 bg-stone-50 space-y-4">
                  <div className="flex justify-between text-xs font-black text-stone-900 uppercase">
                    <span>সর্বমোট মূল্য:</span>
                    <span className="text-[#15803d]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="grid gap-2 grid-cols-2">
                    <Link
                      href="/store/cart"
                      onClick={() => setMiniCartOpen(false)}
                      className="border border-stone-100 py-3 text-center text-[10px] font-black uppercase tracking-wider text-stone-600 hover:border-[#15803d] hover:text-[#15803d] transition bg-white"
                    >
                      কার্ট দেখুন
                    </Link>
                    <Link
                      href="/store/checkout"
                      onClick={() => setMiniCartOpen(false)}
                      className="bg-[#15803d] hover:bg-[#166534] py-3 text-center text-[10px] font-black uppercase tracking-wider text-white shadow-xs transition"
                    >
                      চেকআউট করুন
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="w-full flex items-center justify-between px-6 py-4.5 sm:px-12 lg:px-16">
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
                  className={`transition-all duration-200 hover:text-[#15803d] relative py-1 group ${active ? "text-[#15803d]" : ""}`}
                >
                  {l.label}
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-[#15803d] transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"}`} />
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <Link
              href="/store/search"
              className="p-2 text-stone-600 hover:bg-stone-100 hover:text-[#15803d] transition-all duration-200"
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
                className="relative p-2 text-stone-600 hover:bg-stone-100 hover:text-[#15803d] transition-all duration-200"
                aria-label="Wishlist"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-linear-to-br from-[#ff9f00] to-rose-600 text-[8px] font-black text-white border border-white shadow-xs animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setMiniCartOpen(true)}
              className="relative p-2 text-stone-600 hover:bg-stone-100 hover:text-[#15803d] transition-all duration-200 cursor-pointer"
              aria-label="Cart"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-linear-to-br from-[#ff9f00] to-rose-600 text-[8px] font-black text-white border border-white shadow-xs animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 border border-stone-300 hover:border-[#15803d] hover:text-[#15803d] px-3.5 py-1.5 text-xs font-semibold tracking-wider text-stone-700 transition-all duration-250 cursor-pointer shadow-xs bg-white"
                >
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                  <div className="w-5 h-5 bg-stone-100 flex items-center justify-center border border-stone-200">
                    <svg className="w-3.5 h-3.5 text-[#15803d]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg p-2 z-50 border border-stone-200 animate-scale-in">
                    <Link
                      href="/store/account"
                      className="block px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-[#15803d] transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Profile (আমার প্রোফাইল)
                    </Link>
                    <Link
                      href="/store/orders"
                      className="block px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-[#15803d] transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Orders (আমার অর্ডার)
                    </Link>
                    <Link
                      href="/store/wishlist"
                      className="block px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-[#15803d] transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Wishlist (পছন্দের তালিকা)
                    </Link>
                    <hr className="my-1.5 border-stone-200" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      Sign Out (লগ আউট)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/store/login"
                className="bg-[#15803d] hover:bg-[#166534] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 shadow-sm"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 hover:bg-stone-100 text-stone-600 hover:text-[#15803d] transition cursor-pointer"
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
          <div className="md:hidden border-t border-stone-250 bg-white px-6 py-4 flex flex-col gap-2 shadow-xs animate-slide-up">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block py-2.5 px-4 text-xs font-semibold tracking-wider text-stone-600 hover:bg-emerald-50 hover:text-[#15803d] transition"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/store/search"
              className="block py-2.5 px-4 text-xs font-semibold tracking-wider text-stone-600 hover:bg-emerald-50 hover:text-[#15803d] transition"
              onClick={() => setMenuOpen(false)}
            >
              Search (অনুসন্ধান)
            </Link>
            {!user && (
              <Link
                href="/store/login"
                className="mt-3 block text-center bg-[#15803d] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#166534] transition"
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
      <footer className="bg-stone-900 text-stone-300 mt-auto border-t border-stone-800">
        <div className="w-full px-6 py-16 sm:px-12 lg:px-16 grid gap-10 md:grid-cols-4">
          
          {/* Column 1: Brand Info + Payment Options */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/store" className="inline-block transition-opacity hover:opacity-90">
              <MangoLogo light />
            </Link>
            <p className="text-xs leading-relaxed text-stone-450 max-w-md font-medium">
              নওগাঁর সুমিষ্ট ও শতভাগ নিরাপদ ল্যাংড়া, ফজলি, আম্রপালি ও ক্ষীরশাপাত আম সরাসরি বাগান থেকে আপনার ঘরে পৌঁছে দিচ্ছে আম এক্সপ্রেস। সম্পূর্ণ প্রাকৃতিক উপায়ে পাকানো এবং ক্ষতিকর কেমিক্যালমুক্ত আম পেতে আজই অর্ডার করুন।
            </p>
            
            {/* Payment Badges */}
            <div className="pt-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-white border-l-2 border-[#15803d] pl-2 block mb-3">আমাদের পেমেন্ট পার্টনারস</span>
              <div className="flex flex-wrap gap-2.5">
                <span className="bg-[#e2127a] text-[10px] font-bold text-white px-3 py-1 cursor-default">bKash (বিকাশ)</span>
                <span className="bg-[#f05a24] text-[10px] font-bold text-white px-3 py-1 cursor-default">Nagad (নগদ)</span>
                <span className="bg-[#8c3494] text-[10px] font-bold text-white px-3 py-1 cursor-default">Rocket (রকেট)</span>
                <span className="bg-[#1a1f71] text-[10px] font-bold text-white px-3 py-1 cursor-default">Visa</span>
                <span className="bg-stone-850 text-[10px] font-bold text-stone-300 px-3 py-1 border border-stone-700 cursor-default">Cash On Delivery</span>
              </div>
            </div>
          </div>
          
          {/* Column 2: Quick Shop Link Categories */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-wider text-white border-l-2 border-[#15803d] pl-2 mb-6">কুইক মেনু</h3>
            <div className="grid gap-3.5 text-xs font-semibold text-stone-400">
              <Link href="/store/products" className="hover:text-white hover:underline transition-all">সকল আমের কালেকশন</Link>
              <Link href="/store/products?status=active" className="hover:text-white hover:underline transition-all">প্রিমিয়াম আম</Link>
              <Link href="/store/cart" className="hover:text-white hover:underline transition-all">শপিং কার্ট</Link>
              <Link href="/store/wishlist" className="hover:text-white hover:underline transition-all">আমার পছন্দের তালিকা</Link>
            </div>
          </div>
          
          {/* Column 3: Contact & Info */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-wider text-white border-l-2 border-[#15803d] pl-2 mb-6">যোগাযোগ ও ঠিকানা</h3>
            <div className="grid gap-3.5 text-xs font-semibold text-stone-400">
              <div className="flex items-center gap-2">
                <span className="text-[#15803d]">📞</span>
                <span>+৮৮০ ১৭০৭৮১৯৬৭৬</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#15803d]">✉️</span>
                <span className="break-all">muhammadabdulla442467@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#15803d]">📍</span>
                <span>নওগাঁ, রাজশাহী বিভাগ, বাংলাদেশ</span>
              </div>
              <hr className="border-stone-800 my-1" />
              <Link href="/admin" className="text-emerald-500 font-extrabold hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                <span>এডমিন ড্যাশবোর্ড</span>
                <span className="text-[10px]">↗</span>
              </Link>
            </div>
          </div>
          
        </div>
        
        {/* Bottom copyright bar */}
        <div className="border-t border-stone-850 px-6 py-7 text-center text-[10px] text-stone-500 font-semibold tracking-wider bg-stone-950">
          © {new Date().getFullYear()} Mango Express Naogaon. All Rights Reserved. Freshness and trust delivered directly to your doorstep.
        </div>
      </footer>
    </div>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-[90] p-3 bg-[#15803d] hover:bg-[#ff9f00] text-white hover:text-stone-900 shadow-xl transition-all duration-300 cursor-pointer ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      style={{ borderRadius: "50%" }}
      aria-label="Back to top"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
}
