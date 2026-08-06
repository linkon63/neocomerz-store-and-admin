import Image from "next/image";
import Button from "./button";

export default function NobleBalance() {
  return (
    <section className="relative w-full overflow-hidden bg-[#51524E] mb-12 md:mb-36">
      {/* Pattern Background Layer with blend mode */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
          maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 90%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 90%)',
        }}
      ></div>

      {/* Content Layer */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 py-20 md:py-28 lg:py-36 flex flex-col justify-center items-center gap-6">
        {/* Title */}
        <div className="text-white text-lg font-normal font-['Bembo_Std'] uppercase leading-6 text-center">
          The Noble Balance
        </div>

        {/* Icon */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 my-2">
          <Image
            src="/images/icons/icon-1.svg"
            alt="Balance Icon"
            fill
            className="object-contain"
          />
        </div>

        {/* Heading */}
        <div className="flex flex-col justify-start items-center">
          <div className="text-center text-khaki-gold text-3xl md:text-5xl lg:text-6xl font-normal font-['Bembo_Std'] leading-tight lg:leading-[56px]">
            True Prestige Lies in Grace,
          </div>
          <div className="text-center text-white text-3xl md:text-5xl lg:text-6xl font-normal font-['Snell_Roundhand_LT_Std'] italic leading-tight lg:leading-[56px]">
            Fairness, and Quiet Confidence
          </div>
        </div>

        {/* Description */}
        <div className="self-stretch text-center text-white/90 text-sm md:text-base lg:text-[17px] font-normal font-['Bembo_Std'] leading-relaxed max-w-3xl mx-auto flex flex-col gap-1.5">
          <p className="italic">Luxury should never feel distant or excessive.</p>
          <p>We believe refinement is most meaningful when guided by integrity, thoughtful value, and respect for every experience we create.</p>
        </div>

        {/* Button */}
        <div className="pt-2">
          <Button 
            href="/about" 
            label="Know More"
            variant="primary"
          />
        </div>
      </div>
    </section>
  );
}