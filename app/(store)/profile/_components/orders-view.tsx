"use client";

import { useState, useEffect, useCallback } from "react";
import { FiShoppingBag, FiLoader, FiClock, FiCheckCircle, FiX, FiTruck } from "react-icons/fi";
import { getCustomerToken } from "@/lib/storefront-api";
import ResolvedImage from "./image-resolver";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  variant?: {
    image?: string;
    product?: {
      name: string;
      image?: string;
      media?: Array<{
        isFeatured?: boolean;
        media?: { url?: string };
        url?: string;
      }>;
    };
  };
  product?: {
    name?: string;
    media?: Array<{
      isFeatured?: boolean;
      media?: { url?: string };
      url?: string;
    }>;
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
  shippingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    city: string;
    country: string;
  };
}

export default function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) return;

    setOrdersLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load orders history:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[10px] font-bold tracking-[0.16em] uppercase text-zinc-400 mb-1">
          Order History
        </h2>
        <p className="font-['Bembo_Std'] text-zinc-650 text-base italic">
          Review details and tracking information for your store orders.
        </p>
      </div>

      {ordersLoading ? (
        <div className="flex justify-center py-16">
          <FiLoader className="w-8 h-8 text-[#C5B382] animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-200">
          <FiShoppingBag className="mx-auto text-4xl text-zinc-300 mb-4" />
          <p className="font-sans text-sm text-zinc-500">
            You haven't placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const formattedDate = new Date(order.placedAt || order.createdAt).toLocaleDateString();
            const formattedTotal = Number(order.total).toFixed(2);
            const badgeTone = order.status === "delivered"
              ? "bg-green-150 text-green-800"
              : order.status === "shipped"
              ? "bg-blue-150 text-blue-800"
              : "bg-amber-150 text-amber-800";

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="flex flex-wrap items-center justify-between border border-stone-200 px-5 py-4 hover:border-[#C5B382] transition cursor-pointer bg-white rounded-lg shadow-xs"
              >
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-xs uppercase text-zinc-800 tracking-wider">
                    Order {order.orderNumber}
                  </h3>
                  <p className="font-sans text-[10px] text-zinc-400">
                    Placed on: {formattedDate}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans tracking-wide ${badgeTone}`}>
                    {order.status}
                  </span>
                  <span className="font-sans text-sm font-bold text-neutral-800">
                    ${formattedTotal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Order Detailed Drawer Panel Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-250 max-w-lg w-full rounded shadow-xl overflow-hidden relative animate-fadeIn">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 transition cursor-pointer"
              aria-label="Close details modal"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-150 pb-4">
                <div>
                  <h3 className="font-sans font-bold text-sm uppercase text-neutral-800 tracking-wider">
                    Invoice: {selectedOrder.orderNumber}
                  </h3>
                  <p className="font-sans text-[10px] text-zinc-400 mt-1">
                    Placed on: {new Date(selectedOrder.placedAt || selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase font-sans tracking-wide ${
                  selectedOrder.status === "delivered"
                    ? "bg-green-150 text-green-800"
                    : selectedOrder.status === "shipped"
                    ? "bg-blue-150 text-blue-800"
                    : "bg-amber-150 text-amber-800"
                }`}>
                  {selectedOrder.status}
                </span>
              </div>

              {/* Order Items List */}
              <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-400">
                  Items Purchased
                </h4>
                {selectedOrder.items?.map((item) => {
                  // Resolve item product media url cleanly in Javascript logic block
                  const media = item.variant?.product?.media;
                  const itemMediaUrl = item.variant?.product?.image
                    || (Array.isArray(media) && (media.find((m: any) => m.isFeatured)?.media?.url || media[0]?.media?.url || media[0]?.url))
                    || (Array.isArray(item.product?.media) && (item.product.media.find((m: any) => m.isFeatured)?.media?.url || item.product.media[0]?.media?.url))
                    || item.variant?.image
                    || null;

                  return (
                    <div key={item.id} className="flex items-center justify-between border-b border-stone-100 pb-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-stone-50 border border-stone-200 rounded">
                          <ResolvedImage
                            src={itemMediaUrl}
                            alt={item.variant?.product?.name || item.product?.name || "Product"}
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-800 font-sans">
                            {item.variant?.product?.name || item.product?.name || "Product"}
                          </p>
                          <p className="text-xs text-zinc-500 font-sans">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-sans text-xs font-bold text-zinc-800">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Address details */}
              {selectedOrder.shippingAddress && (
                <div className="pt-4 border-t border-stone-150 space-y-2">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-400">
                    Delivery Address
                  </h4>
                  <p className="font-sans text-xs text-zinc-800 font-semibold">
                    {selectedOrder.shippingAddress.fullName}
                  </p>
                  <p className="font-sans text-xs text-zinc-500">
                    {selectedOrder.shippingAddress.addressLine1}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}
                  </p>
                  <p className="font-sans text-xs text-zinc-500">
                    Phone: {selectedOrder.shippingAddress.phone}
                  </p>
                </div>
              )}

              {/* Total Row */}
              <div className="pt-4 border-t border-stone-150 flex justify-between items-center">
                <span className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-400">
                  Total Paid
                </span>
                <span className="font-sans text-lg font-black text-[#1A1A1A]">
                  ${Number(selectedOrder.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
