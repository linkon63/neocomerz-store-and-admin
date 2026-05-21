"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ordersApi, type Order, formatPrice, getStoreToken } from "@/lib/store-api";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-gray-100 text-gray-700",
};

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 animate-pulse"><div className="h-8 bg-[#ede8e1] rounded w-1/3 mb-8" /></div>}>
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
    } catch { /* ignore */ }
    finally { setCancelling(false); }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 animate-pulse space-y-4">
        <div className="h-8 bg-[#ede8e1] rounded w-1/3" />
        <div className="h-48 bg-white rounded-2xl shadow-sm" />
        <div className="h-32 bg-white rounded-2xl shadow-sm" />
      </div>
    );
  }

  if (!order) return null;

  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Success banner */}
      {isSuccess && (
        <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-5 flex items-center gap-4">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="font-black text-green-800">Order placed successfully!</p>
            <p className="text-sm text-green-700 mt-0.5">Your order #{order.orderNumber} has been received.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/store/orders" className="text-sm text-[#756b60] hover:text-[#171412] transition">
            ← My Orders
          </Link>
          <h1 className="mt-2 text-2xl font-black tracking-tight">Order #{order.orderNumber}</h1>
          <p className="text-sm text-[#756b60] mt-0.5">
            Placed {new Date(order.placedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-block rounded-full px-3 py-1 text-sm font-black capitalize ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
            {order.status}
          </span>
          <p className={`mt-1 text-xs font-bold ${order.paymentStatus === "paid" ? "text-green-600" : "text-orange-500"}`}>
            Payment: {order.paymentStatus}
          </p>
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="rounded-2xl bg-white p-6 shadow-sm mb-5">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition ${i <= stepIndex ? "bg-[#171412] text-white" : "bg-[#ede8e1] text-[#9a9088]"}`}>
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <p className={`mt-2 text-xs font-bold capitalize text-center ${i <= stepIndex ? "text-[#171412]" : "text-[#9a9088]"}`}>
                  {step}
                </p>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`absolute h-0.5 w-full ${i < stepIndex ? "bg-[#171412]" : "bg-[#ede8e1]"}`} style={{ display: "none" }} />
                )}
              </div>
            ))}
          </div>
          {/* Connector line */}
          <div className="relative mt-[-2.5rem] mb-8 mx-4 hidden sm:block">
            <div className="h-0.5 bg-[#ede8e1] absolute top-0 left-0 right-0" />
            <div
              className="h-0.5 bg-[#171412] absolute top-0 left-0 transition-all"
              style={{ width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* Items */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-sm">
                  <div>
                    <Link href={`/store/products/${item.product.slug}`} className="font-bold hover:underline">
                      {item.product.name}
                    </Link>
                    <p className="text-[#756b60] text-xs mt-0.5">SKU: {item.variant.sku} × {item.quantity}</p>
                  </div>
                  <p className="font-black shrink-0">{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </div>
            <hr className="border-[#ede8e1] my-4" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#756b60]">Subtotal</span>
                <span className="font-bold">{formatPrice(parseFloat(String(order.total)) + parseFloat(String(order.discount)) - parseFloat(String(order.shippingCost)))}</span>
              </div>
              {parseFloat(String(order.discount)) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-bold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#756b60]">Shipping</span>
                <span className="font-bold">{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-base font-black pt-1 border-t border-[#ede8e1]">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Cancel */}
          {(order.status === "pending" || order.status === "processing") && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full rounded-full border border-red-200 py-3 text-sm font-black text-red-600 hover:bg-red-50 transition disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Delivery address */}
              {order.address && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#756b60] mb-3">Delivery Address</h3>
              <div className="text-sm space-y-0.5">
                <p className="font-black">{order.address.fullName}</p>
                <p className="text-[#51483f]">{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p className="text-[#51483f]">{order.address.addressLine2}</p>}
                <p className="text-[#51483f]">{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                <p className="text-[#51483f]">{order.address.country}</p>
                <p className="text-[#51483f]">{order.address.phone}</p>
              </div>
            </div>
          )}

          {/* Payment */}
          {order.payments && order.payments.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#756b60] mb-3">Payment</h3>
              {order.payments.map((p) => (
                <div key={p.id} className="text-sm space-y-1">
                  <p className="font-bold capitalize">{p.method?.replace(/_/g, " ")}</p>
                  <p className={`font-bold ${p.status === "success" ? "text-green-600" : p.status === "failed" ? "text-red-600" : "text-orange-500"}`}>{p.status}</p>
                  <p className="font-black">{formatPrice(p.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
