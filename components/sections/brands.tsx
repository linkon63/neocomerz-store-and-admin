"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { fetchShopBrands } from "@/lib/shop-api";
import { resolveImageUrl } from "@/lib/admin-api";
import "swiper/css";

const fallbackBrands = [
  "/images/brands/brands-1.png",
  "/images/brands/brands-2.png",
  "/images/brands/brands-3.png",
  "/images/brands/brands-4.png",
  "/images/brands/brands-5.png",
  "/images/brands/brands-6.png",
];

export default function Brands({
  bgClassName = "bg-[#F6F6F6]",
  variant = "horizontal",
}: {
  bgClassName?: string;
  variant?: "horizontal" | "vertical";
}) {
  const [brandList, setBrandList] = useState<any[]>([]);

  useEffect(() => {
    async function loadBrands() {
      try {
        const fetched = await fetchShopBrands();
        if (fetched && fetched.length > 0) {
          const hasLogos = fetched.some((b) => b.logoUrl);
          if (hasLogos) {
            setBrandList(
              fetched.map((b) => ({
                name: b.name,
                logo: b.logoUrl ? resolveImageUrl(b.logoUrl) : null,
              }))
            );
          } else {
            setBrandList(
              fetched.map((b, i) => ({
                name: b.name,
                logo: fallbackBrands[i % fallbackBrands.length],
              }))
            );
          }
        } else {
          setBrandList(fallbackBrands.map((b, i) => ({ name: `Brand ${i + 1}`, logo: b })));
        }
      } catch (error) {
        console.error("Failed to load brands:", error);
        setBrandList(fallbackBrands.map((b, i) => ({ name: `Brand ${i + 1}`, logo: b })));
      }
    }
    loadBrands();
  }, []);

  if (variant === "vertical") {
    // Duplicate the logos to support smooth infinite marquee loop
    const marqueeBrands = [...brandList, ...brandList, ...brandList, ...brandList];

    return (
      <section className="w-full py-16 bg-white flex flex-col justify-center items-center overflow-hidden">
        <div className="w-full flex flex-col items-center gap-10">
          {/* Infinite Marquee Logo Row */}
          <div className="w-full overflow-hidden relative">
            <div className="flex gap-8 w-max animate-marquee py-2">
              {marqueeBrands.map((brand, index) => (
                <div key={index} className="relative h-14 w-40 flex-shrink-0 flex items-center justify-center">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <span className="font-['Bembo_Std'] text-stone-700 uppercase tracking-widest text-xs font-semibold text-center">
                      {brand.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Centered Heading */}
          <div className="flex justify-center items-start gap-1.5 flex-wrap mt-4">
            <div className="text-stone-400 text-lg font-normal font-['Bembo_Std'] leading-6">
              Trusted Across
            </div>
            <div className="text-neutral-600 text-lg font-bold font-['Snell_Roundhand_LT_Std'] leading-6">
              Refined Establishments
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`w-full py-12 px-6 md:px-12 lg:py-16 ${bgClassName}`}>
      <div className="mx-auto">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row lg:gap-12 flex-wrap">
          <div className="shrink-0 text-center lg:text-left">
            <h2 className="font-['Bembo_Std'] text-lg font-medium uppercase tracking-wide text-khaki-gold">
              Trusted Across
            </h2>
            <h3 className="mt-1 font-['Snell_Roundhand_LT_Std'] text-4xl text-black md:text-5xl">
              Refined Establishments
            </h3>
          </div>
          <div className="w-full flex-1 lg:max-w-[60%]">
            {brandList.length > 0 && (
              <Swiper
                modules={[Autoplay]}
                spaceBetween={20}
                slidesPerView={2}
                loop={brandList.length >= 2}
                speed={800}
                autoplay={{
                  delay: 2000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                breakpoints={{
                  640: {
                    slidesPerView: Math.min(brandList.length, 3),
                    spaceBetween: 28,
                  },
                  1024: {
                    slidesPerView: Math.min(brandList.length, 4),
                    spaceBetween: 36,
                  },
                }}
                className="brands-swiper"
              >
                {brandList.map((brand, index) => (
                  <SwiperSlide key={brand.id || index}>
                    <div className="relative h-18 w-full sm:h-24 flex items-center justify-center">
                      {brand.logo ? (
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <span className="font-['Bembo_Std'] text-stone-700 uppercase tracking-widest text-xs font-semibold text-center">
                          {brand.name}
                        </span>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

