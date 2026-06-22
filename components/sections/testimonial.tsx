"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Testimonial() {
  const testimonials = [
    {
      id: 1,
      text: "Explore the latest additions to our curated selection of exquisite handmade jewelry pieces. Discover our finest collection of handcrafted jewelry, designed with elegance and precision for the modern woman.",
    },
    {
      id: 2,
      text: "Experience the finest quality teas from around the world. Our collection brings you premium selections crafted with care and attention to detail.",
    },
    {
      id: 3,
      text: "Discover the art of tea making with our exclusive range. Each blend is carefully selected to provide an unforgettable taste experience.",
    },
  ];

  return (
    <section className="relative bg-[#473729] py-16 lg:py-24 overflow-hidden">
      {/* Pattern Background Layer with blend mode */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
        }}
      ></div>

      <div className="relative z-10 container mx-auto px-4">
        <div
          className="relative mx-auto w-full max-w-312.5 bg-[#D9D9D9]"
          style={{
            clipPath:
              "polygon(16% 0%, 84% 0%, 100% 50%, 84% 100%, 16% 100%, 0% 50%)",
          }}
        >
          <div className="px-6 py-14 md:p-12 lg:p-24">
            <h2 className="text-center text-3xl md:text-6xl font-['Bembo_Std'] font-normal">
              Our Community
              <span className="font-['Snell_Roundhand_LT_Std'] italic">
                {" "}
                is{" "}
              </span>
              <span className="font-['Snell_Roundhand_LT_Std'] italic">
                Saying
              </span>
            </h2>
            <div className="testimonial-pagination flex justify-center gap-2 mt-5 mb-8"></div>
            <button className="testimonial-prev absolute left-[8%] top-1/2 -translate-y-1/2 z-20 hidden md:flex cursor-pointer">
              <HiOutlineChevronLeft className="text-5xl text-[#1F1B19]" />
            </button>
            <button className="testimonial-next absolute right-[8%] top-1/2 -translate-y-1/2 z-20 hidden md:flex cursor-pointer">
              <HiOutlineChevronRight className="text-5xl text-[#1F1B19]" />
            </button>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation={{
                prevEl: ".testimonial-prev",
                nextEl: ".testimonial-next",
              }}
              pagination={{
                clickable: true,
                el: ".testimonial-pagination",
                bulletClass:
                  "inline-block w-1.5 h-1.5 bg-black rounded-full cursor-pointer transition-all duration-300 mx-1",
                bulletActiveClass: "!bg-black !w-2 !h-2",
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              speed={800}
              loop
              className="max-w-4xl mx-auto"
            >
              {testimonials.map((item) => (
                <SwiperSlide key={item.id}>
                  <div className="text-center px-4 md:px-10">
                    <p className="font-['Bembo_Std'] text-xl md:text-4xl leading-[1.3]">
                      &quot;{item.text}&quot;
                    </p>
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
