import Button from "./button";
import Image from "next/image";

export default function WeOffer() {
  return (
    <section 
      className="relative w-full min-h-150 bg-cover bg-center py-16"
      style={{ backgroundImage: "url('/images/offer/offer.png')" }}
    >
      {/* Content Container */}
      <div className="relative z-10 mx-auto px-6 py-12">
        {/* Border Image Container */}
        <div className="relative p-4">
          {/* G.png Border Image */}
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <Image 
              src="/images/offer/G.svg" 
              alt="Decorative border"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
          {/* Inner White Content Box */}
          <div className="relative rounded-lg px-8 py-12 md:px-16 md:py-16 m-3">
            {/* Left Section - We Offer */}
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl lg:text-5xl">
                <span className="font-['Bembo_Std'] font-normal text-brand-3">We </span>
                <span className="font-['Bembo_Std'] italic text-brand-3">Offer</span>
              </h2>
            </div>
            {/* Main Content - Split Layout */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
              {/* Left Side - Numbers */}
              <div className="text-center md:text-left">
                <h3 className="font-['Bembo_Std'] text-5xl font-normal md:text-6xl lg:text-7xl">
                  825 Types{" "}
                  <span className="font-['Bembo_Std'] text-zinc-500 italic font-normaltext-5xl font-normal md:text-6xl">
                    of rare and premium teas from
                  </span>
                </h3>
                <h3 className="font-['Bembo_Std'] mt-4 text-5xl font-normal md:text-6xl lg:text-7xl">
                  43 Countries
                </h3>
              </div>
              {/* Right Side - Description & Button */}
              <div className="flex flex-col gap-6">
                <p className="font-['Bembo_Std'] text-lg font-normal leading-6">
                  <span className="font-['Snell_Roundhand_LT_Std'] font-bold italic">Our philosophy</span>, and attitude is founded on the need for continuous improvement, 
                  whilst satisfying our own passion for achieving excellence. Our vision is to create 
                  luxury tea stores with unrivaled attention to detail with a traditional and vibrant 
                  environment, where high quality premium teas can be found and clients can receive 
                  the ultimate hospitality experience.
                </p>
                {/* Button */}
                <div className="mt-6">
                  <Button 
                    href="/teas" 
                    label="EXPLORE TEAS"
                    variant="primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
