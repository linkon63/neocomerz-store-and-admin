import Image from "next/image";
export default function TeaCollection() {
     const features = [
    {
      icon: "/images/invitation/Invitation-1.svg",
      description: "Single-origin selections",
    },
    {
      icon: "/images/invitation/Invitation-2.svg",
      description: "Limited harvest batches",
    },
    {
      icon: "/images/invitation/Invitation-4.svg",
      description: "Direct estate sourcing",
    },
    {
      icon: "/images/invitation/Invitation-5.svg",
      description: "Zero compromise on purity",
    },
  ];
  return (
    <section className="relative w-full">
      <div className="teacollection-wrapper"> 
        <div className="container mx-auto py-3 px-6 md:px-12">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 md:gap-12 mb-8 md:mb-12">
                {features.map((feature, index) => (
                <div key={index} className="flex flex-row items-center gap-3">
                    {/* Icon */}
                    <div className="relative w-16 h-16 shrink-0">
                    <Image
                        src={feature.icon}
                        alt={feature.description}
                        fill
                        className="object-contain"
                    />
                    </div>
                    {/* Text */}
                    <p className="text-[#d2c494] text-xl font-normal font-gotham leading-6 max-w-[180px]">
                    {feature.description}
                    </p>
                </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}