"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import GiftItem from "@/components/sections/gift-item";
import Brands from "@/components/sections/brands";
import Instagram from "@/components/sections/instagram";
import ScrollAnimate from "@/components/ui/scroll-animate";

import ProductCard from "@/components/sections/ui/product-card";
import { fetchShopProducts, type ShopProduct } from "@/lib/shop-api";

const curatedProducts = [
  { id: "1", name: "Tea Book Collection", price: "Tk 5,500", image: "/images/products/Product-1.png" },
  { id: "2", name: "Assertion Classic Collection", price: "Tk 5,500", image: "/images/products/Product-2.png" },
  { id: "3", name: "Asserted Super Fruit Collection", price: "Tk 5,500", image: "/images/products/Product-3.png" },
  { id: "4", name: "Asserted Floral Collection", price: "Tk 5,500", image: "/images/products/Product-4.png" },
  { id: "5", name: "Asserted Wild Orchard Collection", price: "Tk 5,500", image: "/images/products/Product-5.png" },
  { id: "6", name: "Tea Book No. 3 Royal Collection", price: "Tk 5,500", image: "/images/products/Product-6.png" },
];

const heritageItems = [
  {
    id: 1,
    title: "Gracious Hospitality",
    desc: "Welcome guests and honour relationships with a tea experience crafted to be remembered beyond the final cup.",
    image: "/images/Assembly/img-11.webp",
    aspect: "aspect-square"
  },
  {
    id: 2,
    title: "Executive Appreciation",
    desc: "Celebrate professional milestones with a gesture of quiet distinction and lasting refinement.",
    image: "/images/Assembly/img-1.png",
    aspect: "aspect-square"
  },
  {
    id: 3,
    title: "",
    desc: "",
    image: "/images/Assembly/img-12.webp",
    aspect: "aspect-[9/16] h-[340px]"
  },
  {
    id: 4,
    title: "Personal Celebrations",
    desc: "Mark life's most meaningful occasions with a gift that reflects thoughtfulness, elegance, and timeless taste.",
    image: "/images/Assembly/img-10.webp",
    aspect: "aspect-square"
  }
];

