import Button from "./button";
import Image from "next/image";

export default function WeOffer() {
  return (
    <section 
      className="relative w-full min-h-150 bg-cover bg-center p-16"
      style={{ backgroundImage: "url('/images/offer/offer.png')" }}
    >
      {/* Content Container */}
      <div className="relative z-10 mx-auto px-6 py-12 bg-white">
        {/* Border Image Container */}
        <div className="relative p-4">
          {/* G.png Border Image */}
          <div className="absolute inset-0 rounded-lg overflow-hidden hidden xl:block">
            <Image 
              src="/images/offer/G.svg" 
              alt="Decorative border"
              fill
              className="object-contain"
            />
          </div>
          {/* Inner White Content Box */}
          <div className="relative rounded-lg px-0 py-0 md:px-16 md:py-16 m-0">
            {/* Main Content - Split Layout */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 md:gap-12">
              {/* Left Side - Numbers */}
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-3xl xl:text-5xl pb-4 xl:pb-8">
                  <span className="font-['Bembo_Std'] font-normal text-brand-3">We </span>
                  <span className="font-['Bembo_Std'] italic text-brand-3">Offer</span>
                </h2>
                <h3 className="font-['Bembo_Std'] text-4xl font-normal xl:text-6xl">
                  825 Types{" "}
                  <span className="font-['Bembo_Std'] text-zinc-500 italic font-normal text-5xl xl:text-6xl">
                    of rare and premium teas from
                  </span>
                </h3>
                <h3 className="font-['Bembo_Std'] mt-4 text-5xl font-normal xl:text-7xl">
                  43 Countries
                </h3>
              </div>
              {/* Right Side - Description & Button */}
              <div className="flex flex-col gap-4 justify-center">
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
