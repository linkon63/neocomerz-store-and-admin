"use client";

import { useState } from "react";
import { useOrders } from "../../_components/use-orders";
import { resolveImageUrl } from "../../shop/products";
import type { OrderData } from "../../../types/order";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-neutral-100 text-neutral-600",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price: string | number) {
  const num = typeof price === "string" ? Number.parseFloat(price) : price;
  return `€${num.toFixed(2)}`;
}

export default function ProfileOrders() {
  const { orders, loading } = useOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      <h2 className="font-bembo text-3xl font-bold">Orders</h2>
      <p className="mt-2 text-sm text-neutral-500">Track, return, or buy items again</p>

      <div className="mt-8 space-y-4">
        {loading ? (
          <p className="text-center text-sm text-neutral-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="rounded-lg border border-neutral-200 px-5 py-12 text-center text-sm text-neutral-500">
            You haven&apos;t placed any orders yet.
          </p>
        ) : (
          orders.map((order: OrderData) => {
            const itemCount = order.items?.length ?? 0;
            const isExpanded = expandedId === order.id;

            return (
              <div key={order.id}>
                <div className="flex flex-wrap items-center justify-between gap-4 border border-neutral-200 px-5 py-4 transition hover:border-neutral-400">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.08em]">{order.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {formatDate(order.placedAt)} &middot; {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${statusColors[order.status] ?? "bg-neutral-100 text-neutral-600"}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm font-bold">{formatPrice(order.total)}</span>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="text-[10px] font-bold uppercase tracking-[0.08em] underline underline-offset-2 transition hover:text-neutral-500"
                    >
                      {isExpanded ? "Hide" : "View"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border border-t-0 border-neutral-200 px-5 py-5">
                    <div className="space-y-4">
                      {order.items?.map((item) => {
                        const featured =
                          item.product.media?.find((m) => m.isFeatured) ?? item.product.media?.[0];
                        const image = resolveImageUrl(featured?.media?.url);
                        let variantLabel = "";
                        if (item.variant?.attributes) {
                          const vals = item.variant.attributes
                            .map((a) => a.attributeValue?.value)
                            .filter(Boolean);
                          if (vals.length) variantLabel = ` – ${vals.join(", ")}`;
                        }
                        return (
                          <div key={item.id} className="flex items-center gap-4">
                            <img
                              src={image}
                              alt={item.product.name}
                              className="h-16 w-16 object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">
                                {item.product.name}{variantLabel}
                              </p>
                              <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-bold">{formatPrice(item.totalPrice)}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 grid gap-4 border-t border-neutral-100 pt-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-500">
                          Shipping Address
                        </p>
                        <p className="mt-1 text-sm">{order.address?.fullName}</p>
                        <p className="text-sm text-neutral-600">{order.address?.phone}</p>
                        <p className="text-sm text-neutral-600">{order.address?.addressLine1}</p>
                        {order.address?.addressLine2 && (
                          <p className="text-sm text-neutral-600">{order.address?.addressLine2}</p>
                        )}
                        <p className="text-sm text-neutral-600">
                          {order.address?.city}, {order.address?.state} {order.address?.postalCode}
                        </p>
                        <p className="text-sm text-neutral-600">{order.address?.country}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-500">
                          Payment
                        </p>
                        <p className="mt-1 text-sm capitalize">{order.paymentStatus}</p>
                        {Number(order.discount) > 0 && (
                          <p className="mt-1 text-sm text-neutral-600">
                            Discount: &minus;{formatPrice(order.discount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
