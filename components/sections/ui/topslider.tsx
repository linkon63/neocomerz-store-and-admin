'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import data from "@/data/top-header.json";
import 'swiper/css';
import 'swiper/css/navigation';

export default function TopSlider() {
  const { slider } = data;

  return (
    <div className="flex items-center gap-2 text-brand-primary w-full justify-center">
      {/* Previous Button */}
      <button 
        className="topslider-prev cursor-pointer hover:opacity-80 transition-opacity shrink-0 flex items-center justify-center text-brand-primary px-1"
        aria-label="Previous slide"
      >
        <span className="font-gotham text-[11px] sm:text-xs md:text-sm font-bold">&lt;</span>
      </button>

      {/* Swiper Slider */}
      <div className="flex-grow overflow-hidden max-w-lg sm:max-w-xl px-1">
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{
            prevEl: '.topslider-prev',
            nextEl: '.topslider-next',
          }}
          autoplay={{
            delay: slider.autoplayDelay,
            disableOnInteraction: false,
          }}
          loop={true}
          speed={slider.speed}
          className="topslider-swiper"
        >
          {slider.slides.map((text: string, index: number) => (
            <SwiperSlide key={index}>
              <div className="text-center">
                <span className="font-gotham text-brand-primary text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide underline cursor-pointer hover:opacity-95 transition-opacity whitespace-nowrap">
                  {text}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Next Button */}
      <button 
        className="topslider-next cursor-pointer hover:opacity-80 transition-opacity shrink-0 flex items-center justify-center text-brand-primary px-1"
        aria-label="Next slide"
      >
        <span className="font-gotham text-[11px] sm:text-xs md:text-sm font-bold">&gt;</span>
      </button>
    </div>
  );
}

