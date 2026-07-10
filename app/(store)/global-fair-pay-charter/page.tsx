import type { Metadata } from "next";
import GlobalFairPayCharter from "@/components/sections/global-fair-pay/global-fair-pay-charter";

export const metadata: Metadata = {
  title: "Global Fair Pay Charter | London Tea Exchange",
  description:
    "London Tea Exchange's Global Fair Pay Charter — formally recognised by the United Nations in partnership with UNITAR. Committing to fair wages, ethical sourcing, and sustainable supply chains across 43+ countries.",
  keywords: [
    "Global Fair Pay Charter",
    "London Tea Exchange",
    "UNITAR",
    "United Nations",
    "ethical tea",
    "fair trade",
    "sustainable sourcing",
  ],
};

export default function GlobalFairPayCharterPage() {
  return <GlobalFairPayCharter />;
}
