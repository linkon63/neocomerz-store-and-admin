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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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

        <div className="w-[180px] flex justify-end items-center gap-1 shrink-0">
          
        {/* Right Icons */}
        <div className="w-55 flex justify-end items-center gap-2">
          <Link
            href="/wishlist"
            className="relative p-2 hover:text-brand-primary transition-colors"
            aria-label="Wishlist"
          >
            <IoHeartOutline className="w-5 h-5" />
            {mounted && wishlistItemCount > 0 && (
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
 
            {mounted && cartItemCount > 0 && (
              <span className="absolute -top-1 right-0 flex items-center justify-center w-4 h-4 rounded-full bg-white text-[9px] font-bold text-zinc-800">
                {cartItemCount}
              </span>
            )}
          </Link>

          <div className="w-px h-4 bg-white/30" />  

          {!mounted || !isAuthenticated ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="p-2 text-white hover:text-brand-primary transition-colors cursor-pointer"
              aria-label="Login or Sign Up"
            >
              <LuUser className="w-5 h-5" />
            </button>
          ) : (
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

        <div className="flex items-center gap-1.5">
          <Link
            href="/wishlist"
            className="relative p-2 hover:text-brand-primary transition-colors"
            aria-label="Wishlist"
          >
            <IoHeartOutline className="w-5 h-5" />
            {mounted && wishlistItemCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-white text-[9px] text-zinc-800 font-bold">
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
 
            {mounted && cartItemCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-white text-[9px] text-zinc-800 font-bold">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}