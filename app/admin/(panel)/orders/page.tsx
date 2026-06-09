"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import {
  apiRequest,
  formatMoney,
  type Order,
  type OrderPaymentStatus,
  type OrderStatus,
  type PaginatedOrders,
  type ProductMedia,
} from "../../../../lib/admin-api";

const TABS: { key: OrderStatus | ""; label: string }[] = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "returned", label: "Returned" },
];

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

const PAGE_SIZE = 20;

/**
 * Rewrites localhost file-server URLs to the public API host.
 * Works the same as resolveImageUrl in shop/products.ts.
 */
function resolveAdminImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("https://")) return url;
  if (url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1")) {
    const publicBase =
      process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "https://tinyecomapi.neocomerz.com";
    try {
      const parsed = new URL(url);
      return `${publicBase}${parsed.pathname}`;
    } catch {
      return null;
    }
  }
  return url;
}

function getProductImage(media?: ProductMedia[]): string | null {
  const item = media?.find((m) => m.isFeatured) ?? media?.[0];
  return resolveAdminImageUrl(item?.media?.url);
}

function statusTone(status: OrderStatus) {
  switch (status) {
    case "delivered":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    case "shipped":
    case "processing":
      return "border-blue-300 bg-blue-50 text-blue-700";
    case "cancelled":
    case "returned":
      return "border-rose-300 bg-rose-50 text-rose-700";
    default:
      return "border-amber-300 bg-amber-50 text-amber-700";
  }
}

