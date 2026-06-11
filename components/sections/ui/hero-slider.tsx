'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { useRef, useEffect } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import { HeroSliderProps } from '@/data/types';
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
            <div className="absolute bg-black/50 z-10"></div>
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center px-4 sm:px-6 z-20 w-full max-w-7xl">
                <h1 className="font-family-bembo text-white text-3xl md:text-5xl text-center mb-4 truncate w-full">
                  {slide.title}
                </h1>
                <p className="font-family-bembo text-white text-xs md:text-lg text-center truncate w-full">
                  {slide.subtitle}
                </p>
              </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
