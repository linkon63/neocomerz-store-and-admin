"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ordersApi, type Order, formatPrice, getStoreToken } from "@/lib/store-api";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ProcessingIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ShippedIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const DeliveredIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-stone-50 text-stone-705 border border-stone-200",
  processing: "bg-stone-50 text-stone-705 border border-stone-200",
  shipped: "bg-primary-light/50 text-primary border border-primary/20",
  delivered: "bg-primary-light/50 text-primary border border-primary/20",
  cancelled: "bg-red-50 text-red-700 border border-red-200/50",
  returned: "bg-stone-50 text-stone-600 border border-stone-200",
};

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16 min-h-[calc(100vh-280px)] animate-pulse space-y-4 font-sans">
          <div className="h-8 bg-stone-100 rounded-none w-1/3 mb-8" />
          <div className="h-48 bg-white rounded-none border border-stroke" />
          <div className="h-32 bg-white rounded-none border border-stroke" />
        </div>
      }
    >
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
      <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16 min-h-[calc(100vh-280px)] animate-pulse space-y-4 font-sans">
        <div className="h-8 bg-stone-100 rounded-none w-1/3" />
        <div className="h-48 bg-white rounded-none border border-stroke" />
        <div className="h-32 bg-white rounded-none border border-stroke" />
      </div>
    );
  }

  if (!order) return null;

  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16 min-h-[calc(100vh-280px)] font-sans">
      {/* Success banner */}
      {isSuccess && (
        <div className="mb-8 border-l-4 border-l-primary border border-stroke bg-white p-6 flex items-start gap-4">
          <span className="text-xl">🎉</span>
          <div>
            <p className="font-bold text-foreground text-xs uppercase tracking-wider">Order placed successfully!</p>
            <p className="text-xs text-stone-500 mt-1 font-semibold">Your order #{order.orderNumber} has been received.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 border-b pb-6 border-stroke">
        <div className="space-y-1">
          <Link href="/store/orders" className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition">
            ← My Orders
          </Link>
          <h1 className="mt-3 text-2xl font-bold font-serif uppercase text-foreground">Order #{order.orderNumber}</h1>
          <p className="text-[10px] text-stone-500 font-semibold tracking-wider">
            Placed {new Date(order.placedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="text-right space-y-2">
          <span className={`inline-block rounded-none px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-700"}`}>
            {order.status}
          </span>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${order.paymentStatus === "paid" ? "text-primary" : "text-stone-500"}`}>
            Payment: <span className="font-bold">[{order.paymentStatus}]</span>
          </p>
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="bg-white border border-stroke p-6 mb-8 relative shadow-none">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
            <span className="text-primary font-bold">■</span> Order Status
          </h2>
          
          {/* Desktop Stepper */}
          <div className="hidden md:block relative my-8">
            {/* Background Line */}
            <div className="absolute top-[20px] left-[12.5%] w-[75%] h-[1px] bg-stroke" />
            
            {/* Active Progress Line */}
            <div 
              className="absolute top-[20px] left-[12.5%] h-[1px] bg-primary transition-all duration-700 ease-out"
              style={{ width: `${stepIndex === 0 ? 0 : stepIndex === 1 ? 25 : stepIndex === 2 ? 50 : 75}%` }} 
            />

            <div className="flex justify-between items-start relative z-10">
              {STATUS_STEPS.map((step, i) => {
                const isActive = i <= stepIndex;
                const isCurrent = i === stepIndex;
                
                const labels = ["Pending", "Processing", "Shipped", "Delivered"];
                const descs = [
                  "Order placed & pending check",
                  "Being packed & prepared",
                  "Handed over to delivery agent",
                  "Delivered successfully"
                ];

                const renderIcon = (active: boolean) => {
                  const iconsMap = [
                    <ClockIcon key="0" className="w-4 h-4" />,
                    <ProcessingIcon key="1" className="w-4 h-4" />,
                    <ShippedIcon key="2" className="w-4 h-4" />,
                    <DeliveredIcon key="3" className="w-4 h-4" />
                  ];
                  return iconsMap[i];
                };

                return (
                  <div key={step} className="flex flex-col items-center flex-1 text-center px-2">
                    {/* Node */}
                    <div 
                      className={`w-10 h-10 flex items-center justify-center transition-all duration-300 border ${
                        isCurrent 
                          ? "bg-primary text-white border-primary shadow-none" 
                          : isActive 
                            ? "bg-primary text-white border-primary" 
                            : "bg-white text-stone-450 border-stroke"
                      }`}
                    >
                      {renderIcon(isActive)}
                    </div>

                    {/* Content */}
                    <div className="mt-4">
                      <span className={`text-[8px] font-bold tracking-widest uppercase ${isActive ? "text-primary" : "text-stone-450"}`}>
                        STEP 0{i + 1}
                      </span>
                      <h3 className={`text-xs font-bold uppercase tracking-widest mt-1 ${isActive ? "text-foreground" : "text-stone-400"}`}>
                        [{labels[i]}]
                      </h3>
                      <p className="text-[10px] text-stone-500 mt-1.5 leading-snug font-medium max-w-[140px] mx-auto">
                        {descs[i]}
                      </p>
                    </div>

                    {isCurrent && (
                      <span className="mt-2 inline-block bg-primary/10 text-primary text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Stepper */}
          <div className="block md:hidden space-y-6 relative my-4">
            {STATUS_STEPS.map((step, i) => {
              const isActive = i <= stepIndex;
              const isCurrent = i === stepIndex;
              const isLast = i === STATUS_STEPS.length - 1;
              
              const labels = ["Pending", "Processing", "Shipped", "Delivered"];
              const descs = [
                "Order placed & pending check",
                "Being packed & prepared",
                "Handed over to delivery agent",
                "Delivered successfully"
              ];

              const renderIcon = (active: boolean) => {
                const iconsMap = [
                  <ClockIcon key="0" className="w-4 h-4" />,
                  <ProcessingIcon key="1" className="w-4 h-4" />,
                  <ShippedIcon key="2" className="w-4 h-4" />,
                  <DeliveredIcon key="3" className="w-4 h-4" />
                ];
                return iconsMap[i];
              };

              return (
                <div key={step} className="flex gap-4 items-start relative">
                  {/* Left connector column */}
                  <div className="flex flex-col items-center shrink-0 w-8">
                    {/* Node */}
                    <div 
                      className={`w-8 h-8 flex items-center justify-center relative z-10 transition-all duration-300 border ${
                        isCurrent 
                          ? "bg-primary text-white border-primary shadow-none" 
                          : isActive 
                            ? "bg-primary text-white border-primary" 
                            : "bg-white text-stone-450 border-stroke"
                      }`}
                    >
                      {renderIcon(isActive)}
                    </div>
                    {/* Vertical Connector Line */}
                    {!isLast && (
                      <div 
                        className={`w-[1px] absolute top-8 bottom-[-24px] left-[15px] ${
                          i < stepIndex ? "bg-primary" : "bg-stroke"
                        }`} 
                      />
                    )}
                  </div>

                  {/* Right Content Column */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-bold tracking-widest uppercase ${isActive ? "text-primary" : "text-stone-450"}`}>
                        STEP 0{i + 1}
                      </span>
                      {isCurrent && (
                        <span className="bg-primary/10 text-primary text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5">
                          Active
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mt-0.5 ${isActive ? "text-foreground" : "text-stone-400"}`}>
                      [{labels[i]}]
                    </h3>
                    <p className="text-[10px] text-stone-500 mt-1 leading-relaxed font-semibold">
                      {descs[i]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div className="space-y-4">
          <div className="bg-white p-6 border border-stroke shadow-none">
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground mb-6">
              [ Items / পণ্যসমূহ ]
            </h2>
            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-xs font-semibold">
                  <div>
                    <Link href={`/store/products/${item.product.slug}`} className="font-bold text-foreground hover:text-primary transition hover:underline">
                      {item.product.name}
                    </Link>
                    <p className="text-stone-500 text-[10px] font-semibold mt-1">SKU: {item.variant.sku} × {item.quantity}</p>
                  </div>
                  <p className="font-bold text-foreground shrink-0">{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-stroke my-6" />
            
            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold text-foreground">{formatPrice(parseFloat(String(order.total)) + parseFloat(String(order.discount)) - parseFloat(String(order.shippingCost)))}</span>
              </div>
              {parseFloat(String(order.discount)) > 0 && (
                <div className="flex justify-between text-primary">
                  <span className="font-medium">Discount</span>
                  <span className="font-bold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Shipping</span>
                <span className="font-bold text-foreground">{formatPrice(order.shippingCost)}</span>
              </div>
              
              <div className="border-t border-stroke pt-4 mt-2" />
              
              <div className="flex justify-between text-sm font-extrabold text-foreground">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Cancel */}
          {(order.status === "pending" || order.status === "processing") && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full border border-red-200 bg-white py-3 text-xs font-bold uppercase tracking-widest text-red-655 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Delivery address */}
          {order.address && (
            <div className="bg-white p-6 border border-stroke shadow-none">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">[ Delivery Address ]</h3>
              <div className="text-xs space-y-1.5 text-stone-600 leading-relaxed font-semibold">
                <p className="font-bold text-foreground">{order.address.fullName}</p>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                <p className="uppercase tracking-widest text-[9px] text-stone-400">{order.address.country}</p>
                <p className="font-bold text-primary mt-2">{order.address.phone}</p>
              </div>
            </div>
          )}

          {/* Payment */}
          {order.payments && order.payments.length > 0 && (
            <div className="bg-white p-6 border border-stroke shadow-none">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">[ Payment ]</h3>
              {order.payments.map((p) => (
                <div key={p.id} className="text-xs space-y-1.5 font-semibold text-stone-600">
                  <p className="font-bold text-foreground capitalize">{p.method?.replace(/_/g, " ")}</p>
                  <p className={`font-bold uppercase tracking-widest text-[10px] ${p.status === "success" ? "text-primary" : p.status === "failed" ? "text-red-600" : "text-stone-500"}`}>[{p.status}]</p>
                  <p className="font-extrabold text-foreground">{formatPrice(p.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
