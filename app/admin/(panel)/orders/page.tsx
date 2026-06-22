"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { InfiniteScroll } from "../../_components/infinite-scroll";
import { AdminIcon, PageHeader, ProductThumb } from "../../_components/admin-shell";
import {
  apiRequest,
  formatMoney,
  resolveImageUrl,
  type Order,
  type OrderPaymentStatus,
  type OrderStatus,
  type PaginatedOrders,
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

const PAGE_SIZE = 20;

function statusTone(status: OrderStatus) {
  switch (status) {
    case "delivered":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    case "shipped":
    case "processing":
      return "border-slate-200 bg-slate-50 text-slate-700";
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

function statusIcon(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "calendar";
    case "processing":
      return "refresh";
    case "shipped":
      return "package";
    case "delivered":
      return "check";
    case "cancelled":
    case "returned":
      return "x";
    default:
      return "orders";
  }
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

const PAYMENT_STATUS_OPTIONS: { value: OrderPaymentStatus; label: string }[] = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

function RichDropdown<T extends string>({
  value,
  options,
  onChange,
  getTone,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  getTone: (val: T) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-44 items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 hover:border-slate-400 cursor-pointer shadow-xs"
      >
        <span className={`inline-flex rounded border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getTone(value)}`}>
          {selectedOption.label}
        </span>
        <svg
          className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-md ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer text-left ${
                    isSelected ? "bg-slate-50 text-slate-900" : "text-slate-600 hover:bg-slate-50/70 hover:text-slate-900"
                  }`}
                >
                  <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold capitalize ${getTone(opt.value)}`}>
                    {opt.label}
                  </span>
                  {isSelected && (
                    <svg className="h-3.5 w-3.5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
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

  // Honour deep-links from the dashboard cards, e.g. /admin/orders?status=pending
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
      if (myReq !== reqRef.current) return; // a newer request superseded this one
      setOrders((prev) => page === 1 ? res.data : [...prev, ...res.data.filter((o) => !prev.some((p) => p.id === o.id))]);
      setTotal(res.meta.total);
      setSelectedId((prev) => {
        if (page === 1) {
          return prev && res.data.some((o) => o.id === prev) ? prev : res.data[0]?.id ?? null;
        }
        return prev;
      });
    } catch (err) {
      if (myReq !== reqRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load orders");
      setOrders([]);
    } finally {
      if (myReq === reqRef.current) setIsLoading(false);
    }
  }, [page, status, paymentStatus, search]);

  async function updateOrderStatus(newStatus: OrderStatus) {
    if (!selectedId) return;
    setError("");
    try {
      await apiRequest(`/orders/${selectedId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await loadOrders();
      const msg = newStatus === "cancelled" ? "Order cancelled." : newStatus === "returned" ? "Order returned." : "Order accepted.";
      toast.success(msg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order status");
    }
  }

  async function updatePaymentStatus(newPaymentStatus: OrderPaymentStatus) {
    if (!selectedId) return;
    setError("");
    try {
      await apiRequest(`/orders/${selectedId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      await loadOrders();
      toast.success("Payment status updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payment status");
    }
  }

  // Debounce search; refetch on status/page changes immediately.
  useEffect(() => {
    const timer = setTimeout(loadOrders, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [loadOrders, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  );

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

  return (
    <>
      <PageHeader
        title="Orders"
        description="Search, filter, and manage customer orders."
        action={
          <span className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-xs">
            <AdminIcon className="h-4 w-4 text-slate-400" name="orders" />
            {total} total
          </span>
        }
      />

      <section>
        <div className="mb-6 flex gap-6 overflow-x-auto border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              className={`whitespace-nowrap pb-3 text-sm font-semibold transition-all duration-200 border-b-2 -mb-[2px] cursor-pointer ${
                status === tab.key
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
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
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-amber-700">
              Payment: {paymentStatus}
              <button
                aria-label="Clear payment filter"
                className="grid h-4 w-4 place-items-center rounded-full hover:bg-amber-100/80 cursor-pointer"
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
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-7 xl:grid-cols-[380px_1fr]">
          <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
            <div className="flex flex-col gap-2 p-3 border-b border-slate-100 bg-slate-50/50">
              <label className="flex h-11 items-center gap-2 rounded-lg border-2 border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
                <input
                  className="w-full bg-transparent text-xs font-medium outline-none text-slate-700 placeholder:text-slate-400"
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Order no. / Name / Phone"
                  value={search}
                />
              </label>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payment:</span>
                <select
                  value={paymentStatus}
                  onChange={(e) => {
                    setPaymentStatus(e.target.value as OrderPaymentStatus | "");
                    setPage(1);
                  }}
                  className="h-11 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
                >
                  <option value="">All Payments</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 p-3 max-h-[calc(100vh-280px)] overflow-y-auto bg-slate-50/30">
              {isLoading && page === 1 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div className="h-20 animate-pulse bg-slate-100 rounded-md" key={i} />
                ))
              ) : orders.length === 0 ? (
                <p className="p-6 text-center text-xs font-semibold text-slate-400">No orders found.</p>
              ) : (
                orders.map((order) => (
                  <button
                    className={`group flex w-full flex-col gap-2 rounded-md border p-3.5 text-left transition-all ${
                      order.id === selectedId
                        ? "bg-slate-50 border-slate-300 shadow-xs border-l-4 border-l-slate-800 pl-[11px]"
                        : "bg-white border-slate-100 hover:border-slate-200 border-l-4 border-l-transparent pl-[11px]"
                    }`}
                    key={order.id}
                    onClick={() => setSelectedId(order.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-2 w-full">
                      <span className="truncate font-semibold text-slate-800 text-[13px] group-hover:text-slate-950 transition-colors">
                        #{order.orderNumber}
                      </span>
                      <span className="shrink-0 font-semibold text-slate-900 text-sm">
                        {formatMoney(order.total)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 w-full">
                      <span>{formatDateTime(order.placedAt)}</span>
                      <span>{order.items?.length ?? 0} {order.items?.length === 1 ? "item" : "items"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 w-full flex-wrap">
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold capitalize tracking-wide ${statusTone(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold capitalize tracking-wide ${paymentTone(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </button>
                ))
              )}

              <InfiniteScroll
                hasMore={page < totalPages}
                isLoading={isLoading}
                onLoadMore={() => setPage((p) => p + 1)}
                loadingLabel="Loading more orders..."
                allLoadedLabel="All orders loaded"
              />
            </div>
          </aside>

          <section>
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-[500px] rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                <AdminIcon className="h-10 w-10 text-slate-400 mb-3" name="orders" />
                <h3 className="font-semibold text-slate-700 text-sm">No Order Selected</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                  Select an order from the list on the left to view details and update its status.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-lg bg-white p-4 sm:flex-row sm:items-center shadow-xs border border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 place-items-center rounded-full border shadow-sm ring-4 ring-offset-0 ${
                      selected.status === "delivered"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600 ring-emerald-50"
                        : selected.status === "cancelled" || selected.status === "returned"
                          ? "border-rose-200 bg-rose-50 text-rose-600 ring-rose-50"
                          : selected.status === "pending"
                            ? "border-amber-200 bg-amber-50 text-amber-600 ring-amber-50"
                            : "border-slate-200 bg-slate-50/80 text-slate-600 ring-slate-100"
                    }`}>
                      <AdminIcon className="h-5 w-5" name={statusIcon(selected.status)} />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        Order #{selected.orderNumber}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Placed on {formatDateTime(selected.placedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Order Status</span>
                      <div className="flex items-center gap-2 h-10">
                        <span className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize ${statusTone(selected.status)}`}>
                          {selected.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Payment Status</span>
                      <RichDropdown
                        value={selected.paymentStatus}
                        options={PAYMENT_STATUS_OPTIONS}
                        onChange={updatePaymentStatus}
                        getTone={paymentTone}
                      />
                    </div>
                    {(selected.status === "pending" || selected.status === "processing") && (
                      <div className="flex items-end gap-2">
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(selected.status === "pending" ? "processing" : "shipped")}
                          className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => updateOrderStatus("cancelled")}
                          className="h-11 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {selected.status === "shipped" && (
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => updateOrderStatus("delivered")}
                          className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 cursor-pointer"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                    {selected.status === "delivered" && (
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => updateOrderStatus("returned")}
                          className="h-11 rounded-lg bg-amber-500 px-5 text-sm font-semibold text-white transition hover:bg-amber-600 cursor-pointer"
                        >
                          Return
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 mb-6">
                  {/* Customer Info Card */}
                  <div className="rounded-lg border border-slate-200/60 bg-white p-5 shadow-xs">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Customer Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 font-semibold text-slate-700 text-sm">
                          {(selected.user?.name ?? "G").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {selected.user?.name ?? "Guest Customer"}
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {selected.user?.email ?? "No email provided"}
                          </p>
                        </div>
                      </div>
                      {selected.user?.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="font-medium text-slate-400">Phone:</span>
                          <span className="font-semibold">{selected.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Info Card */}
                  <div className="rounded-lg border border-slate-200/60 bg-white p-5 shadow-xs">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Shipping Address
                    </h3>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                      {selected.address
                        ? [
                            selected.address.fullName || selected.user?.name,
                            selected.address.phone || selected.user?.phone,
                            selected.address.addressLine1,
                            selected.address.addressLine2,
                            selected.address.city,
                            selected.address.state,
                            selected.address.postalCode,
                            selected.address.country,
                          ]
                            .filter(Boolean)
                            .join(", ") || "No address details available"
                        : "No address details available"}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200/60 bg-white shadow-xs overflow-hidden">
                  <div className="border-b border-slate-100 p-5 bg-slate-50 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Order Items
                    </h3>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                      {selected.items?.length ?? 0} {selected.items?.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                      <div className="space-y-4">
                        {(selected.items ?? []).map((item, index) => {
                          const mediaUrl = item.product?.media?.find((m) => m.isFeatured)?.media?.url 
                            || item.product?.media?.[0]?.media?.url 
                            || null;
                          const resolvedUrl = mediaUrl ? resolveImageUrl(mediaUrl) : null;

                          return (
                            <div className="flex gap-4 items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0" key={item.id}>
                              {resolvedUrl ? (
                                <img
                                  alt={item.product?.name ?? "Product"}
                                  className="h-12 w-16 rounded-md border border-slate-150 object-cover bg-white shrink-0"
                                  src={resolvedUrl}
                                />
                              ) : (
                                <ProductThumb color={["bg-slate-500/80", "bg-slate-600/80", "bg-slate-400/80"][index % 3]} />
                              )}
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-semibold text-slate-800 uppercase truncate">
                                  {item.product?.name ?? "Product"}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded">
                                    SKU: {item.variant?.sku ?? "—"}
                                  </span>
                                  {item.variant?.sku && (
                                    <span className="text-[10px] text-slate-300">|</span>
                                  )}
                                  <span className="text-[11px] font-medium text-slate-500">
                                    {item.quantity} × {formatMoney(item.unitPrice)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-semibold text-slate-800">
                                  {formatMoney(item.totalPrice)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        {(selected.items ?? []).length === 0 && (
                          <p className="text-xs font-semibold text-slate-400 text-center py-6">No items in this order.</p>
                        )}
                      </div>

                      {totals && (
                        <div className="rounded-lg border border-slate-200/60 bg-slate-50/80 p-4 shrink-0 h-fit">
                          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                            Payment Summary
                          </h4>
                          <div className="space-y-2.5 text-xs text-slate-600">
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-medium">Subtotal</span>
                              <span className="font-semibold text-slate-800">{formatMoney(totals.subtotal)}</span>
                            </div>
                            
                            {totals.discount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Discount</span>
                                <span className="font-semibold text-rose-600">- {formatMoney(totals.discount)}</span>
                              </div>
                            )}

                            <div className="flex justify-between">
                              <span className="text-slate-500 font-medium">Delivery Charge</span>
                              <span className="font-semibold text-slate-800">{formatMoney(totals.shipping)}</span>
                            </div>

                            <div className="border-t border-slate-200/60 pt-2.5 flex justify-between items-center">
                              <span className="font-semibold text-slate-800 text-[13px]">Total</span>
                              <span className="font-semibold text-slate-900 text-[15px]">{formatMoney(totals.grand)}</span>
                            </div>

                            <div className="flex justify-between items-center text-emerald-600 bg-emerald-50/50 px-2 py-1.5 rounded-md border border-emerald-100/50 mt-1">
                              <span className="font-semibold text-[11px]">Paid Amount</span>
                              <span className="font-semibold text-xs">{formatMoney(totals.paid)}</span>
                            </div>

                            <div className="flex justify-between items-center text-rose-600 bg-rose-50/50 px-2 py-1.5 rounded-md border border-rose-100/50 mt-1">
                              <span className="font-semibold text-[11px]">Due Amount</span>
                              <span className="font-semibold text-xs">{formatMoney(totals.due)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </section>
    </>
  );
}
