import Link from "next/link";
import type { ButtonProps } from "@/data/types";

export default function Button({ 
  href, 
  label = "DISCOVER MORE",
  variant = "primary" 
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-brand-primary text-white hover:bg-brand-4",
    secondary: "bg-black text-white hover:bg-opacity-90",
    outline: "bg-transparent text-[#B9975B] border-2 border-[#B9975B] hover:bg-[#B9975B] hover:text-white",
  };

  return (
    <div className="flex justify-center pt-6 md:pt-12">
      <Link
        href={href}
        className={`${variantStyles[variant]} font-gotham text-xs sm:text-sm uppercase tracking-wider px-8 py-3 rounded-full transition-colors`}
      >
        {label}
      </Link>
    </div>
  );
}
