"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchShopCategories, type ShopCategory } from "@/lib/shop-api";

const NO_IMAGE = '/images/no-image-icon-6.png';

export default function LooseTea() {
  const [subcategories, setSubcategories] = useState<ShopCategory[]>([]);

  useEffect(() => {
    async function loadSubcategories() {
      try {
        const fetched = await fetchShopCategories();
        const looseTeaParent = fetched.find(
          c => c.slug === 'loose-tea' || c.slug === 'loose-leaf-tea' || c.name.toLowerCase() === 'loose tea'
        );
        if (looseTeaParent && looseTeaParent.children) {
          setSubcategories(looseTeaParent.children);
        }
      } catch (error) {
        console.error("Failed to fetch subcategories for Loose Tea:", error);
      }
    }
    loadSubcategories();
  }, []);

  return (
    <section
      className="relative w-full bg-greenish-gray overflow-hidden flex items-end min-h-175"
    >
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
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex flex-col justify-center items-center gap-3">
            <div className="text-center justify-start text-neutral-800 text-lg font-normal font-['Bembo_Std'] uppercase leading-6">The Collections Of</div>
            <div className="inline-flex justify-center items-center gap-1.5">
              <div className="justify-start text-neutral-600 text-5xl sm:text-6xl font-normal font-['Bembo_Std'] leading-[56px]">Loose</div>
              <div className="justify-start text-neutral-600 text-5xl sm:text-6xl font-normal font-['Snell_Roundhand_LT_Std'] leading-[56px]">Tea</div>
            </div>
          </div>
        </div>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6 md:gap-8 lg:gap-6"
          style={{
            clipPath: "ellipse(110% 100% at 50% 50%)",
          }}
        >
          {subcategories.slice(0, 8).map((subCategory, index) => {
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
                key={subCategory.id}
                href={`/products?category=${encodeURIComponent(subCategory.name)}`}
                className={`flex flex-col items-center group cursor-pointer ${marginTopClasses[index % marginTopClasses.length]}`}
              >
                <div
                  className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-24 lg:h-24 xl:w-28 xl:h-28 mb-3 md:mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    clipPath: "circle(50% at 50% 50%)",
                  }}
                >
                  <Image
                    src={subCategory.imageUrl || NO_IMAGE}
                    alt={subCategory.name}
                    fill
                    sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 112px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="font-['Gotham'] text-xl text-neutral-800 text-center group-hover:text-[#b4a676] transition-colors line-clamp-2 max-w-[120px] px-1 leading-6" style={{ fontWeight: 'normal' }}>
                  {subCategory.name}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="flex justify-center mt-6 md:mt-12">
          <Link
            href="/products?category=Loose%20Tea"
            className="bg-transparent text-stone-700 hover:bg-stone-600 hover:text-white border border-stone-500 font-gotham text-xs sm:text-sm uppercase tracking-wider px-8 py-3 rounded-[100px] transition-all duration-300"
          >
            SHOW ALL
          </Link>
        </div>
      </div>
    </section>
  );
}

