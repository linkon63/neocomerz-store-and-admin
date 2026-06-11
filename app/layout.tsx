import type { Metadata } from "next";
import "./globals.css";
import TopHeader from '@/components/sections/top-header';
import Header from '@/components/sections/header';
import Mainfooter from '@/components/sections/main-footer';
import Bottomfooter from '@/components/sections/bottom-footer';

export const metadata: Metadata = {
  title: "London Tea Exchange",
  description: "A heritage of rare tea, refined through craftsmanship, purity, and timeless elegance.",
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
      </body>
    </html>
  );
}
