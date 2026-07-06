'use client';

import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Grid } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from './product-card';
import type { ExtendedProductCarouselProps } from '@/data/types';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/grid';

export default function ProductCarousel({ products, title }: ExtendedProductCarouselProps) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const prevElClass = `prev-${slug}`;
  const nextElClass = `next-${slug}`;

  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const handleSlideChange = (swiper: SwiperType) => {
    const progress = swiper.progress;
    if (isNaN(progress) || progress <= 0.2) {
      setActiveIndex(0);
    } else if (progress > 0.2 && progress < 0.8) {
      setActiveIndex(1);
    } else {
      setActiveIndex(2);
    }
  };

  const handleDotClick = (dotIndex: number) => {
    if (!swiperInstance) return;
    const total = products.length;
    if (total <= 1) return;

    let targetIndex = 0;
    if (dotIndex === 1) {
      targetIndex = Math.floor(total / 2);
    } else if (dotIndex === 2) {
      targetIndex = total - 1;
    }

    swiperInstance.slideTo(targetIndex);
  };

  return (
    <section className="w-full overflow-hidden">
      {/* Navigation and Title */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 mb-8 md:mb-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16">
            <button
              className={`${prevElClass} flex items-center gap-2 text-stone-850 hover:text-[#B9975B] transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer select-none`}
              aria-label="Previous"
            >
              <FiChevronLeft className="text-dark-charcoal text-lg sm:text-xl" />
              <span className="font-gotham text-dark-charcoal font-medium text-[11px] tracking-[0.2em] uppercase">PREVIOUS</span>
            </button>

            {(() => {
              const parts = title.trim().split(/\s+/);
              if (parts.length === 2) {
                const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
                return (
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-center">
                    <span className="font-['Bembo_Std'] text-khaki-gold">{capitalize(parts[0])} </span>
                    <span className="font-['Snell_Roundhand_LT_Std'] italic text-stone-gray ml-1.5">{capitalize(parts[1])}</span>
                  </h2>
                );
              }
              return (
                <h2 className="font-['Bembo_Std'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-khaki-gold font-normal text-center">
                  {title}
                </h2>
              );
            })()}

            <button
              className={`${nextElClass} flex items-center gap-2 text-stone-850 hover:text-[#B9975B] transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer select-none`}
              aria-label="Next"
            >
              <span className="font-gotham text-dark-charcoal uppercase font-medium text-[11px] tracking-[0.2em]">NEXT</span>
              <FiChevronRight className="text-dark-charcoal text-lg sm:text-xl" />
            </button>
          </div>

          {/* Custom pagination dots - always exactly 3 dots */}
          <div className="flex justify-center items-center gap-3 mt-2 min-h-6">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === i
                    ? 'bg-[#B9975B] scale-110'
                    : 'bg-[#e2e2e2] hover:bg-[#c5a86a]'
                }`}
                aria-label={`Go to slide page ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Swiper Carousel Slider restricted to 1440px max width */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6">
        <Swiper
          modules={[Grid, Navigation, Autoplay]}
          slidesPerView={1}
          grid={{
            rows: 2,
            fill: 'row',
          }}
          spaceBetween={30}
          navigation={{
            prevEl: `.${prevElClass}`,
            nextEl: `.${nextElClass}`,
          }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            640: { 
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: { 
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          onSwiper={setSwiperInstance}
          onSlideChange={handleSlideChange}
          onInit={handleSlideChange}
          className="mySwiper w-full"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard
                id={product.id}
                name={product.name}
                price={`৳${product.price.toLocaleString()}`}
                originalPrice={`৳${(product.originalPrice || product.price).toLocaleString()}`}
                image={product.image}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
