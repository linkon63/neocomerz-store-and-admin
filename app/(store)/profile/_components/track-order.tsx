"use client";

import { useState } from "react";
import { FiLoader, FiCheckCircle, FiTruck, FiClock, FiSearch, FiPackage } from "react-icons/fi";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

const SECTION_LABEL = "text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  placedAt: string;
  createdAt: string;
}

const STEPS = [
  { label: "Order Placed",  statuses: ["pending", "processing", "shipped", "delivered"], Icon: FiClock        },
  { label: "Processing",    statuses: ["processing", "shipped", "delivered"],             Icon: FiPackage      },
  { label: "Shipped",       statuses: ["shipped", "delivered"],                           Icon: FiTruck        },
  { label: "Delivered",     statuses: ["delivered"],                                      Icon: FiCheckCircle  },
] as const;

function statusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":  return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "shipped":    return "bg-sky-50 text-sky-700 border-sky-200";
    case "processing": return "bg-amber-50 text-amber-700 border-amber-200";
    case "cancelled":  return "bg-red-50 text-red-700 border-red-200";
    case "returned":   return "bg-purple-50 text-purple-700 border-purple-200";
    default:           return "bg-stone-50 text-stone-600 border-stone-200";
  }
}

export default function TrackOrderView() {
  const [invoiceId, setInvoiceId] = useState("");
  const [order, setOrder]         = useState<Order | null>(null);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId.trim()) return;
    setLoading(true);
    setSearched(false);
    setOrder(null);
    try {
      const res = await fetch(`${BASE_URL}/orders/${invoiceId.trim()}`);
      if (res.ok) setOrder(await res.json());
      else toast.error("Order not found. Please check your Invoice ID.");
    } catch {
      toast.error("Failed to reach the server. Please try again.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const isCancelled = order?.status?.toLowerCase() === "cancelled";

  return (
    <div className="space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <p className={SECTION_LABEL}>Shipment</p>
        <h2 className="font-['Bembo_Std'] text-2xl text-zinc-850 font-normal mt-1">
          Track Your Order
        </h2>
        <p className="font-['Bembo_Std'] text-zinc-400 text-sm italic mt-0.5">
          Enter your invoice ID to see real-time shipment status.
        </p>
      </div>

      {/* ── Search Form ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleTrack} className="flex gap-3 max-w-xl">
        <div className="flex-grow relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 text-sm pointer-events-none" />
          <input
            type="text"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            placeholder="Enter Invoice ID or Order Number"
            className="w-full pl-10 pr-4 py-3 border border-stone-200 bg-white text-sm font-sans text-zinc-800 outline-none focus:border-stone-400 transition rounded-xl placeholder:text-zinc-300"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-stone-800 text-white font-sans text-[10px] font-bold tracking-[0.16em] uppercase px-7 py-3 rounded-xl transition cursor-pointer shadow-sm disabled:opacity-60"
        >
          {loading ? <FiLoader className="animate-spin w-3.5 h-3.5" /> : "Track"}
        </button>
      </form>

      {/* ── Result ──────────────────────────────────────────────────────────── */}
      {searched && (
        <div className="border-t border-stone-100 pt-10">
          {order ? (
            <div className="space-y-8">

              {/* Summary card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50 border border-stone-200 rounded-xl px-6 py-5">
                <div>
                  <p className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-800">
                    {order.orderNumber}
                  </p>
                  <p className="font-sans text-[10px] text-zinc-400 mt-1">
                    Placed{" "}
                    {new Date(order.placedAt || order.createdAt).toLocaleDateString("en-US", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`border font-sans text-[9px] font-bold tracking-wider uppercase px-3 py-1 rounded-full ${statusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="font-sans font-bold text-sm text-zinc-800">
                    ৳{Number(order.total).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress tracker */}
              {!isCancelled ? (
                <div>
                  <p className="font-sans text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400 mb-7">
                    Delivery Progress
                  </p>

                  {/* Desktop horizontal / mobile 2-col grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative">

                    {/* Connector lines — desktop only */}
                    <div className="absolute hidden sm:block top-[18px] left-[calc(12.5%+18px)] right-[calc(12.5%+18px)] h-px bg-stone-200 -z-0" />

                    {STEPS.map((step, idx) => {
                      const { Icon } = step;
                      const isActive  = step.statuses.includes(order.status.toLowerCase() as any);
                      const isCurrent = (
                        isActive &&
                        !STEPS[idx + 1]?.statuses.includes(order.status.toLowerCase() as any)
                      );
                      return (
                        <div key={step.label} className="flex flex-col items-center gap-2 text-center relative z-10">
                          <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                            isActive
                              ? isCurrent
                                ? "bg-[#C5B382] border-[#C5B382] text-white shadow-md shadow-[#C5B382]/30 scale-110"
                                : "bg-[#C5B382] border-[#C5B382] text-white"
                              : "bg-white border-stone-200 text-stone-300"
                          }`}>
                            <Icon className="text-sm" />
                          </div>
                          <p className={`font-sans text-[10px] font-bold tracking-wider uppercase transition-colors ${
                            isActive ? "text-zinc-800" : "text-stone-300"
                          }`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <span className="font-sans text-[9px] text-[#C5B382] font-bold tracking-wider uppercase">
                              Current
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-red-200 rounded-xl bg-red-50/40">
                  <p className="font-sans font-bold text-xs uppercase tracking-wider text-red-500 mb-1">
                    Order Cancelled
                  </p>
                  <p className="font-sans text-xs text-zinc-400">
                    This order has been cancelled and will not be shipped.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-stone-200 rounded-xl">
              <FiSearch className="text-3xl text-zinc-200 mb-4" />
              <p className="font-['Bembo_Std'] text-zinc-500 text-base italic">Order not found.</p>
              <p className="font-sans text-xs text-zinc-300 mt-1 text-center max-w-xs">
                Please verify your Invoice ID or Order Number and try again.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
