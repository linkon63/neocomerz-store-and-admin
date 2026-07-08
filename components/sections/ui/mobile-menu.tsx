'use client';

import { useState } from "react";
import Link from "next/link";
import { HiOutlineBars3BottomRight } from "react-icons/hi2";
import { IoChevronDownOutline, IoChevronForwardOutline } from "react-icons/io5";
import { NavigationProps } from "../../../data/types";

const categories = [
  {
    id: "assorted",
    label: "Assorted Collections",
    items: [
      { label: "Assorted Classic Collection", href: "/products?category=Assorted%20Classic" },
      { label: "Assorted Royal Collection", href: "/products?category=Assorted%20Royal" },
      { label: "Assorted Super Fruit Collection", href: "/products?category=Assorted%20Super%20Fruit" },
      { label: "Assorted Black Tea Collection", href: "/products?category=Assorted%20Black%20Tea" },
      { label: "Assorted Wellness Collection", href: "/products?category=Assorted%20Wellness" },
      { label: "Assorted Oolong Collection", href: "/products?category=Assorted%20Oolong" },
      { label: "Assorted Festive Collection", href: "/products?category=Assorted%20Festive" },
      { label: "Assorted Wild Meadows Collection", href: "/products?category=Assorted%20Wild%20Meadows" },
      { label: "Assorted Wild Orchard Collection", href: "/products?category=Assorted%20Wild%20Orchard" },
    ],
  },
  {
    id: "tea-books",
    label: "Tea Book Collections",
    items: [
      { label: "Velvet Bound Tea Book", href: "/products?category=Tea%20Books" },
      { label: "Royal Tea Book Collection", href: "/products?category=Tea%20Books" },
      { label: "Classic Tea Book Volume I", href: "/products?category=Tea%20Books" },
      { label: "Classic Tea Book Volume II", href: "/products?category=Tea%20Books" },
      { label: "Heritage Tea Book Volume III", href: "/products?category=Tea%20Books" },
      { label: "Midnight Tea Book Volume IV", href: "/products?category=Tea%20Books" },
    ],
  },
  {
    id: "tea-chests",
    label: "Tea chests",
    items: [
      { label: "Imperial Wooden Chest", href: "/products?category=Tea%20Chests" },
      { label: "Royal Brass Tea Chest", href: "/products?category=Tea%20Chests" },
      { label: "Classic Mahogany Chest", href: "/products?category=Tea%20Chests" },
      { label: "Heritage Bamboo Chest", href: "/products?category=Tea%20Chests" },
      { label: "Gilded Tea Chest Collection", href: "/products?category=Tea%20Chests" },
    ],
  },
  {
    id: "loose-tea",
    label: "Loose Tea",
    items: [
      { label: "Sylhet Imperial Noir", href: "/products?category=Loose%20Tea" },
      { label: "Sovereign Black Blend", href: "/products?category=Loose%20Tea" },
      { label: "Classic English Breakfast", href: "/products?category=Loose%20Tea" },
      { label: "Organic Darjeeling Second Flush", href: "/products?category=Loose%20Tea" },
      { label: "First Flush Reserve", href: "/products?category=Loose%20Tea" },
      { label: "Wild Jasmine Green", href: "/products?category=Loose%20Tea" },
      { label: "Premium Sencha Green", href: "/products?category=Loose%20Tea" },
    ],
  },
];

export default function MobileMenu({
  navItems,
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState<string | null>(null);

  const toggleCategory = (catId: string) => {
    setActiveMobileCategory(activeMobileCategory === catId ? null : catId);
  };

  return (
    <div className="xl:hidden">
      <button
        aria-label="Menu"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="text-zinc-800 hover:text-brand-primary transition-colors cursor-pointer"
      >
        <HiOutlineBars3BottomRight className="w-6 h-6" />
      </button>
      {isMobileMenuOpen && (
        <div className="absolute left-0 top-full w-full border-t border-zinc-200 bg-white shadow-lg z-50">
          <nav className="py-2">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="border-b border-zinc-100 last:border-0"
              >
                {item.hasDropdown ? (
                  <>
                    <button
                      onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 font-gotham text-sm text-zinc-800 hover:bg-zinc-50 hover:text-brand-primary transition-colors"
                    >
                      <span className="font-medium">{item.label}</span>
                      <IoChevronDownOutline
                        className={`w-4 h-4 transition-transform ${
                          mobileDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {mobileDropdownOpen && (
                      <div className="bg-zinc-50 border-t border-zinc-150 py-1">
                        {categories.map((category) => {
                          const isCatOpen = activeMobileCategory === category.id;
                          return (
                            <div key={category.id} className="border-b border-zinc-100/50 last:border-0">
                              <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full flex items-center justify-between pl-8 pr-4 py-2 font-gotham text-sm text-zinc-700 hover:text-brand-primary transition-colors"
                              >
                                <span>{category.label}</span>
                                <IoChevronForwardOutline
                                  className={`w-3 h-3 transition-transform ${
                                    isCatOpen ? "rotate-90" : ""
                                  }`}
                                />
                              </button>

                              {isCatOpen && (
                                <div className="bg-white/60 pl-12 pr-4 py-1 flex flex-col">
                                  {category.items.map((subItem) => (
                                    <Link
                                      key={subItem.label}
                                      href={subItem.href}
                                      onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setMobileDropdownOpen(false);
                                        setActiveMobileCategory(null);
                                      }}
                                      className="block py-2 font-gotham text-xs text-zinc-650 hover:text-brand-primary transition-colors border-b border-zinc-100 last:border-0"
                                    >
                                      {subItem.label}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 font-gotham text-sm font-medium text-zinc-800 hover:bg-zinc-50 hover:text-brand-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}