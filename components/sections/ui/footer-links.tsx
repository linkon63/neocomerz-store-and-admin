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
    <div className="pt-6 border-t border-white/20">
      <div className="flex flex-col gap-4">
        {/* Links & Selectors Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex"></div>
          {/* Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {footerLinks.map((link, index) => (
              <span key={index} className="flex items-center gap-2">
                <Link
                  href={link.href}
                  className="font-['Gotham'] text-white text-xs hover:text-brand-3 transition-colors"
                >
                  {link.label}
                </Link>
                {index < footerLinks.length - 1 && (
                  <span className="text-white text-xs">·</span>
                )}
              </span>
            ))}
          </div>

          {/* Language & Currency Selectors */}
          <div className="flex items-center justify-between gap-3">
            <IoLocationOutline className="w-4 h-4 text-white" />
            <div className="flex"></div>
            {/* Language Selector */}
            <div className="flex items-center gap-0.5">
              <select
                className="bg-transparent text-white border-none outline-none cursor-pointer font-['Gotham'] text-xs appearance-none pr-0.5"
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
              <IoIosArrowDown className="w-3 h-3 text-white" />
            </div>
            
            {/* Currency Selector */}
            <div className="flex items-center gap-0.5">
              <select
                className="bg-transparent text-white border-none outline-none cursor-pointer font-['Gotham'] text-xs appearance-none pr-0.5"
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
              <IoIosArrowDown className="w-3 h-3 text-white" />
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
