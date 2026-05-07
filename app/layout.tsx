import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeoComerz | Demo Ecommerce Landing Page",
  description: "A demo ecommerce landing page with fake products and sections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
