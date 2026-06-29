import Image from "next/image";
import Link from "next/link";
import { IoArrowForward } from "react-icons/io5";

const giftItems = [
  {
    id: 1,
    title: "Assorted Collections",
    image: "/images/gift/item-1.png",
    href: "/products/assorted-collections",
  },
  {
    id: 2,
    title: "Tea Books Collections",
    image: "/images/gift/item-2.png",
    href: "/products/tea-books",
  },
  {
    id: 3,
    title: "Accessories",
    image: "/images/gift/item-3.png",
    href: "/products/accessories",
  },
];

export default function GiftItem() {
  return (
    <section className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden bg-dark-charcoal">
      {/* Pattern Background Layer */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        {/* Title Section */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-['Bembo_Std'] text-4xl md:text-5xl lg:text-6xl mb-4">
            <span className="text-white">Gifting </span>
            <span className="italic text-white">Items</span>
          </h2>
          <p className="font-gotham text-sm md:text-base text-white max-w-3xl mx-auto leading-relaxed">
            From executive gifting to bespoke corporate collections, we create refined tea presentations<br className="hidden sm:block" />
            tailored for hotels, boardrooms, private events, and premium clientele.
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
                className="relative w-full max-w-sm aspect-4/5 overflow-hidden"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
              </div>

              {/* Red Circular Button - Exact match to reference image */}
              <Link
                href={item.href}
                className="absolute bottom-0 w-36 h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 bg-khaki-gold rounded-full flex items-center justify-center text-white hover:bg-[#C62828] transition-all duration-300 shadow-2xl hover:scale-105"
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
                    fontSize="24" 
                    fontFamily="Georgia, serif"
                    fontWeight="400"
                    letterSpacing="2"
                  >
                    <textPath href={`#circlePath-${item.id}`} startOffset="50%" textAnchor="middle">
                      {item.title}
                    </textPath>
                  </text>
                </svg>
                
                {/* Bottom Dashed Semicircle */}
                <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0">
                  <path
                    d="M 50,135 A 70,70 0 0,0 150,135"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeDasharray="12 12"
                    strokeLinecap="round"
                    opacity="1"
                  />
                </svg>
                
                {/* Center Arrow Icon - React Icons */}
                <IoArrowForward className="w-8 h-8 md:w-14 md:h-14 relative z-10 text-white" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}