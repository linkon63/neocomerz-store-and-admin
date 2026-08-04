import Image from "next/image";

export default function TheBrands() {
  return (
    <section className="w-full bg-[#F6F6F6] py-16 px-6 md:px-12 lg:py-44"  style={{
          clipPath: "ellipse(95% 100% at 50% 0%)",
        }}>
      <div className="thebrands-wrapper">
        <div className="container mx-auto px-3">
          {/* Top Section - The Brand */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Side - Text Content */}
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl">
                <span className="font-['Snell_Roundhand_LT_Std'] font-medium text-brand-primary">The </span>
                <span className="font-['Snell_Roundhand_LT_Std'] italic text-brand-primary">Brand</span>
              </h2>
              
              <p className="mt-6 font-['Bembo_Std'] text-lg font-normal leading-6">
                London Tea Exchange succeeds <span className="italic">one of the oldest companies in the United Kingdom</span>. For over 
                two decades, the brand has evolved and carved an enviable niche in the international luxury tea 
                market. For it is here that luxury is experienced through the richness of purity and authenticity, 
                discovered in the beauty of artistry and delivered with an intuitive response to personal 
                expectation and taste.
              </p>
              
              <p className="mt-4 font-['Bembo_Std'] text-lg font-normal">
                No one delivers that kind of tea experience quite like London Tea Exchange.
              </p>

              {/* Two Small Images with Our Promise */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="overflow-hidden">
                  <Image
                    src="/images/brands/images-1.png"
                    alt="Brand showcase 1"
                    width={340}
                    height={400}
                    className=" object-contain"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="overflow-hidden">
                    <Image
                      src="/images/brands/images-2.png"
                      alt="Brand showcase 2"
                      width={292}
                      height={364}
                      className="object-contain"
                    />
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl">
                    <span className="font-['Bembo_Std'] font-medium text-brand-primary">Our </span>
                    <span className="font-['Snell_Roundhand_LT_Std'] italic text-olive-slate">Promise</span>
                  </h2>
                </div>
              </div>
            </div>

            {/* Right Side - Large Image */}
            <div className="overflow-hidden">
              <Image
                src="/images/brands/images-3.png"
                alt="Brand showcase 3"
                width={600}
                height={800}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <p className="font-['Bembo_Std'] text-lg font-normal leading-6">
                London Tea Exchange presents an exceptional prospect to build on the brand and succeed in 
                maintaining a global presence. Serving an untapped market for luxury tea, London Tea Exchange will 
                dominate the competitive landscape with a cost-efficient model that offers a 
                healthy return to partners.
              </p>
            </div>
            <div>
              <p className="font-['Bembo_Std'] text-lg font-normal leading-6">
                London Tea Exchange offers a kind of luxury and depth of flavours and rarity; where 
                less is more; simplicity speaks volumes and classic will have the choice they need or 
                desire. The brand has tremendous momentum as it expands into major gateway cities, 
                fashion districts and affluent neighbourhoods around the world. Uniquely throughout the world. 
                For not only is London Tea Exchange poised for phenomenal growth and 
                opportunity; it is poised for greatness and distinction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
