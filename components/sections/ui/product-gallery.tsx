'use client';

import { useState } from 'react';
import Image from 'next/image';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Main Image Container */}
      <div className="relative w-full h-[350px] sm:h-[450px] md:h-[500px] lg:h-[576px] bg-stone-100 overflow-hidden flex items-center justify-center group">
        <Image
          src={images[activeIndex]}
          alt={`Product Image ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
          className="object-cover transition-all duration-300"
        />
        
        {/* Navigation Arrows overlayed at bottom center */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          <button
            onClick={handlePrev}
            className="w-11 h-11 bg-white hover:bg-stone-50 text-stone-800 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all"
            aria-label="Previous image"
          >
            <IoIosArrowBack className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-11 h-11 bg-white hover:bg-stone-50 text-stone-800 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all"
            aria-label="Next image"
          >
            <IoIosArrowForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Thumbnails Row */}
      <div className="w-full flex justify-center py-2 overflow-x-auto">
        <div className="flex items-center gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-16 h-16 overflow-hidden bg-stone-100 cursor-pointer transition-all duration-200 ${
                idx === activeIndex
                  ? 'ring-2 ring-brand-3 border-transparent scale-105 shadow-sm'
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
