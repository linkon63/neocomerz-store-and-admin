"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useHeroCampaigns } from "./use-hero-campaigns";

export default function HeroSlider() {
  const { slides, loading } = useHeroCampaigns();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (loading) {
    return (
      <section className="w-full">
        <div className="h-[58vh] min-h-[460px] animate-pulse bg-neutral-100 sm:h-[74vh]" />
      </section>
    );
  }

  if (slides.length === 0) return null;

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
            className={`object-cover object-center transition-opacity duration-700 ${
              activeSlide === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 px-6 pb-12 text-white sm:px-12 sm:pb-16">
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
              className={`h-2.5 rounded-full transition-all ${
                activeSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/55"
              }`}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
