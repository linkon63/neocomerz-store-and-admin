"use client";

import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface CarouselHeaderProps {
  title: string;
  onPrevious: () => void;
  onNext: () => void;
}

export default function CarouselHeader({ title, onPrevious, onNext }: CarouselHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8 md:mb-12">
      <button
        onClick={onPrevious}
        className="font-gotham text-text-primary text-xs sm:text-sm uppercase tracking-wider hover:text-brand-3 transition-colors flex items-center gap-1 cursor-pointer"
      >
        <IoChevronBack className="w-4 h-4" />
        PREVIOUS
      </button>

      <h2 className="font-bembo text-brand-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">
        {title}
      </h2>

      <button
        onClick={onNext}
        className="font-gotham text-text-primary text-xs sm:text-sm uppercase tracking-wider hover:text-brand-3 transition-colors flex items-center gap-1 cursor-pointer"
      >
        NEXT
        <IoChevronForward className="w-4 h-4" />
      </button>
    </div>
  );
}
