"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LuPrinter, LuX } from "react-icons/lu";
import type { OrderResult } from "@/lib/types";

const COMPANY = {
  name: "London Tea Exchange",
  logo: "/images/logo/Logo-update.png",
  addressLine: "Room H-125A, Pan Pacific Sonargaon Hotel, 107 Kazi Nazrul Islam Avenue, Dhaka-1215, Bangladesh",
  phone: "+880 13 3987 9494",
  email: "store@londonteaexchangebd.com",
};

const currency = (n: number) =>
  `৳${new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;

export default function InvoiceModal({
  order,
  open,
  onClose,
}: {
  order: OrderResult;
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close on Escape and lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = 0;
  const tax = 0;
  const discount = subtotal + shipping + tax - order.total;
  const issuedOn = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const { address } = order;

  return createPortal(
    <div className="invoice-portal">
      {/* Print rules: only the invoice sheet flows onto the page */}
      <style>{`
        @media print {
          @page { margin: 14mm; }
          body > *:not(.invoice-portal) { display: none !important; }
          .invoice-portal .invoice-backdrop {
            position: static !important;
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          .invoice-portal .invoice-frame {
            max-width: none !important;
            margin: 0 !important;
          }
          .invoice-no-print { display: none !important; }
          #invoice-sheet {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div
        className="invoice-backdrop fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-stone-900/60 backdrop-blur-sm p-4 sm:p-8"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Order invoice"
      >
        <div
          className="invoice-frame relative w-full max-w-3xl my-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/90 font-sans text-sm font-medium uppercase tracking-wider">
              Invoice Preview
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-[#D31F3A] text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#B91A32] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LuPrinter className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={onClose}
                aria-label="Close invoice"
                className="p-2.5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Invoice Sheet */}
          <div
            id="invoice-sheet"
            className="bg-white rounded-lg shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-stone-800"
          >
            {/* Header: logo + company / invoice meta */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6 border-b border-stone-200">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={COMPANY.logo}
                  alt={COMPANY.name}
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <p className="font-serif text-xl text-stone-800 leading-tight">
                    {COMPANY.name}
                  </p>
                  <p className="font-sans text-xs text-stone-500 mt-1 leading-relaxed max-w-[220px]">
                    {COMPANY.addressLine}
                  </p>
                  <p className="font-sans text-xs text-stone-500">{COMPANY.phone}</p>
                  <p className="font-sans text-xs text-stone-500">{COMPANY.email}</p>
                </div>
              </div>

              <div className="sm:text-right">
                <h2 className="font-serif text-3xl text-stone-800 tracking-wide">
                  INVOICE
                </h2>
                <p className="font-sans text-sm text-stone-600 mt-1">
                  <span className="text-stone-400">No. </span>
                  <span className="font-semibold">{order.orderNumber}</span>
                </p>
                <p className="font-sans text-xs text-stone-500 mt-0.5">
                  Issued: {issuedOn}
                </p>
                {order.paymentMethod && (
                  <p className="font-sans text-xs text-stone-500 mt-0.5 capitalize">
                    Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}
                  </p>
                )}
              </div>
            </div>

            {/* Bill To */}
            <div className="py-6 border-b border-stone-200">
              <p className="font-sans text-[11px] uppercase tracking-wider text-stone-400 mb-2">
                Bill To
              </p>
              <p className="font-sans text-sm font-semibold text-stone-800">
                {address.fullName}
              </p>
              <div className="font-sans text-sm text-stone-600 leading-relaxed mt-0.5">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {[address.city, address.state, address.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>{address.country}</p>
                <p className="mt-1">{address.phone}</p>
                <p>{address.email}</p>
              </div>
            </div>

            {/* Items table */}
            <div className="py-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="font-sans text-[11px] uppercase tracking-wider text-stone-400 font-medium pb-3">
                      Item
                    </th>
                    <th className="font-sans text-[11px] uppercase tracking-wider text-stone-400 font-medium pb-3 text-center w-16">
                      Qty
                    </th>
                    <th className="font-sans text-[11px] uppercase tracking-wider text-stone-400 font-medium pb-3 text-right w-24">
                      Price
                    </th>
                    <th className="font-sans text-[11px] uppercase tracking-wider text-stone-400 font-medium pb-3 text-right w-28">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-stone-100">
                      <td className="py-3 font-sans text-sm text-stone-700 pr-2">
                        {item.name}
                      </td>
                      <td className="py-3 font-sans text-sm text-stone-600 text-center">
                        {item.quantity}
                      </td>
                      <td className="py-3 font-sans text-sm text-stone-600 text-right">
                        {currency(item.price)}
                      </td>
                      <td className="py-3 font-sans text-sm text-stone-800 text-right font-medium">
                        {currency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between font-sans text-sm text-stone-600">
                  <span>Subtotal</span>
                  <span>{currency(subtotal)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-stone-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : currency(shipping)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-stone-600">
                  <span>Tax</span>
                  <span>{currency(tax)}</span>
                </div>
                {discount > 0.001 && (
                  <div className="flex justify-between font-sans text-sm text-stone-600">
                    <span>Discount</span>
                    <span>-{currency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-serif text-lg text-stone-900 pt-2 mt-2 border-t border-stone-300">
                  <span>Total</span>
                  <span className="text-[#D31F3A] font-semibold">
                    {currency(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order note */}
            {order.orderNote && (
              <div className="mt-6 pt-4 border-t border-stone-100">
                <p className="font-sans text-[11px] uppercase tracking-wider text-stone-400 mb-1">
                  Order Note
                </p>
                <p className="font-sans text-sm text-stone-600">{order.orderNote}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-stone-200 text-center">
              <p className="font-serif text-base text-stone-700">
                Thank you for your order
              </p>
              <p className="font-sans text-xs text-stone-400 mt-1">
                This is a computer-generated invoice and does not require a signature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
