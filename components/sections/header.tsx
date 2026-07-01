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
  { label: "ABOUT US", href: "/about" },
  { label: "TEAS", href: "/sylheti-tea", hasDropdown: true },
  { label: "GIFT SETS", href: "/gift-sets" },
  { label: "TRADE", href: "/trade" },
  { label: "CONTACT", href: "/contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-olive-slate backdrop-blur-md text-white font-gotham shadow-md border-b border-white/10">
      {/* Desktop Header */}
      <div className="hidden xl:flex items-center justify-between w-full max-w-360 mx-auto py-3 gap-4">
        {/* Search */}
        <div className="w-55 flex justify-start items-center">
          <div className="flex items-center gap-1.5 pr-6 border-b border-zinc-400 pb-1">
            <IoSearchOutline className="w-5 h-5 text-white" />

            <input
              type="text"
              placeholder="SEARCH"
              className="bg-transparent text-white placeholder:text-neutral-400 text-sm font-medium uppercase tracking-wider outline-none border-none w-28 focus:w-36 transition-all duration-300"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex justify-center">
          <Navigation />
        </div>

        {/* Right Icons */}
        <div className="w-55 flex justify-end items-center gap-2">
          <Link
            href="/wishlist"
            className="p-2 hover:text-brand-primary transition-colors"
            aria-label="Wishlist"
          >
            <IoHeartOutline className="w-5 h-5" />
          </Link>

          <Link
            href="/cart"
            className="relative p-2 hover:text-brand-primary transition-colors"
            aria-label="Shopping Cart"
          >
            <LuShoppingBag className="w-5 h-5" />

            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-brand-primary text-[9px] font-semibold text-white">
              1
            </span>
          </Link>

          <div className="w-px h-4 bg-white/30" />

          <Link
            href="/account"
            className="p-2 hover:text-brand-primary transition-colors"
            aria-label="Account"
          >
            <LuUser className="w-5 h-5" />
          </Link>
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
            src="/images/logo/uodate-logo.png"
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
            1
          </span>
        </Link>
      </div>
    </header>
  );
}