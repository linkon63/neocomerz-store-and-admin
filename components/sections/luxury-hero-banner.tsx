'use client';

import React from 'react';

export default function LuxuryHero() {
  return (
    <section className="relative w-full min-h-[70vh] flex items-center justify-center bg-[#D2C498] py-20 px-6 overflow-hidden">
      {/* Subtle Repeating Luxury Diamond Pattern with Fleur-de-lis */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="luxury-diamond-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
              {/* Diamond Border */}
              <path d="M 60 0 L 120 60 L 60 120 L 0 60 Z" fill="none" stroke="#5F522F" strokeWidth="0.75" />
              {/* Centered Fleur-de-lis */}
              <g transform="translate(48, 48) scale(0.75)" fill="#5F522F">
                <path d="M16 4C16 4 14.5 9 11 11.5C12 12.5 13 14 13.5 16C14 14 15 13 16 13C17 13 18 14 18.5 16C19 14 20 12.5 21 11.5C17.5 9 16 4 16 4Z" />
                <path d="M16 14.5C14.5 14.5 11 15 10 18.5C12 19 13.5 18 14.5 17C15 18.5 15.5 21 16 23.5C16.5 21 17 18.5 17.5 17C18.5 18 20 19 22 18.5C21 15 17.5 14.5 16 14.5Z" />
                <path d="M9 19.5C11 20 13.5 19.5 16 19.5C18.5 19.5 21 20 23 19.5C22.5 18.5 21 18 16 18C11 18 9.5 18.5 9 19.5Z" />
              </g>
              {/* Corner Fleur-de-lis */}
              <g transform="translate(-12, -12) scale(0.75)" fill="#5F522F">
                <path d="M16 4C16 4 14.5 9 11 11.5C12 12.5 13 14 13.5 16C14 14 15 13 16 13C17 13 18 14 18.5 16C19 14 20 12.5 21 11.5C17.5 9 16 4 16 4Z" />
              </g>
              <g transform="translate(108, -12) scale(0.75)" fill="#5F522F">
                <path d="M16 4C16 4 14.5 9 11 11.5C12 12.5 13 14 13.5 16C14 14 15 13 16 13C17 13 18 14 18.5 16C19 14 20 12.5 21 11.5C17.5 9 16 4 16 4Z" />
              </g>
              <g transform="translate(-12, 108) scale(0.75)" fill="#5F522F">
                <path d="M16 4C16 4 14.5 9 11 11.5C12 12.5 13 14 13.5 16C14 14 15 13 16 13C17 13 18 14 18.5 16C19 14 20 12.5 21 11.5C17.5 9 16 4 16 4Z" />
              </g>
              <g transform="translate(108, 108) scale(0.75)" fill="#5F522F">
                <path d="M16 4C16 4 14.5 9 11 11.5C12 12.5 13 14 13.5 16C14 14 15 13 16 13C17 13 18 14 18.5 16C19 14 20 12.5 21 11.5C17.5 9 16 4 16 4Z" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#luxury-diamond-pattern)" />
        </svg>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
        {/* Top Crest Icon */}
        <div className="text-[#2c2c2c] mb-2">
          <svg className="w-12 h-12" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C16 2 14 9 10 12C11 13 12 15 12.5 17C13 15 14 14 16 14C18 14 19 15 19.5 17C20 15 21 13 22 12C18 9 16 2 16 2Z" />
            <path d="M16 15C14.5 15 11 16 10 20C12 21 13.5 20 14.5 19C15 21 15.5 24 16 27C16.5 24 17 21 17.5 19C18.5 20 20 21 22 20C21 16 17.5 15 16 15Z" />
            <path d="M9 22C11 23 13.5 22.5 16 22.5C18.5 22.5 21 23 23 22C22.5 21 21 20.5 16 20.5C11 20.5 9.5 21 9 22Z" />
          </svg>
        </div>

        {/* Headings */}
        <div className="space-y-1">
          <h1 className="font-['Bembo_Std'] font-normal text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1C1C1C] tracking-wide leading-tight">
            Curated Tea Experiences for Those
          </h1>
          <h2 className="font-['Snell_Roundhand_LT_Std'] italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#3A3321] mt-2 block">
            Who Represent Excellence
          </h2>
        </div>

        {/* Paragraph */}
        <p className="font-gotham text-stone-800 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed mt-2 uppercase tracking-widest opacity-90">
          From executive gifting and luxury hospitality to bespoke collections for distinguished organisations, we create tea experiences that reflect your standards as thoughtfully as they reflect our own.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto justify-center px-4">
          <button className="px-10 py-4 bg-[#1C1C1C] hover:bg-[#2c2c2c] text-white font-gotham text-xs font-semibold uppercase tracking-[0.2em] rounded-full transition-all duration-300 shadow-md">
            Begin Consultation
          </button>
          <button className="px-10 py-4 bg-white hover:bg-stone-50 text-[#1C1C1C] font-gotham text-xs font-semibold uppercase tracking-[0.2em] rounded-full transition-all duration-300 border border-stone-200 shadow-sm">
            Explore Teas
          </button>
        </div>
      </div>
    </section>
  );
}
