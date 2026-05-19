"use client";

import { useEffect, useState } from "react";
import { AdminIcon, PageHeader, ProductThumb } from "../../_components/admin-shell";
import { apiRequest } from "../../../../lib/admin-api";

type DashboardSummary = {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: string | number;
    paymentStatus: string;
    placedAt: string;
    user?: {
      name: string;
      email: string;
    } | null;
  }>;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  status: string;
  variants?: Array<{
    stockQuantity: number;
    price: string | number;
  }>;
};

type SaleItem = {
  id: string;
  orderNumber: string;
  total: string | number;
  placedAt: string;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [summaryData, productsData, salesData] = await Promise.all([
          apiRequest<DashboardSummary>("/dashboard/summary"),
          apiRequest<Product[]>("/dashboard/products"),
          apiRequest<SaleItem[]>("/dashboard/sales"),
        ]);
        setSummary(summaryData);
        setProducts(productsData);
        setSales(salesData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError("Failed to load real-time dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 font-black text-slate-600">Loading live dashboard stats...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800 font-bold">
        {error || "An error occurred while loading dashboard statistics."}
      </div>
    );
  }

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const summaryCards = [
    { label: "Total sales", value: formatCurrency(summary.totalSales), trend: "Live", tone: "blue", icon: "dashboard" as const },
    { label: "Total orders", value: summary.totalOrders.toString(), trend: "Live", tone: "emerald", icon: "orders" as const },
    { label: "Pending orders", value: summary.pendingOrders.toString(), trend: "Live", tone: "amber", icon: "refresh" as const },
    { label: "Low stock products", value: summary.lowStockProducts.toString(), trend: "Live", tone: "rose", icon: "package" as const },
    { label: "Total customers", value: summary.totalCustomers.toString(), trend: "Live", tone: "violet", icon: "reviews" as const },
    { label: "Total products", value: summary.totalProducts.toString(), trend: "Live", tone: "slate", icon: "package" as const },
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const salesByDay = Array(7).fill(0) as number[];
  sales.forEach((sale) => {
    const day = new Date(sale.placedAt).getDay();
    salesByDay[day] += Number(sale.total);
  });
  const maxDaySales = Math.max(...salesByDay, 1000);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your current sales summary and activity (Connected to live NestJS backend)."
        action={
          <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white text-sm font-black shadow-sm">
            {["Today", "Yesterday", "This Week", "This Month"].map((label, index) => (
              <button
                className={`px-5 py-3 ${index === 0 ? "bg-blue-600 text-white" : ""}`}
                key={label}
              >
                {label}
              </button>
            ))}
            <button className="border-l border-slate-300 px-5 py-3 text-slate-500">
              <span className="inline-flex items-center gap-2">
                Select a date
                <AdminIcon className="h-4 w-4" name="calendar" />
              </span>
            </button>
          </div>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-900/5">
        <div className="grid divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          {summaryCards.slice(0, 4).map((card) => (
            <article className="p-4 sm:p-6" key={card.label}>
              <div className="mb-7 flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-50 text-blue-600">
                  <AdminIcon className="h-4 w-4" name={card.icon} />
                </span>
                <h2 className="font-black text-slate-600">{card.label}</h2>
              </div>
              <p className="text-3xl font-black">{card.value}</p>
              <div className="mt-4 flex items-center gap-3 text-sm font-black">
                <span className="text-slate-500">Compared to yesterday</span>
                <span className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-600">
                  {card.trend}
                </span>
              </div>
            </article>
          ))}
        </div>
        <div className="grid divide-y divide-slate-200 border-t border-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          {summaryCards.slice(4).map((card) => (
            <article className="p-4 sm:p-6" key={card.label}>
              <div className="mb-7 flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-emerald-50 text-emerald-600">
                  <AdminIcon className="h-4 w-4" name={card.icon} />
                </span>
                <h2 className="font-black text-slate-600">{card.label}</h2>
              </div>
              <p className="text-3xl font-black">{card.value}</p>
              <div className="mt-4 flex items-center gap-3 text-sm font-black">
                <span className="text-slate-500">Compared to yesterday</span>
                <span className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-600">
                  {card.trend}
                </span>
              </div>
            </article>
          ))}
          <article className="p-4 sm:p-6">
            <div className="mb-7 flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-rose-50 text-rose-600">
                <AdminIcon className="h-4 w-4" name="refresh" />
              </span>
              <h2 className="font-black text-slate-600">Delivered Orders</h2>
            </div>
            <p className="text-3xl font-black">{summary.deliveredOrders}</p>
            <div className="mt-4 flex items-center gap-3 text-sm font-black">
              <span className="text-slate-500">Fulfillment Success Rate</span>
              <span className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-600">
                {summary.totalOrders > 0
                  ? `${Math.round((summary.deliveredOrders / summary.totalOrders) * 100)}%`
                  : "0%"}
              </span>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-black">Sales Trend</h2>
            <div className="flex gap-3">
              <button className="rounded-lg bg-blue-50 px-4 py-2 font-black text-blue-600">
                Daily
              </button>
              <button className="rounded-lg px-4 py-2 font-black text-slate-400">
                Monthly
              </button>
              <button className="rounded-lg border border-slate-300 px-4 py-2 font-black">
                Select Date
              </button>
            </div>
          </div>
          <div className="relative h-80 border-l border-b border-slate-200">
            {[0, 1, 2, 3, 4].map((line) => (
              <div
                className="absolute left-0 right-0 border-t border-slate-100"
                key={line}
                style={{ top: `${line * 20}%` }}
              />
            ))}
            <div className="absolute inset-x-0 bottom-10 top-0 flex items-end justify-between gap-4 px-6">
              {salesByDay.map((val, idx) => {
                const heightPct = Math.max((val / maxDaySales) * 100, 3);
                return (
                  <div className="flex flex-1 flex-col items-center" key={idx}>
                    <div
                      className="w-full max-w-[42px] rounded-t bg-blue-500"
                      style={{ height: `${heightPct}%` }}
                      title={formatCurrency(val)}
                    />
                    <span className="mt-3 text-xs font-black text-slate-400">
                      {dayNames[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black">Recent Orders</h2>
            <button className="rounded-lg border border-slate-300 px-4 py-2 font-black">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {summary.recentOrders.length === 0 ? (
              <p className="text-sm font-medium text-slate-400 py-6 text-center">No orders placed yet.</p>
            ) : (
              summary.recentOrders.slice(0, 5).map((order) => (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4" key={order.id}>
                  <div>
                    <p className="font-black">{order.orderNumber}</p>
                    <p className="text-sm font-medium text-slate-500">{order.user?.name ?? "Guest Customer"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black">{formatCurrency(Number(order.total))}</p>
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

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="mb-5 text-2xl font-black">Top selling products</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.length === 0 ? (
            <p className="text-sm font-medium text-slate-400 py-6 text-center col-span-3">No products available in database.</p>
          ) : (
            products.slice(0, 3).map((product) => {
              const defaultVariant = product.variants?.[0];
              const price = defaultVariant ? formatCurrency(Number(defaultVariant.price)) : "Price not set";
              const stock = defaultVariant?.stockQuantity ?? 0;
              return (
                <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4" key={product.id}>
                  <ProductThumb color="bg-blue-600" />
                  <div>
                    <p className="font-black line-clamp-1">{product.name}</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {stock} pcs in stock · {price}
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
