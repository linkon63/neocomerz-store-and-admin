'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { RiArrowDownSLine } from "react-icons/ri";

const sylhetiTeaItems = [
  { label: "Black Tea", href: "/sylheti-tea/black-tea" },
  { label: "Green Tea", href: "/sylheti-tea/green-tea" },
  { label: "Organic Collection", href: "/sylheti-tea/organic-collection" },
  { label: "Signature Collection", href: "/sylheti-tea/signature-collection" },
];

const leftNavItems = [
  { label: "Home", href: "/" },
  { label: "ABOUT US", href: "/about" },
  { label: "TEAS", href: "/sylheti-tea", hasDropdown: true },
];

const rightNavItems = [
  { label: "GIFTS", href: "/gift-sets" },
  { label: "TRADE", href: "/trade" },
  { label: "CONTACT", href: "/contact" },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: typeof leftNavItems[0]) => (
    <div key={item.label} className="relative group">
      <Link
        href={item.href}
        className={`font-gotham text-sm font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 ${
          isActive(item.href)
            ? "text-brand-primary"
            : "text-white hover:text-brand-primary"
        }`}
      >
        {item.label}

        {item.hasDropdown && (
          <RiArrowDownSLine className="text-lg text-zinc-400 group-hover:text-brand-primary transition-colors" />
        )}
      </Link>

      {item.hasDropdown && (
        <div className="absolute left-0 top-full pt-4 hidden group-hover:block z-50">
          <div className="w-56 bg-white border border-zinc-200 shadow-lg py-2 rounded-sm">
            {sylhetiTeaItems.map((subItem) => (
              <Link
                key={subItem.label}
                href={subItem.href}
                className="block px-4 py-2 font-gotham text-sm font-medium text-zinc-800 hover:bg-zinc-50 hover:text-brand-primary transition-colors"
              >
                {subItem.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav className="hidden xl:flex items-center gap-6 xl:gap-8">
      <div className="flex items-center gap-6 xl:gap-8">
        {leftNavItems.map(renderNavItem)}
      </div>

      <Link href="/" className="mx-4 shrink-0 transition-transform duration-200 hover:scale-105">
        <Image
          src="/images/logo/Logo-update.png"
          alt="London Tea Exchange Logo"
          width={80}
          height={80}
          className="w-20 h-20 object-contain"
          priority
        />
      </Link>

      <div className="flex items-center gap-6 xl:gap-8">
        {rightNavItems.map(renderNavItem)}
      </div>
    </nav>
  );
}

