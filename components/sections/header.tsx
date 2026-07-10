"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
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
  { label: "TEAS", href: "/sylheti-tea", hasDropdown: true },
  { label: "GIFT SETS", href: "/gift-sets" },
  { label: "CORPORATE ORDER", href: "/corporate-order" },
  { label: "GLOBAL FAIR PAY CHARTER", href: "/global-fair-pay-charter" },
  { label: "CONTACT", href: "/contact" },
];

export default function Header() {
  const { user, isAuthenticated, setShowAuthModal, logout } = useAuth();
  const { itemCount: cartItemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        <div className="w-[180px] flex justify-end items-center gap-1 shrink-0">
          
        {/* Right Icons */}
        <div className="w-55 flex justify-end items-center gap-2">
          <Link
            href="/wishlist"
            className="relative p-2 hover:text-brand-primary transition-colors"
            aria-label="Wishlist"
          >
            <IoHeartOutline className="w-5 h-5" />
            {wishlistItemCount > 0 && (
              <span className="absolute -top-1 right-0 flex items-center justify-center w-4 h-4 rounded-full bg-white text-[9px] font-bold text-zinc-800">
                {wishlistItemCount}
              </span>
            )}
          </Link>
 
          <Link
            href="/cart"
            className="relative p-2 hover:text-brand-primary transition-colors"
            aria-label="Shopping Cart"
          >
            <LuShoppingBag className="w-5 h-5" />
 
            <span className="absolute -top-1 right-0 flex items-center justify-center w-4 h-4 rounded-full bg-white text-[9px] font-bold text-zinc-800">
              {cartItemCount}
            </span>
          </Link>

          <div className="w-px h-4 bg-white/30" />  

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 p-2 text-white hover:text-brand-primary transition-colors"
                aria-label="Account menu"
              >
                <span className="text-sm font-semibold uppercase tracking-wider">
                  {user?.name ?? "Account"}
                </span>
                <LuChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-lg border border-zinc-200 py-1 z-50">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 font-gotham"
                  >
                    <LuUser className="w-4 h-4" />
                    My Account
                  </Link>
                  <Link
                    href="/profile?tab=orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 font-gotham"
                  >
                    <LuShoppingBag className="w-4 h-4" />
                    My Orders
                  </Link>
                  <hr className="my-1 border-zinc-200" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 font-gotham"
                  >
                    <LuLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="p-2 text-white hover:text-brand-primary transition-colors cursor-pointer"
              aria-label="Login or Sign Up"
            >
              <LuUser className="w-5 h-5" />
            </button>
          )}
        </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="xl:hidden flex items-center justify-between px-4 py-2.5">
        <MobileMenu
          navItems={navItems}
          sylhetiTeaItems={sylhetiTeaItems}
        />

        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo/Logo-update.png"
            alt="London Tea Exchange"
            width={56}
            height={56}
            className="w-14 h-14 object-contain"
            priority
          />
        </Link>

        <Link
          href="/cart"
          className="relative p-2 hover:text-brand-primary transition-colors"
          aria-label="Shopping Cart"
        >
          <LuShoppingBag className="w-5 h-5" />

          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-white text-[9px] text-black font-semibold">
            {cartItemCount}
          </span>
        </Link>
      </div>
    </header>
  );
}