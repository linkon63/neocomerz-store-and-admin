"use client";

import { useEffect, useRef, useState } from "react";
import { AdminIcon, ProductThumb } from "../../_components/admin-shell";
import { apiRequest } from "../../../../lib/admin-api";

type DashboardSummary = {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  completedOrders: number;
  cancelledOrders: number;
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

function MetricCard({ icon, label, value, trend }: { icon: string; label: string; value: string; trend?: { value: string; isPositive: boolean } }) {
  return (
    <div className="p-6">
      <div className="mb-3 flex items-start justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${icon === "report" ? "bg-blue-50" : icon === "discount" ? "bg-emerald-50" : icon === "orders" ? "bg-violet-50" : "bg-amber-50"}`}>
          <AdminIcon className={`h-4 w-4 ${icon === "report" ? "text-blue-600" : icon === "discount" ? "text-emerald-600" : icon === "orders" ? "text-violet-600" : "text-amber-600"}`} name={icon as any} />
        </div>
        {trend && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${trend.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-[26px] font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
      {trend && <p className="mt-1 text-xs text-slate-400">Compared to yesterday</p>}
    </div>
  );
}

function TrendBadge({ value, isPositive }: { value: string; isPositive: boolean }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
      {value}
    </span>
  );
}

function SalesTrendChart({ data }: { data: number[] }) {
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");
  const maxVal = Math.max(...data, 1400);
  const minVal = 0;
  const range = maxVal - minVal;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - minVal) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  const pathD = data.length > 1 ? `M ${points.split(" ").map((p, i) => {
    const [x, y] = p.split(",");
    if (i === 0) return `${x} ${y}`;
    const [prevX, prevY] = points.split(" ")[i - 1].split(",");
    const cpX1 = parseFloat(prevX) + (parseFloat(x) - parseFloat(prevX)) / 3;
    const cpX2 = parseFloat(x) - (parseFloat(x) - parseFloat(prevX)) / 3;
    return `C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
  }).join(" ")}` : "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Sales Trend</h2>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setActiveTab("daily")}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${activeTab === "daily" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"}`}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${activeTab === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"}`}
            >
              Monthly
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
            <AdminIcon className="h-4 w-4 text-slate-400" name="calendar" />
            <input type="text" placeholder="Select date range" className="w-32 text-sm text-slate-600 outline-none" readOnly />
          </div>
        </div>
      </div>
      <div className="relative h-64">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {[0, 200, 400, 600, 800, 1000, 1200, 1400].map((val) => {
            const y = 100 - ((val - minVal) / range) * 100;
            return <line key={val} x1="0" y1={y} x2="100" y2={y} stroke="#e2e8f0" strokeWidth="0.2" />;
          })}
          {pathD && (
            <>
              <path d={`${pathD} L 100 100 L 0 100 Z`} fill="url(#areaGradient)" />
              <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="0.5" />
            </>
          )}
        </svg>
        <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-1 text-xs text-slate-500">
          {[1400, 1200, 1000, 800, 600, 400, 200, 0].map((val) => (
            <span key={val}>{val >= 1000 ? `${val / 1000}K` : val}</span>
          ))}
        </div>
        <div className="absolute bottom-0 left-12 text-xs text-slate-500">Week 1</div>
      </div>
    </div>
  );
}

const PRESETS: Preset[] = ["Today", "Yesterday", "This Week", "This Month"];

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

  const isCustomActive = !activePreset && (customFrom || customTo);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
        {error || "An error occurred while loading dashboard statistics."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Live sales summary and activity</p>
        </div>
        <div className="relative flex items-center" ref={datePickerRef}>
          <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white text-sm shadow-sm">
            {PRESETS.map((label) => (
              <button
                key={label}
                onClick={() => activePreset === label ? handleReset() : handlePreset(label)}
                className={`px-4 py-2 transition-colors ${
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
              className={`flex items-center gap-2 border-l border-slate-200 px-4 py-2 transition-colors ${
                isCustomActive ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <AdminIcon className="h-4 w-4" name="calendar" />
              {isCustomActive ? `${customFrom} → ${customTo}` : "Custom"}
            </button>
          </div>

          {showDatePicker && (
            <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Select Date Range</p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">To</label>
                  <input
                    type="date"
                    value={customTo}
                    min={customFrom}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleReset}
                    className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleCustomApply}
                    disabled={!customFrom || !customTo}
                    className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="grid divide-x divide-slate-100 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon="report" label="Total Transactions" value={summary.totalOrders.toString()} trend={{ value: "+12.5%", isPositive: true }} />
          <MetricCard icon="discount" label="Average Sale" value={formatCurrency(summary.totalOrders > 0 ? summary.totalSales / summary.totalOrders : 0)} trend={{ value: "+8.2%", isPositive: true }} />
          <MetricCard icon="orders" label="Daily Average Sale" value={formatCurrency(summary.totalSales / 30)} trend={{ value: "-3.1%", isPositive: false }} />
          <MetricCard icon="package" label="Net Sales" value={formatCurrency(summary.totalSales)} trend={{ value: "+15.3%", isPositive: true }} />
        </div>
        <div className="grid divide-x divide-slate-100 border-t border-slate-100 md:grid-cols-3">
          <MetricCard icon="report" label="Profit" value={formatCurrency(summary.totalSales * 0.2)} />
          <MetricCard icon="discount" label="Cash Sales" value={formatCurrency(summary.totalSales * 0.6)} />
          <MetricCard icon="refresh" label="Refund" value={formatCurrency(summary.totalSales * 0.02)} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="grid divide-x divide-slate-100 md:grid-cols-3 xl:grid-cols-6">
          <MetricCard icon="orders" label="Total Orders" value={summary.totalOrders.toString()} />
          <MetricCard icon="refresh" label="Pending" value={summary.pendingOrders.toString()} />
          <MetricCard icon="package" label="Processing" value={summary.processingOrders.toString()} />
          <MetricCard icon="check" label="Delivered" value={summary.deliveredOrders.toString()} />
          <MetricCard icon="check" label="Completed" value={summary.completedOrders?.toString() || "0"} />
          <MetricCard icon="x" label="Cancelled" value={summary.cancelledOrders?.toString() || "0"} />
        </div>
      </div>

      <SalesTrendChart data={salesByDay} />

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Top Selling Products</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.length === 0 ? (
            <p className="col-span-3 py-6 text-center text-sm text-slate-400">No products available.</p>
          ) : (
            products.slice(0, 3).map((product) => {
              const variant = product.variants?.[0];
              return (
                <div key={product.id} className="flex items-center gap-4 rounded-lg border border-slate-100 p-4">
                  <ProductThumb color="bg-blue-600" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{product.name}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {variant ? `${variant.stockQuantity} in stock · ${formatCurrency(Number(variant.price))}` : "No variants"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
