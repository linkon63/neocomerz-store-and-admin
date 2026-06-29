"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaWhatsapp } from "react-icons/fa";
import "swiper/css";

const instagramImages = [
  "/images/footer/instagram/instagram-1.png",
  "/images/footer/instagram/instagram-2.png",
  "/images/footer/instagram/instagram-3.png",
  "/images/footer/instagram/instagram-4.png",
  "/images/footer/instagram/instagram.png",
   "/images/footer/instagram/instagram-1.png",
  "/images/footer/instagram/instagram-2.png",
  "/images/footer/instagram/instagram-3.png",
  "/images/footer/instagram/instagram-4.png",
  "/images/footer/instagram/instagram.png",
];

export default function Instagram() {
  return (
    <section className="relative w-full bg-[#D9D9D6] pt-16 md:pt-36 pb-5">
      <div className="mx-auto px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="font-['Snell_Roundhand_LT_Std'] text-5xl text-khaki-gold">
            Follow <span className="italic text-olive-slate">us on</span>
          </h2>
          
          {/* Social Icons */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <a href="#" className="text-olive-slate hover:text-neutral-600 transition">
              <FaFacebookF className="text-xl" />
            </a>
            <a href="#" className="text-olive-slate hover:text-neutral-600 transition">
              <FaLinkedinIn className="text-xl" />
            </a>
            <a href="#" className="text-olive-slate hover:text-neutral-600 transition">
              <FaInstagram className="text-xl" />
            </a>
            <a href="#" className="text-olive-slate hover:text-neutral-600 transition">
              <FaWhatsapp className="text-xl" />
            </a>
          </div>
        </div>

        {/* Swiper Slider */}
        <Swiper
          modules={[Autoplay]}
          spaceBetween={8}
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
              spaceBetween: 10,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 12,
            },
          }}
          className="instagram-swiper"
        >
          {instagramImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={image}
                  alt={`Instagram post ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
