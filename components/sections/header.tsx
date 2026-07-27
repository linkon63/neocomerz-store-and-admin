"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileMenu from "./ui/mobile-menu";
import Navigation from "./ui/navigation";
import { IoSearchOutline, IoHeartOutline } from "react-icons/io5";
import { LuShoppingBag, LuUser, LuChevronDown, LuLogOut } from "react-icons/lu";
import { useAuth } from "@/app/_providers/auth-provider";
import { useCart } from "@/app/_providers/cart-provider";
import { useWishlist } from "@/app/_providers/wishlist-provider";

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedOutsideDesktop = !desktopDropdownRef.current || !desktopDropdownRef.current.contains(target);
      const clickedOutsideMobile = !mobileDropdownRef.current || !mobileDropdownRef.current.contains(target);

      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        <div className="w-40 flex justify-start items-center shrink-0">
          <div className="flex items-center gap-1.5 pr-4 py-1.5 border-b border-zinc-400">
            <IoSearchOutline className="w-4 h-4 text-white" />

            <input
              type="text"
              placeholder="SEARCH"
              className="bg-transparent text-white placeholder:text-neutral-400 text-xs font-medium uppercase tracking-wider outline-none border-none w-20 focus:w-28 transition-all duration-300"
            />
          </div>
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
              {wishlistItemCount > 0 && (
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
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-white text-[9px] font-bold text-zinc-900 shadow-xs">
                {cartItemCount}
              </span>
            </Link>

            <div className="w-px h-4 bg-white/20 mx-0.5" />

             {isAuthenticated ? (
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
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="p-2 text-white hover:text-[#C5B382] transition-colors rounded-full flex items-center justify-center cursor-pointer"
                aria-label="Login or Sign Up"
              >
                <LuUser className="w-5 h-5" />
              </button>
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
            {wishlistItemCount > 0 && (
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
            {cartItemCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[15px] h-3.5 px-0.5 rounded-full bg-white text-[9px] text-zinc-900 font-bold">
                {cartItemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
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
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="p-1.5 text-white hover:text-[#C5B382] transition-colors cursor-pointer"
              aria-label="Sign in"
            >
              <LuUser className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}