"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import GiftItem from "@/components/sections/gift-item";
import Brands from "@/components/sections/brands";
import Instagram from "@/components/sections/instagram";

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
    image: "/images/Assembly/img-1.png",
    aspect: "aspect-square"
  },
  {
    id: 2,
    title: "Executive Appreciation",
    desc: "Celebrate professional milestones with a gesture of quiet distinction and lasting refinement.",
    image: "/images/Assembly/img-2.png",
    aspect: "aspect-square"
  },
  {
    id: 3,
    title: "",
    desc: "",
    image: "/images/Assembly/img-3.png",
    aspect: "aspect-[9/16] h-[340px]"
  },
  {
    id: 4,
    title: "Personal Celebrations",
    desc: "Mark life's most meaningful occasions with a gift that reflects thoughtfulness, elegance, and timeless taste.",
    image: "/images/Assembly/img-4.png",
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
            })));
          } else {
            // If no specific gifts found, display the first 6 products
            setProducts(res.data.slice(0, 6).map((p) => ({
              id: p.id,
              name: p.name,
              price: `Tk ${p.price.toLocaleString()}`,
              originalPrice: p.originalPrice ? `Tk ${p.originalPrice.toLocaleString()}` : undefined,
              image: p.image,
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
      <GiftItem />

      {/* SECTION 2: Curated Collections */}
      <section className="w-full py-16 md:py-24 bg-white border-t border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="font-['Bembo_Std'] text-4xl sm:text-5xl text-neutral-800 font-normal tracking-wide">
              Curated <span className="font-['Snell_Roundhand_LT_Std'] italic text-stone-850 lowercase text-5xl sm:text-6xl -ml-1">Collections</span>
            </h2>
            <p className="font-['Bembo_Std'] text-zinc-650 text-sm sm:text-base tracking-wide mt-4 font-light max-w-xl mx-auto leading-relaxed">
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
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Give More Than Tea — Share a Heritage */}
      <section className="w-full py-20 bg-[#FAF9F5] border-t border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Title Panel */}
            <div className="lg:col-span-4 flex flex-col justify-start items-start gap-4">
              <h2 className="text-[#1C1C1C] text-3xl sm:text-4xl md:text-5xl font-normal font-['Bembo_Std'] leading-tight tracking-wide">
                Give More Than Tea—
                <span className="block mt-2 font-['Snell_Roundhand_LT_Std'] italic text-[#C5B382] text-4xl sm:text-5xl md:text-6xl lowercase leading-none">
                  share a heritage
                </span>
              </h2>
            </div>

            {/* Right Images & Details Row */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-4 gap-6 items-start">
              {heritageItems.map((item) => (
                <div key={item.id} className="flex flex-col items-start gap-4 w-full">
                  {/* Image */}
                  <div className={`relative w-full ${item.aspect} bg-stone-100 overflow-hidden rounded-lg shadow-sm border border-white/50 group`}>
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
      </section>

      {/* SECTION 4: Brand Swiper */}
      <Brands />

      {/* SECTION 5: Instagram Follow Swiper */}
      <Instagram />

    </main>
  );
}
