import type { Metadata } from "next";
import StorefrontChrome from "./_components/storefront-chrome";
import "./globals.css";
import TopHeader from '@/components/sections/top-header';
import Header from '@/components/sections/header';
import Mainfooter from '@/components/sections/main-footer';
import Bottomfooter from '@/components/sections/bottom-footer';

export const metadata: Metadata = {
  title: "Humana Vintage",
  description: "A vintage fashion storefront with curated archive pieces and everyday streetwear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <TopHeader />
        <Header />
        {children}
        <Mainfooter />
        <Bottomfooter />
        <StorefrontChrome>{children}</StorefrontChrome>
      </body>
    </html>
  );
}
