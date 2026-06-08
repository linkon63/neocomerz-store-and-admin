import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
