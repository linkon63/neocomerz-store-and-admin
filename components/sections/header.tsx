"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import MobileMenu from "./ui/mobile-menu";
import Navigation from "./ui/navigation";
import { IoSearchOutline, IoHeartOutline } from "react-icons/io5";
import { LuShoppingBag, LuUser, LuChevronDown, LuLogOut } from "react-icons/lu";
import { useAuth } from "@/app/_providers/auth-provider";

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
  { label: "TRADE", href: "/trade" },
  { label: "CONTACT", href: "/contact" },
];

export default function Header() {
  const { user, isAuthenticated, setShowAuthModal, logout } = useAuth();
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
    <header className="w-full bg-olive-slate text-white font-gotham relative shadow-sm z-40">
      <div className="hidden xl:flex items-center justify-between w-full max-w-[1440px] mx-auto px-5 py-2.5 gap-4">
        <div className="w-[220px] flex justify-start items-center">
          <div className="flex items-center gap-1.5 pr-6 py-1.5 border-b border-zinc-350">
            <IoSearchOutline className="w-5 h-5 text-white" />
            <input
              type="text"
              placeholder="SEARCH"
              className="bg-transparent text-white placeholder:text-zinc-400 font-gotham text-sm font-semibold uppercase tracking-wider outline-none border-none w-28 focus:w-36 transition-all duration-300"
            />
          </div>
        </div>

        <div className="grow flex justify-center items-center">
          <Navigation />
        </div>

        <div className="w-[220px] flex justify-end items-center gap-1.5">
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
                    href="/account"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 font-gotham"
                  >
                    <LuUser className="w-4 h-4" />
                    My Account
                  </Link>
                  <Link
                    href="/orders"
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

          <div className="w-px h-4 bg-zinc-300" />
          
          <Link
            href="/wishlist"
            className="p-2 text-white hover:text-brand-primary transition-colors cursor-pointer"
            aria-label="Wishlist"
          >
            <IoHeartOutline className="w-5 h-5" />
          </Link>
          
          <Link
            href="/cart"
            className="p-2 relative text-white hover:text-brand-primary transition-colors cursor-pointer"
            aria-label="Shopping Cart"
          >
            <LuShoppingBag className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-primary rounded-full text-white text-[9px] font-semibold flex items-center justify-center">
              1
            </span>
          </Link>
        </div>
      </div>

      <div className="xl:hidden w-full flex items-center justify-between py-2.5 px-4">
        <MobileMenu navItems={navItems} sylhetiTeaItems={sylhetiTeaItems} />

        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo/uodate-logo.png"
            alt="London Tea Exchange Logo"
            width={56}
            height={56}
            className="w-14 h-14 object-contain"
            priority
          />
        </Link>

        <Link
          href="/cart"
          className="relative p-2 text-white hover:text-brand-primary transition-colors cursor-pointer"
          aria-label="Shopping Cart"
        >
          <LuShoppingBag className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-brand-primary rounded-full text-white text-[9px] font-semibold flex items-center justify-center">
            1
          </span>
        </Link>
      </div>
    </header>
  );
}