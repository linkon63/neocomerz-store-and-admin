import Link from "next/link";
import Image from "next/image";
import MobileMenu from "./ui/mobile-menu";
import Navigation from "./ui/navigation";
import { IoSearchOutline, IoHeartOutline } from "react-icons/io5";
import { LuShoppingBag, LuUser } from "react-icons/lu";

const sylhetiTeaItems = [
  { label: "Black Tea", href: "/sylheti-tea/black-tea" },
  { label: "Green Tea", href: "/sylheti-tea/green-tea" },
  { label: "Organic Collection", href: "/sylheti-tea/organic-collection" },
  { label: "Signature Collection", href: "/sylheti-tea/signature-collection" },
];

const navItems = [
  { label: "Home", href: "/" },
  { label: "SYLHETI TEA", href: "/sylheti-tea", hasDropdown: true },
  { label: "GIFT SETS", href: "/gift-sets" },
  { label: "BEST SELLERS", href: "/best-sellers" },
  { label: "ABOUT US", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

export default function Header() {
  return (
    <header className="w-full bg-[#212721] border-b border-zinc-800 text-white font-gotham relative">
      {/* Desktop Navigation Layout */}
      <div className="hidden xl:flex flex-col items-center w-full max-w-[1440px] mx-auto px-5 py-3 gap-3">
        {/* Top Row: Centered Logo */}
        <div className="flex justify-center items-center py-2">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo/Logo.png"
              alt="London Tea Exchange Logo"
              width={280}
              height={31}
              className="h-[31px] w-auto"
              priority
            />
          </Link>
        </div>

        {/* Bottom Row: Search, Navigation links, and Icons */}
        <div className="self-stretch flex justify-between items-center gap-12">
          {/* Search bar on the left */}
          <div className="flex items-center gap-1.5 pr-9 py-2 border-b border-zinc-500">
            <IoSearchOutline className="w-5 h-5 text-white" />
            <input
              type="text"
              placeholder="SEARCH"
              className="bg-transparent text-white placeholder-zinc-500 font-gotham text-sm font-medium uppercase tracking-wider outline-none border-none w-28 focus:w-40 transition-all duration-300"
            />
          </div>

          {/* Navigation links centered */}
          <div className="flex-1 flex justify-center items-center">
            <Navigation />
          </div>

          {/* Action icons on the right */}
          <div className="flex justify-end items-center gap-2">
            <Link
              href="/account"
              className="p-2.5 hover:text-brand-3 transition-colors cursor-pointer"
              aria-label="Account"
            >
              <LuUser className="w-5 h-5" />
            </Link>
            
            <div className="w-px h-4 bg-zinc-500" />
            
            <Link
              href="/wishlist"
              className="p-2.5 hover:text-brand-3 transition-colors cursor-pointer"
              aria-label="Wishlist"
            >
              <IoHeartOutline className="w-5 h-5" />
            </Link>
            
            <Link
              href="/cart"
              className="p-2.5 relative hover:text-brand-3 transition-colors cursor-pointer"
              aria-label="Shopping Cart"
            >
              <LuShoppingBag className="w-5 h-5" />
              <div className="w-6 p-1 absolute left-[16px] top-0 bg-brand-primary rounded-[100px] inline-flex flex-col justify-center items-center gap-0.5">
                <span className="self-stretch text-center text-white text-xs font-medium leading-4">
                  1
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Navigation Layout */}
      <div className="xl:hidden w-full flex items-center justify-between py-3.5 px-4">
        {/* Mobile menu toggle (hamburger) */}
        <MobileMenu navItems={navItems} sylhetiTeaItems={sylhetiTeaItems} />

        {/* Centered Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo/Logo.png"
            alt="London Tea Exchange Logo"
            width={180}
            height={20}
            className="h-5 w-auto"
            priority
          />
        </Link>

        {/* Cart Action */}
        <Link
          href="/cart"
          className="relative p-2 hover:text-brand-3 transition-colors cursor-pointer"
          aria-label="Shopping Cart"
        >
          <LuShoppingBag className="w-5 h-5 text-white" />
          <div className="w-5 h-5 absolute -top-0.5 -right-0.5 bg-brand-primary rounded-full flex items-center justify-center text-[10px] text-white font-medium">
            1
          </div>
        </Link>
      </div>
    </header>
  );
}