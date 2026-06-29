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

      try {
        const data = JSON.parse(event.data);

        if (data.event === 'onStateChange' && data.info === 0) {
          swiperRef.current?.slideNext();
        }
      } catch (error) {
        // Ignore invalid message
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <Swiper
      modules={[Pagination]}
      slidesPerView={1}
      spaceBetween={0}
      loop={true}
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
      pagination={{
        clickable: true,
        bulletClass: 'hero-bullet',
        bulletActiveClass: 'hero-bullet-active',
      }}
      className="hero-slider"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          <div className="relative h-[500px] md:h-[650px] lg:h-[750px]">

            {/* Video */}
            <div className="absolute inset-0 overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${slide.videoId}?autoplay=1&mute=1&controls=0&rel=0&playsinline=1&enablejsapi=1`}
                className="absolute left-1/2 top-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                allow="autoplay; encrypted-media"
                title={slide.title}
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 z-10" />

            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-end px-4 py-12 md:py-24">

              <h1 className="text-center text-white leading-tight mb-4">
                <span className="font-['Bembo_Std'] text-5xl md:text-7xl lg:text-8xl">
                  {slide.title}{' '}
                </span>

                <span className="font-['Snell_Roundhand_LT_Std'] italic text-5xl md:text-7xl lg:text-8xl">
                  {slide.titleItalic}
                </span>
              </h1>

              <p className="font-['Bembo_Std'] text-center text-white uppercase leading-6 text-lg">
                {slide.subtitle}
              </p>

              <div className="relative w-24 h-24">
                <Image
                  src="/images/icons/icon-4.svg"
                  alt="Decorative Icon"
                  fill
                  className="object-contain"
                />
              </div>

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