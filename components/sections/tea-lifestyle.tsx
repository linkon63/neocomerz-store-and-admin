'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IoChevronUpOutline } from 'react-icons/io5';

const lifestyleItems = [
  {
    id: 'preparation',
    title: 'Tea Preparation',
    description: 'Elevate your tea experience! Discover our preparation guide by clicking and unlock the secrets to brewing the perfect cup. Enjoy every sip with expert tips designed enhance your tea journey!',
    image: '/images/Assembly/img-10.webp',
    bgClass: 'bg-[#ECEAE6] text-neutral-800',
    btnClass: 'border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-800',
    arrowBg: 'bg-white/80 text-neutral-800 border border-neutral-300',
    href: '/about',
  },
  {
    id: 'recipes',
    title: 'Tea Recipes',
    description: 'Get exclusive tea recipes in your inbox! Discover your perfect blend and learn how to infuse artisanal flavours with ease.',
    image: '/images/Assembly/img-11.webp',
    bgClass: 'bg-[#C5A880] text-white',
    btnClass: 'border-white hover:bg-white hover:text-neutral-800 text-white',
    arrowBg: 'bg-[#51524E] text-white',
    href: '/about',
  },
  {
    id: 'wellness',
    title: 'Tea Wellness',
    description: 'The Health Benefits of Drinking Tea Daily. Unveil the natural antioxidants and therapeutic qualities of rare, hand-picked tea blends.',
    image: '/images/Assembly/img-12.webp',
    bgClass: 'bg-[#51524E] text-white',
    btnClass: 'border-white hover:bg-white hover:text-neutral-800 text-white',
    arrowBg: 'bg-[#C5A880] text-white',
    href: '/about',
  },
];

export default function TeaLifestyle() {
  return (
    <section className="relative w-full py-16 md:py-24 bg-white overflow-hidden">
      {/* Pattern Background Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '150px 150px',
          maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 90%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 90%)',
        }}
      ></div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col items-center gap-12">
        
        {/* Section Title */}
        <div className="self-stretch flex flex-col justify-center items-center gap-3 overflow-hidden text-center">
          <h2 className="inline-flex justify-center flex-wrap items-center gap-2">
            <span className="text-[#C6B485] text-4xl md:text-5xl lg:text-6xl font-normal font-['Bembo_Std'] leading-tight">
              Tea
            </span>
            <span className="text-[#8E866B] text-4xl md:text-5xl lg:text-6xl font-normal font-['Snell_Roundhand_LT_Std'] italic leading-tight">
              Lifestyle
            </span>
          </h2>
          <p className="max-w-[700px] text-center text-[#83847e] text-base lg:text-lg font-normal font-['Bembo_Std'] leading-relaxed">
            Discover recipes, wellness benefits, and preparation guides from our team of tea specialists.
          </p>
        </div>

        {/* Lifestyle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {lifestyleItems.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col rounded-xl overflow-hidden shadow-[0px_4px_30px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0px_10px_40px_rgba(0,0,0,0.12)] ${item.bgClass}`}
            >
              {/* Image Container with Hover Scale */}
              <div className="relative w-full aspect-video overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>

              {/* Card Body */}
              <div className="flex-1 p-8 flex flex-col justify-between items-start gap-6 min-h-[250px]">
                <div className="flex flex-col gap-3">
                  <h3 className="font-['Bembo_Std'] text-2xl md:text-3xl font-normal tracking-wide">
                    {item.title}
                  </h3>
                  <p className="font-['Bembo_Std'] text-sm md:text-base leading-relaxed opacity-90">
                    {item.description}
                  </p>
                </div>

                {/* Card CTA Block */}
                <div className="flex items-center justify-between w-full mt-4">
                  <Link
                    href={item.href}
                    className={`px-6 py-2.5 rounded-full border text-xs uppercase tracking-wider font-semibold font-gotham transition-all duration-300 ${item.btnClass}`}
                  >
                    Read More
                  </Link>

                  {/* Circle Floating Icon (Up arrow, similar to the screenshot) */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${item.arrowBg}`}>
                    <IoChevronUpOutline className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
