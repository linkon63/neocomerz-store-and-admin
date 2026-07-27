'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiOutlineBars3BottomRight } from "react-icons/hi2";
import { IoChevronDownOutline, IoChevronForwardOutline } from "react-icons/io5";
import { NavigationProps } from "../../../data/types";
import { fetchShopCategories, type ShopCategory } from "@/lib/shop-api";

export default function MobileMenu({
  navItems,
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState<string | null>(null);
  const [dbCategories, setDbCategories] = useState<ShopCategory[]>([]);

  useEffect(() => {
    async function loadCats() {
      try {
        const data = await fetchShopCategories();
        setDbCategories(data);
      } catch (err) {
        console.error("Failed to load mobile categories:", err);
      }
    }
    loadCats();
  }, []);

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
                    <div className="w-full flex items-center justify-between font-gotham text-sm text-zinc-800 hover:bg-zinc-50 transition-colors">
                      <Link
                        href="/products"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-grow px-4 py-3 font-medium hover:text-brand-primary text-left"
                      >
                        {item.label}
                      </Link>
                      <button
                        onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                        className="px-5 py-3.5 border-l border-zinc-100/50 flex items-center justify-center cursor-pointer text-zinc-500 hover:text-zinc-800"
                        aria-label="Toggle subcategories"
                      >
                        <IoChevronDownOutline
                          className={`w-4 h-4 transition-transform ${
                            mobileDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {mobileDropdownOpen && (
                      <div className="bg-zinc-50 border-t border-zinc-150 py-1">
                        {dbCategories.map((category) => {
                          const isCatOpen = activeMobileCategory === category.id;
                          const subcategories = category.children || [];
                          return (
                            <div key={category.id} className="border-b border-zinc-100/50 last:border-0">
                              <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full flex items-center justify-between pl-8 pr-4 py-2 font-gotham text-sm text-zinc-700 hover:text-brand-primary transition-colors cursor-pointer"
                              >
                                <span>{category.name}</span>
                                {subcategories.length > 0 && (
                                  <IoChevronForwardOutline
                                    className={`w-3 h-3 transition-transform ${
                                      isCatOpen ? "rotate-90" : ""
                                    }`}
                                  />
                                )}
                              </button>

                              {isCatOpen && subcategories.length > 0 && (
                                <div className="bg-white/60 pl-12 pr-4 py-1 flex flex-col">
                                  {subcategories.map((subItem) => (
                                    <Link
                                      key={subItem.id}
                                      href={`/products?category=${encodeURIComponent(subItem.name)}`}
                                      onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setMobileDropdownOpen(false);
                                        setActiveMobileCategory(null);
                                      }}
                                      className="block py-2 font-gotham text-xs text-zinc-650 hover:text-brand-primary transition-colors border-b border-zinc-100 last:border-0"
                                    >
                                      {subItem.name}
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