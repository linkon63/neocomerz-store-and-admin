import Image from "next/image";

export default function AboutUs() {
  return (
    <section className="relative w-full h-auto bg-[#1C221F] py-16 px-6 md:px-12 lg:py-32 overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
          maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 90%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 90%)',
        }}
      ></div>

      <div className="relative z-10 aboutus-wrapper max-w-7xl mx-auto">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center">
            
            <div className="left-wrapper lg:col-span-7 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-tight tracking-wide">
                  <span className="font-['Bembo_Std'] text-white">
                    About{" "}
                  </span>
                  <span className="font-['Snell_Roundhand_LT_Std'] italic text-white">
                    Us
                  </span>
                </h2>
                <p className="font-['Bembo_Std'] text-sm sm:text-base text-stone-400 font-normal leading-relaxed max-w-xl">
                  We understand that our clients take comfort in knowing that quality is at the heart of everything we do. 
                </p>
              </div>
              <p className="text-white text-4xl font-normal font-['Bembo_Std'] leading-10">
                With roots from the city of London spanning hundreds of years, London Tea Exchange offers one of the widest selection of single estate premium teas from across the globe. Our unique tea collections are sourced directly from over forty different countries and includes some of the rarest teas in the world, many of which are exclusive to London Tea Exchange.
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
