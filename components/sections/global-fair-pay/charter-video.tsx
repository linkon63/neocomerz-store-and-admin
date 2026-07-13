export default function CharterVideo() {
  return (
    <div className="relative">
      <section className="w-full bg-[#212721] pt-20 pb-16 px-6 md:px-12 lg:px-24 text-white text-center relative">
        {/* Content */}
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-6 relative z-10">
          {/* Title */}
          <div className="space-y-1">
            <h2 className="font-['Bembo_Std'] text-2xl md:text-[34px] font-normal leading-snug text-khaki-gold">
              Introduction to the
            </h2>
            <h3 className="font-['Snell_Roundhand_LT_Std'] italic text-2xl md:text-[38px] text-khaki-gold leading-normal block">
              Fair Pay Charter Foundation
            </h3>
          </div>

          {/* Description */}
          <p className="font-['Gotham'] text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-semibold max-w-md leading-loose">
            An overview of the Foundation&apos;s mandate, its monitoring role, and
            how the eight articles are put into practice on the ground.
          </p>

          {/* Video Player Box */}
          <div className="w-full max-w-3xl relative mt-4">
            <div className="w-full aspect-video bg-zinc-950 rounded-sm overflow-hidden shadow-2xl border border-zinc-800/50">
              <iframe
                src="https://www.youtube.com/embed/CFfP9DFeOog?rel=0&modestbranding=1"
                title="An Introduction to the Global Fair Pay Charter"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-none"
              />
            </div>

            {/* Caption at bottom-right of video */}
            <p className="font-['Gotham'] text-[9px] text-neutral-400 uppercase tracking-wider text-right mt-2 pr-1">
              Produced by: Fair Pay Foundation / London Tea Exchange
            </p>
          </div>
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

