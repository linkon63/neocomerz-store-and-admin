'use client';

import React from 'react';

export default function LuxuryHero() {
  return (
    <section className="relative w-full flex items-center justify-center bg-[#C2B687] py-36 px-6 overflow-hidden">
      {/* Repeating Luxury Pattern Image */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-80" 
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          backgroundSize: '160px auto',
        }}
      />

      {/* Hero Content Stack */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-12">
        {/* Main Icon (Dark Fleur-de-lis centered at the top) */}
        <div className="text-[#2A2A2A]">
          <svg className="w-12 h-12" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C16 2 14 9 10 12C11 13 12 15 12.5 17C13 15 14 14 16 14C18 14 19 15 19.5 17C20 15 21 13 22 12C18 9 16 2 16 2Z" />
            <path d="M16 15C14.5 15 11 16 10 20C12 21 13.5 20 14.5 19C15 21 15.5 24 16 27C16.5 24 17 21 17.5 19C18.5 20 20 21 22 20C21 16 17.5 15 16 15Z" />
            <path d="M9 22C11 23 13.5 22.5 16 22.5C18.5 22.5 21 23 23 22C22.5 21 21 20.5 16 20.5C11 20.5 9.5 21 9 22Z" />
          </svg>
        </div>

        {/* Headings */}
        <div className="flex flex-col items-center text-center">
          <h1 className="font-['Bembo_Std'] font-normal text-3xl sm:text-4xl md:text-5xl lg:text-[46px] text-[#2A2A2A] tracking-wide leading-tight">
            Curated Tea Experiences for Those
          </h1>
          <h2 className="font-['Snell_Roundhand_LT_Std'] italic text-2xl sm:text-3xl md:text-4xl lg:text-[42px] text-[#2A2A2A] mt-2 block">
            Who Represent Excellence
          </h2>
        </div>

        {/* Paragraph */}
        <p className="font-gotham text-[#2A2A2A] text-sm sm:text-base md:text-lg max-w-3xl leading-relaxed font-normal text-center">
          From executive gifting and luxury hospitality to bespoke collections for distinguished organisations, we create tea experiences that reflect your standards as thoughtfully as they reflect our own.
        </p>

        {/* Buttons (Arranged vertically with a gap) */}
        <div className="flex flex-col gap-4 w-full max-w-xs justify-center items-center">
          <button className="w-full px-12 py-4 bg-[#4A4A4A] hover:bg-[#3E3E3E] rounded-full transition-all duration-300 shadow-md border border-amber-200/10 cursor-pointer flex justify-center items-center">
            <span className="justify-start text-white text-base font-medium font-gotham uppercase leading-5">
              Begin Consultation
            </span>
          </button>
          <button className="w-full px-12 py-4 bg-white hover:bg-stone-50 rounded-full transition-all duration-300 shadow-sm cursor-pointer flex justify-center items-center">
            <span className="justify-start text-[#2A2A2A] text-base font-medium font-gotham uppercase leading-5">
              Explore Teas
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
