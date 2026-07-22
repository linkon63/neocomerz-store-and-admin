import ScrollReveal from "@/components/ui/scroll-reveal";

export default function CharterVideo() {
  return (
    <div className="relative" id="video-section">
      <section id="watch-intro" className="w-full bg-[#212721] pt-24 pb-28 md:pt-32 md:pb-36 px-5 text-white text-center relative overflow-hidden scroll-mt-10">
        {/* Content Container */}
        <div className="max-w-[1440px] w-full mx-auto flex flex-col items-center gap-12 md:gap-20 relative z-10">
          {/* Header Block */}
          <ScrollReveal delay={0} direction="up" distance={20} duration={650} className="self-stretch flex flex-col justify-start items-center gap-6">
            <div className="flex flex-col justify-start items-center">
              <h2 className="text-center text-stone-400 text-3xl sm:text-5xl lg:text-6xl font-normal font-['Bembo_Std'] leading-tight lg:leading-[56px]">
                Introduction to the
              </h2>
              <h3 className="text-center text-white text-3xl sm:text-5xl lg:text-6xl font-normal font-['Snell_Roundhand_LT_Std'] italic leading-tight lg:leading-[56px]">
                Fair Pay Charter Foundation
              </h3>
            </div>
            <p className="w-full max-w-[700px] text-center text-neutral-400 text-sm md:text-base lg:text-lg font-normal font-['Bembo_Std'] uppercase leading-relaxed tracking-wider">
              An overview of the Foundation&apos;s mandate, its monitoring role, and how the eight articles are put into practice on the ground.
            </p>
          </ScrollReveal>

          {/* Video Player Box (Full width of container) */}
          <ScrollReveal delay={120} direction="up" distance={20} duration={650} className="self-stretch w-full flex flex-col justify-start items-end gap-2">
            <div className="w-full aspect-video bg-zinc-950 rounded-sm overflow-hidden shadow-2xl border border-zinc-800/60 relative">
              <iframe
                src="https://www.youtube.com/embed/CFfP9DFeOog?rel=0&modestbranding=1"
                title="An Introduction to the Global Fair Pay Charter"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-none"
              />
            </div>
            <p className="text-right text-neutral-400 text-xs font-medium font-['Gotham'] leading-4 pt-1">
              Produced by: Fair Pay Foundation / London Tea Exchange
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Bottom curved shape */}
      <div className="absolute left-0 right-0 top-full -mt-[1px] z-10 pointer-events-none">
        <img
          src="/images/icons/top-svg.svg"
          alt=""
          className="w-full h-auto block"
        />
      </div>
    </div>
  );
}

