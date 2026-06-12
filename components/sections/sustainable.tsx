export default function Sustainable() {
  return (
    <section className="relative w-full overflow-hidden py-10">
      <div
        className="relative h-full min-h-162.5 w-full overflow-hidden py-16 md:py-24"
        style={{
          clipPath: "ellipse(95% 100% at 50% 100%)",
        }}
      >
        {/* YouTube Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/CFfP9DFeOog?autoplay=1&mute=1&loop=1&playlist=CFfP9DFeOog&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
            allow="autoplay; encrypted-media"
            className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              minWidth: "177.77vh",
              minHeight: "56.25vw",
              width: "100%",
              height: "100%",
            }}
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/45 z-1" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="font-['Bembo_Std'] text-5xl md:text-6xl">
            Sustainable
          </h2>

          <h3 className="mt-2 font-['Snell_Roundhand_LT_Std'] text-4xl italic md:text-6xl">
            and ethical sourcing
          </h3>

          <p className="mt-8 max-w-4xl font-['Bembo_Std'] text-sm leading-6 md:text-lg">
            London Tea Exchange has spent the past two decades building a
            sustainable and ethical sourcing supply chain. We visit each and every
            estate that we purchase teas from to ensure due diligence is carried
            out. We have developed and led the Fair Pay campaign, which this year
            will be formally recognised by the United Nations and will be turned
            into a international campaign.
          </p>
        </div>
      </div>
    </section>
  );
}