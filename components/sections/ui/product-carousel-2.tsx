"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import type { ExtendedProductCarouselProps } from "@/data/types";
import CarouselHeader from "./carousel-header";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function NewProductCarousel({ products, title }: ExtendedProductCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const handlePrevious = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <>
      <CarouselHeader title={title} onPrevious={handlePrevious} onNext={handleNext} />
      <div className="flex justify-center items-center gap-2 mb-8">
        <div className="swiper-pagination-custom flex justify-center"></div>
      </div>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={32}
        slidesPerView={1}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        pagination={{
          el: ".swiper-pagination-custom",
          clickable: true,
          bulletClass: "inline-block w-2 h-2 bg-gray-300 rounded-full mx-1 transition-all duration-300 cursor-pointer",
          bulletActiveClass: "!bg-brand-3 !w-8",
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 24,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 32,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 32,
          },
        }}
        className="w-full mb-8"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="group relative bg-white overflow-hidden">
              <Link href={`/products/${product.id}`} className="block relative aspect-square bg-white mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-brand-3 text-white text-xs font-gotham px-3 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
              </Link>
              <div className="text-left p-8">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-gotham text-text-primary text-base sm:text-lg hover:text-brand-3 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-gotham text-text-primary text-lg sm:text-xl font-medium">
                      ৳{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="font-gotham text-gray-400 text-sm line-through">
                        ৳{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2 hover:bg-brand-3 rounded-full transition-colors cursor-pointer"
                      aria-label="Add to wishlist"
                    >
                      {wishlist.includes(product.id) ? (
                        <IoHeart className="w-8 h-8 text-brand-primary" />
                      ) : (
                        <IoHeartOutline className="w-8 h-8 text-stone-600 hover:text-brand-primary" />
                      )}
                    </button>                    
                    <button
                      className="p-2 rounded-full hover:bg-opacity-90 transition-colors flex items-center justify-center cursor-pointer"
                      aria-label="Add to cart"
                    >
                      <Image
                        src="/images/products/cart.svg"
                        alt="Add to cart"
                        width={48}
                        height={48}
                        className="w-12 h-12"
                      />
                    </button>
                  </div>
                </div>
                <p className="font-gotham text-gray-500 text-xs">VAT Included</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
