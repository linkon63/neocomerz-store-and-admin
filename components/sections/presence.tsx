export default function Presence() {
  return (
    <section className="w-full">
      <div className="presence-wrapper"> 
        <div 
          className="container mx-auto bg-center bg-cover bg-no-repeat" 
          style={{ backgroundImage: "url('/images/presence.png')" }}
        > 
        <div className="presence-content text-center">
            <p className="text-white text-lg font-normal font-['Bembo_Std'] uppercase py-10">Global Presence</p>
            <h2 className="text-white text-6xl font-normal font-['Snell_Roundhand_LT_Std']">From the Gardens of Sylhet to <span>Tables Across the World</span></h2>
            <p className="text-white text-xl font-normal font-['Gotham'] py-12">What begins in quiet cultivation now finds its place in global refinement.</p>
        </div>
        </div>
      </div>
    </section>
  );
}