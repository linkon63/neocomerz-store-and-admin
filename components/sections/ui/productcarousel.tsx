'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Grid, Pagination } from 'swiper/modules';
import ProductCard from './product-card';
import type { ExtendedProductCarouselProps } from '@/data/types';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/grid';
import 'swiper/css/pagination';

export default function ProductCarousel({ products, title }: ExtendedProductCarouselProps) {
  return (
    <section className="w-full overflow-hidden">
      {/* Navigation and Title */}
      <div className="container mx-auto px-4 sm:px-6 mb-8 md:mb-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16">
            <button
              className="product-carousel-prev flex items-center gap-2 text-stone-850 hover:text-[#B9975B] transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer select-none"
              aria-label="Previous"
            >
              <span className="text-[#B9975B] text-lg font-normal">&lt;</span>
              <span className="font-gotham font-medium text-[11px] tracking-[0.2em]">PREVIOUS</span>
            </button>

            <h2 className="font-['Bembo_Std'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#B9975B] font-normal text-center">
              {title}
            </h2>

            <button
              className="product-carousel-next flex items-center gap-2 text-stone-850 hover:text-[#B9975B] transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer select-none"
              aria-label="Next"
            >
              <span className="font-gotham font-medium text-[11px] tracking-[0.2em]">NEXT</span>
              <span className="text-[#B9975B] text-lg font-normal">&gt;</span>
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="swiper-pagination-product flex justify-center items-center gap-2 h-4"></div>
        </div>
      </div>

      {/* Full-width Swiper Carousel Slider with Grid */}
      <div className="w-full px-4 sm:px-6">
        <Swiper
          modules={[Grid, Pagination, Navigation, Autoplay]}
          slidesPerView={1}
          grid={{
            rows: 2,
            fill: 'row',
          }}
          spaceBetween={30}
          navigation={{
            prevEl: '.product-carousel-prev',
            nextEl: '.product-carousel-next',
          }}
          pagination={{
            el: '.swiper-pagination-product',
            clickable: true,
            bulletClass: 'inline-block w-2 h-2 bg-gray-300 rounded-full cursor-pointer transition-all duration-300 mx-1',
            bulletActiveClass: '!bg-[#B9975B] scale-110',
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
          className="mySwiper pb-12"
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
