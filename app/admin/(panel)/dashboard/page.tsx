"use client";

import { useEffect, useRef, useState } from "react";
import { AdminIcon, PageHeader, ProductThumb } from "../../_components/admin-shell";
import { apiRequest } from "../../../../lib/admin-api";

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardSummary = {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    total: string | number;
    paymentStatus: string;
    placedAt: string;
    user?: { name: string; email: string } | null;
  }[];
};

type Product = {
  id: string;
  name: string;
  status: string;
  variants?: { stockQuantity: number; price: string | number }[];
};

type SaleItem = {
  id: string;
  orderNumber: string;
  total: string | number;
  placedAt: string;
};

// ─── Date range helpers ───────────────────────────────────────────────────────

type Preset = "Today" | "Yesterday" | "This Week" | "This Month";

function getPresetRange(preset: Preset): { from: Date; to: Date } {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  switch (preset) {
    case "Today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "Yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    }
    case "This Week": {
      const day = now.getDay();
      const mon = new Date(now);
      mon.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
      return { from: startOfDay(mon), to: endOfDay(now) };
    }
    case "This Month":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: endOfDay(now),
      };
  }
}

function toIso(d: Date) {
  return d.toISOString();
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  }).format(val);
}

// ─── Component ────────────────────────────────────────────────────────────────

