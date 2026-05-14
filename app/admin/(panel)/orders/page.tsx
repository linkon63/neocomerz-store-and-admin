"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminIcon,
  PageHeader,
} from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import {
  apiRequest,
  formatDate,
  type Order,
  type OrderStatus,
} from "../../../../lib/admin-api";
import {
  calculateDueAmount,
  calculatePaidAmount,
  getPaymentStatusColor,
} from "../../lib/order-utils";

const TABS: { label: string; statuses: OrderStatus[] }[] = [
  { label: "Order Placed",  statuses: ["pending"] },
  { label: "Packaging",     statuses: ["processing"] },
  { label: "Ready to Ship", statuses: ["shipped"] },
  { label: "On the Way",    statuses: ["shipped"] },
  { label: "Delivered",     statuses: ["delivered"] },
  { label: "Failed",        statuses: ["returned", "cancelled"] },
];

type FilterState = {
  paymentStatus: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
};

const emptyFilter: FilterState = {
  paymentStatus: "",
  paymentMethod: "",
  startDate: "",
  endDate: "",
};

function NoOrderSelected() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white min-h-[600px] py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <AdminIcon className="h-8 w-8 text-slate-400" name="reviews" />
      </div>
      <p className="font-black text-slate-700">No Order Selected</p>
      <p className="mt-1 text-sm font-medium text-slate-400">
        Please select an order from the list on the left to view its details.
      </p>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(emptyFilter);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [actionError, setActionError] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  const loadOrders = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      const data = await apiRequest<Order[]>("/orders");
      setOrders(data);
      if (data.length > 0 && !selectedId) {
         const firstInTab = data.find(o => TABS[activeTab].statuses.includes(o.status as OrderStatus));
         if (firstInTab) setSelectedId(firstInTab.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesTab = TABS[activeTab].statuses.includes(o.status as OrderStatus);
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.user?.phone?.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q);
      
      const matchesPaymentStatus = !filters.paymentStatus || o.paymentStatus === filters.paymentStatus;
      const matchesPaymentMethod = !filters.paymentMethod || o.payments?.[0]?.method === filters.paymentMethod;
      
      let matchesDateRange = true;
      if (filters.startDate) {
        matchesDateRange = matchesDateRange && new Date(o.placedAt) >= new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchesDateRange = matchesDateRange && new Date(o.placedAt) <= new Date(filters.endDate);
      }

      return matchesTab && matchesSearch && matchesPaymentStatus && matchesPaymentMethod && matchesDateRange;
    });
  }, [orders, activeTab, search, filters]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const totalPages = Math.ceil(filtered.length / limit);
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const selected = useMemo(() => {
    return orders.find((o) => o.id === selectedId) ?? null;
  }, [orders, selectedId]);

  const handleUpdateStatus = useCallback(async (status: OrderStatus, note?: string) => {
    if (!selected) return;
    setActionError("");
    setIsActioning(true);
    try {
      await apiRequest(`/orders/${selected.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: note ?? "" }),
      });
      await loadOrders();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setIsActioning(false);
    }
  }, [selected, loadOrders]);

  const handleCancel = useCallback(async () => {
    if (!selected) return;
    setActionError("");
    setIsActioning(true);
    try {
      await apiRequest(`/orders/${selected.id}/cancel`, { method: "DELETE" });
      setCancelModalOpen(false);
      await loadOrders();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setIsActioning(false);
    }
  }, [selected, loadOrders]);

  const paidAmount = useMemo(() => calculatePaidAmount(selected?.payments), [selected]);
  const dueAmount = useMemo(() => calculateDueAmount(selected?.total || 0, paidAmount), [selected, paidAmount]);

  const handleMakePayment = useCallback(async () => {
    if (!selected || dueAmount <= 0) return;
    setActionError("");
    setIsActioning(true);
    try {
      await apiRequest("/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selected.id,
          amount: dueAmount,
          method: "Online",
          transactionId: `MANUAL-${Date.now()}`
        }),
      });
      await loadOrders();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsActioning(false);
    }
  }, [selected, dueAmount, loadOrders]);

  function clearFilters() {
    setFilters(emptyFilter);
    setPage(1);
  }

  return (
    <>
      <PageHeader
        title={TABS[activeTab].label}
        description={`Manage all ${TABS[activeTab].label.toLowerCase()} orders, view status logs, and update payment information.`}
        action={
          <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-[13px] font-black text-slate-600 hover:bg-slate-50 transition-colors">
            <AdminIcon className="h-4 w-4" name="download" />
            Export List
          </button>
        }
      />

      <div className="mb-6 flex overflow-x-auto border-b border-slate-200 bg-white rounded-t-xl">
        {TABS.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => {
              setActiveTab(index);
              setPage(1);
              const firstInTab = orders.find(o => tab.statuses.includes(o.status as OrderStatus));
              setSelectedId(firstInTab?.id || null);
            }}
            className={`shrink-0 whitespace-nowrap px-6 py-3 text-sm font-bold transition-colors ${
              activeTab === index
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-100 p-4 bg-slate-50/95 backdrop-blur-sm">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <AdminIcon className="h-4 w-4 shrink-0 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-slate-400"
                placeholder="Search order no. or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="grid h-6 w-6 place-items-center rounded-md hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <AdminIcon className="h-3 w-3" name="x" />
                </button>
              )}
            </label>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-all ${
                showFilters || hasActiveFilters
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              <AdminIcon className="h-4 w-4" name="filter" />
              {hasActiveFilters && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                  {Object.values(filters).filter((v) => v !== "").length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="border-b border-slate-200 bg-slate-50/50 p-4 space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">Filters</h4>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-black text-blue-600 hover:text-blue-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-black text-slate-700">Payment Status</span>
                <select
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium outline-none focus:border-blue-500"
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, paymentStatus: e.target.value }));
                    setPage(1);
                  }}
                  value={filters.paymentStatus}
                >
                  <option value="">All</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-black text-slate-700">Payment Method</span>
                <select
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium outline-none focus:border-blue-500"
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, paymentMethod: e.target.value }));
                    setPage(1);
                  }}
                  value={filters.paymentMethod}
                >
                  <option value="">All</option>
                  <option value="COD">COD</option>
                  <option value="Online">Online</option>
                  <option value="Card">Card</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-black text-slate-700">Start Date</span>
                <input
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium outline-none focus:border-blue-500"
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, startDate: e.target.value }));
                    setPage(1);
                  }}
                  type="date"
                  value={filters.startDate}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-black text-slate-700">End Date</span>
                <input
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium outline-none focus:border-blue-500"
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, endDate: e.target.value }));
                    setPage(1);
                  }}
                  type="date"
                  value={filters.endDate}
                />
              </label>
            </div>
          )}

          <div key={activeTab} className="flex-1 overflow-y-auto max-h-[600px] animate-in fade-in slide-in-from-left-2 duration-300">
            {isLoading ? (
              <div className="flex h-full items-center justify-center py-16 text-center text-sm text-slate-400">Loading orders…</div>
            ) : paginatedOrders.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400 border border-slate-200">
                  <AdminIcon className="h-6 w-6" name="orders" />
                </div>
                <p className="text-sm font-black text-slate-600">No Order Found</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100">
                  {paginatedOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedId(order.id)}
                      className={`flex w-full items-start justify-between gap-2 px-4 py-4 text-left transition-all duration-200 hover:bg-slate-50 ${
                        selectedId === order.id ? "bg-blue-50/50 border-l-4 border-blue-600" : "px-5"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-black text-slate-900 uppercase">{order.orderNumber}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{formatDate(order.placedAt)}</p>
                        <div className="mt-3">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[13px] font-black text-slate-900">BDT {Number(order.total || 0).toLocaleString()}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{order.items?.length || 0} Items</p>
                        <div className="mt-3 flex justify-end">
                          <span className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                            {(order.payments?.[0]?.method || "COD").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-slate-50/95 backdrop-blur-sm px-4 py-3">
                    <p className="text-xs font-medium text-slate-600">
                      Page <span className="font-black">{page}</span> of <span className="font-black">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        <AdminIcon className="h-3.5 w-3.5 rotate-180" name="chevronRight" />
                      </button>
                      <button
                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        <AdminIcon className="h-3.5 w-3.5" name="chevronRight" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div key={selectedId || 'none'} className="animate-in fade-in slide-in-from-right-2 duration-300">
          {selected ? (
            <section className="flex flex-col gap-4 min-h-[600px]">
              {actionError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{actionError}</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-full text-white ${
                    selected.status === 'delivered' ? 'bg-emerald-600 shadow-lg shadow-emerald-200' : 
                    selected.status === 'cancelled' || selected.status === 'returned' ? 'bg-rose-500 shadow-lg shadow-rose-200' :
                    'bg-blue-600 shadow-lg shadow-blue-200'
                  }`}>
                    <AdminIcon className="h-5 w-5" name={selected.status === 'delivered' ? 'check' : (selected.status === 'cancelled' ? 'x' : 'package')} />
                  </span>
                  <div>
                    <p className="text-[13px] font-black text-slate-900 uppercase">Order {selected.status}</p>
                    <p className="text-[11px] font-medium text-slate-500">{formatDate(selected.placedAt)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {dueAmount > 0 && (
                    <button 
                      disabled={isActioning}
                      onClick={handleMakePayment}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-black text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {isActioning ? "Paying..." : "Make Payment"}
                    </button>
                  )}
                  {selected.status !== 'cancelled' && selected.status !== 'delivered' && (
                    <button
                      disabled={isActioning}
                      onClick={() => setCancelModalOpen(true)}
                      className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-[13px] font-black text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  )}
                  {selected.status === "pending" && (
                    <button
                      disabled={isActioning}
                      onClick={() => handleUpdateStatus("processing", "Order accepted")}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-[13px] font-black text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      Accept
                    </button>
                  )}
                  {selected.status === "processing" && (
                    <button
                      disabled={isActioning}
                      onClick={() => handleUpdateStatus("shipped", "Order marked as ready to ship")}
                      className="rounded-xl bg-violet-600 px-4 py-2 text-[13px] font-black text-white hover:bg-violet-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      Ready to Ship
                    </button>
                  )}
                  {selected.status === "shipped" && (
                    <button
                      disabled={isActioning}
                      onClick={() => handleUpdateStatus("delivered", "Order delivered")}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-black text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      Mark Delivered
                    </button>
                  )}
                  <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50">
                    <AdminIcon className="h-5 w-5" name="actions" />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-6">
                  <div className="mb-8 rounded-xl border border-slate-200 p-6 bg-slate-50/50">
                    <h3 className="mb-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Shipping & Billing Address</h3>
                    <div className="flex items-start gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-200 text-slate-500">
                        <AdminIcon className="h-4 w-4" name="user" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{selected.user?.name || "Regular Customer"} ({selected.user?.phone || "N/A"})</p>
                        <p className="mt-1 text-sm font-medium text-slate-600">{selected.address?.addressLine1}, {selected.address?.city}, {selected.address?.state}, {selected.address?.postalCode}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-100 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Order #</p>
                      <p className="mt-1 text-[13px] font-black text-slate-900">{selected.orderNumber}</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Order Date</p>
                      <p className="mt-1 text-[13px] font-black text-slate-900">{formatDate(selected.placedAt)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Payment Status</p>
                      <span className={`mt-2 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-black uppercase ${getPaymentStatusColor(selected.paymentStatus)}`}>
                        {selected.paymentStatus}
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-100 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Type</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-600 uppercase">
                          {(selected.payments?.[0]?.method || "COD")}
                        </span>
                        <span className="inline-flex items-center rounded border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-600 uppercase">
                          Normal
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {(selected.items || []).map((item) => (
                      <div key={item.id} className="flex items-center gap-4 rounded-xl bg-slate-50/50 p-3 border border-slate-100">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400 border border-slate-200">
                          <AdminIcon className="h-6 w-6" name="package" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-900">{item.product?.name}</p>
                          <p className="mt-1 text-[11px] font-medium text-slate-400 uppercase tracking-wide">SKU: {item.variant?.sku || "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">BDT {Number(item.totalPrice).toLocaleString()}</p>
                          <p className="mt-1 text-[11px] font-medium text-slate-500">{item.quantity} Item(s)</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="ml-auto max-w-sm space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="text-slate-900 font-bold font-mono">BDT {(Number(selected.total) - Number(selected.shippingCost)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500">Delivery charge</span>
                      <span className="text-slate-900 font-bold font-mono">+ BDT {Number(selected.shippingCost).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[16px] font-black border-t border-slate-100 pt-3">
                      <span className="text-slate-900">Total</span>
                      <span className="text-slate-900 font-mono">BDT {Number(selected.total).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black pt-2">
                      <span className="text-emerald-600">Paid Amount</span>
                      <span className="text-emerald-600 font-mono">BDT {paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black">
                      <span className="text-rose-600">Due Amount</span>
                      <span className="text-rose-600 font-mono">BDT {dueAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <NoOrderSelected />
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Order"
        message={`Are you sure you want to cancel order ${selected?.orderNumber}? This action cannot be undone.`}
        confirmText={isActioning ? "Cancelling…" : "Yes, Cancel Order"}
        isDestructive
      />
    </>
  );
}
