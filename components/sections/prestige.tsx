export default function Prestige() {
  
  return (
    <section className="relative w-full overflow-hidden">
      <div className="prestige-wrapper"> 
        <div className="container mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ">
            <div className="text-center lg:text-left border-r border-stone-gray">
              <h2 
                className="text-3xl md:text-4xl lg:text-6xl font-['Bembo_Std'] leading-14 font-normal text-khaki-gold"
              >
                Recognized Where Taste
                Becomes Prestige
              </h2>
            </div>
            {/* Right Side - Content */}
            <div>
              {/* Top paragraph */}
              <p 
                className="text-sm md:text-base leading-relaxed text-stone-gray mb-8 font-['Bembo_Std']"
              >
                Rooted in the fertile landscapes of Sylhet, our teas travel beyond origin—carrying with them the character of place, time, and craft. Inspired by the legacy of global trade excellence shaped by the London Tea Exchange, we position every selection not as a commodity, but as a refined expression of origin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}