import { Suspense } from 'react';
import TopHeader from '@/components/sections/top-header';
import Header from '@/components/sections/header';
import Mainfooter from '@/components/sections/main-footer';
import Bottomfooter from '@/components/sections/bottom-footer';
import ScrollAnimate from '@/components/ui/scroll-animate';
import { AuthProvider } from "../_providers/auth-provider";
import { CartProvider } from "../_providers/cart-provider";
import { WishlistProvider } from "../_providers/wishlist-provider";
import AuthModal from "@/components/auth-modal";
import { Toaster } from "sonner";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <TopHeader />
          <Suspense fallback={<div className="h-16 bg-olive-slate animate-pulse w-full" />}>
            <Header />
          </Suspense>
          {children}
          <ScrollAnimate variant="fade-in-up" className="reveal-footer">
            <Mainfooter />
          </ScrollAnimate>
          <ScrollAnimate variant="fade-in-up" className="reveal-bottom-footer">
            <Bottomfooter />
          </ScrollAnimate>
          <AuthModal />
          <Toaster richColors closeButton position="top-right" />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
