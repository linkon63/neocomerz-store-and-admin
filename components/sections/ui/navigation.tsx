'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { RiArrowDownSLine } from "react-icons/ri";
import { fetchShopCategories, type ShopCategory } from "@/lib/shop-api";

const leftNavItems = [
  { label: "HOME", href: "/" },
  { label: "TEAS", href: "/products", hasDropdown: true },
  { label: "GIFTS", href: "/gift-sets" },
  { label: "CORPORATE ORDER", href: "/corporate-order" },
];

const rightNavItems = [
  { label: "ABOUT US", href: "/about" },
  { label: "GLOBAL FAIR PAY CHARTER", href: "/global-fair-pay-charter" },
  { label: "CONTACT", href: "/contact" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [isTeasHovered, setIsTeasHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on pathname change
  useEffect(() => {
    setIsTeasHovered(false);
  }, [pathname]);

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsTeasHovered(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const fetched = await fetchShopCategories();
        // Filters only main categories (e.g. parentId is null)
        const mainCategories = fetched.filter(c => !c.parentId);
        setCategories(mainCategories);
        if (mainCategories.length > 0) {
          setActiveCategory(mainCategories[0].id);
        }
      } catch (err) {
        console.error("Failed to load categories for menu:", err);
      }
    }
    loadCategories();
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsTeasHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsTeasHovered(false);
    }, 250);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const currentCategoryData = categories.find((cat) => cat.id === activeCategory) || categories[0] || null;

  const renderNavItem = (item: typeof leftNavItems[0]) => (
    <div 
      key={item.label} 
      className={item.hasDropdown ? "" : "relative"}
      onMouseEnter={item.hasDropdown ? handleMouseEnter : undefined}
      onMouseLeave={item.hasDropdown ? handleMouseLeave : undefined}
    >
      <Link
        href={item.href}
        className={`font-gotham text-[10.5px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors flex items-center gap-1 py-2 relative group ${
          isActive(item.href)
            ? "text-brand-primary"
            : "text-white hover:text-brand-primary"
        }`}
      >
        {item.label}

        {item.hasDropdown && (
          <RiArrowDownSLine className="text-lg text-zinc-400 group-hover:text-brand-primary transition-colors" />
        )}

        {item.label === "TEAS" && (
          <span className="absolute top-[85%] left-1/2 -translate-x-1/2 hidden group-hover:block bg-stone-900 border border-stone-800 text-white text-[10px] font-semibold tracking-wider uppercase py-1 px-2.5 rounded shadow-lg z-[60] whitespace-nowrap">
            All Products
          </span>
        )}
      </Link>

      {item.hasDropdown && (
        <div 
          className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 transition-all duration-300 ease-out ${
            isTeasHovered
              ? "opacity-100 translate-y-0 visible pointer-events-auto"
              : "opacity-0 -translate-y-2 invisible pointer-events-none"
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="w-[92vw] max-w-[1400px] bg-white shadow-[0px_12px_48px_0px_rgba(0,0,0,0.08)] rounded-none border border-zinc-100">
            <div className="px-10 py-12 flex justify-start items-start gap-12 text-zinc-800">
              
              <div className="flex-1 flex justify-start items-start gap-12">
                <div className="w-[300px] xl:w-[350px] shrink-0 flex flex-col justify-start items-start">
                  <Link
                    href="/products"
                    onClick={() => setIsTeasHovered(false)}
                    className="w-full pb-3 mb-3 border-b border-zinc-100 flex items-center justify-start text-left font-['Bembo_Std'] text-stone-gray hover:text-[#b4a676] text-xl font-semibold transition-all duration-200"
                  >
                    <span>All Products</span>
                  </Link>

                  {categories.map((category) => {
                    const isCatActive = category.id === activeCategory;
                    return (
                      <Link
                        key={category.id}
                        href={`/products?category=${encodeURIComponent(category.name)}`}
                        onMouseEnter={() => setActiveCategory(category.id)}
                        onClick={() => setIsTeasHovered(false)}
                        className={`w-full py-2.5 flex items-center justify-start text-left transition-all duration-200 cursor-pointer border-none bg-transparent ${
                          isCatActive
                            ? "font-['Snell_Roundhand_LT_Std'] text-[#b4a676] text-2xl xl:text-3xl font-normal leading-normal flex items-center gap-3 translate-x-1"
                            : "font-['Bembo_Std'] text-stone-gray text-2xl xl:text-3xl font-normal leading-normal hover:text-[#b4a676] hover:translate-x-1"
                        }`}
                      >
                        <span>{category.name}</span>
                        {isCatActive && (
                          <span className="text-[#b4a676] text-xl font-normal leading-none self-center">⚜</span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="flex-1 pt-2 flex flex-col justify-start items-start">
                  {currentCategoryData?.children && currentCategoryData.children.length > 0 ? (
                    currentCategoryData.children.map((subItem) => (
                      <Link
                        key={subItem.id}
                        href={`/products?category=${encodeURIComponent(subItem.name)}`}
                        onClick={() => setIsTeasHovered(false)}
                        className="group/sub py-1.5 flex items-center gap-2 font-['Bembo_Std'] text-stone-gray hover:text-[#b4a676] text-sm lg:text-base font-normal leading-normal transition-all duration-200 hover:translate-x-1.5"
                      >
                        <span className="transition-transform duration-200">{subItem.name}</span>
                        <span className="opacity-0 -translate-x-2 text-xs transition-all duration-200 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 text-[#b4a676]">→</span>
                      </Link>
                    ))
                  ) : (
                    <span className="py-2 text-sm text-stone-400 font-['Bembo_Std']">
                      No subcategories available
                    </span>
                  )}
                </div>
              </div>

              <div className="w-px self-stretch bg-zinc-300"></div>

              <div className="flex-1 flex justify-start items-center gap-6">
                <Link 
                  href="/products" 
                  onClick={() => setIsTeasHovered(false)}
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
                  onClick={() => setIsTeasHovered(false)}
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
    <nav className="relative hidden xl:flex items-center justify-center w-full">
      {/* Left nav group */}
      <div className="flex items-center justify-end gap-3 xl:gap-5 flex-1">
        {leftNavItems.map(renderNavItem)}
      </div>

      {/* Center Logo */}
      <Link href="/" className="mx-3 xl:mx-5 shrink-0 transition-transform duration-200 hover:scale-105">
        <Image
          src="/images/logo/Logo-update.png"
          alt="London Tea Exchange Logo"
          width={80}
          height={80}
          className="w-20 h-20 object-contain"
          priority
        />
      </Link>

      {/* Right nav group */}
      <div className="flex items-center justify-start gap-3 xl:gap-5 flex-1">
        {rightNavItems.map(renderNavItem)}
      </div>
    </nav>
  );
}

