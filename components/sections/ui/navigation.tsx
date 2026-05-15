import Link from "next/link";
import { RiArrowDownSLine } from "react-icons/ri";

const sylhetiTeaItems = [
  { label: "Black Tea", href: "/sylheti-tea/black-tea" },
  { label: "Green Tea", href: "/sylheti-tea/green-tea" },
  { label: "Organic Collection", href: "/sylheti-tea/organic-collection" },
  { label: "Signature Collection", href: "/sylheti-tea/signature-collection" },
];

const navItems = [
  { label: "SYLHETI TEA", href: "/sylheti-tea", hasDropdown: true },
  { label: "GIFT SETS", href: "/gift-sets" },
  { label: "BEST SELLERS", href: "/best-sellers" },
  { label: "ABOUT US", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

export default function Navigation() {
  return (
    <nav className="hidden xl:flex items-center gap-6 xl:gap-8">
      {navItems.map((item) => (
        <div key={item.label} className="relative group">
          <Link
            href={item.href}
            className="font-gotham text-sm font-medium text-stone-800 hover:text-brand-3 transition-colors flex items-center gap-1"
          >
            {item.label}

            {item.hasDropdown && (
              <RiArrowDownSLine className="text-xl" />
            )}
          </Link>

          {/* Dropdown */}
          {item.hasDropdown && (
            <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
              <div className="w-56 bg-white border border-gray-100 rounded-md shadow-lg py-2">
                {sylhetiTeaItems.map((subItem) => (
                  <Link
                    key={subItem.label}
                    href={subItem.href}
                    className="block px-4 py-2 font-gotham text-sm font-medium text-stone-800 hover:bg-brand-3 hover:text-white transition-colors"
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
