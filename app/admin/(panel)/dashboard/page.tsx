"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Datepicker, { type DateValueType } from "react-tailwindcss-datepicker";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminIcon, PageHeader, ProductThumb } from "../../_components/admin-shell";
import {
  apiRequest,
  formatMoney,
  type DashboardSummary,
  type MetricValue,
  type OrderPaymentStatus,
  type SalesTrendPoint,
  type TopProduct,
} from "../../../../lib/admin-api";
import { toISODate } from "../../../../lib/utils";

type Granularity = "daily" | "monthly" | "yearly";

function formatNumber(n: number) {
  return n.toLocaleString("en");
}

type Period = "week" | "month" | "quarter" | "year" | "custom";

const THUMB_COLORS = ["blue", "amber", "emerald", "violet", "rose", "cyan"];

const PERIODS: { key: Period; label: string }[] = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "Year" },
];

function formatBucket(date: string, granularity: Granularity) {
  const d = new Date(date);
  if (granularity === "yearly") {
    return new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
  }
  return new Intl.DateTimeFormat(
    "en",
    granularity === "monthly"
      ? { month: "short", year: "2-digit" }
      : { month: "short", day: "numeric" },
  ).format(d);
}

function paymentTone(status: OrderPaymentStatus) {
  if (status === "paid") return "text-emerald-600";
  if (status === "refunded") return "text-amber-600";
  return "text-rose-600";
}

