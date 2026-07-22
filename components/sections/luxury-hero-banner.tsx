'use client';

import React from 'react';
import Link from 'next/link';

export default function LuxuryHero() {
  const scrollToForm = () => {
    const element = document.getElementById('inquiry-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
          maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 90%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 90%)',
        }}
      />

      {/* Hero Content Stack */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-12">
        {/* Main Icon (Dark Fleur-de-lis centered at the top) */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/icons/icon-3.svg" 
            alt="Crest Icon" 
            className="w-12 h-14 object-contain opacity-90" 
          />
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
          <button 
            type="button"
            onClick={scrollToForm}
            className="w-full px-12 py-4 bg-[#4A4A4A] hover:bg-[#3E3E3E] rounded-full transition-all duration-300 shadow-md border border-amber-200/10 cursor-pointer flex justify-center items-center"
          >
            <span className="justify-start text-white text-base font-medium font-gotham uppercase leading-5">
              Begin Consultation
            </span>
          </button>
          <Link 
            href="/products"
            className="w-full px-12 py-4 bg-white hover:bg-stone-50 rounded-full transition-all duration-300 shadow-sm cursor-pointer flex justify-center items-center"
          >
            <span className="justify-start text-[#2A2A2A] text-base font-medium font-gotham uppercase leading-5">
              Explore Teas
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
