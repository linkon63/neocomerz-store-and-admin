import { FiCheck } from 'react-icons/fi';
import { PiBowlSteam } from 'react-icons/pi';

export default function Prestige() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="prestige-wrapper"> 
        <div className="container mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <h2 
                className="text-4xl md:text-5xl lg:text-7xl font-['Snell_Roundhand_LT_Std'] italic leading-tight"
              >
                Recognized Where Taste
                Becomes Prestige
              </h2>
            </div>
            {/* Right Side - Content */}
            <div>
              {/* Top paragraph */}
              <p 
                className="text-sm md:text-base leading-relaxed text-gray-700 mb-8 font-['Bembo_Std']"
              >
                Rooted in the fertile landscapes of Sylhet, our teas travel beyond origin—carrying with them the character of place, time, and craft. Inspired by the legacy of global trade excellence shaped by the London Tea Exchange, we position every selection not as a commodity, but as a refined expression of origin.
              </p>

              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                 <PiBowlSteam className="text-lg text-gray-700" />
                  <p 
                    className="text-lg md:text-xl font-normal font-['Bembo_Std']"
                  >
                    Single-origin selections
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-700 flex items-center justify-center mt-1">
                    <FiCheck className="text-sm text-gray-700" />
                  </div>
                  <p 
                    className="text-lg md:text-xl font-normal font-['Bembo_Std']"
                  >
                    Limited harvest batches
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-700 flex items-center justify-center mt-1">
                    <FiCheck className="text-sm text-gray-700" />
                  </div>
                  <p 
                    className="text-lg md:text-xl font-normal font-['Bembo_Std']"
                  >
                    Direct estate sourcing
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-700 flex items-center justify-center mt-1">
                    <FiCheck className="text-sm text-gray-700" />
                  </div>
                  <p className="text-lg md:text-xl font-normal font-['Bembo_Std']"
                  > Zero compromise on purity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}