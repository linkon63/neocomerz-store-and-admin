export default function Presence() {
  return (
    <section className="w-full">
      <div className="presence-wrapper">
        <div
          className="container mx-auto bg-center bg-contain bg-no-repeat"
          style={{ backgroundImage: "url('/images/presence.png')" }}
        >
          <div className="presence-content text-center">
            <p className="text-brand-5 text-lg font-normal font-['Bembo_Std'] uppercase py-10">Global Presence</p>
            <h2 className="text-brand-5 text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight">
              <span className="font-['Bembo_Std']">From the Gardens of Sylhet to </span>
              <span className="font-['Snell_Roundhand_LT_Std'] italic text-olive-slate">Tables Across the World</span>
            </h2>
            <p className="text-brand-5 text-lg font-normal font-['Bembo_Std'] py-12">What begins in quiet cultivation now finds its place in global refinement.</p>
          </div>
        </div>
      </div>
    </section>
  );
}