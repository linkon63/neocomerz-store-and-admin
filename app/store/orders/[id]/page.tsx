"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ordersApi, type Order, formatPrice, getStoreToken } from "@/lib/store-api";
import { showToast } from "../../_components/toast";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200/50",
  processing: "bg-blue-50 text-blue-700 border border-blue-200/50",
  shipped: "bg-indigo-50 text-indigo-700 border border-indigo-200/50",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
  cancelled: "bg-red-50 text-red-700 border border-red-200/50",
  returned: "bg-gray-50 text-gray-700 border border-gray-200/50",
};

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 bg-[#FAF9F6] animate-pulse"><div className="h-8 bg-surface-muted rounded-full w-48 mb-8" /></div>}>
      <OrderDetailContent />
    </Suspense>
  );
}

function OrderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "1";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const isLoggedIn = typeof window !== "undefined" && !!getStoreToken();

  useEffect(() => {
    if (!isLoggedIn) { router.push("/store/login"); return; }
    ordersApi.byId(id)
      .then(setOrder)
      .catch(() => router.push("/store/orders"))
      .finally(() => setLoading(false));
  }, [id, isLoggedIn]);

  async function handleCancel() {
    if (!order) return;
    if (!confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(order.id);
      const updated = await ordersApi.byId(order.id);
      setOrder(updated);
      showToast("Order cancelled successfully", "success");
    } catch { /* ignore */ }
    finally { setCancelling(false); }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 bg-[#FAF9F6] animate-pulse space-y-6">
        <div className="h-6 bg-surface-muted rounded-full w-48" />
        <div className="h-44 bg-white rounded-3xl border border-stroke" />
        <div className="h-32 bg-white rounded-3xl border border-stroke" />
      </div>
    );
  }

  if (!order) return null;

  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 bg-[#FAF9F6] min-h-[calc(100vh-280px)]">
      
      {/* Success banner */}
      {isSuccess && (
        <div className="mb-8 rounded-3xl bg-emerald-50 border border-emerald-200/50 p-6 flex items-center gap-4 animate-scale-in">
          <span className="text-3xl filter drop-shadow-sm">🎉</span>
          <div>
            <p className="font-extrabold text-emerald-800 text-sm uppercase tracking-wider">Order placed successfully!</p>
            <p className="text-xs text-emerald-700/85 mt-1 font-medium">Your purchase order #{order.orderNumber} has been received. Thank you for shopping with NeoComerz.</p>
          </div>
        </div>
      )}

      {/* Header Navigation */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-stroke">
        <div>
          <Link href="/store/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-dark hover:text-foreground transition-colors group">
            <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Orders</span>
          </Link>
          <h1 className="mt-3 font-serif font-light text-2xl sm:text-3xl tracking-wide text-[#111111]">Invoice #{order.orderNumber}</h1>
          <p className="text-[10px] text-[#80807C] font-extrabold uppercase tracking-widest mt-1.5">
            Placed on: {new Date(order.placedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="text-left sm:text-right self-start sm:self-auto space-y-1.5">
          <span className={`inline-block rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
            {order.status}
          </span>
          <div className="flex items-center sm:justify-end gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === "paid" ? "bg-emerald" : "bg-amber"}`}></span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#80807C]">
              Payment Status: <span className={order.paymentStatus === "paid" ? "text-emerald font-extrabold" : "text-amber font-extrabold"}>{order.paymentStatus}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="rounded-3xl bg-white p-8 shadow-sm mb-6 border border-stroke">
          <div className="flex items-center justify-between relative z-10">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 shadow-sm border ${
                  i <= stepIndex 
                    ? "bg-gold text-black border-gold" 
                    : "bg-surface-muted text-foreground/30 border-stroke"
                }`}>
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <p className={`mt-3 text-[10px] font-extrabold uppercase tracking-widest text-center ${
                  i <= stepIndex ? "text-foreground" : "text-foreground/35"
                }`}>
                  {step}
                </p>
              </div>
            ))}
          </div>
          
          {/* Connector line (Sleek and beautiful horizontal track) */}
          <div className="relative mt-[-2.95rem] mb-9 mx-10 hidden sm:block">
            <div className="h-0.5 bg-stroke absolute top-0 left-0 right-0" />
            <div
              className="h-0.5 gold-gradient absolute top-0 left-0 transition-all duration-1000 ease-out"
              style={{ width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Grid Details */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        
        {/* Left Side: Items & Cost Summary */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-stroke">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stroke">
              <span className="text-lg">🛒</span>
              <h2 className="text-base font-bold text-[#111111] uppercase tracking-wide">Registered Items</h2>
            </div>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-xs font-semibold">
                  <div className="min-w-0">
                    <Link href={`/store/products/${item.product.slug}`} className="font-extrabold text-foreground hover:text-gold-dark transition-colors text-[13px] leading-tight block">
                      {item.product.name}
                    </Link>
                    <p className="text-[#80807C] text-[10px] uppercase tracking-widest mt-1.5">SKU: {item.variant.sku} <span className="opacity-40">•</span> Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-[#111111] shrink-0 text-sm">{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </div>
            
            <hr className="border-stroke my-5" />
            
            <div className="space-y-2.5 text-xs font-semibold text-[#80807C]">
              <div className="flex justify-between uppercase tracking-wider">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">{formatPrice(parseFloat(String(order.total)) + parseFloat(String(order.discount)) - parseFloat(String(order.shippingCost)))}</span>
              </div>
              {parseFloat(String(order.discount)) > 0 && (
                <div className="flex justify-between uppercase tracking-wider text-emerald">
                  <span>Promo Discount</span>
                  <span className="font-bold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between uppercase tracking-wider">
                <span>Delivery Cost</span>
                <span className="font-bold text-foreground">{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-base font-black pt-3.5 border-t border-stroke text-foreground">
                <span>Invoice Total</span>
                <span className="text-gold-dark">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          {(order.status === "pending" || order.status === "processing") && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full rounded-xl border border-red-500/20 bg-red-500/5 py-3.5 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-500/35 transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {cancelling ? "Processing Cancellation..." : "Cancel Booking Order"}
            </button>
          )}
        </div>

        {/* Right Side: Shipping & Payment Address cards */}
        <div className="space-y-6">
          
          {/* Shipping Address */}
          {order.address && (
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-stroke">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stroke">
                <span className="text-base">📍</span>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-gold-dark">Shipping Address</h3>
              </div>
              <div className="text-xs space-y-1.5">
                <p className="font-extrabold text-[#111111]">{order.address.fullName}</p>
                <div className="space-y-1 font-semibold text-foreground/75 leading-relaxed">
                  <p>{order.address.addressLine1}</p>
                  {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                  <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                  <p className="uppercase tracking-widest text-[9px]">{order.address.country}</p>
                  <p className="text-gold-dark font-bold mt-1.5">{order.address.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {order.payments && order.payments.length > 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-stroke">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stroke">
                <span className="text-base">💳</span>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-gold-dark">Payment Log</h3>
              </div>
              {order.payments.map((p) => (
                <div key={p.id} className="text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span className="capitalize text-foreground/80">{p.method?.replace(/_/g, " ")}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                      p.status === "success" 
                        ? "bg-emerald-50 text-emerald" 
                        : p.status === "failed" 
                        ? "bg-red-50 text-red-600" 
                        : "bg-amber-50 text-amber-600"
                    }`}>{p.status}</span>
                  </div>
                  <p className="font-extrabold text-[#111111] text-sm">{formatPrice(p.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
