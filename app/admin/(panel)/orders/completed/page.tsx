"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminIcon,
  PageHeader,
} from "../../../_components/admin-shell";
import {
  apiRequest,
  formatDate,
  type Order,
} from "../../../../../lib/admin-api";
import {
  calculateDueAmount,
  calculatePaidAmount,
  getPaymentStatusColor,
} from "../../../lib/order-utils";

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

export default function CompletedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadOrders = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      const data = await apiRequest<Order[]>("/orders");
      const completed = data.filter((o) => o.status === "delivered");
      setOrders(completed);
      if (completed.length > 0 && !selectedId) setSelectedId(completed[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      return (
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.user?.phone?.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q)
      );
    });
  }, [orders, search]);

  const selected = useMemo(() => {
    return orders.find((o) => o.id === selectedId) ?? null;
  }, [orders, selectedId]);

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

  return (
    <>
      <PageHeader
        title="Completed Orders"
        description="View and manage delivered orders"
        action={
          <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-[13px] font-black text-slate-600 hover:bg-slate-50 transition-colors">
            <AdminIcon className="h-4 w-4" name="download" />
            Export List
          </button>
        }
      />

      {(error || actionError) && (
        <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error || actionError}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-100 p-4 bg-slate-50/30">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 transition-all focus-within:border-blue-500">
              <AdminIcon className="h-4 w-4 shrink-0 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-slate-400"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="grid h-6 w-6 place-items-center rounded-md hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <AdminIcon className="h-3 w-3" name="x" />
                </button>
              )}
            </label>
          </div>

          <div key={search} className="flex-1 overflow-y-auto h-[600px] min-h-[400px] animate-in fade-in slide-in-from-left-2 duration-300">
            {isLoading ? (
              <div className="flex h-full items-center justify-center py-16 text-center text-sm text-slate-400">Loading orders…</div>
            ) : filtered.length === 0 ? (
              <div className="flex h-full items-center justify-center py-16 text-center text-slate-400">No completed orders found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedId(order.id)}
                    className={`flex w-full items-start justify-between gap-2 px-5 py-4 text-left transition-all duration-200 hover:bg-slate-50 ${
                      selectedId === order.id ? "bg-blue-50/50 border-l-4 border-blue-600" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-slate-900 uppercase">{order.orderNumber}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{formatDate(order.placedAt)}</p>
                      <div className="mt-3">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-black text-slate-900">BDT {Number(order.total || 0).toLocaleString()}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{order.items?.length || 0}Items</p>
                      <div className="mt-3 flex justify-end">
                        <span className="inline-flex items-center rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                          {(order.payments?.[0]?.method || "COD").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div key={selectedId || 'none'} className="animate-in fade-in slide-in-from-right-2 duration-300">
          {selected ? (
            <section className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                    <AdminIcon className="h-5 w-5" name="check" />
                  </span>
                  <div>
                    <p className="text-[13px] font-black text-slate-900">Order Completed</p>
                    <p className="text-[11px] font-medium text-slate-500">{formatDate(selected.placedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {dueAmount > 0 && (
                    <button 
                      disabled={isActioning}
                      onClick={handleMakePayment}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-black text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isActioning ? "Paying..." : "Make Payment"}
                    </button>
                  )}
                  <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50">
                    <AdminIcon className="h-5 w-5" name="actions" />
                  </button>
                </div>
              </div>

              <article className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-6">
                  <div className="mb-8 rounded-xl border border-slate-200 p-6 bg-slate-50/50">
                    <h3 className="mb-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Shipping & Billing Address</h3>
                    <div className="flex items-start gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-200 text-slate-500">
                        <AdminIcon className="h-4 w-4" name="user" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {selected.user?.name || "Regular Customer"} ({selected.user?.phone || "N/A"})
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                          {selected.address?.addressLine1}, {selected.address?.city}, {selected.address?.state}, {selected.address?.postalCode}
                        </p>
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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate">{item.product?.name}</p>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5 uppercase">SKU: {item.variant?.sku || "—"}</p>
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
              </article>
            </section>
          ) : (
            <NoOrderSelected />
          )}
        </div>
      </div>
    </>
  );
}
