"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchShopProducts, ShopProduct } from "@/lib/shop-api";

const NO_IMAGE = '/images/no-image-icon-6.png';

export default function LooseTea() {
  const [products, setProducts] = useState<ShopProduct[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetchShopProducts({ limit: 8 });
        if (res && res.data) {
          setProducts(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch products for Loose Tea:", error);
      }
    }
    loadProducts();
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
          <p className="font-['Bembo_Std'] text-xs sm:text-lg uppercase tracking-wider text-gray-600 mb-2">
            THE COLLECTIONS OF
          </p>
          <h2 className="inline-flex flex-row justify-center items-baseline gap-2 md:gap-3 font-normal text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="font-['Bembo_Std'] text-[#C6B485] leading-none">Loose</span>
            <span className="font-['Snell_Roundhand_LT_Std'] italic text-[#8E866B] leading-none lowercase">Tea</span>
          </h2>
        </div>
        <div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6 md:gap-8 lg:gap-6"
          style={{
            clipPath: "ellipse(110% 100% at 50% 50%)",
          }}
        >
          {products.slice(0, 8).map((product, index) => {
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
                key={product.id}
                href={`/products/${product.id}`}
                className={`flex flex-col items-center group cursor-pointer ${marginTopClasses[index % marginTopClasses.length]}`}
              >
                <div
                  className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-24 lg:h-24 xl:w-28 xl:h-28 mb-3 md:mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    clipPath: "circle(50% at 50% 50%)",
                  }}
                >
                  <Image
                    src={product.image || NO_IMAGE}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 112px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="font-gotham text-xs sm:text-sm text-stone-gray text-center group-hover:text-brand-3 transition-colors line-clamp-2 max-w-[120px] px-1">
                  {product.name}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="flex justify-center mt-6 md:mt-12">
          <Link
            href="/products"
            className="bg-transparent text-stone-700 hover:bg-stone-600 hover:text-white border border-stone-500 font-gotham text-xs sm:text-sm uppercase tracking-wider px-8 py-3 rounded-[100px] transition-all duration-300"
          >
            SHOW ALL
          </Link>
        </div>
      </div>
    </section>
  );
}

