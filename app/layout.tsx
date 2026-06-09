import type { Metadata } from "next";
import StorefrontChrome from "./_components/storefront-chrome";
import "./globals.css";
import { Toaster } from "sonner";

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
        <StorefrontChrome>{children}</StorefrontChrome>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
