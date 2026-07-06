"use client";

import { useState } from "react";
import Link from "next/link";
import { LuPrinter } from "react-icons/lu";
import { FiInfo } from "react-icons/fi";
import type { OrderResult } from "@/lib/types";

export default function ConfirmationPage() {
  const [order] = useState<OrderResult | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("orderResult");
    if (stored) {
      try {
        return JSON.parse(stored) as OrderResult;
      } catch {
        return null;
      }
    }
    return null;
  });

  if (!order) {
    return (
      <main className="grow bg-white w-full min-h-screen flex items-center justify-center">
        <p className="text-stone-500">No order information found.</p>
      </main>
    );
  }

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <main className="grow bg-white w-full min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Main Thank You Message */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl lg:text-5xl text-stone-800 mb-4">
            Thanks For your Order
          </h1>
          <p className="font-sans text-stone-600 text-sm leading-relaxed">
            Thank you for your order! We&apos;re dedicated to providing you with the best
            service and hope you love your purchase.
          </p>
        </div>

        {/* Decorative Plus Sign Line */}
        <div className="flex items-center justify-center gap-1 my-8">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="text-stone-200 text-xs">+</span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/products"
            className="w-full sm:w-auto px-10 py-3.5 bg-[#D31F3A] text-white font-sans text-sm font-semibold uppercase tracking-wider rounded-full hover:bg-[#B91A32] transition-colors cursor-pointer"
          >
            CONTINUE SHOPPING
          </Link>
          <button
            onClick={handlePrintInvoice}
            className="w-full sm:w-auto px-10 py-3.5 bg-white border-2 border-stone-200 text-stone-700 font-sans text-sm font-semibold uppercase tracking-wider rounded-full hover:border-stone-300 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LuPrinter className="w-4 h-4" />
            PRINT INVOICE
          </button>
        </div>

        {/* Bottom Links */}
        <div className="flex flex-col items-center justify-center gap-3 text-sm mt-8">
          <Link
            href="#"
            className="text-stone-500 hover:text-stone-700 transition-colors text-sm font-medium"
          >
            Cancel Order
          </Link>
          <Link
            href="/cancellation-policy"
            className="text-stone-500 hover:text-stone-700 transition-colors text-sm font-medium flex items-center gap-1"
          >
            <FiInfo className="w-3.5 h-3.5" />
            Checkout cancellation policy
          </Link>
        </div>
      </div>
    </main>
  );
}
