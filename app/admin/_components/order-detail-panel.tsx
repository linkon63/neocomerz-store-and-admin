"use client";

import { useEffect, useRef, useState } from "react";
import { AdminIcon, ProductThumb } from "./admin-shell";
import {
  formatMoney,
  resolveImageUrl,
  type Order,
  type OrderPaymentStatus,
  type OrderStatus,
} from "../../../lib/admin-api";

function statusTone(status: OrderStatus) {
  switch (status) {
    case "delivered":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    case "shipped":
    case "processing":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "cancelled":
    case "returned":
      return "border-rose-300 bg-rose-50 text-rose-700";
    default:
      return "border-amber-300 bg-amber-50 text-amber-700";
  }
}

function paymentTone(status: string) {
  if (status === "paid") return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "refunded") return "border-amber-300 bg-amber-50 text-amber-700";
  return "border-rose-300 bg-rose-50 text-rose-700";
}

function statusIcon(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "calendar";
    case "processing":
      return "refresh";
    case "shipped":
      return "package";
    case "delivered":
      return "check";
    case "cancelled":
    case "returned":
      return "x";
    default:
      return "orders";
  }
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const PAYMENT_STATUS_OPTIONS: { value: OrderPaymentStatus; label: string }[] = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

function RichDropdown<T extends string>({
  value,
  options,
  onChange,
  getTone,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  getTone: (val: T) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-28 items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 hover:border-slate-400 cursor-pointer shadow-xs"
      >
        <span className={`inline-flex rounded border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getTone(value)}`}>
          {selectedOption.label}
        </span>
        <svg
          className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-md ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer text-left ${
                    isSelected ? "bg-slate-50 text-slate-900" : "text-slate-600 hover:bg-slate-50/70 hover:text-slate-900"
                  }`}
                >
                  <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold capitalize ${getTone(opt.value)}`}>
                    {opt.label}
                  </span>
                  {isSelected && (
                    <svg className="h-3.5 w-3.5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export type OrderTotals = {
  subtotal: number;
  shipping: number;
  discount: number;
  grand: number;
  paid: number;
  due: number;
};

interface OrderDetailPanelProps {
  order: Order;
  totals: OrderTotals | null;
  symbol: string;
  onUpdateOrderStatus: (status: OrderStatus) => void;
  onUpdatePaymentStatus: (paymentStatus: OrderPaymentStatus) => void;
}

export function OrderDetailPanel({
  order,
  totals,
  symbol,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
}: OrderDetailPanelProps) {
  return (
    <>
      <div className="mb-4 flex flex-col justify-between gap-4 rounded-lg bg-white p-4 sm:flex-row sm:items-center shadow-xs border border-slate-200/60">
        <div className="flex items-center gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-full border shadow-sm ring-4 ring-offset-0 ${
            order.status === "delivered"
              ? "border-emerald-200 bg-emerald-50 text-emerald-600 ring-emerald-50"
              : order.status === "cancelled" || order.status === "returned"
                ? "border-rose-200 bg-rose-50 text-rose-600 ring-rose-50"
                : order.status === "pending"
                  ? "border-amber-200 bg-amber-50 text-amber-600 ring-amber-50"
                  : "border-slate-200 bg-slate-50/80 text-slate-600 ring-slate-100"
          }`}>
            <AdminIcon className="h-5 w-5" name={statusIcon(order.status)} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              Order #{order.orderNumber}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {formatDateTime(order.placedAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Payment Status</span>
            {order.status === "delivered" ? (
              <RichDropdown
                value={order.paymentStatus}
                options={PAYMENT_STATUS_OPTIONS}
                onChange={onUpdatePaymentStatus}
                getTone={paymentTone}
              />
            ) : (
              <span className={`inline-flex items-center rounded-lg border px-2 py-1.5 text-xs font-semibold capitalize ${paymentTone(order.paymentStatus)}`}>
                {order.paymentStatus}
              </span>
            )}
          </div>
          {(order.status === "pending" || order.status === "processing") && (
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => onUpdateOrderStatus(order.status === "pending" ? "processing" : "shipped")}
                className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 cursor-pointer"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => onUpdateOrderStatus("cancelled")}
                className="h-11 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
          {order.status === "shipped" && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => onUpdateOrderStatus("delivered")}
                className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 cursor-pointer"
              >
                Accept
              </button>
            </div>
          )}
          {order.status === "delivered" && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => onUpdateOrderStatus("returned")}
                className="h-10 rounded-lg bg-amber-500 px-5 text-sm font-semibold text-white transition hover:bg-amber-600 cursor-pointer"
              >
                Return
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <div className="rounded-lg border border-slate-200/60 bg-white p-5 shadow-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
            Customer Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 font-semibold text-slate-700 text-sm">
                {(order.user?.name ?? "G").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {order.user?.name ?? "Guest Customer"}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {order.user?.email ?? "No email provided"}
                </p>
              </div>
            </div>
            {order.user?.phone && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-medium text-slate-400">Phone:</span>
                <span className="font-semibold">{order.user.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/60 bg-white p-5 shadow-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
            Shipping Address
          </h3>
          <p className="text-xs font-semibold text-slate-700 leading-relaxed">
            {order.address
              ? [
                  order.address.fullName || order.user?.name,
                  order.address.phone || order.user?.phone,
                  order.address.addressLine1,
                  order.address.addressLine2,
                  order.address.city,
                  order.address.state,
                  order.address.postalCode,
                  order.address.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "No address details available"
              : "No address details available"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200/60 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 p-5 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
            Order Items
          </h3>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
            {order.items?.length ?? 0} {order.items?.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="p-5">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {(order.items ?? []).map((item, index) => {
                const mediaUrl = item.product?.media?.find((m) => m.isFeatured)?.media?.url 
                  || item.product?.media?.[0]?.media?.url 
                  || null;
                const resolvedUrl = mediaUrl ? resolveImageUrl(mediaUrl) : null;

                return (
                  <div className="flex gap-4 items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0" key={item.id}>
                    {resolvedUrl ? (
                      <img
                        alt={item.product?.name ?? "Product"}
                        className="h-12 w-16 rounded-md border border-slate-150 object-cover bg-white shrink-0"
                        src={resolvedUrl}
                      />
                    ) : (
                      <ProductThumb color={["bg-slate-500/80", "bg-slate-600/80", "bg-slate-400/80"][index % 3]} />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-slate-800 uppercase truncate">
                        {item.product?.name ?? "Product"}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded">
                          SKU: {item.variant?.sku ?? "\u2014"}
                        </span>
                        {item.variant?.sku && (
                          <span className="text-[10px] text-slate-300">|</span>
                        )}
                        <span className="text-[11px] font-medium text-slate-500">
                          {item.quantity} &#x2715; {formatMoney(item.unitPrice, symbol)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-800">
                        {formatMoney(item.totalPrice, symbol)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {(order.items ?? []).length === 0 && (
                <p className="text-xs font-semibold text-slate-400 text-center py-6">No items in this order.</p>
              )}
            </div>

            {totals && (
              <div className="rounded-lg border border-slate-200/60 bg-slate-50/80 p-4 shrink-0 h-fit">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Payment Summary
                </h4>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="font-semibold text-slate-800">{formatMoney(totals.subtotal, symbol)}</span>
                  </div>

                  {totals.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Discount</span>
                      <span className="font-semibold text-rose-600">- {formatMoney(totals.discount, symbol)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Delivery Charge</span>
                    <span className="font-semibold text-slate-800">{formatMoney(totals.shipping, symbol)}</span>
                  </div>

                  <div className="border-t border-slate-200/60 pt-2.5 flex justify-between items-center">
                    <span className="font-semibold text-slate-800 text-[13px]">Total</span>
                    <span className="font-semibold text-slate-900 text-[15px]">{formatMoney(totals.grand, symbol)}</span>
                  </div>

                  <div className="flex justify-between items-center text-emerald-600 bg-emerald-50/50 px-2 py-1.5 rounded-md border border-emerald-100/50 mt-1">
                    <span className="font-semibold text-[11px]">Paid Amount</span>
                    <span className="font-semibold text-xs">{formatMoney(totals.paid, symbol)}</span>
                  </div>

                  <div className="flex justify-between items-center text-rose-600 bg-rose-50/50 px-2 py-1.5 rounded-md border border-rose-100/50 mt-1">
                    <span className="font-semibold text-[11px]">Due Amount</span>
                    <span className="font-semibold text-xs">{formatMoney(totals.due, symbol)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
