import Link from "next/link";
import Image from "next/image";
import HeaderActions from "./ui/header-actions";
import MobileMenu from "./ui/mobile-menu";
import Navigation from "./ui/navigation";

const sylhetiTeaItems = [
  { label: "Black Tea", href: "/sylheti-tea/black-tea" },
  { label: "Green Tea", href: "/sylheti-tea/green-tea" },
  { label: "Organic Collection", href: "/sylheti-tea/organic-collection" },
  { label: "Signature Collection", href: "/sylheti-tea/signature-collection" },
];

const navItems = [
  { label: "SYLHETI TEA", href: "/sylheti-tea", hasDropdown: true },
  { label: "GIFT SETS", href: "/gift-sets" },
  { label: "BEST SELLERS", href: "/best-sellers" },
  { label: "ABOUT US", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200 fixed top-[44px] sm:top-[32px] left-0 right-0 z-50">
      <div className="header-wrapper">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4 gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo/Logo.png"
                alt="London Tea Exchange Logo"
                width={150}
                height={40}
                className="h-8 sm:h-10 w-auto"
              />
            </Link>

            {/* Navigation */}
            <Navigation />

            {/* Client Components */}
            <div className="flex items-center gap-3 sm:gap-4">
              <HeaderActions />
              <MobileMenu
                navItems={navItems}
                sylhetiTeaItems={sylhetiTeaItems}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}