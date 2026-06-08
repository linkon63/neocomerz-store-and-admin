"use client";

import { usePathname } from "next/navigation";
import StorefrontFooter from "./storefront-footer";
import StorefrontHeader from "./storefront-header";

export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return children;
  }

  return (
    <>
      <StorefrontHeader />
      {children}
      <StorefrontFooter />
    </>
  );
}
