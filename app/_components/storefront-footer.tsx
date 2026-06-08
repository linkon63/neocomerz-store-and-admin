import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

const footerGroups = [
  {
    title: "Customer Service",
    links: [
      { label: "FAQ", href: "#" },
      { label: "Terms & Conditions", href: "#" },
      { label: "Terms & Conditions Store", href: "#" },
      { label: "Shipping & Delivery", href: "#" },
      { label: "Login", href: "/profile" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Who We Are",
    links: [
      { label: "Who We Are", href: "#" },
      { label: "Contacts", href: "#" },
      { label: "Our Stores", href: "#" },
      { label: "Institutional Blog", href: "#" },
    ],
  },
  {
    title: "More Information",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Info and Returns", href: "#" },
      { label: "Refunds", href: "#" },
    ],
  },
];

const paymentMethods = ["VISA", "PayPal", "stripe", "VeriSign"];

export default function StorefrontFooter() {
  return (
    <footer className="bg-white px-4 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1.2fr_1fr]">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-bold uppercase tracking-[0.02em] text-neutral-900">
                {group.title}
              </h2>
              <ul className="mt-5 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium uppercase leading-5 text-neutral-400 transition hover:text-neutral-900 sm:text-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.02em] text-neutral-900">
              Social Media
            </h2>
            <div className="mt-5 flex gap-3">
              <Link
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-900 transition hover:border-neutral-900"
                aria-label="Facebook"
              >
                <FaFacebookF className="text-sm" />
              </Link>
              <Link
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-900 transition hover:border-neutral-900"
                aria-label="Instagram"
              >
                <FaInstagram className="text-base" />
              </Link>
            </div>

            <h2 className="mt-9 text-sm font-bold uppercase tracking-[0.02em] text-neutral-900">
              Payment Methods
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="inline-flex h-8 items-center rounded bg-neutral-800 px-3 text-sm font-black text-white"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-300 pt-10 text-xs font-medium text-neutral-400">
          © 2026 Humana Vintage Italia | Powered by LikeYou Srl .
        </div>
      </div>
    </footer>
  );
}
