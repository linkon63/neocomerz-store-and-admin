export default function CharterIntro() {
  return (
    <section className="w-full bg-[#4b3729] py-20 px-6 md:px-12 lg:px-24 text-white relative">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading */}
          <div className="lg:col-span-5 space-y-4">
            <p className="font-['Gotham'] text-[10px] md:text-xs uppercase tracking-[0.25em] text-khaki-gold font-semibold">
              IMPACT
            </p>
            <div className="space-y-1">
              <h2 className="font-['Bembo_Std'] text-3xl md:text-[40px] font-normal leading-tight text-khaki-gold">
                What the Charter is
              </h2>
              <h3 className="font-['Snell_Roundhand_LT_Std'] italic text-2xl md:text-[38px] text-white leading-normal block">
                trying to change
              </h3>
            </div>
          </div>

          {/* Right Column: 2x2 Grid of Metrics */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-x-12 gap-y-10">
            {/* Metric 1 */}
            <div className="space-y-2">
              <span className="font-bembo text-4xl md:text-5xl lg:text-6xl font-normal text-white leading-none block">
                8
              </span>
              <p className="font-['Gotham'] text-[10px] md:text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Articles in the Charter
              </p>
            </div>

            {/* Metric 2 */}
            <div className="space-y-2">
              <span className="font-['Bembo_Std'] text-4xl md:text-5xl lg:text-6xl font-normal text-white leading-none block">
                3M
              </span>
              <p className="font-['Gotham'] text-[10px] md:text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Workers targeted for extreme-poverty exit by 2030
              </p>
            </div>

            {/* Metric 3 */}
            <div className="space-y-2">
              <span className="font-['Bembo_Std'] text-4xl md:text-5xl lg:text-6xl font-normal text-white leading-none block">
                2024
              </span>
              <p className="font-['Gotham'] text-[10px] md:text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Fair Pay Foundation established
              </p>
            </div>

            {/* Metric 4 */}
            <div className="space-y-2">
              <span className="font-['Bembo_Std'] text-4xl md:text-5xl lg:text-6xl font-normal text-white leading-none block">
                120M
              </span>
              <p className="font-['Gotham'] text-[10px] md:text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                People estimated to work across the global tea industry
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Citation Footnote with left gold border */}
        <div className="border-l border-khaki-gold pl-6 pt-1 pb-1">
          <p className="font-['Bembo_Std'] italic text-xs text-khaki-gold/85 leading-relaxed max-w-5xl">
            The 2030 target was announced at the Fair Pay Foundation&apos;s UNITAR signing on 30 May 2024. The ~120M figure is cited by founder Sheikh Aliur Rahman in press interviews. Neither has been independently audited; later claims of impact already achieved vary between sources and are noted in the Timeline below.
          </p>
        </div>
      </div>
    </section>
  );
}
