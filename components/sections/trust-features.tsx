'use client';

import React from 'react';

export default function TrustFeatures() {
  const features = [
    {
      title: 'Sovereign Seal',
      icon: (
        <svg className="w-12 h-12 text-[#1C1C1C]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {/* Sovereign Seal (Crown + Crest) */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l3-5 6 3 6-3 3 5-1.5 8.5a3 3 0 01-3 2.5H7.5a3 3 0 01-3-2.5L3 10z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M9 13.5h6" />
          <circle cx="12" cy="4" r="1" fill="currentColor" />
          <circle cx="6" cy="5" r="0.75" fill="currentColor" />
          <circle cx="18" cy="5" r="0.75" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: 'Grand Passage',
      icon: (
        <svg className="w-12 h-12 text-[#1C1C1C]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {/* Grand Passage (Classic Ship) */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 17h20s-2 4-10 4S2 17 2 17z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v13M7 6v8M17 6v8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4c-3 0-5 3-5 5h5V4zM12 9c-3 0-5 3-5 5h5V9zM17 6c-2 0-3 2-3 4h3V6z" />
        </svg>
      ),
    },
    {
      title: 'Noble Balance',
      icon: (
        <svg className="w-12 h-12 text-[#1C1C1C]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {/* Noble Balance (Scale) */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17M12 20h4M12 20H8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14" />
          {/* Left Pan */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 7l-2 6h4l-2-6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13v2a2 2 0 002 2" />
          {/* Right Pan */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-2 6h4l-2-6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 13v2a2 2 0 01-2 2" />
        </svg>
      ),
    },
    {
      title: 'World Assembly',
      icon: (
        <svg className="w-12 h-12 text-[#1C1C1C]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {/* World Assembly (Compass Rose) */}
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
          <path d="M12 7l2 5-2 5-2-5 2-5z" fill="currentColor" fillOpacity="0.2" />
          <path d="M7 12l5-2 5 2-5 2-5-2z" fill="currentColor" fillOpacity="0.2" />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-white py-20 sm:py-36 overflow-hidden flex flex-col justify-center items-center">
      <div className="max-w-6xl mx-auto px-5 w-full flex flex-col justify-start items-center gap-12">
        {/* Title */}
        <div className="self-stretch flex flex-col justify-start items-center">
          <div className="text-center text-stone-400 text-5xl sm:text-6xl font-normal font-['Bembo_Std'] leading-[56px]">Why Choose</div>
          <div className="text-center text-[#1C1C1C] text-5xl sm:text-6xl font-normal font-['Snell_Roundhand_LT_Std'] italic lowercase leading-[56px] -mt-1">London Tea Exchange</div>
        </div>

        {/* Features Row */}
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 md:gap-16">
          {features.map((feature, i) => (
            <div key={i} className="inline-flex flex-col justify-center items-center gap-3 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 flex items-center justify-center text-[#1C1C1C]">
                {feature.icon}
              </div>
              <div className="text-center text-[#1C1C1C] text-lg sm:text-xl font-normal font-['Gotham'] leading-6">
                {feature.title}
              </div>
            </div>
          ))}
        </div>

        {/* Center Paragraph */}
        <div className="w-full max-w-[700px] text-center text-zinc-600 text-lg font-normal font-['Bembo_Std'] leading-6 px-4">
          When tea becomes part of your hospitality, gifting, or brand experience, every detail matters. Our collections are curated to leave a lasting impression—through exceptional quality, refined presentation, and uncompromising attention to detail.
        </div>
      </div>
    </section>
  );
}