/** Coloured trend pill. `goodWhenDown` inverts tone for metrics where a rise is bad. */
function TrendBadge({
  trend,
  goodWhenDown = false,
}: {
  trend: number | null;
  goodWhenDown?: boolean;
}) {
  if (trend === null) {
    return (
      <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-slate-400">
        —
      </span>
    );
  }

  const isUp = trend >= 0;
  const isPositive = goodWhenDown ? !isUp : isUp;
  const tone = isPositive
    ? "border-emerald-300 bg-emerald-50 text-emerald-600"
    : "border-rose-300 bg-rose-50 text-rose-600";

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 ${tone}`}>
      <svg
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
        style={{ transform: isUp ? "none" : "scaleY(-1)" }}
        aria-hidden
      >
        <path d="M4 17l6-6 4 4 6-6" />
        <path d="M16 9h4v4" />
      </svg>
      {Math.abs(trend)}%
    </span>
  );
}

function MetricCard({
  label,
  metric,
  iconName,
  tone,
  href,
  isMoney = false,
  goodWhenDown = false,
  caption = "Compared to previous period",
  loading,
}: {
  label: string;
  metric?: MetricValue;
  iconName: Parameters<typeof AdminIcon>[0]["name"];
  tone: string;
  href: string;
  isMoney?: boolean;
  goodWhenDown?: boolean;
  caption?: string;
  loading: boolean;
}) {
  const value = metric?.value ?? 0;
  return (
    <Link
      className="group relative block p-4 transition hover:bg-slate-50/80 sm:p-6"
      href={href}
    >
      <div className="mb-7 flex items-center gap-3">
        <span className={`grid h-7 w-7 place-items-center rounded-md ${tone}`}>
          <AdminIcon className="h-4 w-4" name={iconName} />
        </span>
        <h2 className="font-black text-slate-600">{label}</h2>
        <AdminIcon
          className="ml-auto h-4 w-4 text-slate-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:text-slate-500 group-hover:opacity-100"
          name="chevronRight"
        />
      </div>
      {loading ? (
        <div className="h-9 w-28 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="text-3xl font-black">
          {isMoney ? formatMoney(value) : formatNumber(value)}
        </p>
      )}
      <div className="mt-4 flex items-center gap-3 text-sm font-black">
        <span className="text-slate-500">{caption}</span>
        {loading ? (
          <span className="h-6 w-14 animate-pulse rounded-md bg-slate-100" />
        ) : (
          <TrendBadge trend={metric?.trend ?? null} goodWhenDown={goodWhenDown} />
        )}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<SalesTrendPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [period, setPeriod] = useState<Period>("month");
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [dateValue, setDateValue] = useState<DateValueType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const queryString = useCallback(
    (extra?: Record<string, string>) => {
      const params = new URLSearchParams({ period, ...extra });
      if (period === "custom" && dateValue?.startDate && dateValue?.endDate) {
        params.set("startDate", toISODate(new Date(dateValue.startDate)));
        params.set("endDate", toISODate(new Date(dateValue.endDate)));
      }
      return params.toString();
    },
    [period, dateValue],
  );

  useEffect(() => {
    let active = true;

    async function load() {
      if (period === "custom" && (!dateValue?.startDate || !dateValue?.endDate)) return;
      setIsLoading(true);
      setError("");
      try {
        const [summaryRes, trendRes, topRes] = await Promise.all([
          apiRequest<DashboardSummary>(`/dashboard/summary?${queryString()}`),
          apiRequest<SalesTrendPoint[]>(
            `/dashboard/sales-trend?${queryString({ granularity })}`,
          ),
          apiRequest<TopProduct[]>(`/dashboard/top-products?${queryString()}`),
        ]);
        if (!active) return;
        setSummary(summaryRes);
        setTrend(trendRes);
        setTopProducts(topRes);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [period, granularity, dateValue, queryString]);

  const chartData = useMemo(
    () => trend.map((p) => ({ ...p, label: formatBucket(p.date, granularity) })),
    [trend, granularity],
  );

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your current sales summary and activity."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white text-sm font-black shadow-sm">
              {PERIODS.map(({ key, label }) => (
                <button
                  className={`px-5 py-3 transition ${
                    period === key ? "bg-blue-600 text-white" : "hover:bg-slate-50"
                  }`}
                  key={key}
                  onClick={() => {
                    setPeriod(key);
                    setDateValue(null);
                  }}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="w-72">
              <Datepicker
                containerClassName={`relative rounded-lg border text-sm font-black shadow-sm ${
                  period === "custom" ? "border-blue-600" : "border-slate-300"
                }`}
                displayFormat="MMM DD, YYYY"
                inputClassName="w-full rounded-lg bg-transparent px-4 py-3 font-black text-slate-600 placeholder:text-slate-400 focus:outline-none"
                maxDate={new Date()}
                onChange={(value) => {
                  setDateValue(value);
                  if (value?.startDate && value?.endDate) {
                    setPeriod("custom");
                  } else if (!value?.startDate && !value?.endDate) {
                    setPeriod("month");
                  }
                }}
                placeholder="Select date range"
                popoverDirection="down"
                primaryColor="blue"
                separator="→"
                showFooter
                showShortcuts
                useRange
                value={dateValue}
                /* The library's open-state uses `opacity-1`, which under Tailwind v4
                   resolves to opacity:1% (invisible). Force the popup fully opaque. */
                popupClassName={(defaults) => `${defaults ?? ""} opacity-100!`}
              />
            </div>
          </div>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 font-black text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-900/5">
        <div className="grid divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          <MetricCard label="Total sales" metric={summary?.totalSales} iconName="report" tone="bg-blue-50 text-blue-600" href="/admin/orders" isMoney loading={isLoading} />
          <MetricCard label="Total orders" metric={summary?.totalOrders} iconName="orders" tone="bg-emerald-50 text-emerald-600" href="/admin/orders" loading={isLoading} />
          <MetricCard label="Pending orders" metric={summary?.pendingOrders} iconName="refresh" tone="bg-amber-50 text-amber-600" href="/admin/orders?status=pending" goodWhenDown loading={isLoading} />
          <MetricCard label="Low stock products" metric={summary?.lowStockProducts} iconName="stock" tone="bg-rose-50 text-rose-600" href="/admin/stock" goodWhenDown caption="Variants at/under threshold" loading={isLoading} />
        </div>
        <div className="grid divide-y divide-slate-200 border-t border-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          <MetricCard label="Avg. order value" metric={summary?.avgOrderValue} iconName="discount" tone="bg-sky-50 text-sky-600" href="/admin/orders" caption="Per paid order" isMoney loading={isLoading} />
          <MetricCard label="Total customers" metric={{ value: summary?.totalCustomers.value ?? 0, trend: summary?.newCustomers.trend ?? null }} iconName="suppliers" tone="bg-violet-50 text-violet-600" href="/admin/reports" caption="New customers vs previous" loading={isLoading} />
          <MetricCard label="Total products" metric={summary?.totalProducts} iconName="package" tone="bg-slate-100 text-slate-600" href="/admin/products" caption="Active catalogue" loading={isLoading} />
          <MetricCard label="Refund amount" metric={summary?.refundAmount} iconName="refresh" tone="bg-rose-50 text-rose-600" href="/admin/orders?paymentStatus=refunded" isMoney goodWhenDown loading={isLoading} />
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-black">Sales Trend</h2>
            <div className="flex gap-3">
              {(["daily", "monthly", "yearly"] as Granularity[]).map((g) => (
                <button
                  className={`rounded-lg px-4 py-2 font-black capitalize transition ${
                    granularity === g ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600"
                  }`}
                  key={g}
                  onClick={() => setGranularity(g)}
                  type="button"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            {isLoading ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-slate-100" />
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center font-black text-slate-400">
                No paid sales in this period.
              </div>
            ) : (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesBar" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#93c5fd" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="label"
                    fontSize={12}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(v) => (Number(v) >= 1000 ? `${Number(v) / 1000}k` : `${v}`)}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontWeight: 700 }}
                    width={48}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    formatter={(value) => [formatMoney(value as number), "Revenue"]}
                    labelStyle={{ fontWeight: 800, color: "#0f172a" }}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontWeight: 700 }}
                  />
                  <Bar dataKey="total" fill="url(#salesBar)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black">Recent Orders</h2>
            <Link className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black hover:bg-slate-50" href="/admin/orders">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div className="h-16 animate-pulse rounded-xl bg-slate-100" key={i} />
              ))
            ) : summary && summary.recentOrders.length > 0 ? (
              summary.recentOrders.slice(0, 5).map((order) => (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4" key={order.id}>
                  <div className="min-w-0">
                    <p className="truncate font-black">{order.orderNumber}</p>
                    <p className="truncate text-sm font-medium text-slate-500">
                      {order.user?.name ?? "Guest"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black">{formatMoney(order.total)}</p>
                    <span className={`text-xs font-black capitalize ${paymentTone(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 font-medium text-slate-400">
                No orders in this period.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="mb-5 text-2xl font-black">Top selling products</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div className="h-20 animate-pulse rounded-xl bg-slate-100" key={i} />
            ))
          ) : topProducts.length > 0 ? (
            topProducts.map((product, index) => (
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4" key={product.id}>
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={product.name}
                    className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                    src={product.imageUrl}
                  />
                ) : (
                  <ProductThumb color={THUMB_COLORS[index % THUMB_COLORS.length]} />
                )}
                <div className="min-w-0">
                  <p className="truncate font-black">{product.name}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {formatNumber(product.unitsSold)} sold · {formatMoney(product.revenue)}
                  </p>
                  <p className="text-xs font-medium text-slate-400">
                    {formatNumber(product.stock)} pcs in stock
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="font-medium text-slate-400">No sales recorded in this period.</p>
          )}
        </div>
      </section>
    </>
  );
}
