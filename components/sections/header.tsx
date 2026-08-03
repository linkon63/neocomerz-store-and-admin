"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import MobileMenu from "./ui/mobile-menu";
import Navigation from "./ui/navigation";
import { IoSearchOutline, IoHeartOutline } from "react-icons/io5";
import { LuShoppingBag, LuUser, LuChevronDown, LuLogOut } from "react-icons/lu";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/_providers/auth-provider";
import { useCart } from "@/app/_providers/cart-provider";
import { useWishlist } from "@/app/_providers/wishlist-provider";
import { fetchShopProducts, type ShopProduct } from "@/lib/shop-api";

const sylhetiTeaItems = [
  { label: "Black Tea", href: "/sylheti-tea/black-tea" },
  { label: "Green Tea", href: "/sylheti-tea/green-tea" },
  { label: "Organic Collection", href: "/sylheti-tea/organic-collection" },
  { label: "Signature Collection", href: "/sylheti-tea/signature-collection" },
];

const navItems = [
  { label: "Home", href: "/" },
  { label: "ABOUT US", href: "/about" },
  { label: "TEAS", href: "/products", hasDropdown: true },
  { label: "GIFT SETS", href: "/gift-sets" },
  { label: "CORPORATE ORDER", href: "/corporate-order" },
  { label: "GLOBAL FAIR PAY CHARTER", href: "/global-fair-pay-charter" },
  { label: "CONTACT", href: "/contact" },
];

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, setShowAuthModal, logout } = useAuth();
  const { itemCount: cartItemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ShopProduct[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync search input with URL search param
  useEffect(() => {
    const search = searchParams?.get("search") || "";
    setSearchQuery(search);
  }, [searchParams]);

  // Debounced search suggestions fetch
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetchShopProducts({
          page: 1,
          limit: 5,
          search: trimmedQuery,
        });
        setSuggestions(res.data);
      } catch (err) {
        console.error("Failed to fetch search suggestions:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedOutsideDesktop = !desktopDropdownRef.current || !desktopDropdownRef.current.contains(target);
      const clickedOutsideMobile = !mobileDropdownRef.current || !mobileDropdownRef.current.contains(target);

      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleNavigate = (path: string) => {
    setDropdownOpen(false);
    window.location.href = path;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-olive-slate backdrop-blur-md text-white font-gotham shadow-md border-b border-white/10">
      {/* Desktop Header */}
      <div className="hidden xl:flex items-center justify-between w-full max-w-360 mx-auto px-5 py-2.5 gap-4">
        {/* Search */}
        <div className="relative w-40 flex justify-start items-center shrink-0" ref={searchContainerRef}>
          <form onSubmit={(e) => { handleSearchSubmit(e); setShowSuggestions(false); }} className="flex items-center gap-1.5 pr-4 py-1.5 border-b border-zinc-400">
            <button type="submit" aria-label="Submit Search" className="p-0 border-none bg-transparent cursor-pointer">
              <IoSearchOutline className="w-4 h-4 text-white hover:text-brand-primary transition-colors" />
            </button>

            <input
              type="text"
              placeholder="SEARCH"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="bg-transparent text-white placeholder:text-neutral-400 text-xs font-medium uppercase tracking-wider outline-none border-none w-20 focus:w-28 transition-all duration-300"
            />
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 mt-2 w-[350px] bg-white text-zinc-800 shadow-xl border border-zinc-200 py-2.5 z-[999] rounded-md font-gotham">
              {isSearching ? (
                <div className="flex items-center justify-center py-6 px-4 gap-2 text-sm text-zinc-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-3 border-t-transparent" />
                  Searching...
                </div>
              ) : suggestions.length > 0 ? (
                <div className="flex flex-col">
                  <div className="px-4 pb-2 mb-1.5 border-b border-zinc-100 text-[10px] uppercase font-bold tracking-wider text-zinc-400 select-none">
                    Matching Products
                  </div>
                  <div className="max-h-[280px] overflow-y-auto">
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug ?? product.id}`}
                        onClick={() => {
                          setShowSuggestions(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 transition-colors group"
                      >
                        <div className="w-10 h-10 shrink-0 relative overflow-hidden bg-zinc-100 rounded border border-zinc-200">
                          <Image
                            src={product.image || "/images/no-image-icon-6.png"}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-xs font-medium text-zinc-800 truncate group-hover:text-brand-3 transition-colors">
                            {product.name}
                          </h4>
                          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                            {product.category}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-zinc-800 shrink-0">
                          ৳{product.price.toLocaleString()}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-zinc-100 mt-2 pt-2 px-3">
                    <button
                      onClick={(e) => {
                        handleSearchSubmit(e);
                        setShowSuggestions(false);
                      }}
                      className="w-full py-2 bg-brand-3 hover:bg-[#A38148] text-white font-semibold text-[10px] uppercase tracking-wider text-center transition-colors rounded cursor-pointer"
                    >
                      View All Results ({suggestions.length})
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 px-4 text-center text-xs text-zinc-500 font-medium select-none">
                  No products found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 flex justify-center">
          <Navigation />
        </div>

        <div className="w-[200px] flex justify-end items-center shrink-0">
          {/* Right Icons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/wishlist"
              className="relative p-2 hover:text-[#C5B382] transition-colors rounded-full flex items-center justify-center cursor-pointer"
              aria-label="Wishlist"
            >
              <IoHeartOutline className="w-5 h-5" />
              {mounted && wishlistItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-white text-[9px] font-bold text-zinc-900 shadow-xs">
                  {wishlistItemCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative p-2 hover:text-[#C5B382] transition-colors rounded-full flex items-center justify-center cursor-pointer"
              aria-label="Shopping Cart"
            >
              <LuShoppingBag className="w-5 h-5" />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-white text-[9px] font-bold text-zinc-900 shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <div className="w-px h-4 bg-white/20 mx-0.5" />

             {!mounted || !isAuthenticated ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="p-2 text-white hover:text-[#C5B382] transition-colors rounded-full flex items-center justify-center cursor-pointer"
                aria-label="Login or Sign Up"
              >
                <LuUser className="w-5 h-5" />
              </button>
            ) : (
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[#C5B382]/60 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5B382]"
                  aria-label="User profile menu"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-[#C5B382] text-zinc-950 flex items-center justify-center font-bold text-xs border border-white/30 shadow-xs overflow-hidden shrink-0">
                    {user?.avatarUrl || (user as any)?.avatar ? (
                      <img
                        src={user?.avatarUrl || (user as any)?.avatar || undefined}
                        alt={user?.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {user?.name
                          ? user.name
                              .trim()
                              .split(/\s+/)
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()
                          : "U"}
                      </span>
                    )}
                  </div>
                  <LuChevronDown
                    className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {/* Persistent User Dropdown Menu on Click */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200/90 p-2 z-50 font-sans animate-fadeIn">
                    <div className="px-3.5 py-3 border-b border-stone-100 mb-1">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#C5B382] text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-stone-200/60">
                          {user?.avatarUrl || (user as any)?.avatar ? (
                            <img
                              src={user?.avatarUrl || (user as any)?.avatar || undefined}
                              alt={user?.name || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {user?.name
                                ? user.name
                                    .trim()
                                    .split(/\s+/)
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()
                                : "U"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-zinc-900 truncate">
                            {user?.name || "Account Profile"}
                          </p>
                          <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                            {user?.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-stone-100 hover:text-zinc-950 rounded-xl transition-colors font-sans cursor-pointer"
                      >
                        <LuUser className="w-4 h-4 text-stone-500" />
                        My Account
                      </Link>
                      <Link
                        href="/profile?tab=orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-stone-100 hover:text-zinc-950 rounded-xl transition-colors font-sans cursor-pointer"
                      >
                        <LuShoppingBag className="w-4 h-4 text-stone-500" />
                        My Orders
                      </Link>
                      <Link
                        href="/profile?tab=wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-stone-100 hover:text-zinc-950 rounded-xl transition-colors font-sans cursor-pointer"
                      >
                        <IoHeartOutline className="w-4 h-4 text-stone-500" />
                        Wishlist
                      </Link>
                    </div>

                    <div className="my-1 border-t border-stone-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors font-sans cursor-pointer"
                    >
                      <LuLogOut className="w-4 h-4 text-red-500" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="xl:hidden flex items-center justify-between px-4 py-2.5 relative">
        <div className="z-10 flex items-center shrink-0">
          <MobileMenu
            navItems={navItems}
            sylhetiTeaItems={sylhetiTeaItems}
          />
        </div>

        <Link
          href="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-auto"
        >
          <Image
            src="/images/logo/Logo-update.png"
            alt="London Tea Exchange"
            width={56}
            height={56}
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
            priority
          />
        </Link>
        <div className="z-10 flex items-center gap-2 shrink-0">
          <Link
            href="/wishlist"
            className="relative p-1.5 text-white hover:text-[#C5B382] transition-colors"
            aria-label="Wishlist"
          >
            <IoHeartOutline className="w-5 h-5" />
            {mounted && wishlistItemCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[15px] h-3.5 px-0.5 rounded-full bg-white text-[9px] text-zinc-900 font-bold">
                {wishlistItemCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative p-1.5 text-white hover:text-[#C5B382] transition-colors"
            aria-label="Shopping Cart"
          >
            <LuShoppingBag className="w-5 h-5" />
            {mounted && cartItemCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[15px] h-3.5 px-0.5 rounded-full bg-white text-[9px] text-zinc-900 font-bold">
                {cartItemCount}
              </span>
            )}
          </Link>

          {!mounted || !isAuthenticated ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="p-1.5 text-white hover:text-[#C5B382] transition-colors cursor-pointer"
              aria-label="Sign in"
            >
              <LuUser className="w-5 h-5" />
            </button>
          ) : (
            <div className="relative" ref={mobileDropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-7 h-7 rounded-full bg-[#C5B382] text-zinc-950 flex items-center justify-center font-bold text-xs border border-white/30 overflow-hidden shrink-0 cursor-pointer"
                aria-label="User menu"
              >
                {user?.avatarUrl || (user as any)?.avatar ? (
                  <img
                    src={user?.avatarUrl || (user as any)?.avatar || undefined}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {user?.name
                      ? user.name
                          .trim()
                          .split(/\s+/)
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-stone-200/90 p-2 z-50 font-sans">
                  <div className="px-3 py-2 border-b border-stone-100 mb-1">
                    <p className="text-xs font-bold text-zinc-900 truncate">{user?.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-stone-100 rounded-xl w-full text-left cursor-pointer"
                  >
                    <LuUser className="w-4 h-4" /> My Account
                  </Link>
                  <Link
                    href="/profile?tab=orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-stone-100 rounded-xl w-full text-left cursor-pointer"
                  >
                    <LuShoppingBag className="w-4 h-4" /> My Orders
                  </Link>
                  <Link
                    href="/profile?tab=wishlist"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-stone-100 rounded-xl w-full text-left cursor-pointer"
                  >
                    <IoHeartOutline className="w-4 h-4" /> Wishlist
                  </Link>
                  <div className="my-1 border-t border-stone-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                  >
                    <LuLogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}