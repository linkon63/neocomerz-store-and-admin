'use client';

import { useState, Fragment } from 'react';
import Image from 'next/image';

const TABS = [
  {
    id: 'assorted',
    label: 'Assorted Collections',
    image: '/images/footer/footerright.png',
  },
  {
    id: 'tea-books',
    label: 'Tea Book Collections',
    image: '/images/gift/item-2.png',
  },
  {
    id: 'tea-chests',
    label: 'Tea chests',
    image: '/images/gift/item-1.png',
  },
];

export default function TheCollection() {
  const [activeTab, setActiveTab] = useState('assorted');

  return (
    <section className="relative w-full py-16 md:py-24 bg-white overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '150px 150px',
          maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%)',
        }}
      ></div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col justify-start items-center gap-10 md:gap-12">
        <div className="flex flex-col justify-center items-center gap-3 text-center">
          <h2 className="inline-flex flex-row justify-center items-baseline gap-2 md:gap-3">
            <span className="font-['Bembo_Std'] text-[#C6B485] text-4xl sm:text-5xl md:text-6xl font-normal leading-none">The</span>
            <span className="font-['Snell_Roundhand_LT_Std'] italic text-[#8E866B] text-4xl sm:text-5xl md:text-6xl font-normal leading-none">Collections</span>
          </h2>
          <p className="max-w-[600px] text-center text-[#83847e] text-sm sm:text-base md:text-lg font-normal font-['Bembo_Std'] leading-normal px-4">
            Elegant tea bag presentations featuring rare blends, royal infusions, wellness selections, and timeless classics.
          </p>
        </div>

        <div className="w-full flex flex-col md:flex-row flex-wrap items-center justify-center gap-4 md:gap-5 lg:gap-8 mb-4">
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <Fragment key={tab.id}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 xl:px-12 xl:py-6 rounded-full flex justify-center items-center font-['Bembo_Std'] text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-normal transition-all duration-300 cursor-pointer select-none whitespace-nowrap ${
                    isActive
                      ? 'bg-linear-[44deg] from-khaki-gold to-sage-gold text-white shadow-[0px_4px_20px_rgba(196,164,108,0.2)]'
                      : 'bg-white text-[#8E866B] outline outline-1 outline-offset-[-1px] outline-zinc-300 hover:bg-stone-50 hover:text-stone-700'
                  }`}
                >
                  {tab.label}
                </button>

                {idx < TABS.length - 1 && (
                  <div className="hidden md:block relative w-6 h-6 lg:w-8 lg:h-8 shrink-0">
                    <Image
                      src="/images/icons/icon-3.svg"
                      alt="Separator"
                      fill
                      className="object-contain opacity-90"
                    />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>

        <div className="relative w-full aspect-[1400/846] overflow-hidden rounded-xl">
          {TABS.map((tab) => (
            <div
              key={tab.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                activeTab === tab.id ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <Image
                src={tab.image}
                alt={tab.label}
                fill
                className="object-cover"
                priority={tab.id === 'assorted'}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}