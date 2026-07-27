import TopHeader from '@/components/sections/top-header';
import Header from '@/components/sections/header';
import Mainfooter from '@/components/sections/main-footer';
import Bottomfooter from '@/components/sections/bottom-footer';
import { AuthProvider } from "../_providers/auth-provider";
import { CartProvider } from "../_providers/cart-provider";
import { WishlistProvider } from "../_providers/wishlist-provider";
import AuthModal from "@/components/auth-modal";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
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
    </GoogleOAuthProvider>
  );
}