function paymentTone(status: string) {
  if (status === "paid") return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "refunded") return "border-amber-300 bg-amber-50 text-amber-700";
  return "border-rose-300 bg-rose-50 text-rose-700";
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function num(value: unknown) {
  return Number(value ?? 0);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Status update state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState("");
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | "">("");

  // Honour deep-links from dashboard cards, e.g. /admin/orders?status=pending
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("status");
    const ps = params.get("paymentStatus");
    const q = params.get("search");
    if (s) setStatus(s as OrderStatus);
    if (ps) setPaymentStatus(ps as OrderPaymentStatus);
    if (q) setSearch(q);
  }, []);

  const reqRef = useRef(0);

  const loadOrders = useCallback(async () => {
    const myReq = ++reqRef.current;
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (status) params.set("status", status);
      if (paymentStatus) params.set("paymentStatus", paymentStatus);
      if (search.trim()) params.set("search", search.trim());

      const res = await apiRequest<PaginatedOrders>(`/orders?${params.toString()}`);
      if (myReq !== reqRef.current) return;
      setOrders(res.data);
      setTotal(res.meta.total);
      setSelectedId((prev) =>
        prev && res.data.some((o) => o.id === prev) ? prev : (res.data[0]?.id ?? null),
      );
    } catch (err) {
      if (myReq !== reqRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load orders");
      setOrders([]);
    } finally {
      if (myReq === reqRef.current) setIsLoading(false);
    }
  }, [page, status, paymentStatus, search]);

  // Debounce search; refetch immediately on status/page changes.
  useEffect(() => {
    const timer = setTimeout(loadOrders, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [loadOrders, search]);

  // Sync pending status selector when selected order changes
  useEffect(() => {
    setStatusUpdateError("");
    const order = orders.find((o) => o.id === selectedId);
    setPendingStatus(order?.status ?? "");
  }, [selectedId, orders]);

  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const totals = useMemo(() => {
    if (!selected) return null;
    const subtotal = (selected.items ?? []).reduce((sum, it) => sum + num(it.totalPrice), 0);
    const shipping = num(selected.shippingCost);
    const discount = num(selected.discount);
    const grand = num(selected.total);
    const paid = (selected.payments ?? [])
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + num(p.amount), 0);
    return { subtotal, shipping, discount, grand, paid, due: Math.max(0, grand - paid) };
  }, [selected]);

  async function handleStatusUpdate() {
    if (!selected || !pendingStatus || pendingStatus === selected.status) return;
    setIsUpdatingStatus(true);
    setStatusUpdateError("");
    try {
      const updated = await apiRequest<Order>(`/orders/${selected.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: pendingStatus }),
      });
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      setStatusUpdateError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Orders"
        description="Search, filter, and manage customer orders."
        action={
          <span className="inline-flex h-14 items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 font-black text-slate-600">
            <AdminIcon className="h-5 w-5" name="orders" />
            {total} total
          </span>
        }
      />

      <section>
        <div className="mb-6 flex gap-7 overflow-x-auto border-b border-slate-300">
          {TABS.map((tab) => (
            <button
              className={`whitespace-nowrap pb-4 text-lg font-black transition ${
                status === tab.key
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              key={tab.key || "all"}
              onClick={() => {
                setStatus(tab.key);
                setPaymentStatus("");
                setPage(1);
              }}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {paymentStatus && (
          <div className="mb-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-black capitalize text-amber-700">
              Payment: {paymentStatus}
              <button
                aria-label="Clear payment filter"
                className="grid h-4 w-4 place-items-center rounded-full hover:bg-amber-200"
                onClick={() => {
                  setPaymentStatus("");
                  setPage(1);
                }}
                type="button"
              >
                <AdminIcon className="h-3 w-3" name="x" />
              </button>
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 font-black text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-7 xl:grid-cols-[380px_1fr]">
          {/* ── Order list sidebar ─────────────────────────────── */}
          <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex gap-3 p-3">
              <label className="flex h-12 flex-1 items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-blue-500">
                <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
                <input
                  className="w-full bg-transparent font-medium outline-none"
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Order no. / Name / Phone"
                  value={search}
                />
              </label>
            </div>

            <div className="divide-y divide-slate-200">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div className="h-24 animate-pulse bg-slate-50" key={i} />
                ))
              ) : orders.length === 0 ? (
                <p className="p-6 text-center font-medium text-slate-400">No orders found.</p>
              ) : (
                orders.map((order) => (
                  <button
                    className={`flex w-full justify-between p-4 text-left transition ${
                      order.id === selectedId ? "bg-sky-50" : "bg-white hover:bg-slate-50"
                    }`}
                    key={order.id}
                    onClick={() => setSelectedId(order.id)}
                    type="button"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-black">{order.orderNumber}</p>
                      <p className="font-medium text-slate-600">
                        {order.user?.name ?? "Guest"}
                      </p>
                      <p className="text-sm font-medium text-slate-400">
                        {formatDateTime(order.placedAt)}
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-md border px-2 py-1 text-xs font-black capitalize ${statusTone(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-black">{formatMoney(order.total)}</p>
                      <p className="font-medium text-slate-700">
                        {order.items?.length ?? 0} items
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-md border px-2 py-1 text-xs font-black capitalize ${paymentTone(order.paymentStatus)}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 p-3 text-sm font-black">
                <button
                  className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  type="button"
                >
                  Prev
                </button>
                <span className="text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-40"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </aside>

          {/* ── Order detail panel ─────────────────────────────── */}
          <section>
            {!selected ? (
              <div className="grid h-full place-items-center rounded-xl border border-slate-200 bg-white p-12 font-black text-slate-400">
                Select an order to view details.
              </div>
            ) : (
              <>
                {/* Status bar */}
                <div className="mb-7 flex flex-col justify-between gap-4 rounded-xl bg-white p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-full ${statusTone(selected.status)}`}
                    >
                      <AdminIcon className="h-6 w-6" name="check" />
                    </span>
                    <div>
                      <p className="font-black capitalize">Order {selected.status}</p>
                      <p className="font-medium">{formatDateTime(selected.placedAt)}</p>
                    </div>
                  </div>

                  {/* Status update control */}
                  <div className="flex items-center gap-3">
                    <select
                      value={pendingStatus}
                      onChange={(e) => setPendingStatus(e.target.value as OrderStatus)}
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-bold text-sm capitalize outline-none focus:border-blue-500"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleStatusUpdate}
                      disabled={isUpdatingStatus || pendingStatus === selected.status}
                      className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-black text-white disabled:opacity-40 hover:bg-blue-700 transition"
                    >
                      {isUpdatingStatus ? "Saving…" : "Update Status"}
                    </button>
                  </div>
                </div>

                {statusUpdateError && (
                  <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">
                    {statusUpdateError}
                  </div>
                )}

                <article className="rounded-xl border border-slate-200 bg-white p-7">
                  <div className="grid gap-6 border-b border-slate-200 pb-7 lg:grid-cols-[1fr_360px]">
                    <div>
                      <h2 className="text-3xl font-black">
                        {selected.user?.name ?? "Guest"}
                        {selected.user?.phone ? ` (${selected.user.phone})` : ""}
                      </h2>
                      {selected.user?.email && (
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {selected.user.email}
                        </p>
                      )}
                      <p className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                        Shipping Address
                      </p>
                      {selected.address ? (
                        <div className="mt-3 text-sm font-medium text-slate-700 space-y-1">
                          <p className="font-black">{selected.address.fullName}</p>
                          <p>{selected.address.phone}</p>
                          <p>
                            {[
                              selected.address.addressLine1,
                              selected.address.addressLine2,
                              selected.address.city,
                              selected.address.state,
                              selected.address.postalCode,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          <p className="font-black">{selected.address.country}</p>
                        </div>
                      ) : (
                        <p className="mt-3 font-medium text-slate-400">No address on record.</p>
                      )}
                    </div>
                    <div className="grid grid-cols-[1fr_1fr] gap-y-3 text-right font-medium">
                      <p className="text-left text-slate-600">Order #</p>
                      <p className="font-black">{selected.orderNumber}</p>
                      <p className="text-left text-slate-600">Order Date</p>
                      <p className="font-black">{formatDateTime(selected.placedAt)}</p>
                      <p className="text-left text-slate-600">Order Type</p>
                      <p className="font-black capitalize">{selected.orderType ?? "retail"}</p>
                      <p className="text-left text-slate-600">Payment</p>
                      <p>
                        <span
                          className={`rounded-md border px-2 py-1 font-black capitalize ${paymentTone(selected.paymentStatus)}`}
                        >
                          {selected.paymentStatus}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Line items */}
                  <div className="grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-5">
                      {(selected.items ?? []).map((item) => {
                        const imageUrl = getProductImage(
                          item.product?.media as ProductMedia[] | undefined,
                        );
                        return (
                          <div className="flex gap-4" key={item.id}>
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={item.product?.name ?? "Product"}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-slate-200" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg font-black uppercase">
                                {item.product?.name ?? "Product"}
                              </h3>
                              <p className="font-medium text-slate-600">
                                SKU: {item.variant?.sku ?? "—"}
                              </p>
                              <p className="font-medium text-slate-600">
                                {item.quantity} × {formatMoney(item.unitPrice)} ={" "}
                                {formatMoney(item.totalPrice)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {(selected.items ?? []).length === 0 && (
                        <p className="font-medium text-slate-400">No line items.</p>
                      )}
                    </div>

                    {/* Order totals */}
                    {totals && (
                      <div>
                        <div className="grid grid-cols-2 gap-y-3 text-right font-medium">
                          <p className="text-left">Subtotal</p>
                          <p>{formatMoney(totals.subtotal)}</p>
                          {totals.discount > 0 && (
                            <>
                              <p className="text-left">Discount</p>
                              <p className="text-rose-600">- {formatMoney(totals.discount)}</p>
                            </>
                          )}
                          <p className="text-left">Delivery charge</p>
                          <p>+ {formatMoney(totals.shipping)}</p>
                          <p className="border-t border-slate-200 pt-3 text-left font-black">
                            Total
                          </p>
                          <p className="border-t border-slate-200 pt-3 font-black">
                            {formatMoney(totals.grand)}
                          </p>
                          <p className="text-left font-black text-emerald-600">Paid Amount</p>
                          <p className="font-black text-emerald-600">
                            {formatMoney(totals.paid)}
                          </p>
                          <p className="text-left font-black text-rose-600">Due Amount</p>
                          <p className="font-black text-rose-600">
                            {formatMoney(totals.due)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              </>
            )}
          </section>
        </div>
      </section>
    </>
  );
}
