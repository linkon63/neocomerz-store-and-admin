'use client';

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { RiArrowDownSLine } from "react-icons/ri";

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

const leftNavItems = [
  { label: "Home", href: "/" },
  { label: "ABOUT US", href: "/about" },
  { label: "TEAS", href: "/sylheti-tea", hasDropdown: true },
];

const rightNavItems = [
  { label: "GIFTS", href: "/gift-sets" },
  { label: "CORPORATE ORDER", href: "/corporate-order" },
  { label: "CONTACT", href: "/contact" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState("assorted");
  const [isTeasHovered, setIsTeasHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsTeasHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsTeasHovered(false);
    }, 150);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const currentCategoryData = categories.find((cat) => cat.id === activeCategory) || categories[0];

  const renderNavItem = (item: typeof leftNavItems[0]) => (
    <div 
      key={item.label} 
      className={item.hasDropdown ? "" : "relative"}
      onMouseEnter={item.hasDropdown ? handleMouseEnter : undefined}
      onMouseLeave={item.hasDropdown ? handleMouseLeave : undefined}
    >
      <Link
        href={item.href}
        className={`font-gotham text-sm font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 py-2 ${
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

      {item.hasDropdown && isTeasHovered && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 z-50">
          <div className="w-[92vw] max-w-[1400px] bg-white shadow-[0px_12px_48px_0px_rgba(0,0,0,0.08)] rounded-none border border-zinc-100">
            <div className="px-10 py-12 flex justify-start items-start gap-12 text-zinc-800">
              
              <div className="flex-1 flex justify-start items-start gap-12">
                <div className="w-[300px] xl:w-[350px] shrink-0 flex flex-col justify-start items-start">
                  {categories.map((category) => {
                    const isCatActive = category.id === activeCategory;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onMouseEnter={() => setActiveCategory(category.id)}
                        className={`w-full py-2.5 flex items-center justify-start text-left transition-all duration-200 cursor-pointer border-none bg-transparent ${
                          isCatActive
                            ? "font-['Snell_Roundhand_LT_Std'] text-[#b4a676] text-2xl xl:text-3xl font-normal leading-normal flex items-center gap-3"
                            : "font-['Bembo_Std'] text-stone-gray text-2xl xl:text-3xl font-normal leading-normal hover:text-stone-600"
                        }`}
                      >
                        <span>{category.label}</span>
                        {isCatActive && (
                          <span className="text-[#b4a676] text-xl font-normal leading-none self-center">⚜</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 pt-2 flex flex-col justify-start items-start">
                  {currentCategoryData.items.map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      className="self-stretch py-1.5 flex flex-col justify-start items-start gap-1 font-['Bembo_Std'] text-stone-gray hover:text-[#b4a676] text-sm lg:text-base font-normal leading-normal transition-colors"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="w-px self-stretch bg-zinc-300"></div>

              <div className="flex-1 flex justify-start items-center gap-6">
                <Link 
                  href="/products" 
                  className="flex-1 flex flex-col justify-center items-start gap-3 group/promo"
                >
                  <img 
                    src="/images/products/Product-3.png" 
                    alt="Best Sellers" 
                    className="self-stretch h-80 object-cover rounded-md transition-transform duration-300 group-hover/promo:scale-[1.02]"
                  />
                  <div className="justify-start text-zinc-650 group-hover/promo:text-[#b4a676] transition-colors text-xl font-normal font-['Gotham'] leading-6">
                    Best Sellers
                  </div>
                </Link>
                <Link 
                  href="/products" 
                  className="flex-1 flex flex-col justify-center items-start gap-3 group/promo"
                >
                  <img 
                    src="/images/products/Product-5.png" 
                    alt="New Arrivals" 
                    className="self-stretch h-80 object-cover rounded-md transition-transform duration-300 group-hover/promo:scale-[1.02]"
                  />
                  <div className="justify-start text-zinc-650 group-hover/promo:text-[#b4a676] transition-colors text-xl font-normal font-['Gotham'] leading-6">
                    New Arrivals
                  </div>
                </Link>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav className="relative hidden xl:flex items-center gap-6 xl:gap-8">
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