export default function GiftsPage() {
  const [products, setProducts] = useState<any[]>(curatedProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetchShopProducts({ page: 1, limit: 12 });
        if (res && res.data && res.data.length > 0) {
          // Filter to show only gift products if available
          const gifts = res.data.filter((p: ShopProduct) => 
            p.category?.toLowerCase().includes("gift") ||
            p.name?.toLowerCase().includes("gift") ||
            p.name?.toLowerCase().includes("collection") ||
            p.name?.toLowerCase().includes("book")
          );

          if (gifts.length > 0) {
            setProducts(gifts.map((p) => ({
              id: p.id,
              name: p.name,
              price: `Tk ${p.price.toLocaleString()}`,
              originalPrice: p.originalPrice ? `Tk ${p.originalPrice.toLocaleString()}` : undefined,
              image: p.image,
              slug: p.slug,
            })));
          } else {
            // If no specific gifts found, display the first 6 products
            setProducts(res.data.slice(0, 6).map((p) => ({
              id: p.id,
              name: p.name,
              price: `Tk ${p.price.toLocaleString()}`,
              originalPrice: p.originalPrice ? `Tk ${p.originalPrice.toLocaleString()}` : undefined,
              image: p.image,
              slug: p.slug,
            })));
          }
        }
      } catch (err) {
        console.error("Failed to load products from API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <main className="relative w-full bg-[#FAF9F5] overflow-hidden">
      
      {/* SECTION 1: Top Gifting Items (Using existing premium section layout) */}
      <ScrollAnimate variant="fade-in-up">
        <GiftItem />
      </ScrollAnimate>

      {/* SECTION 2: Curated Collections */}
      <ScrollAnimate variant="fade-in-up">
        <section className="w-full py-16 md:py-24 bg-[#F6F6F6] border-t border-stone-100">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            {/* Header */}
            <div className="text-center mb-16 flex flex-col items-center">
              <h2 className="inline-flex flex-row justify-center items-baseline gap-2 md:gap-3">
                <span className="font-['Bembo_Std'] text-[#C6B485] text-4xl sm:text-5xl md:text-6xl font-normal leading-none">Curated</span>
                <span className="font-['Snell_Roundhand_LT_Std'] italic text-[#8E866B] text-4xl sm:text-5xl md:text-6xl font-normal leading-none lowercase">Collections</span>
              </h2>
              <p className="max-w-[600px] text-center text-[#83847e] text-sm sm:text-base md:text-lg font-normal font-['Bembo_Std'] leading-normal px-4 mt-4">
                Designed to make a lasting impression for corporate, seasonal, and personal gifting.
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  slug={product.slug}
                />
              ))}
            </div>
          </div>
        </section>
      </ScrollAnimate>

      {/* SECTION 3: Give More Than Tea — Share a Heritage */}
      <ScrollAnimate variant="fade-in-up">
        <section className="relative w-full pt-32 pb-20 md:pt-44 md:pb-28 bg-white overflow-hidden">
          {/* Top Curve Shape */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-none select-none pointer-events-none z-10">
            <svg 
              viewBox="0 0 1920 94" 
              preserveAspectRatio="none" 
              className="relative block w-full h-[30px] sm:h-[50px] md:h-[70px] lg:h-[94px]"
            >
              <path d="M1920 0H0C0 0 429.807 94 960 94C1490.19 94 1920 0 1920 0Z" fill="#F6F6F6" />
            </svg>
          </div>

          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Title Panel */}
              <div className="lg:col-span-5 flex flex-col justify-start items-start gap-4">
                <h2 className="text-[#C5B382] text-2xl sm:text-4xl md:text-5xl font-normal font-['Bembo_Std'] leading-tight tracking-wide whitespace-nowrap">
                  Give More Than Tea—
                  <span className="block mt-2 font-['Snell_Roundhand_LT_Std'] italic text-[#1C1C1C] text-3xl sm:text-5xl md:text-6xl leading-none whitespace-nowrap">
                    Share a Heritage
                  </span>
                </h2>
              </div>

              {/* Right Images & Details Row */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-4 gap-6 items-start">
                {heritageItems.map((item) => (
                  <div key={item.id} className="flex flex-col items-start gap-4 w-full">
                    {/* Image */}
                    <div className={`relative w-full ${item.aspect} bg-stone-100 overflow-hidden rounded-none shadow-sm border border-white/50 group`}>
                      <Image
                        src={item.image}
                        alt={item.title || "Heritage representation"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Text details (only if title is defined) */}
                    {item.title && (
                      <div className="space-y-2">
                        <h4 className="font-['Snell_Roundhand_LT_Std'] italic text-2xl text-[#C5B382] tracking-wide font-normal leading-tight lowercase">
                          {item.title}
                        </h4>
                        <p className="font-['Bembo_Std'] text-zinc-650 text-xs sm:text-sm leading-relaxed font-light">
                          {item.desc}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Bottom Curve Shape */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none select-none pointer-events-none z-10">
            <svg 
              viewBox="0 0 1920 94" 
              preserveAspectRatio="none" 
              className="relative block w-full h-[30px] sm:h-[50px] md:h-[70px] lg:h-[94px]"
            >
              <path d="M0 0C0 0 429.807 94 960 94H0V0ZM1920 94H960C1490.19 94 1920 0 1920 0V94Z" fill="#F6F6F6" />
            </svg>
          </div>
        </section>
      </ScrollAnimate>

      {/* SECTION 4: Brand Swiper */}
      <ScrollAnimate variant="fade-in-up">
        <Brands bgClassName="bg-[#F6F6F6]" />
      </ScrollAnimate>

      {/* SECTION 5: Instagram Follow Swiper */}
      <ScrollAnimate variant="fade-in-up">
        <Instagram />
      </ScrollAnimate>

    </main>
  );
}
