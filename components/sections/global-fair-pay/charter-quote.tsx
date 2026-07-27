import ScrollReveal from "@/components/ui/scroll-reveal";

export default function CharterQuote() {
  return (
    <section className="w-full bg-white pt-24 pb-28 md:pt-32 md:pb-40 px-5 sm:px-6 md:px-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Instant Inline Top shape transition with zero reload animation / shift */}
      <div className="absolute left-0 right-0 top-0 -mt-[1px] pointer-events-none z-10 w-full select-none">
        <svg width="1920" height="94" viewBox="0 0 1920 94" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
          <path d="M1920 0H0C0 0 429.807 94 960 94C1490.19 94 1920 0 1920 0Z" fill="#F6F6F6"/>
        </svg>
      </div>

      {/* Main Quote Container */}
      <div className="w-full max-w-[700px] mx-auto flex flex-col justify-start items-start gap-8 sm:gap-10 md:gap-12 relative z-20 text-left group px-1 sm:px-0">
        <ScrollReveal delay={0} direction="up">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[100px] border border-neutral-300 flex items-center justify-center bg-white shadow-2xs group-hover:border-khaki-gold group-hover:shadow-md group-hover:scale-105 transition-all duration-300 shrink-0">
            <img
              src="/images/icons/icon-3.svg"
              alt="Fleur-de-lis"
              className="w-4 h-4 sm:w-5 sm:h-5 object-contain opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80} direction="up">
          <div className="self-stretch text-left text-neutral-600 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal font-['Bembo_Std'] leading-[30px] sm:leading-[34px] md:leading-[38px]">
            Signing the Charter at Mansion House was a chance to put the City of London&apos;s name behind something concrete: fair pay for tea workers, not as a slogan, but as a written commitment with named signatories attached to it.
          </div>
        </ScrollReveal>

        <ScrollReveal delay={160} direction="up">
          <div className="self-stretch text-left text-neutral-400 text-[11px] sm:text-xs font-normal font-['Gotham'] underline leading-relaxed hover:text-neutral-600 transition-colors duration-200">
            — Paraphrased from remarks by Professor Michael Mainelli, Lord Mayor of the City of London, on signing the Charter, May 2024
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
