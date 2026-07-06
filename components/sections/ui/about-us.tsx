import Image from "next/image";

export default function AboutUs() {
  return (
    <section className="relative w-full h-auto bg-[#1C221F] py-16 px-6 md:px-12 lg:py-32 overflow-hidden">
      {/* Subtle Repeating Luxury Diamond Pattern with Fleur-de-lis */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="luxury-dark-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
              {/* Diamond Border */}
              <path d="M 60 0 L 120 60 L 60 120 L 0 60 Z" fill="none" stroke="#D2C498" strokeWidth="0.5" strokeOpacity="0.3" />
              {/* Centered Fleur-de-lis */}
              <g transform="translate(48, 48) scale(0.75)" fill="#D2C498" fillOpacity="0.25">
                <path d="M16 4C16 4 14.5 9 11 11.5C12 12.5 13 14 13.5 16C14 14 15 13 16 13C17 13 18 14 18.5 16C19 14 20 12.5 21 11.5C17.5 9 16 4 16 4Z" />
                <path d="M16 14.5C14.5 14.5 11 15 10 18.5C12 19 13.5 18 14.5 17C15 18.5 15.5 21 16 23.5C16.5 21 17 18.5 17.5 17C18.5 18 20 19 22 18.5C21 15 17.5 14.5 16 14.5Z" />
                <path d="M9 19.5C11 20 13.5 19.5 16 19.5C18.5 19.5 21 20 23 19.5C22.5 18.5 21 18 16 18C11 18 9.5 18.5 9 19.5Z" />
              </g>
              {/* Corner Fleur-de-lis */}
              <g transform="translate(-12, -12) scale(0.75)" fill="#D2C498" fillOpacity="0.25">
                <path d="M16 4C16 4 14.5 9 11 11.5C12 12.5 13 14 13.5 16C14 14 15 13 16 13C17 13 18 14 18.5 16C19 14 20 12.5 21 11.5C17.5 9 16 4 16 4Z" />
              </g>
              <g transform="translate(108, -12) scale(0.75)" fill="#D2C498" fillOpacity="0.25">
                <path d="M16 4C16 4 14.5 9 11 11.5C12 12.5 13 14 13.5 16C14 14 15 13 16 13C17 13 18 14 18.5 16C19 14 20 12.5 21 11.5C17.5 9 16 4 16 4Z" />
              </g>
              <g transform="translate(-12, 108) scale(0.75)" fill="#D2C498" fillOpacity="0.25">
                <path d="M16 4C16 4 14.5 9 11 11.5C12 12.5 13 14 13.5 16C14 14 15 13 16 13C17 13 18 14 18.5 16C19 14 20 12.5 21 11.5C17.5 9 16 4 16 4Z" />
              </g>
              <g transform="translate(108, 108) scale(0.75)" fill="#D2C498" fillOpacity="0.25">
                <path d="M16 4C16 4 14.5 9 11 11.5C12 12.5 13 14 13.5 16C14 14 15 13 16 13C17 13 18 14 18.5 16C19 14 20 12.5 21 11.5C17.5 9 16 4 16 4Z" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#luxury-dark-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 aboutus-wrapper max-w-7xl mx-auto">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center">
            
            {/* Left Column */}
            <div className="left-wrapper lg:col-span-7 flex flex-col gap-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-wide">
                <span className="font-['Bembo_Std'] font-normal text-white">
                  About{" "}
                </span>
                <span className="font-['Snell_Roundhand_LT_Std'] italic text-white">
                  Us
                </span>
              </h2>
              <p className="font-['Bembo_Std'] text-xs text-stone-300 font-light tracking-wide uppercase opacity-75 max-w-xl">
                We understand that our clients take comfort in knowing that quality is at the heart of everything we do. 
              </p>
              <p className="font-['Bembo_Std'] text-xl sm:text-2xl lg:text-3xl text-white font-light leading-relaxed tracking-wide">
                With roots from the city of London spanning hundreds of years, London Tea Exchange offers one of the widest selection of single estate premium tea&apos;s from across the globe. Our unique tea collections are sourced directly from over forty different countries and includes some of the rarest teas in the world, many of which are exclusive to London Tea Exchange.
              </p>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[450px] aspect-square overflow-hidden border border-stone-800 shadow-2xl">
                <Image
                  src="/images/about/about.png"
                  alt="London Tea Exchange Storefront"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
