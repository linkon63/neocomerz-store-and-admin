import TopHeader from '@/components/sections/top-header';
import Header from '@/components/sections/header';
import Mainfooter from '@/components/sections/main-footer';
import Bottomfooter from '@/components/sections/bottom-footer';
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
      <CartProvider>
        <WishlistProvider>
          <TopHeader />
          <Header />
          {children}
          <Mainfooter />
          <Bottomfooter />
          <AuthModal />
          <Toaster richColors closeButton position="top-right" />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
