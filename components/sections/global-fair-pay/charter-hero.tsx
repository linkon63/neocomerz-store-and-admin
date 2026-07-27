import ScrollReveal from "@/components/ui/scroll-reveal";

export default function CharterHero() {
  return (
    <section className="w-full bg-white py-20 px-6 md:px-12 flex flex-col items-center justify-center text-center relative overflow-x-hidden min-h-[90vh]">
      {/* Background elegant pattern with soft bottom fade */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20 [mask-image:linear-gradient(to_bottom,black_30%,transparent_95%)] [-webkit-mask-image:linear-gradient(to_bottom,black_30%,transparent_95%)]"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "160px auto",
        }}
      />

      <div className="max-w-[1440px] w-full inline-flex flex-col justify-center items-center gap-6 md:gap-8 relative z-10">
        {/* Top Center Decorative Fleur-de-lis Icon */}
        <ScrollReveal delay={0} direction="up">
          <div className="flex items-center justify-center mb-1">
            <img
              src="/images/icons/icon-3.svg"
              alt="Fleur-de-lis"
              className="w-7 h-8 object-contain filter grayscale brightness-0 opacity-80"
            />
          </div>
        </ScrollReveal>

        {/* Initiative Pill Tag */}
        <ScrollReveal delay={80} direction="up">
          <div className="px-5 md:px-7 py-2.5 bg-white rounded-[100px] border border-neutral-200 shadow-2xs inline-flex justify-center items-center gap-2">
            <span className="text-center text-neutral-800 text-xs md:text-sm font-normal font-['Bembo_Std'] uppercase tracking-[0.15em] leading-snug">
              AN INITIATIVE OF LONDON TEA EXCHANGE, WITH UNITAR & THE COMMONWEALTH
            </span>
          </div>
        </ScrollReveal>

        {/* Main Title */}
        <ScrollReveal delay={160} direction="up">
          <div className="flex flex-col justify-start items-center my-2">
            <h1 className="text-center text-khaki-gold text-4xl sm:text-5xl md:text-[64px] font-normal font-['Bembo_Std'] leading-tight sm:leading-[1.15]">
              Fair pay for every hand
            </h1>
            <h2 className="text-center text-neutral-600 text-4xl sm:text-5xl md:text-[64px] font-normal font-['Snell_Roundhand_LT_Std'] italic leading-tight sm:leading-[1.15]">
              that picks your tea.
            </h2>
          </div>
        </ScrollReveal>

        {/* Spaced Metadata row */}
        <ScrollReveal delay={240} direction="up">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 my-1">
            <span className="text-center text-neutral-400 text-sm md:text-lg font-normal font-['Gotham'] leading-snug">
              Est. 2024
            </span>
            <span className="text-center text-neutral-400 text-sm md:text-lg font-normal font-['Gotham'] leading-snug">
              Mansion House, London
            </span>
            <span className="text-center text-neutral-400 text-sm md:text-lg font-normal font-['Gotham'] leading-snug">
              Eight-Article Pledge
            </span>
          </div>
        </ScrollReveal>

        {/* Paragraph Description */}
        <ScrollReveal delay={320} direction="up">
          <p className="w-full max-w-[720px] text-center text-neutral-400 text-sm md:text-base lg:text-lg font-normal font-['Gotham'] leading-relaxed px-2">
            The Global Fair Pay Charter commits signatories to fair, dignified pay for tea industry workers worldwide. It was conceived by Sheikh Aliur Rahman OBE, Group Chairman of London Tea Exchange, and formally launched with the United Nations Institute for Training and Research on International Tea Day, 22 May 2024.
          </p>
        </ScrollReveal>

        {/* Action Buttons (Stacked Vertically) */}
        <ScrollReveal delay={400} direction="up">
          <div className="w-full max-w-xs flex flex-col justify-start items-center gap-3.5 mt-2">
            <a
              href="#watch-intro"
              className="w-full px-6 py-4 bg-[#4A4643] rounded-[100px] flex flex-col justify-center items-center cursor-pointer hover:bg-neutral-800 transition-colors duration-300 shadow-xs"
            >
              <span className="text-white text-xs md:text-sm font-medium font-['Gotham'] uppercase tracking-wider leading-tight">
                WATCH THE INTRODUCTION
              </span>
            </a>
            <a
              href="#eight-articles"
              className="w-full px-6 py-4 bg-white rounded-[100px] border border-[#4A4643] flex flex-col justify-center items-center cursor-pointer hover:bg-neutral-50 transition-colors duration-300"
            >
              <span className="text-neutral-700 text-xs md:text-sm font-medium font-['Gotham'] uppercase tracking-wider leading-tight">
                READ THE EIGHT ARTICLES
              </span>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
