import Link from "next/link";
import type { ButtonProps } from "@/data/types";

/**
 * LTE Store CTA Button
 *
 * Spec:
 *   padding  : px-6 py-5
 *   radius   : rounded-[100px]  (capsule)
 *   primary  : bg-gradient-to-r from-[#C5A880] to-[#A89F91]
 *   text     : Gotham · text-base · medium · uppercase · tracking-wider
 */
export default function Button({
  href,
  label   = "DISCOVER MORE",
  variant = "primary",
  size    = "lg",
}: ButtonProps) {
  const sizes = {
    sm: "px-4 py-3 text-xs md:px-5 md:py-4 md:text-sm lg:px-6 lg:py-5 lg:text-base",
    lg: "px-6 py-5 text-base",
  };

  const base = `inline-flex items-center justify-center gap-2 font-gotham font-medium uppercase tracking-wider rounded-[100px] transition-all duration-200 active:scale-[0.98] ${sizes[size]}`;

  const variants: Record<string, string> = {
    // spec primary: gold gradient
    primary:
      "bg-gradient-to-r from-[#C5A880] to-[#A89F91] text-white hover:opacity-90 shadow-sm",
    // dark solid
    secondary:
      "bg-[#1A1A1A] text-white hover:bg-stone-800 shadow-sm",
    // bordered outline
    outline:
      "bg-transparent text-[#83847e] border-2 border-[#b4a676] hover:bg-[#b4a676] hover:text-white",
  };

  return (
    <div className="flex justify-center">
      <Link href={href} className={`${base} ${variants[variant] ?? variants.primary}`}>
        {label}
      </Link>
    </div>
  );
}
