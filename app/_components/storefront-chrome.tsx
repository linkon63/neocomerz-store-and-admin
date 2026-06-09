"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import StorefrontFooter from "./storefront-footer";
import StorefrontHeader from "./storefront-header";

export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return children;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <StorefrontHeader />
        {children}
        <StorefrontFooter />
      </CartProvider>
    </AuthProvider>
  );
}
