import Image from "next/image";

export default function Invitation() {
  const features = [
    {
      icon: "/images/invitation/Invitation-1.svg",
      description: "Single-Origin Leaves — Sourced with precision from the gardens of Sylhet",
    },
    {
      icon: "/images/invitation/Invitation-2.svg",
      description: "Limited Harvests — No mass production, only moments captured in season",
    },
    {
      icon: "/images/invitation/Invitation-3.svg",
      description: "Refined Craft — Curated with the philosophy of London Tea Exchange",
    },
  ];

  return (
    <section className="relative w-full bg-white py-12 md:py-16 lg:py-28 overflow-hidden">
      {/* Pattern Background Layer with blend mode */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
        }}
      ></div>

      <div className="relative z-10 container mx-auto px-6 sm:px-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <p className="font-gotham text-text-primary text-xs sm:text-sm tracking-widest uppercase mb-4">
            A QUIET INVITATION
          </p>
          <h2 className="font-family-bembo text-brand-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-relaxed">
            Not Everything Rare Asks for Attention
          </h2>
          <h3 className="font-family-bembo text-brand-3 text-xl sm:text-2xl md:text-4xl lg:text-5xl mb-8 md:mb-12">
            Some Things Reveal Themselves, Slowly
          </h3>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-row items-center gap-4 md:gap-6">
              {/* Icon */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mb-4">
                <Image
                  src={feature.icon}
                  alt={feature.description}
                  fill
                  className="object-contain"
                />
              </div>
              {/* Text */}
              <p className="font-gotham text-text-primary text-xs sm:text-lg leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        {/* Bottom Text */}
        <div className="text-center max-w-5xl mx-auto">
          <p className="font-gotham text-text-primary text-xs sm:text-sm md:text-base leading-relaxed">
            This is not a collection made to impress at first glance. It is designed to unfold—layer by layer, note by note. For those who choose to go further, there is always more to discover.
          </p>
        </div>
      </div>
    </section>
  );
}
