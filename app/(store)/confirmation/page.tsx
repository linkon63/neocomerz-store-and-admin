"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/lib/currency-context";
import { LuCheck } from "react-icons/lu";
import type { OrderResult } from "@/lib/types";

export default function ConfirmationPage() {
  const { formatCurrency } = useCurrency();
  const [order, setOrder] = useState<OrderResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("orderResult");
    if (stored) {
      try {
        setOrder(JSON.parse(stored) as OrderResult);
      } catch {
        // ignore parse error
      }
    }
  }, []);

  if (!order) {
    return (
      <main className="flex-grow bg-white w-full min-h-screen flex items-center justify-center">
        <p className="text-stone-500">No order information found.</p>
      </main>
    );
  }

  return (
    <main className="flex-grow bg-white w-full min-h-screen">
      <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <LuCheck className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="mt-6 font-bembo text-3xl text-stone-800">Order Confirmed</h1>
        <p className="mt-2 text-stone-500 text-sm">
          Thank you for your order! A confirmation email will be sent shortly.
        </p>

        <div className="mt-8 border border-stone-200 rounded-lg p-6 text-left">
          <div className="text-sm text-stone-500">
            <span className="font-semibold text-stone-800">Order Number:</span>{" "}
            {order.orderNumber}
          </div>

          <div className="mt-4 space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-12 h-12 relative bg-stone-50 rounded">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-stone-800 truncate">{item.name}</p>
                  <p className="text-stone-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-stone-800">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-stone-200 flex justify-between">
            <span className="font-semibold text-stone-800">Total</span>
            <span className="font-semibold text-stone-800">{formatCurrency(order.total)}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-200 text-sm text-stone-500">
            <p className="font-medium text-stone-800">Shipping to:</p>
            <p>{order.address.fullName}</p>
            <p>{order.address.addressLine1}</p>
            {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
            <p>
              {order.address.city}, {order.address.state} {order.address.postalCode}
            </p>
            <p>{order.address.country}</p>
          </div>
        </div>

        <Link
          href="/products"
          className="mt-8 inline-block px-8 py-3 bg-stone-800 text-white text-sm font-semibold uppercase tracking-wider hover:bg-stone-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