const PRESETS: Preset[] = ["Today", "Yesterday", "This Week", "This Month"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activePreset, setActivePreset] = useState<Preset | null>(null);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadData(from?: string, to?: string) {
    setLoading(true);
    setError("");
    try {
      const qs = from && to ? `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` : "";
      const [summaryData, productsData, salesData] = await Promise.all([
        apiRequest<DashboardSummary>(`/dashboard/summary${qs}`),
        apiRequest<Product[]>("/dashboard/products"),
        apiRequest<SaleItem[]>(`/dashboard/sales${qs}`),
      ]);
      setSummary(summaryData);
      setProducts(productsData);
      setSales(salesData);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function handlePreset(preset: Preset) {
    setActivePreset(preset);
    setCustomFrom("");
    setCustomTo("");
    setShowDatePicker(false);
    const { from, to } = getPresetRange(preset);
    loadData(toIso(from), toIso(to));
  }

  function handleCustomApply() {
    if (!customFrom || !customTo) return;
    setActivePreset(null);
    setShowDatePicker(false);
    const from = new Date(customFrom);
    const to = new Date(customTo);
    to.setHours(23, 59, 59, 999);
    loadData(toIso(from), toIso(to));
  }

  function handleReset() {
    setActivePreset(null);
    setCustomFrom("");
    setCustomTo("");
    setShowDatePicker(false);
    loadData();
  }

  const salesByDay = Array(7).fill(0) as number[];
  sales.forEach((s) => {
    salesByDay[new Date(s.placedAt).getDay()] += Number(s.total);
  });
  const maxDaySales = Math.max(...salesByDay, 1000);

  const isCustomActive = !activePreset && (customFrom || customTo);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 font-black text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center font-bold text-red-800">
        {error || "An error occurred while loading dashboard statistics."}
      </div>
    );
  }

  const summaryCards = [
    { label: "Total Sales", value: formatCurrency(summary.totalSales), icon: "dashboard" as const, accent: "blue" },
    { label: "Total Orders", value: summary.totalOrders.toString(), icon: "orders" as const, accent: "emerald" },
    { label: "Pending Orders", value: summary.pendingOrders.toString(), icon: "refresh" as const, accent: "amber" },
    { label: "Low Stock Products", value: summary.lowStockProducts.toString(), icon: "package" as const, accent: "rose" },
    { label: "Total Customers", value: summary.totalCustomers.toString(), icon: "reviews" as const, accent: "violet" },
    { label: "Total Products", value: summary.totalProducts.toString(), icon: "package" as const, accent: "slate" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Live sales summary and activity."
        action={
          <div className="relative flex items-center" ref={datePickerRef}>
            <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white text-sm font-black shadow-sm">
              {PRESETS.map((label) => (
                <button
                  key={label}
                  onClick={() => activePreset === label ? handleReset() : handlePreset(label)}
                  className={`px-4 py-2.5 transition-colors ${
                    activePreset === label
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setShowDatePicker((v) => !v)}
                className={`flex items-center gap-2 border-l border-slate-300 px-4 py-2.5 transition-colors ${
                  isCustomActive ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <AdminIcon className="h-4 w-4" name="calendar" />
                {isCustomActive ? `${customFrom} → ${customTo}` : "Custom"}
              </button>
            </div>

            {showDatePicker && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Select Date Range</p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-black text-slate-600">From</label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-black text-slate-600">To</label>
                    <input
                      type="date"
                      value={customTo}
                      min={customFrom}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleReset}
                      className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-black text-slate-600 hover:bg-slate-50"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleCustomApply}
                      disabled={!customFrom || !customTo}
                      className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      />

      {/* Summary cards */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          {summaryCards.slice(0, 4).map((card) => (
            <article className="p-5 sm:p-6" key={card.label}>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-50 text-blue-600">
                  <AdminIcon className="h-4 w-4" name={card.icon} />
                </span>
                <h2 className="font-black text-slate-600">{card.label}</h2>
              </div>
              <p className="text-3xl font-black text-slate-900">{card.value}</p>
            </article>
          ))}
        </div>
        <div className="grid divide-y divide-slate-200 border-t border-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          {summaryCards.slice(4).map((card) => (
            <article className="p-5 sm:p-6" key={card.label}>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-emerald-50 text-emerald-600">
                  <AdminIcon className="h-4 w-4" name={card.icon} />
                </span>
                <h2 className="font-black text-slate-600">{card.label}</h2>
              </div>
              <p className="text-3xl font-black text-slate-900">{card.value}</p>
            </article>
          ))}
          <article className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-rose-50 text-rose-600">
                <AdminIcon className="h-4 w-4" name="check" />
              </span>
              <h2 className="font-black text-slate-600">Delivered Orders</h2>
            </div>
            <p className="text-3xl font-black text-slate-900">{summary.deliveredOrders}</p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {summary.totalOrders > 0
                ? `${Math.round((summary.deliveredOrders / summary.totalOrders) * 100)}% fulfillment rate`
                : "No orders yet"}
            </p>
          </article>
        </div>
      </section>

      {/* Sales chart + Recent orders */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-black text-slate-900">Sales Trend</h2>
          <div className="relative h-72 border-b border-l border-slate-200">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-slate-100"
                style={{ top: `${i * 20}%` }}
              />
            ))}
            <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-between gap-2 px-4 pb-0">
              {salesByDay.map((val, idx) => (
                <div key={idx} className="flex flex-1 flex-col items-center">
                  <div
                    className="w-full max-w-[40px] rounded-t-md bg-blue-500 transition-all duration-500"
                    style={{ height: `${Math.max((val / maxDaySales) * 100, 3)}%` }}
                    title={formatCurrency(val)}
                  />
                  <span className="mt-2 text-xs font-black text-slate-400">{DAY_NAMES[idx]}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-black text-slate-900">Recent Orders</h2>
          <div className="space-y-3">
            {summary.recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm font-medium text-slate-400">No orders in this period.</p>
            ) : (
              summary.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-black text-slate-900">{order.orderNumber}</p>
                    <p className="text-xs font-medium text-slate-500">{order.user?.name ?? "Guest"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{formatCurrency(Number(order.total))}</p>
                    <span className={`text-xs font-black ${order.paymentStatus === "paid" ? "text-emerald-600" : "text-rose-600"}`}>
                      {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      {/* Top products */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-black text-slate-900">Top Selling Products</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.length === 0 ? (
            <p className="col-span-3 py-6 text-center text-sm font-medium text-slate-400">No products available.</p>
          ) : (
            products.slice(0, 3).map((product) => {
              const variant = product.variants?.[0];
              return (
                <div key={product.id} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                  <ProductThumb color="bg-blue-600" />
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-900">{product.name}</p>
                    <p className="mt-0.5 text-sm font-medium text-slate-500">
                      {variant ? `${variant.stockQuantity} in stock · ${formatCurrency(Number(variant.price))}` : "No variants"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
