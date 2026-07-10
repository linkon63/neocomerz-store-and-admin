import Image from "next/image";

export default function CharterStats() {
  return (
    <section className="w-full bg-[#1C221F] py-20 md:py-28 px-6 md:px-12 lg:px-24 text-white overflow-hidden relative">
      {/* Decorative patterns */}
      <div
        className="absolute inset-0 z-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
        }}
      />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
        {/* Left Side: HTML/CSS Leaflet Booklet Cover Representation */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
          <div className="relative w-[280px] h-[400px] md:w-[320px] md:h-[450px] bg-white text-zinc-900 shadow-2xl rounded-sm transform -rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden flex flex-col justify-between p-6 border border-zinc-200">
            {/* Top Row: Brand & UN Logo */}
            <div className="flex justify-between items-start">
              <span className="font-['Gotham'] text-[8px] font-bold tracking-widest text-neutral-600 uppercase">
                FAIR PAY FOUNDATION
              </span>
              <div className="flex items-center gap-1">
                <span className="font-['Gotham'] text-[8px] font-bold text-neutral-600 uppercase">UN</span>
                <span className="text-[6px] text-neutral-400 font-['Gotham'] leading-none block">
                  United Nations Institute for Training and Research
                </span>
              </div>
            </div>

            {/* Title Block */}
            <div className="my-4 text-center">
              <span className="font-['Bembo_Std'] text-xs text-neutral-400 uppercase tracking-widest block mb-2">
                An Introduction to the
              </span>
              <h3 className="font-['Bembo_Std'] text-xl md:text-2xl font-normal leading-tight text-dark-charcoal">
                Global Fair Pay Charter
              </h3>
            </div>

            {/* Middle Image representing Tea Garden / Forest */}
            <div className="flex-1 w-full relative min-h-[140px] mb-4 overflow-hidden rounded-xs border border-zinc-100">
              <Image
                src="/images/about/about.png"
                alt="Tea Garden Landscape"
                fill
                className="object-cover filter contrast-125 saturate-110"
              />
            </div>

            {/* Bottom Row: Chairman Attribution */}
            <div className="border-t border-zinc-200 pt-3 text-center">
              <p className="font-['Bembo_Std'] italic text-[10px] text-neutral-600">
                Sheikh Aliur Rahman OBE, Group Chairman
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Large Numbers and Stats */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-start text-left space-y-8">
          <h2 className="font-['Bembo_Std'] text-3xl md:text-[40px] font-normal leading-tight text-zinc-100 max-w-md">
            A stake in the estate, not just the shelf
          </h2>

          <div className="space-y-2">
            <p className="font-['Bembo_Std'] text-6xl md:text-8xl font-normal tracking-tight text-white leading-none">
              3,400+
            </p>
            <p className="font-['Bembo_Std'] text-sm md:text-base text-khaki-gold tracking-wider uppercase">
              rare & premium teas in the collection
            </p>
          </div>

          <div className="w-full border-t border-zinc-800 pt-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] md:text-xs font-['Gotham'] font-semibold tracking-[0.2em] text-khaki-gold">
              <span>40+ COUNTRIES SOURCED</span>
              <span className="text-zinc-700">•</span>
              <span>SINCE 1999</span>
              <span className="text-zinc-700">•</span>
              <span>GOLDEN BENGAL, BANGLADESH</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
