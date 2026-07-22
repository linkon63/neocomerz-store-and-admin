import Button from "./button";

export default function WeOffer() {
  return (
    <section 
      className="relative w-full min-h-[450px] md:min-h-[550px] bg-cover bg-center flex items-center py-12 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24"
      style={{ backgroundImage: "url('/images/offer/offer.png')" }}
    >
      <div className="relative z-10 mx-auto w-full max-w-[1200px] bg-white border-2 border-double border-[#b9975b]/60 md:border-none md:bg-[url('/images/offer/G.svg')] md:bg-[size:100%_100%] md:bg-no-repeat p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20 shadow-sm rounded-lg">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="text-center lg:text-left flex flex-col justify-center">
            <h2 className="font-['Bembo_Std'] text-2xl sm:text-3xl md:text-4xl text-[#b9975b] leading-none mb-4 md:mb-6">
              We <span className="font-['Snell_Roundhand_LT_Std'] italic capitalize ml-1 text-3xl sm:text-4xl md:text-5xl">Offer</span>
            </h2>
            
            <h3 className="font-['Bembo_Std'] text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[46px] leading-[1.3] text-[#231f20] font-normal tracking-wide">
              825 Types <span className="font-['Snell_Roundhand_LT_Std'] italic text-zinc-500 lowercase text-[1.1em] pl-1 whitespace-nowrap">of rare and</span>
              <br className="hidden lg:block" />
              <span className="font-['Snell_Roundhand_LT_Std'] italic text-zinc-500 lowercase text-[1.1em] pr-1.5 whitespace-nowrap">premium teas from</span> 43
              <br className="hidden lg:block" />
              Countries
            </h3>
          </div>

          <div className="flex flex-col gap-6 justify-center">
            <p className="font-['Bembo_Std'] text-sm sm:text-base md:text-lg text-zinc-700 font-normal leading-relaxed">
              <span className="font-['Snell_Roundhand_LT_Std'] italic text-zinc-950 font-semibold text-2xl pr-1">Our philosophy</span> and attitude is founded on the need for continuous improvement, 
              whilst satisfying our own passion for achieving excellence. Our vision is to create 
              luxury tea stores with unrivalled attention to detail with a traditional and vibrant 
              environment, where high quality premium teas can be found and clients can receive 
              the ultimate hospitality experience.
            </p>
            <div className="mt-2 flex justify-center lg:justify-start">
              <Button 
                href="/products" 
                label="EXPLORE TEAS"
                variant="primary"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
