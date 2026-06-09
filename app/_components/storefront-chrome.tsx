"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import { WishlistProvider } from "./wishlist-context";
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
      <WishlistProvider>
        <CartProvider>
          <div
            className="relative z-10 bg-white shadow-2xl" 
            style={{ marginBottom: `450px` }}
          >
            <StorefrontHeader />
            {children}
            <StorefrontFooter />
          </div>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
