import ScrollReveal from "@/components/ui/scroll-reveal";

export default function CharterIntro() {
  return (
    <section className="w-full bg-[#3E332A] py-16 md:py-24 px-6 md:px-12 lg:px-24 text-white relative">
      <div className="max-w-[1440px] mx-auto space-y-12">
        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading */}
          <ScrollReveal delay={0} direction="up" className="lg:col-span-5 space-y-3">
            <p className="font-['Bembo_Std'] text-xs md:text-sm uppercase tracking-[0.25em] text-[#9C8E7D]">
              IMPACT
            </p>
            <div className="space-y-0.5">
              <h2 className="font-['Bembo_Std'] text-3xl md:text-4xl lg:text-[48px] font-normal leading-[1.15] text-[#C5A880]">
                What the Charter is
              </h2>
              <h3 className="font-['Snell_Roundhand_LT_Std'] italic text-3xl md:text-4xl lg:text-[48px] text-white leading-[1.15] block">
                trying to change
              </h3>
            </div>
          </ScrollReveal>

          {/* Right Column: 2x2 Grid of Metrics */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-x-12 gap-y-10">
            {/* Metric 1 */}
            <ScrollReveal delay={80} direction="up" className="space-y-2">
              <span className="font-['Bembo_Std'] text-4xl md:text-5xl lg:text-[56px] font-normal text-white leading-none block">
                8
              </span>
              <p className="font-['Gotham'] text-xs md:text-[13px] font-semibold text-white/90 leading-snug">
                Articles in the Charter
              </p>
            </ScrollReveal>

            {/* Metric 2 */}
            <ScrollReveal delay={160} direction="up" className="space-y-2">
              <span className="font-['Bembo_Std'] text-4xl md:text-5xl lg:text-[56px] font-normal text-white leading-none block">
                3M
              </span>
              <p className="font-['Gotham'] text-xs md:text-[13px] font-semibold text-white/90 leading-snug">
                Workers targeted for extreme-poverty exit by 2030
              </p>
            </ScrollReveal>

            {/* Metric 3 */}
            <ScrollReveal delay={240} direction="up" className="space-y-2">
              <span className="font-['Bembo_Std'] text-4xl md:text-5xl lg:text-[56px] font-normal text-white leading-none block">
                2024
              </span>
              <p className="font-['Gotham'] text-xs md:text-[13px] font-semibold text-white/90 leading-snug">
                Fair Pay Foundation established
              </p>
            </ScrollReveal>

            {/* Metric 4 */}
            <ScrollReveal delay={320} direction="up" className="space-y-2">
              <span className="font-['Bembo_Std'] text-4xl md:text-5xl lg:text-[56px] font-normal text-white leading-none block">
                120M
              </span>
              <p className="font-['Gotham'] text-xs md:text-[13px] font-semibold text-white/90 leading-snug">
                People estimated to work across the global tea industry
              </p>
            </ScrollReveal>
          </div>
        </div>

        {/* Bottom Citation Footnote with left gold border */}
        <ScrollReveal delay={400} direction="up" className="border-l-2 border-[#9C8E7D]/60 pl-6 py-1">
          <p className="font-['Bembo_Std'] italic text-xs text-[#9C8E7D] leading-relaxed max-w-5xl">
            <span className="underline underline-offset-2">The 2030 target was announced at the Fair Pay Foundation&apos;s UNITAR signing on 30 May 2024. The ~120M figure is cited by founder Sheikh Aliur Rahman in press interviews. Neither has been independently audited; later claims of impact already achieved vary between sources and are noted in the Timeline below.</span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
