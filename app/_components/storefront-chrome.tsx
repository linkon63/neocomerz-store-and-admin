"use client";

import { usePathname } from "next/navigation";
import { CurrencyProvider } from "../../lib/currency-context";
import StorefrontFooter from "./storefront-footer";
import StorefrontHeader from "./storefront-header";

export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <CurrencyProvider>{children}</CurrencyProvider>;
  }

  return (
    <CurrencyProvider>
      <StorefrontHeader />
      {children}
      <StorefrontFooter />
    </CurrencyProvider>
  );
}
