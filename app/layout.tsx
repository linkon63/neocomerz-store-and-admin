import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mango Express Naogaon | প্রিমিয়াম নওগাঁর আম — বাগান থেকে সরাসরি",
  description:
    "নওগাঁর সেরা প্রিমিয়াম আম — ল্যাংড়া, ফজলি, হিমসাগর, গোপালভোগ। হাতে বাছাই করা, গুণগত মান যাচাই করা আম সরাসরি বিশ্বস্ত বাগান থেকে আপনার দোরগোড়ায়। Mango Express Naogaon — Premium farm-to-home mango delivery from Naogaon, Bangladesh.",
  keywords: [
    "নওগাঁর আম",
    "প্রিমিয়াম আম",
    "ল্যাংড়া আম",
    "ফজলি আম",
    "হিমসাগর আম",
    "Naogaon mango",
    "mango delivery Bangladesh",
    "Mango Express",
    "farm to home mango",
  ],
  openGraph: {
    title: "Mango Express Naogaon | প্রিমিয়াম নওগাঁর আম",
    description:
      "নওগাঁর সেরা প্রিমিয়াম আম সরাসরি বাগান থেকে আপনার ঘরে। তাজা, সুস্বাদু, এবং গুণগত মান নিশ্চিত।",
    type: "website",
    locale: "bn_BD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
