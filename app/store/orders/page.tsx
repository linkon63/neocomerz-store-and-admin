"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ordersApi,
  type Order,
  formatPrice,
  getStoreToken,
  getStoredUser,
  type StoreUser,
  clearStoreSession,
} from "@/lib/store-api";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-stone-50 text-stone-750 border border-stone-200",
  processing: "bg-stone-50 text-stone-750 border border-stone-200",
  shipped: "bg-primary-light/50 text-primary border border-primary/20",
  delivered: "bg-primary-light/50 text-primary border border-primary/20",
  cancelled: "bg-red-50 text-red-700 border border-red-200/50",
  returned: "bg-stone-50 text-stone-600 border border-stone-200",
};

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoreUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = typeof window !== "undefined" && !!getStoreToken();

  useEffect(() => {
    if (!isLoggedIn) { router.push("/store/login"); return; }
    setUser(getStoredUser());
    ordersApi.myOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  function handleLogout() {
    clearStoreSession();
    router.push("/store");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16 min-h-[calc(100vh-280px)] animate-pulse font-sans">
        <div className="h-6 w-40 rounded-lg bg-stone-200 mb-8" />
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="h-56 rounded-3xl border border-stone-200 bg-white" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl border border-stone-200 bg-white" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16 min-h-[calc(100vh-280px)] font-sans">
      <div className="mb-8 flex flex-col gap-1 border-b pb-5 border-stone-200">
        <h1 className="text-2xl font-bold font-serif uppercase text-stone-850">
          আমার অর্ডারসমূহ
        </h1>
        <p className="text-xs text-stone-500 font-semibold tracking-wide">
          ডেলিভারি স্ট্যাটাস ও অর্ডার ডিটেইলস (My Orders)
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        
        {/* Navigation Sidebar */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-xs border border-stone-200/60">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm bg-[#2E7D32] shadow-xs shadow-[#2E7D32]/25">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs truncate text-stone-850">
                  {user?.name}
                </p>
                <p className="text-[10px] text-stone-500 truncate mt-0.5 font-medium">
                  {user?.email}
                </p>
              </div>
            </div>

            <nav className="space-y-1 text-xs">
              {[
                { href: "/store/account", label: "অ্যাকাউন্ট (Profile)", icon: "👤" },
                { href: "/store/orders", label: "অর্ডারসমূহ (Orders)", icon: "📦", active: true },
                { href: "/store/wishlist", label: "পছন্দের তালিকা (Wishlist)", icon: "♡" },
                { href: "/store/cart", label: "শপিং কার্ট (Cart)", icon: "🛒" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all border duration-200"
                  style={
                    item.active
                      ? {
                          backgroundColor: "#2E7D32",
                          color: "#ffffff",
                          borderColor: "#2E7D32",
                          boxShadow: "0 4px 10px -2px rgba(46, 125, 50, 0.2)"
                        }
                      : {
                          color: "var(--store-text-muted)",
                          borderColor: "transparent",
                        }
                  }
                >
                  <span className="text-xs">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50 transition border border-transparent text-left cursor-pointer"
              >
                <span className="text-xs">🚪</span>
                <span>লগআউট (Logout)</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-3xl bg-white border border-stone-200/60 p-16 text-center shadow-xs">
              <p className="text-3xl mb-4">📦</p>
              <p className="text-sm font-bold uppercase tracking-wider text-stone-800">
                এখনো কোনো অর্ডার নেই
              </p>
              <p className="mt-2 text-xs text-stone-500 font-semibold">
                নতুন সংগ্রহের সুস্বাদু ও ফরমালিন মুক্ত আম অর্ডার করুন এখনই।
              </p>
              <Link
                href="/store/products"
                className="mt-6 inline-flex rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors bg-[#2E7D32] hover:bg-[#1B5E20] shadow-xs cursor-pointer btn-premium"
              >
                আমসমূহ দেখুন
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/store/orders/${order.id}`}
                  className="block rounded-2xl bg-white p-6 border border-stone-200/60 transition-all duration-300 hover:border-[#2E7D32]/50 hover:shadow-md shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-xs text-stone-850">
                          #{order.orderNumber}
                        </span>
                        <span className={`inline-block rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-700 border border-stone-200"}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 font-semibold">
                        তারিখ: {new Date(order.placedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                      <p className="text-[11px] text-stone-605 font-bold">
                        মোট {order.items.length}টি পণ্য
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-stone-200/60">
                      <p className="font-black text-sm text-[#2E7D32] font-display">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-[10px] mt-1 font-semibold text-stone-500">
                        পেমেন্ট: <span className="text-[#2E7D32] font-extrabold">{order.paymentStatus}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
