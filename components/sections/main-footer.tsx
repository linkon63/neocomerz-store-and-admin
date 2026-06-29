import Image from "next/image";
import Link from "next/link";
import { HiPhone, HiMail, HiLocationMarker } from "react-icons/hi";
import { MdOutlineArrowOutward } from "react-icons/md";

export default function Mainfooter() {
  const supportLinks = [
    { label: "Help Center", href: "/help" },
    { label: "Live chat", href: "/chat" },
    { label: "Check order status", href: "/order-status" },
    { label: "Refunds", href: "/refunds" },
    { label: "Report abuse", href: "/report" },
  ];

  const exploreLinks = [
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Best Sellers", href: "/best-sellers" },
    { label: "Assorted Collections", href: "/collections" },
    { label: "Tea Blends Collections", href: "/tea-blends" },
    { label: "Loose Leaf Tea", href: "/loose-leaf" },
    { label: "Elegant Gifts", href: "/gifts" },
    { label: "Sale Collections", href: "/sale" },
  ];

  const experienceLinks = [
    { label: "Our Story", href: "/story" },
    { label: "Product Philosophy", href: "/philosophy" },
    { label: "Global Presence", href: "/presence" },
    { label: "The Journal", href: "/journal" },
    { label: "Tea Rituals", href: "/rituals" },
    { label: "Private Gifting", href: "/private-gifting" },
  ];

  const philosophyIcons = [
    { src: "/images/footer/icons.svg", label: "Sovereign Seal" },
    { src: "/images/footer/icons-2.svg", label: "Grand Passage" },
    { src: "/images/footer/icons-3.svg", label: "Noble Balance" },
    { src: "/images/footer/icons-4.svg", label: "World Assembly" },
  ];

  return (
    <section className="w-full bg-olive-slate">
      <div className="mainfooter-wrapper"> 
        <div className="container mx-auto px-6 md:px-12 py-12 md:py-16">
          
          {/* Logo */}
          <div className="mb-8">
            <Image 
              src="/images/logo/Logo.png" 
              alt="London Tea Exchange Logo" 
              width={300} 
              height={80}
              className="h-12 w-auto"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            
            {/* About Us Section - 40% (2 cols out of 5) */}
            <div className="lg:col-span-2">
              <h3 className="font-['Bembo_Std'] font-medium text-white text-xl mb-4 uppercase tracking-wide flex items-center gap-1">
                ABOUT US
                <MdOutlineArrowOutward />
              </h3>

              <p className="font-['Bembo_Std'] text-lg leading-relaxed text-white mb-6">
                Rooted in the fertile landscapes of Sylhet, our teas travel beyond origin—carrying with them the character of place, time, and craft. Inspired by the legacy of global trade excellence shaped by the London Tea Exchange, we position every selection not as a commodity, but as a refined expression of origin.
              </p>

              {/* Philosophy Icons */}
              <div className="flex gap-3 md:gap-10 mb-6">
                {philosophyIcons.map((item, index) => (
                  <div key={index} className="flex flex-col items-center text-center">
                    <Image 
                      src={item.src} 
                      alt={item.label} 
                      width={32} 
                      height={32} 
                      className="w-8 h-8 object-contain mb-1" 
                    />
                    <p className="font-['Bembo_Std'] text-lg text-sage-gold leading-6">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-lg text-sage-gold font-normal">
                  <HiPhone className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="font-['Gotham'] font-normal">+8801339-879491</span>
                </div>
                <div className="flex items-center gap-2 text-lg text-sage-gold">
                  <HiMail className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="font-['Gotham']">store@londonteaexchange.com</span>
                </div>
                <div className="flex items-center gap-2 text-lg font-normal text-sage-gold">
                  <HiLocationMarker className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="font-['Gotham']">Pan Pacific Sonargaon, Dhaka- 107 Kazi Nazrul Islam Ave, Dhaka 1215, Bangladesh</span>
                </div>
              </div>
            </div>

            {/* Right Side - 3 Columns - 60% (3 cols out of 5) */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
              
              {/* Get Support Column */}
              <div>
              <h3 className="font-['Bembo_Std'] font-medium text-white text-lg mb-4 uppercase tracking-wide">
                GET SUPPORT
              </h3>
              <ul className="space-y-2">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="font-['Bembo_Std'] text-lg text-white hover:text-brand-3 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Explore Column */}
            <div>
              <h3 className="font-['Bembo_Std'] font-medium text-white text-lg mb-4 uppercase tracking-wide">
                EXPLORE
              </h3>
              <ul className="space-y-2">
                {exploreLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="font-['Bembo_Std'] text-lg text-white hover:text-brand-3 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Experience Column */}
            <div>
              <h3 className="font-['Bembo_Std'] font-medium text-white text-lg mb-4 uppercase tracking-wide">
                THE EXPERIENCE
              </h3>
              <ul className="space-y-2">
                {experienceLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="font-['Bembo_Std'] text-lg font-normal text-white hover:text-brand-3 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
