'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';
import ProductCard from './product-card';

import 'swiper/css';
import 'swiper/css/navigation';

interface RelatedProduct {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
}

const relatedProducts: RelatedProduct[] = [
  {
    id: '1',
    name: 'Tea Book Vol. 2 Royal Collection',
    price: '৳4,950',
    originalPrice: '৳5,000',
    image: '/images/products/product-6.webp',
  },
  {
    id: '2',
    name: 'Assorted Classic Collection',
    price: '৳2,900',
    originalPrice: '৳3,000',
    image: '/images/products/product-3.webp',
  },
  {
    id: '3',
    name: 'Tea Book Vol. 2 Royal Collection',
    price: '৳4,950',
    originalPrice: '৳5,000',
    image: '/images/products/product-1.webp',
  },
  {
    id: '4',
    name: 'Tea Book Vol. 2 Royal Collection',
    price: '৳4,950',
    originalPrice: '৳5,000',
    image: '/images/products/product-2.webp',
  },
  {
    id: '5',
    name: 'Assorted Wild Orchard Collection',
    price: '৳2,900',
    originalPrice: '৳3,000',
    image: '/images/products/gallery-2.webp',
  },
  {
    id: '6',
    name: 'Tea Book Collection',
    price: '৳34,650',
    originalPrice: '৳35,000',
    image: '/images/products/product-4.webp',
  },
];

// Duplicate the list of products to ensure Swiper loop mode works without empty space glitches or warnings.
const displayProducts = [
  ...relatedProducts,
  ...relatedProducts.map((product) => ({
    ...product,
    id: product.id + '-dup',
  })),
];

export default function RelatedCarousel() {
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(2);

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
                price={product.price}
                originalPrice={product.originalPrice}
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
