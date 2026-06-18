"use client";

interface CarouselHeaderProps {
  title: string;
  onPrevious: () => void;
  onNext: () => void;
}

export default function CarouselHeader({ title, onPrevious, onNext }: CarouselHeaderProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 mb-8 md:mb-12">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider text-gray-600 hover:text-[#B9975B] transition-colors duration-300 cursor-pointer"
          aria-label="Previous"
        >
          <span className="text-lg">&lt;</span>
          <span>Previous</span>
        </button>

        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-['Bembo_Std'] text-[#B9975B]">
          {title}
        </h2>

        <button
          onClick={onNext}
          className="flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider text-gray-600 hover:text-[#B9975B] transition-colors duration-300 cursor-pointer"
          aria-label="Next"
        >
          <span>Next</span>
          <span className="text-lg">&gt;</span>
        </button>
      </div>
    </div>
  );
}
