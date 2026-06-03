import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { IoLocationOutline } from "react-icons/io5";

export default function FooterLinks() {
  const footerLinks = [
    { label: "Policies and rules", href: "/policies" },
    { label: "Legal Notice", href: "/legal" },
    { label: "Product Listing Policy", href: "/product-policy" },
    { label: "Intellectual Property Protection", href: "/ip-protection" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Integrity Compliance", href: "/compliance" },
  ];

  const selectors = {
    language: {
      default: "en",
      options: [
        { value: "en", label: "EN" },
        { value: "bn", label: "BN" },
      ],
    },
    currency: {
      default: "bd",
      options: [
        { value: "bd", label: "BD" },
        { value: "usd", label: "USD" },
      ],
    },
  };

  return (
    <div className="bg-brand-5 py-4">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row sm:items-center gap-4 justify-between">
          {/* Links */}
          <div className="flex"></div>
          <div className="flex flex-wrap gap-4">
            {footerLinks.map((link, index) => (
              <span key={index} className="flex items-center gap-4">
                <Link
                  href={link.href}
                  className="font-gotham text-white text-xs hover:text-brand-3 transition-colors"
                >
                  {link.label}
                </Link>
                {index < footerLinks.length - 1 && (
                  <span className="text-white text-xs">·</span>
                )}
              </span>
            ))}
          </div>

          {/* Language */}
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white">
              {/* Location Icon */}
              <IoLocationOutline className="w-3 h-3 sm:w-4 sm:h-4 hidden sm:inline" />
              
              {/* Language Selector */}
              <div className="flex items-center gap-0.5">
                <select
                  className="bg-transparent text-white border-none outline-none cursor-pointer font-gotham text-xs sm:text-sm appearance-none pr-0.5"
                  defaultValue={selectors.language.default}
                >
                  {selectors.language.options.map((option: { value: string; label: string }) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="text-black bg-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <IoIosArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </div>
              
              {/* Currency Selector */}
              <div className="flex items-center gap-0.5">
                <select
                  className="bg-transparent text-white border-none outline-none cursor-pointer font-gotham text-xs sm:text-sm appearance-none pr-0.5"
                  defaultValue={selectors.currency.default}
                >
                  {selectors.currency.options.map((option: { value: string; label: string }) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="text-black bg-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <IoIosArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </div>
            </div>
          </div>
        </div>
        <div className="copyright text-center mt-4">
          <p className="font-gotham text-white text-xs">
            © 2026 London Tea Exchange. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
