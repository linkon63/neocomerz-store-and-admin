export default function CharterHero() {
  return (
    <section className="w-full bg-white py-20 px-6 md:px-12 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[90vh]">
      {/* Background elegant pattern — diamond + fleur-de-lis grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "url('/images/pattern/pattern-1.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "453px 453px",
        }}
      />

      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10 space-y-7">
        {/* Top Crest Icon */}
        <div className="mb-2">
          <img
            src="/images/icons/icon-3.svg"
            alt="Fleur-de-lis Crest"
            className="w-10 h-10 object-contain opacity-80"
          />
        </div>

        {/* Initiative Pill Tag */}
        <div className="inline-block border border-zinc-200/80 bg-white/60 backdrop-blur-xs rounded-full px-6 py-2">
          <p className="font-gotham text-[9.5px] uppercase tracking-[0.2em] text-[#51524e] font-semibold">
            An initiative of London Tea Exchange, with UNITAR & the Commonwealth
          </p>
        </div>

        {/* Main Title */}
        <div className="space-y-1">
          <h1 className="font-bembo text-4xl md:text-[50px] font-normal text-[#b4a676] leading-tight">
            Fair pay for every hand
          </h1>
          <h2 className="font-snell italic text-3xl md:text-[44px] text-[#212721] leading-normal block">
            that picks your tea.
          </h2>
        </div>

        {/* Spaced Metadata row */}
        <div className="flex items-center justify-center gap-12 font-gotham text-[10.5px] tracking-[0.15em] text-[#999999] uppercase pt-2">
          <span>Est. 2024</span>
          <span>Mansion House, London</span>
          <span>Eight-Article Pledge</span>
        </div>

        {/* Paragraph Description */}
        <p className="font-bembo text-xs md:text-sm text-[#665a5d]/90 leading-relaxed max-w-2xl font-normal pt-2">
          The Global Fair Pay Charter commits signatories to fair, dignified pay for tea industry workers worldwide. It was conceived by Sheikh Aliur Rahman OBE, Group Chairman of London Tea Exchange, and formally launched with the United Nations Institute for Training and Research on International Tea Day, 22 May 2024.
        </p>

        {/* Action Buttons (Stacked Vertically) */}
        <div className="flex flex-col gap-3 w-full max-w-xs justify-center items-center pt-6">
          <a
            href="#watch-intro"
            className="w-full font-gotham text-xs font-semibold uppercase tracking-wider bg-[#4b4a45] text-white py-4 rounded-full hover:bg-zinc-800 transition-colors duration-300 text-center shadow-xs cursor-pointer"
          >
            Watch the introduction
          </a>
          <a
            href="#learn-more"
            className="w-full font-gotham text-xs font-semibold uppercase tracking-wider text-[#4b4a45] bg-white border border-zinc-300 py-4 rounded-full hover:bg-zinc-50 transition-colors duration-300 text-center cursor-pointer"
          >
            Read the eight articles
          </a>
        </div>
      </div>
    </section>
  );
}
