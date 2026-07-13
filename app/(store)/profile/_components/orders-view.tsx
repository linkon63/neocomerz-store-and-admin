"use client";

import { useState, useEffect, useCallback } from "react";
import { FiShoppingBag, FiLoader, FiX, FiPackage, FiMapPin, FiChevronRight } from "react-icons/fi";
import { getCustomerToken } from "@/lib/storefront-api";
import ResolvedImage from "./image-resolver";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

const SECTION_LABEL = "text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice?: string;
  totalPrice?: string;
  price?: string;
  variant?: {
    image?: string;
    product?: {
      name?: string;
      media?: Array<{ isFeatured?: boolean; media?: { url?: string }; url?: string }>;
    };
  };
  product?: {
    name?: string;
    media?: Array<{ isFeatured?: boolean; media?: { url?: string }; url?: string }>;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  placedAt: string;
  createdAt: string;
  items?: OrderItem[];
  shippingAddress?: { fullName: string; phone: string; addressLine1: string; city: string; country: string };
  address?: { fullName: string; phone: string; addressLine1: string; city: string; country: string };
}

function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":  return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "shipped":    return "bg-sky-50 text-sky-700 border-sky-200";
    case "processing": return "bg-amber-50 text-amber-700 border-amber-200";
    case "cancelled":  return "bg-red-50 text-red-700 border-red-200";
    case "returned":   return "bg-purple-50 text-purple-700 border-purple-200";
    default:           return "bg-stone-50 text-stone-600 border-stone-200";
  }
}

function resolveItemImage(item: OrderItem): string | null {
  const media = item.variant?.product?.media ?? item.product?.media;
  return (
    (Array.isArray(media) && (
      media.find((m) => m.isFeatured)?.media?.url ??
      media[0]?.media?.url ??
      media[0]?.url
    )) ||
    item.variant?.image ||
    null
  );
}

export default function OrdersView() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : (data?.data ?? []));
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const shippingAddr = selected?.shippingAddress ?? selected?.address;

  return (
    <div className="space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <p className={SECTION_LABEL}>Purchase History</p>
        <h2 className="font-['Bembo_Std'] text-2xl text-zinc-850 font-normal mt-1">
          My Orders
          {orders.length > 0 && (
            <span className="ml-3 font-sans text-sm font-normal text-zinc-400">({orders.length})</span>
          )}
        </h2>
        <p className="font-['Bembo_Std'] text-zinc-400 text-sm italic mt-0.5">
          Review and track all your store purchases.
        </p>
      </div>

      {/* ── List ────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <FiLoader className="w-7 h-7 text-[#C5B382] animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-stone-200 rounded-xl">
          <FiShoppingBag className="text-4xl text-zinc-200 mb-4" />
          <p className="font-['Bembo_Std'] text-zinc-400 text-base italic">No orders placed yet.</p>
          <p className="font-sans text-xs text-zinc-300 mt-1">
            Your order history will appear here after your first purchase.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const date  = new Date(order.placedAt || order.createdAt).toLocaleDateString("en-US", {
              day: "numeric", month: "short", year: "numeric",
            });

            return (
              <button
                key={order.id}
                onClick={() => setSelected(order)}
                className="w-full text-left flex items-center gap-4 border border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm rounded-xl px-5 py-4 transition-all duration-200 cursor-pointer group"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                  <FiPackage className="text-zinc-400 text-base" />
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-800">
                      {order.orderNumber}
                    </p>
                    <span className={`border font-sans text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${statusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="font-sans text-[10px] text-zinc-400 mt-0.5">
                    {date}
                    {order.items?.length ? ` · ${order.items.length} item${order.items.length !== 1 ? "s" : ""}` : ""}
                  </p>
                </div>

                {/* Total + chevron */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-sans font-bold text-sm text-zinc-800">
                    ৳{Number(order.total || 0).toLocaleString()}
                  </span>
                  <FiChevronRight className="text-zinc-300 group-hover:text-zinc-500 transition text-base" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal ─────────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="flex items-start justify-between px-7 py-5 border-b border-stone-100">
              <div>
                <p className={SECTION_LABEL}>Order Details</p>
                <h3 className="font-['Bembo_Std'] text-xl text-zinc-850 mt-0.5">{selected.orderNumber}</h3>
                <p className="font-sans text-[10px] text-zinc-400 mt-0.5">
                  Placed{" "}
                  {new Date(selected.placedAt || selected.createdAt).toLocaleDateString("en-US", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`border font-sans text-[9px] font-bold tracking-wider uppercase px-3 py-1 rounded-full ${statusStyle(selected.status)}`}>
                  {selected.status}
                </span>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
                  aria-label="Close"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="px-7 py-6 space-y-6 max-h-[65vh] overflow-y-auto">

              {/* Items */}
              {selected.items && selected.items.length > 0 && (
                <div>
                  <p className="font-sans text-[10px] font-bold tracking-[0.16em] uppercase text-zinc-400 mb-3">
                    Items ({selected.items.length})
                  </p>
                  <div className="space-y-3">
                    {selected.items.map((item) => {
                      const name  = item.variant?.product?.name ?? item.product?.name ?? "Product";
                      const price = Number(item.totalPrice ?? item.unitPrice ?? item.price ?? 0);
                      return (
                        <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-stone-100 last:border-0 last:pb-0">
                          <div className="w-11 h-11 bg-stone-50 border border-stone-100 rounded-lg overflow-hidden shrink-0 relative">
                            <ResolvedImage src={resolveItemImage(item)} alt={name} className="object-contain p-1" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-sans font-bold text-xs text-zinc-800 truncate">{name}</p>
                            <p className="font-sans text-[10px] text-zinc-400 mt-0.5">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-sans font-bold text-xs text-zinc-800 shrink-0">
                            ৳{Number(price || 0).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Shipping address */}
              {shippingAddr && (
                <div>
                  <p className="font-sans text-[10px] font-bold tracking-[0.16em] uppercase text-zinc-400 mb-3 flex items-center gap-1.5">
                    <FiMapPin className="text-xs" /> Delivery Address
                  </p>
                  <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 space-y-0.5">
                    <p className="font-sans font-bold text-xs text-zinc-800">{shippingAddr.fullName}</p>
                    <p className="font-sans text-xs text-zinc-500">{shippingAddr.addressLine1}</p>
                    <p className="font-sans text-xs text-zinc-500">{shippingAddr.city}, {shippingAddr.country}</p>
                    <p className="font-sans text-xs text-zinc-500">{shippingAddr.phone}</p>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                <p className="font-sans text-[10px] font-bold tracking-[0.16em] uppercase text-zinc-400">
                  Total Paid
                </p>
                <p className="font-['Bembo_Std'] text-xl text-zinc-850">
                  ৳{Number(selected.total).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
