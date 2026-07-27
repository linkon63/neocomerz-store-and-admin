import Link from "next/link";
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

  return (
    <div className="pt-6 border-t border-white/20">
      <div className="flex flex-col gap-4">
        {/* Links & Location Row */}
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

          {/* Static Shop Location */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-white">
            <IoLocationOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            <span className="font-['Gotham'] text-white text-[11px] sm:text-xs">
              Pan Pacific Sonargaon
            </span>
          </div>
        </div>

        {/* Copyright Row */}
        <div className="text-center">
          <p className="font-['Gotham'] text-white text-xs">
            © {new Date().getFullYear()} London Tea Exchange. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
