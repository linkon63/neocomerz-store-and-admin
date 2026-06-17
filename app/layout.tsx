import type { Metadata } from "next";
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
  // `lang` defaults to the storefront default locale; the locale layout syncs
  // it to the active locale (en/it). Admin routes keep this default.
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
