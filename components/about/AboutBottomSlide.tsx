"use client";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import Image from 'next/image';

const supplyChainData = [
    { title: "Selection", image: "/images/about/img1.webp" },
    { title: "Sale", image: "/images/about/img2.webp" },
    { title: "Projects", image: "/images/about/img3.webp" },
    { title: "img1ollection", image: "/images/about/img4.webp" },
    { title: "img1ollection", image: "/images/about/img1.webp" },
    { title: "Selection", image: "/images/about/img1.webp" },
    { title: "Sale", image: "/images/about/img2.webp" },
    { title: "Projects", image: "/images/about/img3.webp" },
    { title: "img1ollection", image: "/images/about/img4.webp" },
    { title: "img1ollection", image: "/images/about/img1.webp" },
];

export default function AboutBottomSlide() {
    return (
        <section className="py-20 px-6 max-w-7xl mx-auto text-center">
            <h4 className="text-sm uppercase tracking-widest text-gray-500 mb-4">Human People to People</h4>
            <h2 className="text-4xl font-serif font-bold mb-6">Our supply chain</h2>
            <p className="max-w-2xl mx-auto text-gray-600 mb-12">
                By giving used clothing a new life, we care for the environment and people. 
                Thanks to an efficient circular economy model, we generate value to fund our social projects.
            </p>

            <Swiper
                modules={[Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 4 },
                }}
            >
                {supplyChainData.map((item, index) => (
                    <SwiperSlide key={index}>
                        <div className="flex flex-col items-center">
                            <div className="relative w-full h-[300px] mb-4">
                                <Image 
                                    src={item.image} 
                                    alt={item.title} 
                                    fill 
                                    className="object-cover rounded-lg"
                                />
                            </div>
                            <h3 className="text-2xl font-serif font-bold">{item.title}</h3>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}