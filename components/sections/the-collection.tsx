import Image from "next/image";
import Button from "./ui/button";

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
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-3">
            <span className="font-['Bembo_Std'] text-khaki-gold">The </span>
            <span className="font-['Snell_Roundhand_LT_Std'] italic text-stone-gray">Collections</span>
          </h2>
          <p className="font-gotham text-sm md:text-base text-gray-600 max-w-3xl mx-auto">
            Elegant tea bag presentations featuring rare blends, royal infusions, wellness<br className="hidden sm:block" />
            selections, and timeless classics.
          </p>
        </div>

        {/* Buttons and Icons Row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-16">
          {/* Button 1 */}
          <Button
            href="/collections/assorted"
            label="Assorted Collections"
            variant="primary"
          />

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
          <Button
            href="/collections/tea-books"
            label="Tea Book Collections"
            variant="outline"
          />

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
          <Button
            href="/collections/tea-chests"
            label="Tea chests"
            variant="outline"
          />
        </div>

        {/* Image Section */}
        <div className="relative w-full aspect-video md:aspect-21/9 overflow-hidden shadow-2xl">
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