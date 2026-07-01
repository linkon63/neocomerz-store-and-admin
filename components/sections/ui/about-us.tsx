import Image from "next/image";

export default function AboutUs() {
  return (
    <section className="relative w-full h-auto bg-dark-charcoal py-16 px-6 md:px-12 lg:py-44 overflow-hidden">
      {/* Pattern Background Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
        }}
      ></div>

      <div className="relative z-10 aboutus-wrapper">
        <div className="container mx-auto py-3">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="left-wrapper">
              <h2 className="text-4xl md:text-5xl lg:text-6xl">
                <span className="font-['Bembo_Std'] font-medium text-white">
                  The{" "}
                </span>
                <span className="font-['Snell_Roundhand_LT_Std'] italic text-white">
                  Brand
                </span>
              </h2>
              <p className="mt-6 font-['Bembo_Std'] text-lg text-white font-normal leading-6">
                We understand that our clients take comfort in knowing that quality is at the heart of everything we do. 
              </p>
              <p className="mt-6 font-['Bembo_Std'] text-3xl md:text-4xl text-white font-normal leading-12">
                With roots from the city of London spanning hundreds of years,
                London Tea Exchange offers one of the widest selection of single 
                estate premium tea’s from across the globe. Our unique tea
                collections are sourced directly from over forty different
                countries and includes some of the rarest teas in the world,
                many of which are exclusive to London Tea Exchange.
              </p>
            </div>
            <div className="overflow-hidden">
              <Image
                src="/images/about/about.png"
                alt="Brand showcase 3"
                width={500}
                height={500}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
