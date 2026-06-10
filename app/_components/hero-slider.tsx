"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1800&q=85",
    title: "Vintage football stories",
    copy: "Archive jerseys, warm-up jackets, and one-off pieces selected for everyday wear.",
  },
  {
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85",
    title: "Curated streetwear",
    copy: "Statement layers, classic silhouettes, and fresh arrivals from the Humana archive.",
  },
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=85",
    title: "Football corner",
    copy: "Find club colors, training tops, and retro match-day essentials.",
  },
];

export default function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="w-full">
      <div className="relative h-[58vh] min-h-[460px] overflow-hidden sm:h-[74vh]">
        {slides.map((slide, index) => (
          <Image
            key={slide.image}
            src={slide.image}
            alt={slide.title}
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover object-center transition-opacity duration-700 ${activeSlide === index ? "opacity-100" : "opacity-0"
              }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 pb-12 text-white sm:pb-16 max-w-434 px-4 md:px-6 mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.18em]">Humana Vintage</p>
          <h1 className="mt-4 max-w-3xl font-bembo text-5xl font-bold leading-none sm:text-7xl">
            {slides[activeSlide].title}
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-7 sm:text-lg">
            {slides[activeSlide].copy}
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-black transition hover:bg-black hover:text-white"
          >
            Shop Now
          </Link>
        </div>

        <div className="absolute bottom-5 right-6 flex gap-2 sm:right-12">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={`h-2.5 rounded-full transition-all ${activeSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/55"
                }`}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
