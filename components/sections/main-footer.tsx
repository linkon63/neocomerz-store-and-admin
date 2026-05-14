import Image from "next/image";
import Link from "next/link";

export default function Mainfooter() {
  const supportLinks = [
    { label: "Help Center", href: "/help" },
    { label: "Live chat", href: "/chat" },
    { label: "Check order status", href: "/order-status" },
    { label: "Refunds", href: "/refunds" },
    { label: "Report abuse", href: "/report" },
  ];

  const paymentLinks = [
    { label: "Sales tax and VAT", href: "/tax" },
    { label: "Safe and easy payments", href: "/payments" },
    { label: "Money-back policy", href: "/money-back" },
    { label: "On-time shipment", href: "/shipment" },
    { label: "After-sales protections", href: "/protections" },
    { label: "Product monitoring services", href: "/monitoring" },
  ];

  const knowUsLinks = [
    { label: "About Us", href: "/about" },
    { label: "Corporate Responsibility", href: "/responsibility" },
    { label: "Citizenship Program", href: "/citizenship" },
    { label: "News Center", href: "/news" },
    { label: "Careers", href: "/careers" },
  ];

  return (
    <section className="w-full bg-gray-50 border-t border-gray-200">
      <div className="mainfooter-wrapper"> 
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Top Section - Contact Info & Logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="font-gotham">close@londonteaexchange.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="font-gotham">Pan Pacific Sonargaon, Dhaka- 107 Kazi Nazrul Islam Ave, Dhaka 1215, Bangladesh</span>
              </div>
            </div>
            <div className="shrink-0">
              <Image 
                src="/images/logo/Logo.png" 
                alt="London Tea Exchange Logo" 
                width={200} 
                height={50}
                className="h-10 sm:h-12 w-auto"
              />
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* GET SUPPORT Column */}
            <div className="lg:col-span-2">
              <h3 className="font-bembo font-medium text-text-primary text-sm mb-4 uppercase">
                GET SUPPORT
              </h3>
              <ul className="space-y-2">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="font-bembo text-sm text-text-primary hover:text-brand-3 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* PAYMENTS AND PROTECTION Column */}
            <div className="lg:col-span-2">
              <h3 className="font-bembo font-medium text-text-primary text-sm mb-4 uppercase">
                PAYMENTS AND PROTECTION
              </h3>
              <ul className="space-y-2">
                {paymentLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="font-bembo text-sm text-text-primary hover:text-brand-3 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* GET TO KNOW US Column */}
            <div className="lg:col-span-2">
              <h3 className="font-bembo font-medium text-text-primary text-sm mb-4 uppercase">
                GET TO KNOW US
              </h3>
              <ul className="space-y-2">
                {knowUsLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="font-bembo text-sm text-text-primary hover:text-brand-3 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* THE COLLECTIONS Column - Larger */}
            <div className="lg:col-span-6">
              {/* Collection Image with Overlay Content */}
              <div className="relative w-full h-96 not-first:overflow-hidden shadow-xl">
                {/* Background Image */}
                <Image 
                  src="/images/footer/footerright.png" 
                  alt="Tea Collections" 
                  fill
                  className="object-cover"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/50"></div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col">
                  {/* Top Section - Heading */}
                  <div className="flex justify-center pt-8">
                    <h3 className="font-bembo text-white text-lg uppercase tracking-widest">
                      THE COLLECTIONS
                    </h3>
                  </div>

                  {/* Middle Section - Buttons */}
                  <div className="flex justify-between items-center py-3">
                    {/* Assorted Collections Button */}
                    <Link 
                      href="/collections/assorted"
                      className="flex bg-brand-primary text-white text-center  hover:bg-brand-3 py-4 px-6 font-bembo text-base uppercase tracking-wide hover:bg-opacity-90 transition-all"
                    >
                      ASSORTED COLLECTIONS
                    </Link>

                    {/* Decorative Logo/Icon */}
                    <div className="w-16 h-16 flex items-center justify-center relative">
                      <Image 
                        src="/images/footer/footerrightlogo.png" 
                        alt="London Tea Exchange Logo" 
                        width={64} 
                        height={64}
                        className="object-contain"
                      />
                    </div>

                    {/* Tea Book Collections Button */}
                    <Link 
                      href="/collections/tea-book"
                      className="flex bg-white text-text-primary text-center py-4 px-6 font-bembo text-base uppercase tracking-wide hover:bg-brand-3 hover:text-white transition-all"
                    >
                      TEA BOOK COLLECTIONS
                    </Link>
                  </div>

                  {/* Bottom Section - Description */}
                  <div className="pb-8 px-6">
                    <p className="text-white text-center text-sm font-bembo leading-relaxed max-w-3xl mx-auto">
                      Elegant tea bag presentations featuring rare blends, royal infusions, wellness selections, and timeless classics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
