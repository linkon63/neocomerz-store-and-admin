export default function Presence() {
  return (
    <section className="w-full px-4">
      <div className="presence-wrapper">
        <div
          className="container mx-auto bg-center bg-no-repeat flex flex-col items-center justify-center py-6 sm:py-8 md:py-10 lg:py-12 px-8 sm:px-12 md:px-16 lg:px-24"
          style={{
            backgroundImage: "url('/images/presence.png')",
            backgroundSize: "100% 100%",
          }}
        >
          <div className="presence-content text-center flex flex-col items-center gap-5 lg:gap-8">
            <p className="text-neutral-800 text-base md:text-lg font-normal font-['Bembo_Std'] uppercase leading-6">
              The Grand Passage
            </p>
            <h2 className="flex flex-row flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 gap-y-1">
              <span className="text-[#C6B485] text-3xl md:text-5xl lg:text-6xl font-normal font-['Bembo_Std'] leading-tight lg:leading-[56px] whitespace-nowrap">
                From the Gardens of Sylhet to
              </span>
              <span className="text-neutral-600 text-3xl md:text-5xl lg:text-6xl font-normal font-['Snell_Roundhand_LT_Std'] leading-tight lg:leading-[56px] whitespace-nowrap">
                Tables Across the World
              </span>
            </h2>
            <p className="text-neutral-800 text-base md:text-lg font-normal font-['Bembo_Std'] leading-6 max-w-2xl mx-auto">
              What begins in quiet cultivation now finds its place in global refinement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}