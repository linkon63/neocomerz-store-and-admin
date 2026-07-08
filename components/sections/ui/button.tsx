import Link from "next/link";
import type { ButtonProps } from "@/data/types";
 
export default function Button({ 
  href, 
  label = "DISCOVER MORE",
  variant = "primary" 
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-khaki-gold text-white hover:bg-brand-4",
    secondary: "bg-black text-white hover:bg-opacity-90",
    outline: "bg-transparent text-stone-gray border-2 border-[#B9975B] hover:bg-[#B9975B] hover:text-white",
  };
 
  return (
    <div className="flex justify-center">
      <Link
        href={href}
        className={`${variantStyles[variant]} font-gotham text-xs sm:text-sm uppercase tracking-wider px-8 py-3 rounded-[100px] transition-colors`}
      >
        {label}
      </Link>
    </div>
  );
}
