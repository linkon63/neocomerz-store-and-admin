import Image from "next/image";
import Button from "./button";

export default function NobleBalance() {
  return (
    <section className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden bg-[#473729] mb-12 md:mb-36">
      {/* Pattern Background Layer with blend mode */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
        }}
      ></div>

      {/* Content Layer - Top */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center space-y-6 md:space-y-8">
          {/* Title */}
          <h3 className="font-['Bembo_Std'] text-lg text-white uppercase font-normal">
            THE NOBLE BALANCE
          </h3>

          {/* Icon */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28">
            <Image
              src="/images/icons/icon-1.svg"
              alt="Balance Icon"
              fill
              className="object-contain"
            />
          </div>

          {/* Main Heading */}
          <h2 className="max-w-4xl text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            <span className="font-['Bembo_Std'] font-normal text-brand-3">
              True Prestige Lies in Grace,
            </span>
            <br />
            <span className="font-['Snell_Roundhand_LT_Std'] italic text-white font-normal">
              Fairness, and Quiet Confidence
            </span>
          </h2>

          {/* Description */}
          <div className="max-w-3xl space-y-2">
            <p className="font-['Bembo_Std'] text-sm lg:text-lg text-white italic">
              Luxury should never feel distant or excessive.
            </p>
            <p className="font-['Bembo_Std'] text-sm lg:text-lg text-white">
              We believe refinement is most meaningful when guided by integrity, thoughtful value, and respect for every experience we create.
            </p>
          </div>

          {/* Button */}
          <div className="pt-4">
            <Button 
              href="/about" 
              label="KNOW MORE"
              variant="outline"
            />
          </div>
        </div>
      </div>
    </section>
  );
}