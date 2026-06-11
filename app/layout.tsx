import type { Metadata } from "next";
import StorefrontChrome from "./_components/storefront-chrome";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: process.env.SHOP_NAME || "Home",
  description: process.env.SHOP_DESCRIPTION || "Welcome to our store, where quality meets style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <StorefrontChrome>{children}</StorefrontChrome>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
