"use client";

import { useState } from "react";
import { FiLoader, FiCheckCircle, FiTruck, FiClock } from "react-icons/fi";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  placedAt: string;
  createdAt: string;
}

export default function TrackOrderView() {
  const [trackInvoiceId, setTrackInvoiceId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingSearched, setTrackingSearched] = useState(false);

  const handleOrderTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInvoiceId.trim()) return;

    setTrackingLoading(true);
    setTrackingSearched(false);
    setTrackedOrder(null);

    try {
      const res = await fetch(`${BASE_URL}/orders/${trackInvoiceId.trim()}`, {
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setTrackedOrder(data);
      } else {
        toast.error("Order not found.");
      }
    } catch (err) {
      toast.error("Failed to track order. Please try again.");
    } finally {
      setTrackingLoading(false);
      setTrackingSearched(true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[10px] font-bold tracking-[0.16em] uppercase text-zinc-400 mb-1">
          Track Order
        </h2>
        <p className="font-['Bembo_Std'] text-zinc-650 text-base italic">
          Track the shipment status of your purchase.
        </p>
      </div>

      <form onSubmit={handleOrderTrack} className="flex gap-4 max-w-lg items-end">
        <div className="relative flex-grow border border-stone-200 focus-within:border-stone-400 rounded">
          <input
            type="text"
            value={trackInvoiceId}
            onChange={(e) => setTrackInvoiceId(e.target.value)}
            placeholder="Enter Invoice ID / Order Number"
            className="w-full px-4 py-3 text-sm outline-none font-sans"
            required
          />
        </div>
        <button
          type="submit"
          disabled={trackingLoading}
          className="bg-[#1A1A1A] hover:bg-stone-850 text-white font-sans text-xs font-semibold tracking-wider uppercase py-3.5 px-8 shadow-sm transition cursor-pointer shrink-0"
        >
          {trackingLoading ? <FiLoader className="animate-spin text-white w-4 h-4" /> : "Track"}
        </button>
      </form>

      {trackingSearched && (
        <div className="pt-6 border-t border-stone-150">
          {trackedOrder ? (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-stone-150 pb-4">
                <div>
                  <h3 className="font-sans font-bold text-xs uppercase text-zinc-800 tracking-wider">
                    Invoice: {trackedOrder.orderNumber}
                  </h3>
                  <p className="font-sans text-[10px] text-zinc-400 mt-1">
                    Placed on: {new Date(trackedOrder.placedAt || trackedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-stone-100 border border-stone-200 text-zinc-800 text-xs px-3 py-1 rounded font-sans font-semibold uppercase">
                  {trackedOrder.status}
                </span>
              </div>

              {/* Order status tracking visual bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                {[
                  { label: "Ordered", statusKey: ["pending", "processing", "shipped", "delivered"] },
                  { label: "Processing", statusKey: ["processing", "shipped", "delivered"] },
                  { label: "Shipped", statusKey: ["shipped", "delivered"] },
                  { label: "Delivered", statusKey: ["delivered"] }
                ].map((step, idx) => {
                  const isActive = step.statusKey.includes(trackedOrder.status.toLowerCase());
                  return (
                    <div key={idx} className="flex gap-6 items-start">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center z-15 ${isActive
                        ? "bg-[#C5B382] border-[#C5B382] text-black"
                        : "bg-white border-stone-200 text-stone-300"
                        }`}>
                      {idx === 3 ? (
                        <FiCheckCircle className="text-sm" />
                      ) : idx === 2 ? (
                        <FiTruck className="text-sm" />
                      ) : idx === 1 ? (
                        <FiLoader className="text-sm" />
                      ) : (
                        <FiClock className="text-sm" />
                      )}
                      </div>
                      <div>
                        <h4 className={`font-sans font-bold text-xs uppercase tracking-wider ${isActive ? "text-zinc-800" : "text-stone-350"}`}>
                          {step.label}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border border-stone-150 rounded">
              <p className="font-sans text-sm text-zinc-500 font-semibold mb-2">
                Order Not Found
              </p>
              <p className="font-sans text-xs text-zinc-400 max-w-xs mx-auto">
                Please verify your Invoice ID / Order Number and try again.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
