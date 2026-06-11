export default function Sustainable() {
  return (
    <section className="relative w-full overflow-hidden py-10">
      <div
        className="relative h-[650px] w-full bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/footer/footerbanner.png')",
          clipPath: "ellipse(95% 100% at 50% 100%)",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="font-['Bembo_Std'] text-5xl md:text-6xl">
            Sustainable
          </h2>

          <h3 className="mt-2 font-['Snell_Roundhand_LT_Std'] text-4xl italic md:text-6xl">
            and ethical sourcing
          </h3>

          <p className="font-['Bembo_Std'] mt-8 max-w-4xl text-sm leading-6 md:text-lg">
            London Tea Exchange has spent the past two decades building a
            sustainable and ethical sourcing supply chain. We visit each and
            every estate that we purchase teas from to ensure due diligence is
            carried out. We have developed and led the Fair Pay campaign, which
            this year will be formally recognised by the United Nations and will
            be turned into a international campaign.
          </p>
        </div>
      </div>
    </section>
  );
}
