import Image from "next/image";
import Link from "next/link";
import { IoArrowForward } from "react-icons/io5";

const giftItems = [
  {
    id: 1,
    title: "Assorted Collections",
    image: "/images/gift/item-1.png",
    href: "/products?category=Assorted+Collections",
  },
  {
    id: 2,
    title: "Tea Books Collections",
    image: "/images/gift/item-2.png",
    href: "/products?category=Tea+Books+Collections",
  },
  {
    id: 3,
    title: "Accessories",
    image: "/images/gift/item-3.png",
    href: "/products?category=Accessories",
  },
];


export default function GiftItem() {
  return (
    <section className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden bg-dark-charcoal">
      {/* Pattern Background Layer */}
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
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        {/* Title Section */}
        <div className="self-stretch flex flex-col justify-center items-center gap-3 overflow-hidden mb-12 md:mb-16">
          <h2 className="inline-flex justify-center flex-wrap items-center gap-1.5">
            <span className="text-white text-4xl md:text-5xl lg:text-6xl font-normal font-['Bembo_Std'] leading-tight lg:leading-[56px]">
              Gifting
            </span>
            <span className="text-white text-4xl md:text-5xl lg:text-6xl font-normal font-['Snell_Roundhand_LT_Std'] leading-tight lg:leading-[56px]">
              Items
            </span>
          </h2>
          <p className="max-w-[700px] text-center text-white text-base lg:text-lg font-normal font-['Bembo_Std'] leading-6 mx-auto">
            What better way to enjoy a warming cup of tea than when served with a beautiful tea gift set? Enjoy your tea with a Teabloom&apos;s tea gift set.
          </p>
        </div>

        {/* Gift Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 lg:gap-12 mb-8">
          {giftItems.map((item) => (
            <div
              key={item.id}
              className="relative flex flex-col items-center pb-20"
            >
              {/* Image Container */}
              <div 
                className="relative w-full max-w-sm aspect-4/5 overflow-hidden concave-corner-frame"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
              </div>

              {/* Red Circular Button - Exact match to reference image */}
              <Link
                href={item.href}
                className="absolute bottom-0 w-36 h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 bg-linear-[44deg] from-khaki-gold to-sage-gold rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-[0px_0px_40px_0px_rgba(0,0,0,0.40)] hover:scale-105 hover:shadow-[0px_0px_50px_0px_rgba(0,0,0,0.60)]"
              >
                <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0 -rotate-90">
                  <defs>
                    {/* Circular path for text */}
                    <path
                      id={`circlePath-${item.id}`}
                      d="M 100, 100 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"
                    />
                  </defs>
                  
                  {/* Curved Text around circle */}
                  <text 
                    fill="white" 
                    fontSize="22" 
                    fontFamily="'Bembo Std', Georgia, serif"
                    fontWeight="400"
                    letterSpacing="3.5"
                  >
                    <textPath href={`#circlePath-${item.id}`} startOffset="50%" textAnchor="middle">
                      {item.title}
                    </textPath>
                  </text>
                </svg>
                
                {/* Bottom Dashed Arc - concentric at radius 70, leaving space at sides to avoid text overlap */}
                <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0">
                  <path
                    d="M 50,149 A 70,70 0 0,0 150,149"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeDasharray="6 8"
                    strokeLinecap="round"
                    opacity="1"
                  />
                </svg>
                
                {/* Center Arrow Icon - Custom SVG Line Arrow */}
                <svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 md:w-12 md:h-12 relative z-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}