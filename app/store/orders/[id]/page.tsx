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
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const DeliveredIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-stone-50 text-stone-750 border border-stone-200",
  processing: "bg-stone-50 text-stone-750 border border-stone-200",
  shipped: "bg-emerald-50 text-[#15803d] border border-[#15803d]/20",
  delivered: "bg-emerald-50 text-[#15803d] border border-[#15803d]/20",
  cancelled: "bg-red-50 text-red-700 border border-red-200/50",
  returned: "bg-stone-50 text-stone-600 border border-stone-200",
};

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16 min-h-[calc(100vh-280px)] animate-pulse space-y-4 font-sans">
          <div className="h-8 bg-stone-100 w-1/3 mb-8" />
          <div className="h-48 bg-white border border-stone-200" />
          <div className="h-32 bg-white border border-stone-200" />
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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
    setCancelling(true);
    setShowCancelConfirm(false);
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
        <div className="h-8 bg-stone-100 w-1/3" />
        <div className="h-48 bg-white border border-stone-200" />
        <div className="h-32 bg-white border border-stone-200" />
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
        <div className="mb-8 border-l-4 border-l-[#15803d] border border-stone-200/60 bg-[#f0fdf4] p-6 flex items-start gap-4 shadow-xs">
          <span className="text-xl">🎉</span>
          <div>
            <p className="font-extrabold text-stone-850 text-xs uppercase tracking-wider">অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে! (Order Placed Successfully!)</p>
            <p className="text-xs text-stone-500 mt-1 font-semibold">আপনার অর্ডার নম্বর #{order.orderNumber} সফলভাবে সিস্টেমে যোগ করা হয়েছে।</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 border-b pb-6 border-stone-200">
        <div className="space-y-1">
          <Link href="/store/orders" className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-[#15803d] transition">
            ← অর্ডারসমূহ (My Orders)
          </Link>
          <h1 className="mt-3 text-2xl font-bold font-serif uppercase text-stone-850">অর্ডার #{order.orderNumber}</h1>
          <p className="text-[10px] text-stone-500 font-semibold tracking-wider">
            তারিখ: {new Date(order.placedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="text-right space-y-2">
          <span className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-700 border border-stone-200"}`}>
            {order.status}
          </span>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${order.paymentStatus === "paid" ? "text-[#15803d]" : "text-stone-500"}`}>
            পেমেন্ট: <span className="font-black text-[#15803d]">[{order.paymentStatus}]</span>
          </p>
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="bg-white border border-stone-200/60 p-6 mb-8 relative shadow-xs">
          <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-6 flex items-center gap-2 font-display">
            <span className="text-[#15803d] font-black">■</span> অর্ডারের বর্তমান অবস্থা (Order Status)
          </h2>
          
          {/* Desktop Stepper */}
          <div className="hidden md:block relative my-8">
            {/* Background Line */}
            <div className="absolute top-[20px] left-[12.5%] w-[75%] h-[1px] bg-stone-200" />
            
            {/* Active Progress Line */}
            <div 
              className="absolute top-[20px] left-[12.5%] h-[1px] bg-[#15803d] transition-all duration-700 ease-out"
              style={{ width: `${stepIndex === 0 ? 0 : stepIndex === 1 ? 25 : stepIndex === 2 ? 50 : 75}%` }} 
            />

            <div className="flex justify-between items-start relative z-10">
              {STATUS_STEPS.map((step, i) => {
                const isActive = i <= stepIndex;
                const isCurrent = i === stepIndex;
                
                const labels = ["অপেক্ষমাণ (Pending)", "প্যাকিং চলছে (Processing)", "পাঠানো হয়েছে (Shipped)", "ডেলিভার্ড (Delivered)"];
                const descs = [
                  "অর্ডারটি যাচাইকরণ সম্পন্ন হচ্ছে",
                  "বাগান থেকে ফ্রেশ আম সংগ্রহ ও প্যাকেট করা হচ্ছে",
                  "আম কুরিয়ার সার্ভিসে হস্তান্তর করা হয়েছে",
                  "আপনার ঠিকানায় আম সফলভাবে পৌঁছে দেওয়া হয়েছে"
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
                          ? "bg-[#15803d] text-white border-[#15803d]" 
                          : isActive 
                            ? "bg-[#15803d] text-white border-[#15803d]" 
                            : "bg-white text-stone-400 border-stone-200"
                      }`}
                    >
                      {renderIcon(isActive)}
                    </div>

                    {/* Content */}
                    <div className="mt-4">
                      <span className={`text-[8px] font-extrabold tracking-widest uppercase ${isActive ? "text-[#15803d]" : "text-stone-400"}`}>
                        ধাপ ০{i + 1}
                      </span>
                      <h3 className={`text-xs font-bold uppercase tracking-widest mt-1 ${isActive ? "text-stone-850" : "text-stone-400"}`}>
                        {labels[i]}
                      </h3>
                      <p className="text-[10px] text-stone-500 mt-1.5 leading-snug font-semibold max-w-[150px] mx-auto">
                        {descs[i]}
                      </p>
                    </div>

                    {isCurrent && (
                      <span className="mt-2.5 inline-block bg-[#f0fdf4] text-[#15803d] text-[8px] font-black uppercase tracking-widest px-2.5 py-1">
                        চলমান (Active)
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
              
              const labels = ["পেন্ডিং (Pending)", "প্রসেসিং (Processing)", "শিপড (Shipped)", "ডেলিভার্ড (Delivered)"];
              const descs = [
                "অর্ডারটি যাচাইকরণ সম্পন্ন হচ্ছে",
                "বাগান থেকে ফ্রেশ আম সংগ্রহ ও প্যাকেট করা হচ্ছে",
                "আম কুরিয়ার সার্ভিসে হস্তান্তর করা হয়েছে",
                "আপনার ঠিকানায় আম সফলভাবে পৌঁছে দেওয়া হয়েছে"
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
                          ? "bg-[#15803d] text-white border-[#15803d]" 
                          : isActive 
                            ? "bg-[#15803d] text-white border-[#15803d]" 
                            : "bg-white text-stone-400 border-stone-200"
                      }`}
                    >
                      {renderIcon(isActive)}
                    </div>
                    {/* Vertical Connector Line */}
                    {!isLast && (
                      <div 
                        className={`w-[1px] absolute top-8 bottom-[-24px] left-[15px] ${
                          i < stepIndex ? "bg-[#15803d]" : "bg-stone-200"
                        }`} 
                      />
                    )}
                  </div>

                  {/* Right Content Column */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-extrabold tracking-widest uppercase ${isActive ? "text-[#15803d]" : "text-stone-400"}`}>
                        ধাপ ০{i + 1}
                      </span>
                      {isCurrent && (
                        <span className="bg-[#f0fdf4] text-[#15803d] text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                          চলমান (Active)
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mt-0.5 ${isActive ? "text-stone-850" : "text-stone-400"}`}>
                      {labels[i]}
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
          <div className="bg-white p-6 border border-stone-200/60 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#15803d] mb-6 font-display">
              অর্ডারকৃত আমসমূহ (Ordered Items)
            </h2>
            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-xs font-semibold">
                  <div>
                    <Link href={`/store/products/${item.product.slug}`} className="font-bold text-stone-850 hover:text-[#15803d] transition hover:underline">
                      {item.product.name}
                    </Link>
                    <p className="text-stone-500 text-[10px] font-semibold mt-1">SKU: {item.variant.sku} × {item.quantity}</p>
                  </div>
                  <p className="font-extrabold text-[#15803d] shrink-0 font-display">{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-stone-200 my-6" />
            
            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span className="font-semibold">মোট মূল্য (Subtotal)</span>
                <span className="font-extrabold text-stone-800">{formatPrice(parseFloat(String(order.total)) + parseFloat(String(order.discount)) - parseFloat(String(order.shippingCost)))}</span>
              </div>
              {parseFloat(String(order.discount)) > 0 && (
                <div className="flex justify-between text-[#15803d]">
                  <span className="font-semibold">ছাড় (Discount)</span>
                  <span className="font-extrabold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-semibold">ডেলিভারি চার্জ (Shipping)</span>
                <span className="font-extrabold text-stone-850">{formatPrice(order.shippingCost)}</span>
              </div>
              
              <div className="border-t border-stone-200 pt-4 mt-2" />
              
              <div className="flex justify-between text-sm font-extrabold text-stone-850">
                <span>সর্বমোট (Total)</span>
                <span className="text-[#15803d] font-black text-base font-display">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Cancel */}
          {(order.status === "pending" || order.status === "processing") && (
            <>
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
                className="w-full border border-red-200 bg-white py-3.5 text-xs font-bold uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50 hover:border-rose-350"
              >
                {cancelling ? "বাতিল করা হচ্ছে..." : "অর্ডার বাতিল করুন (Cancel Order)"}
              </button>

              {showCancelConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setShowCancelConfirm(false)} />
                  <div className="relative bg-white border border-stone-200 p-6 shadow-lg max-w-sm w-full" style={{ borderRadius: "6px" }}>
                    <h3 className="font-bold text-sm text-stone-900 mb-2">অর্ডার বাতিল করবেন?</h3>
                    <p className="text-xs text-stone-500 font-semibold mb-5">অর্ডার নম্বর #{order.orderNumber} স্থায়ীভাবে বাতিল হয়ে যাবে।</p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wide py-2.5 cursor-pointer transition disabled:opacity-50"
                        style={{ borderRadius: "4px" }}
                      >
                        হ্যাঁ, বাতিল করুন
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 border border-stone-200 hover:border-stone-400 text-stone-600 text-xs font-bold uppercase tracking-wide py-2.5 cursor-pointer transition"
                        style={{ borderRadius: "4px" }}
                      >
                        না, রাখুন
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Delivery address */}
          {order.address && (
            <div className="bg-white p-6 border border-stone-200/60 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#15803d] mb-4 font-display">ডেলিভারি ঠিকানা (Delivery Address)</h3>
              <div className="text-xs space-y-1.5 text-stone-600 leading-relaxed font-semibold">
                <p className="font-bold text-stone-850">{order.address.fullName}</p>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                <p className="uppercase tracking-widest text-[9px] text-stone-400 font-extrabold">{order.address.country}</p>
                <p className="font-bold text-[#15803d] mt-2 font-display">{order.address.phone}</p>
              </div>
            </div>
          )}

          {/* Payment */}
          {order.payments && order.payments.length > 0 && (
            <div className="bg-white p-6 border border-stone-200/60 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#15803d] mb-4 font-display">পেমেন্ট বিবরণ (Payment)</h3>
              {order.payments.map((p) => (
                <div key={p.id} className="text-xs space-y-1.5 font-semibold text-stone-600">
                  <p className="font-bold text-stone-850 capitalize">{p.method?.replace(/_/g, " ")}</p>
                  <p className={`font-black uppercase tracking-widest text-[10px] ${p.status === "success" ? "text-[#15803d]" : p.status === "failed" ? "text-rose-600" : "text-stone-500"}`}>[{p.status}]</p>
                  <p className="font-black text-stone-850 font-display">{formatPrice(p.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
