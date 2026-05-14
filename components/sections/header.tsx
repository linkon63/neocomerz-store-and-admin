'use client';

import { IoSearchOutline, IoHeartOutline, IoChevronDownOutline } from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";
import { LuShoppingBag, LuUser } from "react-icons/lu";
import { useState } from "react";
import { HiOutlineBars3BottomRight } from "react-icons/hi2";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const sylhetiTeaItems = [
    { label: "Black Tea", href: "/sylheti-tea/black-tea" },
    { label: "Green Tea", href: "/sylheti-tea/green-tea" },
    { label: "Organic Collection", href: "/sylheti-tea/Organiccollection" },
    { label: "Signature Collection", href: "/sylheti-tea/Signaturecollection" },
  ];

  const navItems = [
    { label: "SYLHETI TEA", href: "/sylheti-tea", hasDropdown: true },
    { label: "GIFT SETS", href: "/gift-sets" },
    { label: "BEST SELLERS", href: "/best-sellers" },
    { label: "ABOUT US", href: "/about" },
    { label: "CONTACT", href: "/contact" },
  ];

  return (
    <section className="w-full bg-white border-b border-gray-200">
      <div className="header-wrapper"> 
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4 gap-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/images/logo/Logo.png" 
                  alt="London Tea Exchange Logo" 
                  width={150} 
                  height={40}
                  className="h-8 sm:h-10 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden xl:flex items-center gap-6 xl:gap-8">
              {navItems.map((item) => (
                <div 
                  key={item.label} 
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && setIsDropdownOpen(true)}
                  onMouseLeave={() => item.hasDropdown && setIsDropdownOpen(false)}
                >
                  <Link
                    href={item.href}
                    className="font-gotham text-text-primary text-sm hover:text-brand-3 transition-colors flex items-center gap-1"
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <IoChevronDownOutline className="w-3 h-3" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.hasDropdown && isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-0 pt-2 w-48 z-50">
                      <div className="bg-white shadow-lg rounded-md py-2 border border-gray-100">
                        {sylhetiTeaItems.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className="block px-4 py-2 font-gotham text-sm text-text-primary hover:bg-brand-3 hover:text-white transition-colors"
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

            {/* Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Search Icon */}
              <button 
                className="text-text-primary hover:text-brand-3 transition-colors hidden sm:block cursor-pointer"
                aria-label="Search"
              >
                <IoSearchOutline className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button 
                className="text-text-primary hover:text-brand-3 transition-colors hidden sm:block cursor-pointer"
                aria-label="Wishlist"
              >
                <IoHeartOutline className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button 
                className="text-text-primary hover:text-brand-3 transition-colors relative cursor-pointer"
                aria-label="Shopping Cart"
              >
                <LuShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  0
                </span>
              </button>
              <button 
                className="text-text-primary hover:text-brand-3 transition-colors cursor-pointer"
                aria-label="User Account"
              >
                <LuUser className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Mobile Menu Button */}
              <button 
                className="xl:hidden text-text-primary"
                aria-label="Menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <HiOutlineBars3BottomRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="xl:hidden border-t border-gray-200 bg-white shadow-lg">
              <nav className="py-2">
                {navItems.map((item) => (
                  <div key={item.label} className="border-b border-gray-100 last:border-0">
                    {item.hasDropdown ? (
                      <>
                        {/* Menu item with dropdown */}
                        <button
                          onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                          className="w-full flex items-center justify-between px-4 py-3 font-gotham text-sm text-text-primary hover:bg-gray-50 transition-colors"
                        >
                          <span>{item.label}</span>
                          <IoChevronDownOutline 
                            className={`w-4 h-4 transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        
                        {/* Dropdown Items */}
                        {mobileDropdownOpen && (
                          <div className="bg-gray-50 border-t border-gray-200 hover:text-brand-3 transition-colors">
                            {sylhetiTeaItems.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                className="block pl-8 pr-4 py-2.5 font-gotham text-sm text-text-primary hover:bg-brand-3 hover:text-white transition-colors border-b border-gray-100 last:border-0"
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setMobileDropdownOpen(false);
                                }}
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
                        className="block px-4 py-3 font-gotham text-sm text-text-primary hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
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
      </div>
    </section>
  );
}
