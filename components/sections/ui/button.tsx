import Link from "next/link";
import type { ButtonProps } from "@/data/types";

export default function Button({ 
  href, 
  label = "DISCOVER MORE",
  variant = "primary" 
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-brand-primary text-white hover:bg-brand-4",
    secondary: "bg-text-secondary text-white hover:bg-opacity-90",
    outline: "bg-transparent text-white border-2 border-white hover:bg-white hover:text-black",
  };

  return (
    <div className="flex">
      <Link
        href={href}
        className={`${variantStyles[variant]} font-gotham text-xs sm:text-sm uppercase tracking-wider px-8 py-3 rounded-full transition-colors`}
      >
        {label}
      </Link>
    </div>
  );
}
