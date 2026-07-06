"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import DiscoverMoreButton from "./button";
import { fetchShopCategories } from "@/lib/shop-api";
import { resolveImageUrl } from "@/lib/admin-api";

const fallbackTeaTypes = [
  { id: 1, name: "Black tea", image: "/images/tea/tea-1.png" },
  { id: 2, name: "Green Tea", image: "/images/tea/tea-3.png" },
  { id: 3, name: "Oolong tea", image: "/images/tea/tea-2.png" },
  { id: 4, name: "White tea", image: "/images/tea/tea-5.png" },
  { id: 5, name: "Yellow tea", image: "/images/tea/tea-4.png" },
  { id: 6, name: "Herbal tea", image: "/images/tea/tea-6.png" },
  { id: 7, name: "Floral tea", image: "/images/tea/tea-7.png" },
  { id: 8, name: "Fruit tea", image: "/images/tea/tea.png" },
];

export default function LooseTea() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const fetched = await fetchShopCategories();
        if (fetched && fetched.length > 0) {
          setCategories(
            fetched.map((c, i) => ({
              id: c.id,
              name: c.name,
              image: c.imageUrl ? resolveImageUrl(c.imageUrl) : fallbackTeaTypes[i % fallbackTeaTypes.length].image,
            }))
          );
        } else {
          setCategories(fallbackTeaTypes);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories(fallbackTeaTypes);
      }
    }
    loadCategories();
  }, []);

  return (
    <section 
      className="relative w-full bg-greenish-gray overflow-hidden flex items-end min-h-175"
    >
      {/* Top SVG Curve */}
      <svg
        className="absolute top-0 left-0 w-full h-32 md:h-45"
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0 C360,180 1080,180 1440,0 L1440,0 L0,0 Z"
          fill="#F9F9FB"
        />
      </svg>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Title */}
        <div className="text-center mb-10 md:mb-14">
          <p className="font-['Bembo_Std'] text-xs sm:text-lg uppercase tracking-wider text-gray-600 mb-2">
            THE COLLECTIONS OF
          </p>
          <h2 className="font-['Bembo_Std'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-brand-3">
            Loose <span className="italic font-['Snell_Roundhand_LT_Std']">Tea</span>
          </h2>
        </div>
        <div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6 md:gap-8 lg:gap-6"
          style={{
            clipPath: "ellipse(110% 100% at 50% 50%)",
          }}
        >
          {categories.map((tea, index) => {
            const marginTopClasses = [
              'lg:-mt-14',  
              'lg:-mt-8',   
              'lg:-mt-4',   
              'lg:mt-0',    
              'lg:mt-0',  
              'lg:-mt-4',   
              'lg:-mt-8',   
              'lg:-mt-14',  
            ];
            
            return (
              <Link
                key={tea.id}
                href={`/products?category=${encodeURIComponent(tea.name)}`}
                className={`flex flex-col items-center group cursor-pointer ${marginTopClasses[index % marginTopClasses.length]}`}
              >
                <div
                  className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-24 lg:h-24 xl:w-28 xl:h-28 mb-3 md:mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    clipPath: "circle(50% at 50% 50%)",
                  }}
                >
                  <Image
                    src={tea.image}
                    alt={tea.name}
                    fill
                    sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 112px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="font-gotham text-xs sm:text-sm text-stone-gray text-center group-hover:text-brand-3 transition-colors">
                  {tea.name}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="flex justify-center mt-6 md:mt-12">
          <DiscoverMoreButton href="/products" variant="primary" />
        </div>
      </div>
    </section>
  );
}

