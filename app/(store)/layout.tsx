import TopHeader from '@/components/sections/top-header';
import Header from '@/components/sections/header';
import Mainfooter from '@/components/sections/main-footer';
import Bottomfooter from '@/components/sections/bottom-footer';
import { AuthProvider } from "../_providers/auth-provider";
import AuthModal from "@/components/auth-modal";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <TopHeader />
      <Header />
      {children}
      <Mainfooter />
      <Bottomfooter />
      <AuthModal />
    </AuthProvider>
  );
}
