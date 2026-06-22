'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { useRef, useEffect } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/pagination';
import { HeroSliderProps } from '@/data/types';
import Button from './button';
export default function HeroSlider({ slides }: HeroSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      const data = JSON.parse(event.data);
      if (data.event === 'onStateChange' && data.info === 0) {
        if (swiperRef.current) {
          swiperRef.current.slideNext();
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  return (
    <Swiper
      modules={[Pagination]}
      spaceBetween={0}
      slidesPerView={1}
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
      pagination={{
        clickable: true,
        bulletClass: 'inline-block w-4 h-4 bg-white rounded-full mx-1.5 transition-all duration-300 cursor-pointer border-2 border-brand-primary p-3',
        bulletActiveClass: '!bg-brand-3 !w-12',
      }}
      loop={true}
      className="w-full [&_.swiper-pagination]:bottom-8!"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          <div className="relative w-full h-125 md:h-150 lg:h-175">
            {/* YouTube Video Background */}
            <div className="absolute inset-0 overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${slide.videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
                className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                allow="autoplay; encrypted-media"
                title={`Hero video ${index + 1}`}
              />
            </div>
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4">
              {/* Content */}
              <h1 className="font-['Snell_Roundhand_LT_Std'] italic text-white text-4xl md:text-6xl lg:text-7xl text-center mb-4 font-normal leading-tight">
                {slide.title}
              </h1>
              <p className="font-['Bembo_Std'] text-white text-xs md:text-sm lg:text-base text-center mb-8 tracking-wider uppercase max-w-2xl">
                {slide.subtitle}
              </p>
               {/* Icon */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-6">
                <Image
                  src="/images/icons/icon-3.svg"
                  alt="Hero Icon"
                  fill
                  className="object-contain"
                />
              </div>
              {/* Shop Now Button */}
              <Button 
                href="/products" 
                label="SHOP NOW"
                variant="primary"
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
