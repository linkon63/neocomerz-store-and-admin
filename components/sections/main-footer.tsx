import Image from "next/image";
import Link from "next/link";
import CollectionBanner from "./ui/collection-banner";

export default function Mainfooter() {
  const supportLinks = [
    { label: "Help Center", href: "/help" },
    { label: "Live chat", href: "/chat" },
    { label: "Check order status", href: "/order-status" },
    { label: "Refunds", href: "/refunds" },
    { label: "Report abuse", href: "/report" },
  ];

  const exploreLinks = [
    { label: "Sylheti Tea", href: "/sylheti-tea" },
    { label: "Gift Sets", href: "/gift-sets" },
    { label: "Best Sellers", href: "/best-sellers" },
    { label: "Loose Leaf Tea", href: "/collections" },
    { label: "New Arrivals", href: "/new-arrivals" },
  ];

  const experienceLinks = [
    { label: "Our Heritage", href: "/about" },
    { label: "Tea Houses", href: "/tea-houses" },
    { label: "Brewing Guide", href: "/brewing-guide" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Careers", href: "/careers" },
  ];

  return (
    <section className="w-full bg-gray-50 border-t border-gray-200">
      <div className="mainfooter-wrapper"> 
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Top Section - Contact Info & Logo */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gray-200">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 lg:gap-6">
            <div className="xl:col-span-2">
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
            <div className="xl:col-span-2">
              <h3 className="font-bembo font-medium text-text-primary text-sm mb-4 uppercase">
                EXPLORE
              </h3>
              <ul className="space-y-2">
                {exploreLinks.map((link) => (
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
            <div className="xl:col-span-2">
              <h3 className="font-bembo font-medium text-text-primary text-sm mb-4 uppercase">
                THE EXPERIENCE
              </h3>
              <ul className="space-y-2">
                {experienceLinks.map((link) => (
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
            {/* Decorative Image Section */}
            <div className="xl:col-span-6">
              <CollectionBanner />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
