import Image from "next/image";

const certifications = [
  { name: "FINE FOOD GUILD", image: "/images/quality/Fine Food Guild.png" },
  { name: "BRITISH TEA COUNCIL", image: "/images/quality/British Tea Council.png" },
  { name: "ISO 22000:2018", image: "/images/quality/ISO-22000.png" },
  { name: "FDA", image: "/images/quality/FDA.png" },
  { name: "HALAL", image: "/images/quality/Halal.png" },
  { name: "HACCP", image: "/images/quality/HACCP.png" },
  { name: "FAIR PAY CHARTER", image: "/images/quality/Fair Pay Charter.png" },
  { name: "GMP", image: "/images/quality/GMP.png" },
];

export default function Quality() {
  return (
    <section className="w-full py-16 px-6 md:px-12 lg:py-24">
      <div className="Quality-wrapper">
        <div className="container mx-auto">
            {/* Header */}
            <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-stone-800">
                <span className="font-['Gotham']">Quality</span>
                <span className="font-['Snell_Roundhand_LT_Std'] italic"> Standard</span>
            </h2>
            
            <p className="mx-auto mt-6 font-['Gotham'] text-sm leading-6 md:text-lg font-normal">
                We follow a strict clean confidentiality policy governing the use of client information. London Tea Exchange is{" "}
                <span className="font-['Snell_Roundhand_LT_Std'] italic font-">registered with the Information Commissioners Office and abides by the Data Protection Act 1998</span>{" "}
                and all subsequent codes of conduct entailed therein.
            </p>
            
            <p className="mx-auto mt-4 font-['Gotham'] text-xs text-zinc-500">
                London Tea Exchange is already a member of the
            </p>
            </div>
            {/* Certification Logos */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
            {certifications.map((cert, index) => (
                <div key={index} className="flex flex-col items-center justify-center gap-3">
                <div className="relative h-12 w-12 sm:h-16 sm:w-16">
                    <Image
                    src={cert.image}
                    alt={cert.name}
                    fill
                    className="object-contain"
                    />
                </div>
                <p className="text-center font-['Gotham'] text-xs font-medium uppercase tracking-wide text-black">
                    {cert.name}
                </p>
                </div>
            ))}
            </div>
        </div>
      </div>
    </section>
  );
}