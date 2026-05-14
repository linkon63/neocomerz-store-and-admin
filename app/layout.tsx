import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
