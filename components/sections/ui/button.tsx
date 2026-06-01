import Link from "next/link";
import type { ButtonProps } from "@/data/types";

export default function Button({ 
  href, 
  label = "DISCOVER MORE",
  variant = "primary" 
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-text-primary text-white hover:bg-brand-3",
    secondary: "bg-brand-3 text-white hover:bg-opacity-90",
    outline: "bg-transparent text-text-primary border-2 border-text-primary hover:bg-text-primary hover:text-white",
  };

  return (
    <div className="flex justify-center mt-8 md:mt-12">
      <Link
        href={href}
        className={`${variantStyles[variant]} font-gotham text-xs sm:text-sm uppercase tracking-wider px-8 py-3 rounded-full transition-colors`}
      >
        {label}
      </Link>
    </div>
  );
}
