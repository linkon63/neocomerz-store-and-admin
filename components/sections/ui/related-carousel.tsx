'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';
import ProductCard from './product-card';
import { fetchShopProducts, ShopProduct } from '@/lib/shop-api';

import 'swiper/css';
import 'swiper/css/navigation';

export default function RelatedCarousel() {
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(2);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetchShopProducts({ limit: 12 });
        // Reverse or shift elements to show different products in Popular section if needed
        // Here we just use the fetched products
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch most popular products', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="w-full bg-[#F9F9FB] py-16 sm:py-24 border-t border-stone-100 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center mb-8">
            <div className="w-64 h-10 bg-stone-200 animate-pulse rounded"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 bg-stone-200 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  // Duplicate the list of products to ensure Swiper loop mode works without empty space glitches or warnings.
  const displayProducts = [
    ...products,
    ...products.map((product) => ({
      ...product,
      id: product.id + '-dup',
    })),
  ];

  return (
    <section className="w-full bg-[#F9F9FB] py-16 sm:py-24 border-t border-stone-100 overflow-hidden">
      {/* Centered Header with Navigation Controls */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16">
            <button
              className="related-prev flex items-center gap-2 text-stone-850 hover:text-brand-3 transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer select-none"
              aria-label="Previous products"
            >
              <span className="text-brand-3 text-base font-normal">&lt;</span>
              <span className="font-gotham font-medium text-[11px] tracking-[0.2em] text-stone-850">PREVIOUS</span>
            </button>

            <h2 className="font-bembo text-3xl sm:text-4xl text-brand-3 font-normal tracking-wide">
              Most Popular
            </h2>

            <button
              className="related-next flex items-center gap-2 text-stone-850 hover:text-brand-3 transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer select-none"
              aria-label="Next products"
            >
              <span className="font-gotham font-medium text-[11px] tracking-[0.2em] text-stone-850">NEXT</span>
              <span className="text-brand-3 text-base font-normal">&gt;</span>
            </button>
          </div>

          {/* Custom 3-Dot Pagination (Centered below title) */}
          <div className="flex justify-center items-center gap-2 mt-2 h-4">
            {[0, 1, 2].map((i) => {
              // Map loop index (0-5) to 3 dot segments
              const relativeIndex = activeIndex % 6;
              const isActive = Math.floor(relativeIndex / 2) === i;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (swiperRef) {
                      swiperRef.slideToLoop(i * 2);
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-brand-3 scale-110'
                      : 'bg-stone-300 hover:bg-stone-400'
                  }`}
                  aria-label={`Go to slide group ${i + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Full-width Swiper Carousel Slider (No side padding on desktop or mobile) */}
      <div className="w-full px-0">
        <Swiper
          modules={[Navigation, Autoplay]}
          onSwiper={setSwiperRef}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.realIndex);
          }}
          navigation={{
            prevEl: '.related-prev',
            nextEl: '.related-next',
          }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={24}
          slidesPerView={1.2}
          centeredSlides={true}
          initialSlide={2}
          loop={true}
          breakpoints={{
            480: { slidesPerView: 1.8, spaceBetween: 20 },
            768: { slidesPerView: 2.8, spaceBetween: 24 },
            1024: { slidesPerView: 3.5, spaceBetween: 24 },
            1440: { slidesPerView: 4.2, spaceBetween: 24 },
          }}
          className="related-swiper pb-12 w-full"
        >
          {displayProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard
                id={product.id.replace('-dup', '')}
                name={product.name}
                price={`৳${product.price.toLocaleString()}`}
                originalPrice={product.originalPrice ? `৳${product.originalPrice.toLocaleString()}` : ''}
                image={product.image}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        {/* Discover More Link Centered Below Carousel */}
        <div className="flex justify-center mt-10">
          <Link
            href="/products"
            className="px-12 py-3.5 bg-brand-3 hover:bg-[#A38148] text-white font-gotham text-xs font-semibold uppercase tracking-[0.2em] rounded-full transition-all duration-300 cursor-pointer shadow-sm text-center"
          >
            Discover More
          </Link>
        </div>
      </div>
    </section>
  );
}
