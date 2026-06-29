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
          <Link
            href="/account"
            className="p-2 text-white hover:text-brand-primary transition-colors cursor-pointer"
            aria-label="Account"
          >
            <LuUser className="w-5 h-5" />
          </Link>
          
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