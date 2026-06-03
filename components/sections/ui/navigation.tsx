'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiArrowDownSLine } from "react-icons/ri";

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

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="hidden xl:flex items-center gap-6 xl:gap-8">
      {navItems.map((item) => (
        <div key={item.label} className="relative group">
          <Link
            href={item.href}
            className={`font-gotham text-sm font-medium uppercase tracking-wider transition-colors flex items-center gap-1 ${
              isActive(item.href)
                ? "text-brand-3"
                : "text-white hover:text-brand-3"
            }`}
          >
            {item.label}

            {item.hasDropdown && (
              <RiArrowDownSLine className="text-xl" />
            )}
          </Link>

          {/* Dropdown */}
          {item.hasDropdown && (
            <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
              <div className="w-56 bg-[#212721] border border-zinc-800 shadow-lg py-2">
                {sylhetiTeaItems.map((subItem) => (
                  <Link
                    key={subItem.label}
                    href={subItem.href}
                    className="block px-4 py-2 font-gotham text-sm font-medium text-white hover:bg-brand-3 hover:text-white transition-colors"
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

