import Image from "next/image";

export default function WorldAssembly() {
  return (
    <section className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden bg-white">
      {/* Content Layer */}
      <div className="relative z-10 container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 mb-12 md:mb-16">
          {/* Title */}
          <h3 className="font-['Bembo_Std'] text-lg text-stone-gray uppercase tracking-wider">
            THE WORLD ASSEMBLY
          </h3>

          {/* Icon */}
          <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24">
            <Image
              src="/images/icons/icon-2.svg"
              alt="World Assembly Icon"
              fill
              unoptimized
              className="object-contain"
            />
          </div>

          {/* Main Heading */}
          <h2 className="max-w-4xl text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            <span className="font-['Bembo_Std'] font-normal text-khaki-gold">
              Bringing Together the World
            </span>
            <br />
            <span className="font-['Snell_Roundhand_LT_Std'] italic text-olive-slate">
              Through the Ritual of Tea
            </span>
          </h2>
        </div>

        {/* Image Grid - Masonry Layout */}
        <div className="grid grid-cols-12 gap-2 md:gap-3 lg:gap-4 auto-rows-[120px] md:auto-rows-[180px]">
          {/* Large Left */}
          <div className="col-span-12 md:col-span-5 row-span-3 relative">
            <Image
              src="/images/Assembly/img-1.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          {/* Top Right Row */}
          <div className="col-span-4 md:col-span-3 row-span-1 relative">
            <Image
              src="/images/Assembly/img-2.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          <div className="col-span-4 md:col-span-2 row-span-1 relative">
            <Image
              src="/images/Assembly/img-3.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          <div className="col-span-4 md:col-span-2 row-span-1 relative">
            <Image
              src="/images/Assembly/img-4.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          {/* Middle Large Image */}
          <div className="col-span-8 md:col-span-5 row-span-3 relative">
            <Image
              src="/images/Assembly/img-6.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          {/* Right Vertical */}
          <div className="col-span-4 md:col-span-2 row-span-2 relative">
            <Image
              src="/images/Assembly/img-5.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          {/* Bottom Left */}
          <div className="col-span-6 md:col-span-2 row-span-1 relative">
            <Image
              src="/images/Assembly/img-7.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          <div className="col-span-6 md:col-span-3 row-span-1 relative">
            <Image
              src="/images/Assembly/img-8.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          {/* Bottom Right */}
          <div className="col-span-12 md:col-span-2 row-span-1 relative">
            <Image
              src="/images/Assembly/img-9.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
