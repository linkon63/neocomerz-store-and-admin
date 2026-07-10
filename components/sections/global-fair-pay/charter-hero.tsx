export default function CharterHero() {
  return (
    <section className="w-full bg-white py-20 px-6 md:px-12 flex flex-col items-center justify-center text-center relative overflow-x-hidden min-h-[90vh]">
      {/* Background elegant pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "160px auto",
        }}
      />

      <div className="max-w-[1440px] w-full inline-flex flex-col justify-center items-center gap-8 md:gap-12 relative z-10">
        {/* Initiative Pill Tag */}
        <div className="px-4 md:px-6 pt-3 pb-1.5 bg-white rounded-[100px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center gap-2">
          <div className="text-center justify-start text-neutral-800 text-xs md:text-lg font-normal font-['Bembo_Std'] uppercase leading-5 md:leading-6">
            An initiative of London Tea Exchange, with UNITAR & the Commonwealth
          </div>
        </div>

        {/* Main Title */}
        <div className="flex flex-col justify-start items-center">
          <h1 className="text-center justify-start text-khaki-gold text-4xl sm:text-5xl md:text-6xl font-normal font-['Bembo_Std'] leading-[40px] sm:leading-[48px] md:leading-[56px]">
            Fair pay for every hand
          </h1>
          <h2 className="text-center justify-start text-neutral-600 text-4xl sm:text-5xl md:text-6xl font-normal font-['Snell_Roundhand_LT_Std'] leading-[40px] sm:leading-[48px] md:leading-[56px]">
            that picks your tea.
          </h2>
        </div>

        {/* Spaced Metadata row */}
        <div className="flex flex-wrap justify-center items-start gap-6 md:gap-12">
          <span className="text-center justify-start text-neutral-400 text-sm md:text-xl font-normal font-['Gotham'] leading-5 md:leading-6">
            Est. 2024
          </span>
          <span className="text-center justify-start text-neutral-400 text-sm md:text-xl font-normal font-['Gotham'] leading-5 md:leading-6">
            Mansion House, London
          </span>
          <span className="text-center justify-start text-neutral-400 text-sm md:text-xl font-normal font-['Gotham'] leading-5 md:leading-6">
            Eight-Article Pledge
          </span>
        </div>

        {/* Paragraph Description */}
        <p className="w-full max-w-[700px] text-center justify-start text-neutral-400 text-base md:text-xl font-normal font-['Gotham'] leading-5 md:leading-6 px-0">
          The Global Fair Pay Charter commits signatories to fair, dignified pay for tea industry workers worldwide. It was conceived by Sheikh Aliur Rahman OBE, Group Chairman of London Tea Exchange, and formally launched with the United Nations Institute for Training and Research on International Tea Day, 22 May 2024.
        </p>

        {/* Action Buttons (Stacked Vertically) */}
        <div className="w-full max-w-xs flex flex-col justify-start items-center gap-3">
          <a
            href="#watch-intro"
            className="w-full px-6 py-5 bg-neutral-600 rounded-[100px] outline outline-1 outline-offset-[-1px] outline-orange-200 flex flex-col justify-center items-center gap-2 cursor-pointer hover:bg-neutral-700 transition-colors duration-300"
          >
            <span className="justify-start text-white text-sm md:text-base font-medium font-['Gotham'] uppercase leading-5">
              Watch the introduction
            </span>
          </a>
          <a
            href="#learn-more"
            className="w-full px-6 py-5 bg-white rounded-[100px] outline outline-1 outline-offset-[-1px] outline-neutral-600 flex flex-col justify-center items-center gap-2 cursor-pointer hover:bg-zinc-50 transition-colors duration-300"
          >
            <span className="justify-start text-neutral-600 text-sm md:text-base font-medium font-['Gotham'] uppercase leading-5">
              Read the eight articles
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
