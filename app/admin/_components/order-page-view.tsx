"use client";

import { InfiniteScroll } from "./infinite-scroll";
import { AdminIcon, PageHeader } from "./admin-shell";
import { useOrders } from "../_hooks/use-orders";
import { OrderDetailPanel } from "./order-detail-panel";
import { formatMoney, type OrderStatus, type OrderPaymentStatus } from "../../../lib/admin-api";
import { useCurrency } from "../../../lib/currency-context";
import { formatDateTime } from "../../../lib/utils";

const TABS: { key: OrderStatus | ""; label: string }[] = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "returned", label: "Returned" },
];

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

interface OrderPageViewProps {
  title: string;
  description: string;
  fixedStatus?: OrderStatus;
}

export default function OrderPageView({ title, description, fixedStatus }: OrderPageViewProps) {
  const { symbol } = useCurrency();
  const {
    orders, selected, selectedId, setSelectedId,
    status, setStatus, paymentStatus, setPaymentStatus,
    search, setSearch, page, setPage,
    total, isLoading, error, isUpdatingStatus,
    totalPages, hasMore, totals,
    updateOrderStatus, updatePaymentStatus,
  } = useOrders({ fixedStatus });

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <span className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-xs">
            <AdminIcon className="h-4 w-4 text-slate-400" name="orders" />
            {total} total
          </span>
        }
      />

      <section>
        {!fixedStatus && (
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
        )}

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

        <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
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

            <div className="flex flex-col gap-2.5 p-3 xl:max-h-[calc(100vh-280px)] xl:overflow-y-auto bg-slate-50/30">
              {isLoading && page === 1 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div className="h-20 animate-pulse bg-slate-100 rounded-md" key={i} />
                ))
              ) : orders.length === 0 ? (
                <p className="p-6 text-center text-xs font-semibold text-slate-400">No orders found.</p>
              ) : (
                orders.map((order) => {
                  const isSelected = order.id === selectedId;
                  return (
                    <div key={order.id}>
                      <button
                        className={`group flex w-full flex-col gap-2 rounded-md border p-3.5 text-left transition-all ${
                          isSelected
                            ? "bg-slate-50 border-slate-300 shadow-xs border-l-4 border-l-slate-800 pl-[11px]"
                            : "bg-white border-slate-100 hover:border-slate-200 border-l-4 border-l-transparent pl-[11px]"
                        }`}
                        onClick={() => setSelectedId(isSelected ? null : order.id)}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-2 w-full">
                          <span className="truncate font-semibold text-slate-800 text-[13px] group-hover:text-slate-950 transition-colors">
                            #{order.orderNumber}
                          </span>
                          <span className="shrink-0 font-semibold text-slate-900 text-sm">
                            {formatMoney(order.total, symbol)}
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
                      {isSelected && selected && (
                        <div className="xl:hidden border-t border-slate-100 mx-3 pt-3 pb-2">
                          <OrderDetailPanel
                            order={selected}
                            totals={totals}
                            symbol={symbol}
                            onUpdateOrderStatus={updateOrderStatus}
                            onUpdatePaymentStatus={updatePaymentStatus}
                            isUpdatingStatus={isUpdatingStatus}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              <InfiniteScroll
                hasMore={hasMore}
                isLoading={isLoading}
                onLoadMore={() => setPage((p) => p + 1)}
                loadingLabel="Loading more orders..."
                allLoadedLabel="All orders loaded"
              />
            </div>
          </aside>

          <section className="hidden xl:block">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-[500px] rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                <AdminIcon className="h-10 w-10 text-slate-400 mb-3" name="orders" />
                <h3 className="font-semibold text-slate-700 text-sm">No Order Selected</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                  Select an order from the list on the left to view details and update its status.
                </p>
              </div>
            ) : (
              <OrderDetailPanel
                order={selected}
                totals={totals}
                symbol={symbol}
                onUpdateOrderStatus={updateOrderStatus}
                onUpdatePaymentStatus={updatePaymentStatus}
                isUpdatingStatus={isUpdatingStatus}
              />
            )}
          </section>
        </div>
      </section>
    </>
  );
}
