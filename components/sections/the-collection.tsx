import Image from "next/image";
import Link from "next/link";

export default function TheCollection() {
  return (
    <section className="relative w-full py-16 md:py-20 lg:py-24 bg-white overflow-hidden">
      {/* Pattern Background Layer with blend mode */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
        }}
      ></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        {/* Title Section */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="font-['Bembo_Std'] text-4xl md:text-5xl lg:text-6xl mb-3">
            <span className="text-khaki-gold">The </span>
            <span className="italic text-stone-gray">Collections</span>
          </h2>
          <p className="font-gotham text-sm md:text-base text-gray-600 max-w-3xl mx-auto">
            Elegant tea bag presentations featuring rare blends, royal infusions, wellness<br className="hidden sm:block" />
            selections, and timeless classics.
          </p>
        </div>

        {/* Buttons and Icons Row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-16">
          {/* Button 1 */}
          <Link
            href="/collections/assorted"
            className="w-full md:w-auto px-8 lg:px-12 py-3 md:py-3.5 text-white font-gotham text-xs md:text-sm uppercase tracking-wider rounded-full transition-all duration-300 text-center shadow-md hover:opacity-90"
            style={{
              background: 'linear-gradient(134deg, var(--Khaki-Gold, #B4A676) -3.81%, var(--Sage-Gold, #D2C494) 102.27%)',
            }}
          >
            Assorted Collections
          </Link>

          {/* Icon 1 */}
          <div className="hidden md:block relative w-8 h-8">
            <Image
              src="/images/icons/icon-3.svg"
              alt="Icon"
              fill
              className="object-contain"
            />
          </div>

          {/* Button 2 */}
          <Link
            href="/collections/tea-books"
            className="w-full md:w-auto px-8 lg:px-12 py-3 md:py-3.5 bg-white text-stone-gray font-['Bembo_Std'] text-xs md:text-sm uppercase tracking-wider rounded-full hover:bg-[#F5F5F0] transition-all duration-300 text-center shadow-md border border-[#B9975B]"
          >
            Tea Book Collections
          </Link>

          {/* Icon 2 */}
          <div className="hidden md:block relative w-8 h-8">
            <Image
              src="/images/icons/icon-3.svg"
              alt="Icon"
              fill
              className="object-contain"
            />
          </div>

          {/* Button 3 */}
          <Link
            href="/collections/tea-chests"
            className="w-full md:w-auto px-8 lg:px-12 py-3 md:py-3.5 bg-white text-stone-gray font-['Bembo_Std'] text-xs md:text-sm uppercase tracking-wider rounded-full hover:bg-[#F5F5F0] transition-all duration-300 text-center shadow-md border border-[#B9975B]"
          >
            Tea chests
          </Link>
        </div>

        {/* Image Section */}
        <div className="relative w-full aspect-video md:aspect-21/9 overflow-hidden rounded-lg shadow-2xl">
          <Image
            src="/images/footer/footerright.png"
            alt="Tea Collections"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}