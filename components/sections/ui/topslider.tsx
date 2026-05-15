'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import data from "@/data/top-header.json";
import 'swiper/css';
import 'swiper/css/navigation';

export default function TopSlider() {
  const { slider } = data;

  return (
    <div className="flex items-center gap-1 text-xs sm:text-sm text-white w-full">
      {/* Previous Button */}
      <button 
        className="topslider-prev cursor-pointer hover:opacity-80 transition-opacity shrink-0 hidden xl:block"
        aria-label="Previous slide"
      >
        <IoIosArrowBack className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
      </button>

      {/* Swiper Slider */}
      <div className="flex-1 overflow-hidden px-0.5 sm:px-1">
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
                <span className="font-gotham text-white text-xs sm:text-sm underline">
                  {text}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Next Button */}
      <button 
        className="topslider-next cursor-pointer hover:opacity-80 transition-opacity shrink-0 hidden xl:block"
        aria-label="Next slide"
      >
        <IoIosArrowForward className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
      </button>
    </div>
  );
}
