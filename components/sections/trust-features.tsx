'use client';

import React from 'react';
import Image from 'next/image';

export default function TrustFeatures() {
  const features = [
    {
      title: 'Sovereign Seal',
      iconUrl: '/images/icons/why-chosse-1.svg',
    },
    {
      title: 'Grand Passage',
      iconUrl: '/images/icons/why-chosse-2.svg',
    },
    {
      title: 'Noble Balance',
      iconUrl: '/images/icons/why-chosse-3.svg',
    },
    {
      title: 'World Assembly',
      iconUrl: '/images/icons/why-chosse-4.svg',
    },
  ];

  return (
    <section className="w-full bg-white pt-20 pb-10 sm:pt-28 sm:pb-12 overflow-hidden flex flex-col justify-center items-center">
      <div className="max-w-6xl mx-auto px-5 w-full flex flex-col justify-start items-center gap-12 sm:gap-16">
        {/* Title */}
        <div className="self-stretch flex flex-col justify-start items-center">
          <div className="text-center justify-start text-stone-400 text-5xl sm:text-6xl font-normal font-['Bembo_Std'] leading-[56px]">
            Why Choose
          </div>
          <div className="text-center justify-start text-neutral-800 text-5xl sm:text-6xl font-normal font-['Snell_Roundhand_LT_Std'] leading-[56px]">
            London Tea Exchange
          </div>
        </div>

        {/* Features Row */}
        <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-14 md:gap-20">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col justify-center items-center gap-3 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 flex items-center justify-center relative">
                <Image
                  src={feature.iconUrl}
                  alt={feature.title}
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <div className="text-center justify-start text-neutral-800 text-sm sm:text-base md:text-lg font-normal font-['Gotham'] leading-6">
                {feature.title}
              </div>
            </div>
          ))}
        </div>

        {/* Center Paragraph */}
        <div className="w-full max-w-[750px] text-center text-zinc-500 text-sm sm:text-base font-normal font-['Bembo_Std'] leading-relaxed px-4">
          When tea becomes part of your hospitality, gifting, or brand experience, every detail matters. Our
          collections are curated to leave a lasting impression—through exceptional quality, refined
          presentation, and uncompromising attention to detail.
        </div>
      </div>
    </section>
  );
}
