'use client';

import { useState } from 'react';
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
    <section className="relative w-full py-16 md:py-20 lg:py-24 bg-white overflow-hidden">
      {/* Pattern Background Layer with blend mode */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '150px 150px',
        }}
      ></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        {/* Title Section */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-3">
            <span className="font-['Bembo_Std'] text-khaki-gold">The </span>
            <span className="font-['Snell_Roundhand_LT_Std'] italic text-stone-gray">Collections</span>
          </h2>
          <p className="font-gotham text-sm md:text-base text-gray-600 max-w-3xl mx-auto">
            Elegant tea bag presentations featuring rare blends, royal infusions, wellness<br className="hidden sm:block" />
            selections, and timeless classics.
          </p>
        </div>

        {/* Tab Buttons and Icons Row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-16">
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <div key={tab.id} className="flex items-center gap-4 md:gap-6 lg:gap-8">
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-10 py-3.5 md:px-12 md:py-4 rounded-full font-['Bembo_Std'] text-lg md:text-xl font-normal transition-all duration-300 cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#C4A46C] text-white border border-[#C4A46C] shadow-[0px_4px_12px_rgba(196,164,108,0.2)]'
                      : 'bg-white text-stone-500 border border-[#e2e2e2] hover:bg-stone-50 hover:text-stone-700'
                  }`}
                >
                  {tab.label}
                </button>

                {/* Show decorative separator icon between items (hidden on last item and on mobile) */}
                {idx < TABS.length - 1 && (
                  <div className="hidden md:block relative w-8 h-8 shrink-0">
                    <Image
                      src="/images/icons/icon-3.svg"
                      alt="Separator"
                      fill
                      className="object-contain opacity-80"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Image Section with smooth cross-fade */}
        <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden shadow-2xl rounded-sm">
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