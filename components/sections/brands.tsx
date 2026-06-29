"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const brands = [
  "/images/brands/brands-1.png",
  "/images/brands/brands-2.png",
  "/images/brands/brands-3.png",
  "/images/brands/brands-4.png",
  "/images/brands/brands-5.png",
  "/images/brands/brands-6.png",
];
export default function Brands() {
  return (
    <section className="w-full py-12 px-6 md:px-12 lg:py-16 bg-[#F6F6F6]">
      <div className="mx-auto">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row lg:gap-12 flex-wrap">
          <div className="shrink-0 text-center lg:text-left">
            <h2 className="font-family-bembo text-lg font-medium uppercase tracking-wide text-khaki-gold">
              Trusted Across
            </h2>
            <h3 className="mt-1 font-['Snell_Roundhand_LT_Std'] text-4xl text-black md:text-5xl">
              Refined Establishments
            </h3>
          </div>
          <div className="w-full flex-1 lg:max-w-[60%]">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={30}
              slidesPerView={2}
              loop={true}
              speed={800}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 3,
                  spaceBetween: 40,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 50,
                },
              }}
              className="brands-swiper"
            >
              {brands.map((brand, index) => (
                <SwiperSlide key={index}>
                  <div className="relative h-12 w-full sm:h-14">
                    <Image
                      src={brand}
                      alt={`Brand ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
