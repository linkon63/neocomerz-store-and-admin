import Image from "next/image";
import Button from "./ui/button";

export default function Experience() {
  return (
    <section className="w-full bg-brand-4 py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_1fr] gap-8 lg:gap-12 items-center">
          {/* Left Image Grid - 3 rows, 6 images total */}
          <div className="grid grid-cols-2 auto-rows-auto gap-2 sm:gap-3">
            {/* Row 1 - Two small squares */}
            <div className="relative aspect-square aspect-[3/2] overflow-hidden">
              <Image
                src="/images/products/Product-1.png"
                alt="Tea experience 1"
                fill
                className="w-20 object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-square aspect-[3/2] overflow-hidden">
              <Image
                src="/images/products/Product-2.png"
                alt="Tea experience 2"
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            
            {/* Row 2 - Two large vertical rectangles */}
            <div className="relative aspect-[3/2] overflow-hidden">
              <Image
                src="/images/products/Product-3.png"
                alt="Tea experience 3"
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-[3/2] overflow-hidden">
              <Image
                src="/images/products/Product-4.png"
                alt="Tea experience 4"
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            
            {/* Row 3 - Two small squares */}
            <div className="relative aspect-square aspect-[3/2] overflow-hidden">
              <Image
                src="/images/products/Product-5.png"
                alt="Tea experience 5"
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-square aspect-[3/2] overflow-hidden">
              <Image
                src="/images/products/Product-6.png"
                alt="Tea experience 6"
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Center Content */}
          <div className="text-center px-4 sm:px-6 lg:px-8">
            <p className="font-gotham text-white text-xs sm:text-sm tracking-widest uppercase mb-4">
              THE EXPERIENCE OF TEA
            </p>
            <h2 className="font-bembo text-brand-3 text-2xl lg:text-4xl italic mb-2 leading-relaxed">
              Not Just Served
            </h2>
            <h3 className="font-bembo text-brand-3 text-2xl md:text-4xl mb-6">
              Felt, Slowly
            </h3>
            <p className="font-gotham text-white text-xs sm:text-sm md:text-base mb-3 leading-relaxed">
              Before the first sip, there is a pause.
            </p>
            <p className="font-gotham text-white text-xs sm:text-sm md:text-base mb-3 leading-relaxed">
              Steam rises. Aroma unfolds. Time softens. In a world that moves without waiting, this is one of the few rituals that asks you to slow—
            </p>
            <p className="font-gotham text-white text-xs sm:text-sm md:text-base mb-6 leading-relaxed italic">
              This is not consumption. This is presence.
            </p>
            <Button href="/experience" label="KNOW MORE" variant="outline" />
          </div>

          {/* Right Image Grid - 3 rows, 6 images total */}
          <div className="grid grid-cols-2 auto-rows-auto gap-2 sm:gap-3">
            {/* Row 1 - Two small squares */}
            <div className="relative aspect-square overflow-hidden">
              <Image
                src="/images/products/Product-6.png"
                alt="Tea experience 7"
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-square overflow-hidden">
              <Image
                src="/images/products/Product-5.png"
                alt="Tea experience 8"
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            
            {/* Row 2 - Two large vertical rectangles */}
            <div className="relative aspect-[3/2] overflow-hidden">
              <Image
                src="/images/products/Product-4.png"
                alt="Tea experience 9"
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-[3/2] overflow-hidden">
              <Image
                src="/images/products/Product-3.png"
                alt="Tea experience 10"
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            
            {/* Row 3 - Two small squares */}
            <div className="relative aspect-square overflow-hidden">
              <Image
                src="/images/products/Product-2.png"
                alt="Tea experience 11"
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-square overflow-hidden">
              <Image
                src="/images/products/Product-1.png"
                alt="Tea experience 12"
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
