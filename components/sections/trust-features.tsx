'use client';

import React from 'react';

export default function TrustFeatures() {
  const features = [
    {
      title: 'Sovereign Seal',
      icon: (
        <svg className="w-10 h-10 text-stone-800" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
        <svg className="w-10 h-10 text-stone-800" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
        <svg className="w-10 h-10 text-stone-800" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
        <svg className="w-10 h-10 text-stone-800" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
    <section className="w-full bg-white py-16 sm:py-24 md:py-32">
      <div className="container mx-auto px-6 sm:px-12 max-w-7xl">
        {/* Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-['Bembo_Std'] text-3xl sm:text-4xl text-[#A38148] font-normal tracking-wide">
            Why Choose
          </h2>
          <h3 className="font-['Snell_Roundhand_LT_Std'] italic text-3xl sm:text-5xl text-[#1C1C1C] mt-2">
            London Tea Exchange
          </h3>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16 text-center">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-stone-50 hover:bg-stone-100 transition-colors duration-300">
                {feature.icon}
              </div>
              <h4 className="font-['Bembo_Std'] text-stone-850 font-medium text-sm sm:text-base tracking-widest uppercase">
                {feature.title}
              </h4>
            </div>
          ))}
        </div>

        {/* Center Paragraph */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-24">
          <p className="font-gotham text-stone-500 text-xs sm:text-sm leading-relaxed tracking-wider">
            When tea becomes part of your hospitality, gifting, or brand experience, every detail matters. Our
            collections are curated to leave a lasting impression—through exceptional quality, refined
            presentation, and uncompromising attention to detail.
          </p>
        </div>

        {/* Partner Logos */}
        <div className="border-t border-stone-100 pt-12 sm:pt-16">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16 opacity-65 grayscale hover:grayscale-0 transition-all duration-500">
            {/* FreshBox */}
            <div className="flex items-center gap-2">
              <span className="bg-[#E32938] text-white p-1 text-[10px] font-bold rounded">FB</span>
              <span className="font-sans font-black text-lg text-[#E32938] tracking-tight">FreshBox</span>
            </div>

            {/* Truck Lagbe */}
            <div className="flex items-center gap-1.5">
              <div className="bg-[#464E5F] text-white p-1 rounded">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2-6.5h-3V9h3v3z"/></svg>
              </div>
              <span className="font-sans font-bold text-base text-[#464E5F] tracking-tight">Truck Lagbe</span>
            </div>

            {/* Uber */}
            <div className="font-sans font-black text-2xl tracking-tighter text-black">
              Uber
            </div>

            {/* Happy Fresh Hub */}
            <div className="flex items-center gap-1">
              <span className="font-sans font-bold text-lg text-[#55B32A]">happy</span>
              <span className="bg-[#55B32A] text-white px-2 py-0.5 rounded-full text-xs font-bold font-sans">fresh hub</span>
            </div>

            {/* Walt Disney World */}
            <div className="flex flex-col items-center">
              <span className="font-serif italic text-base text-stone-800 leading-none">Walt Disney</span>
              <span className="font-sans text-[8px] uppercase tracking-[0.3em] text-stone-500 font-bold">World</span>
            </div>

            {/* Tip Top */}
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-yellow-400">
                TT
              </div>
              <span className="font-sans font-extrabold text-base tracking-widest text-red-600 italic">TIP TOP</span>
            </div>
          </div>

          <p className="text-center font-['Snell_Roundhand_LT_Std'] italic text-xl sm:text-2xl text-[#A38148] mt-8">
            Trusted Across Refined Establishments
          </p>
        </div>
      </div>
    </section>
  );
}
