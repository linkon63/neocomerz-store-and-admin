import Image from "next/image";

export default function Invitation() {
  const features = [
    {
      icon: "/images/invitation/Invitation-1.png",
      title: "Single-Origin Leaves —",
      description: "Sourced with precision from the gardens of Sylhet",
    },
    {
      icon: "/images/invitation/Invitation-2.png",
      title: "Limited Harvests —",
      description: "No mass production, only moments captured in season",
    },
    {
      icon: "/images/invitation/Invitation-3.png",
      title: "Refined Craft —",
      description: "Curated with the philosophy of London Tea Exchange",
    },
  ];

  return (
    <section className="w-full bg-white py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 mb-12 md:mb-16">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mb-4">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  fill
                  className="object-contain"
                />
              </div>
              {/* Text */}
              <div className="max-w-xs">
                <h4 className="font-gotham text-text-primary text-sm sm:text-base mb-2">
                  {feature.title}
                </h4>
                <p className="font-gotham text-text-primary text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Text */}
        <div className="text-center max-w-5xl mx-auto">
          <p className="font-gotham text-text-primary text-xs sm:text-sm md:text-base leading-relaxed">
            This is not a collection made to impress at first glance. It is designed to unfold—layer by layer, note by note. For those who choose to go further, rather than faster.
          </p>
        </div>
      </div>
    </section>
  );
}
