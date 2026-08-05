'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import data from "@/data/top-header.json";
import 'swiper/css';
import 'swiper/css/navigation';

export default function TopSlider({ slogan }: { slogan?: string }) {
  const { slider } = data;

  if (slogan) {
    return (
      <div className="flex items-center gap-1 sm:gap-2 text-white w-full justify-center">
        <div className="flex-grow px-0.5 sm:px-1 text-center">
          <span className="font-gotham text-white text-[10px] sm:text-xs md:text-sm font-normal tracking-wide">
            {slogan}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 text-white w-full justify-center">
      <button 
        className="topslider-prev cursor-pointer hover:opacity-80 transition-opacity shrink-0 hidden sm:flex items-center justify-center text-white px-0.5 sm:px-1"
        aria-label="Previous slide"
      >
        <IoChevronBack className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>

      <div className="flex-grow overflow-hidden px-0.5 sm:px-1">
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
                <span className="font-gotham text-white text-[10px] sm:text-xs md:text-sm font-normal tracking-wide cursor-pointer hover:opacity-95 transition-opacity">
                  {text}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <button 
        className="topslider-next cursor-pointer hover:opacity-80 transition-opacity shrink-0 hidden sm:flex items-center justify-center text-white px-0.5 sm:px-1"
        aria-label="Next slide"
      >
        <IoChevronForward className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
}

