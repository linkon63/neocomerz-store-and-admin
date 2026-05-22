"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ordersApi, type Order, formatPrice, getStoreToken, getStoredUser, type StoreUser } from "@/lib/store-api";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200/50",
  processing: "bg-blue-50 text-blue-700 border border-blue-200/50",
  shipped: "bg-indigo-50 text-indigo-700 border border-indigo-200/50",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
  cancelled: "bg-red-50 text-red-700 border border-red-200/50",
  returned: "bg-gray-50 text-gray-700 border border-gray-200/50",
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

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-6 w-40 rounded-lg bg-gray-100 mb-6" />
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <div className="h-56 rounded-2xl border bg-white" style={{ borderColor: "var(--store-border)" }} />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl border bg-white" style={{ borderColor: "var(--store-border)" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 min-h-[calc(100vh-280px)]">
      <div className="mb-8 flex flex-col gap-1 border-b pb-5" style={{ borderColor: "var(--store-border)" }}>
        <h1 className="text-[26px] font-black tracking-tight" style={{ color: "var(--store-text)" }}>
          My Orders
        </h1>
        <p className="text-[13px]" style={{ color: "var(--store-text-muted)" }}>
          Track delivery status and view order details
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        
        {/* Navigation Sidebar (Shared with account setting for cohesion) */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm border" style={{ borderColor: "var(--store-border)" }}>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b" style={{ borderColor: "var(--store-border)" }}>
              <div
                className="w-11 h-11 rounded-xl text-white flex items-center justify-center font-black text-base"
                style={{ backgroundColor: "var(--store-primary)" }}
              >
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[14px] truncate" style={{ color: "var(--store-text)" }}>
                  {user?.name}
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--store-text-muted)" }}>
                  {user?.email}
                </p>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { href: "/store/account", label: "Account", icon: "👤" },
                { href: "/store/orders", label: "My Orders", icon: "📦", active: true },
                { href: "/store/wishlist", label: "Wishlist", icon: "♡" },
                { href: "/store/cart", label: "Cart", icon: "🛒" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors"
                  style={
                    item.active
                      ? {
                          backgroundColor: "var(--store-primary-light)",
                          color: "var(--store-primary)",
                          border: "1px solid var(--store-primary-mid)",
                        }
                      : { color: "var(--store-text-muted)" }
                  }
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <button
                onClick={() => {
                  try {
                    localStorage.removeItem("store_token");
                    localStorage.removeItem("store_user");
                  } catch {}
                  router.push("/store");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 transition"
              >
                <span className="text-sm">🚪</span>
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-2xl bg-white border p-12 text-center" style={{ borderColor: "var(--store-border)" }}>
              <p className="text-3xl mb-3">📦</p>
              <p className="text-[16px] font-bold" style={{ color: "var(--store-text)" }}>
                No orders placed yet
              </p>
              <p className="mt-2 text-[13px]" style={{ color: "var(--store-text-muted)" }}>
                Browse our curated collections and find something premium.
              </p>
              <Link
                href="/store/products"
                className="mt-6 inline-flex rounded-xl px-6 py-3 text-[13px] font-bold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "var(--store-primary)" }}
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/store/orders/${order.id}`}
                  className="block rounded-2xl bg-white p-5 border transition-all hover:shadow-sm"
                  style={{ borderColor: "var(--store-border)" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[13px]" style={{ color: "var(--store-text)" }}>
                          #{order.orderNumber}
                        </span>
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px]" style={{ color: "var(--store-text-muted)" }}>
                        Placed: {new Date(order.placedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                      <p className="text-[12px]" style={{ color: "var(--store-text-muted)" }}>
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-3.5 sm:pt-0" style={{ borderColor: "var(--store-border)" }}>
                      <p className="font-black text-[16px]" style={{ color: "var(--store-text)" }}>
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-[11px] mt-1" style={{ color: "var(--store-text-muted)" }}>
                        Payment: {order.paymentStatus}
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
