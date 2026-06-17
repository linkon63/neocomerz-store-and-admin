'use client';

import { useState } from "react";
import Link from "next/link";
import { HiOutlineBars3BottomRight } from "react-icons/hi2";
import { IoChevronDownOutline } from "react-icons/io5";
import { NavigationProps } from "../../../data/types";

export default function MobileMenu({
  navItems,
  sylhetiTeaItems,
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

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
                      onClick={() =>
                        setMobileDropdownOpen(!mobileDropdownOpen)
                      }
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
                      <div className="bg-zinc-50 border-t border-zinc-150">
                        {sylhetiTeaItems.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setMobileDropdownOpen(false);
                            }}
                            className="block pl-8 pr-4 py-2.5 font-gotham text-sm text-zinc-700 hover:bg-zinc-100 hover:text-brand-primary transition-colors border-b border-zinc-150 last:border-0"
                          >
                            {subItem.label}
                          </Link>
                        ))}
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