import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const bembo = localFont({
  src: [
    {
      path: "./fonts/Bembo-Std-Font/BemboStd.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Bembo-Std-Font/BemboStd-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Bembo-Std-Font/BemboStd-SemiboldItalic.otf",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-bembo",
});

const snell = localFont({
  src: [
    {
      path: "./fonts/Snell-Roundhand/Snell Roundhand Script.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Snell-Roundhand/Snell Roundhand Bold Script.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-snell",
});

const gotham = localFont({
  src: [
    {
      path: "./fonts/Gotham/Gotham-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/Gotham/Gotham-Medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-gotham",
});

export const metadata: Metadata = {
  title: "London Tea Exchange",
  description: "London Tea Exchange offers an exquisite selection of single estate premium teas and unique tea collections sourced from across the globe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${bembo.variable} ${snell.variable} ${gotham.variable}`}>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
