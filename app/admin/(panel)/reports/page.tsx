"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "../../_components/admin-shell";
import { apiRequest } from "../../../../lib/admin-api";

type SummaryData = {
  totalSales: number;
  totalOrders: number;
  lowStockProducts: number;
};

type SaleItem = {
  id: string;
  orderNumber: string;
  total: string | number;
  placedAt: string;
};

type OrderLite = {
  id: string;
  paymentStatus: string;
  status: string;
  total: string | number;
};

export default function ReportsPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundCount, setRefundCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReportData() {
      try {
        setLoading(true);
        const [summaryData, salesData, ordersData] = await Promise.all([
          apiRequest<SummaryData>("/dashboard/summary"),
          apiRequest<SaleItem[]>("/dashboard/sales"),
          apiRequest<OrderLite[]>("/orders"),
        ]);
        setSummary(summaryData);
        setSales(salesData);

        const refundedOrders = ordersData.filter((order) => order.paymentStatus === "refunded");
        setRefundCount(refundedOrders.length);
        setRefundAmount(
          refundedOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0),
        );
      } catch (err) {
        console.error("Failed to load reports", err);
        setError("Failed to load real-time reporting data.");
      } finally {
        setLoading(false);
      }
    }

    loadReportData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 font-black text-slate-600">Generating live report statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800 font-bold">
        {error || "An error occurred while loading reporting metrics."}
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

  // Group sales by day of week or date to render visual bars
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const salesByDay = Array(7).fill(0);

  sales.forEach((sale) => {
    const date = new Date(sale.placedAt);
    const day = date.getDay();
    salesByDay[day] += Number(sale.total);
  });

  const maxVal = Math.max(...salesByDay, 1000);

  return (
    <>
      <PageHeader
        title="Report"
        description="Real-time sales, inventory, and order reports directly connected to your NestJS database."
        action={
          <button
            onClick={() => window.print()}
            className="h-14 rounded-lg border border-slate-300 bg-white px-6 font-black hover:bg-slate-50 transition-colors"
          >
            Print Report
          </button>
        }
      />
      <section className="grid gap-5 lg:grid-cols-4">
        {[
          ["Revenue", formatCurrency(summary.totalSales)],
          ["Total Orders", summary.totalOrders.toString()],
          [
            "Refunds Tracked",
            refundCount ? `${formatCurrency(refundAmount)} (${refundCount})` : formatCurrency(0),
          ],
          ["Low stock Alerts", summary.lowStockProducts.toString()],
        ].map(([label, value]) => (
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" key={label}>
            <p className="font-black text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black">{value}</p>
          </article>
        ))}
      </section>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-black">Revenue by day of week</h2>
        <div className="mt-6 h-80 border-l border-b border-slate-200">
          <div className="flex h-full items-end gap-6 px-8 pb-2">
            {salesByDay.map((val, index) => {
              const heightPct = Math.max((val / maxVal) * 100, 4); // Min 4% height to show a small bar
              return (
                <div className="flex-1 flex flex-col items-center group relative" key={index}>
                  <div
                    className="w-full max-w-[48px] rounded-t bg-blue-600 group-hover:bg-blue-700 transition-all cursor-pointer relative"
                    style={{ height: `${heightPct}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2.5 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-black">
                      {formatCurrency(val)}
                    </div>
                  </div>
                  <span className="mt-2 text-xs font-black text-slate-500 absolute -bottom-6">
                    {dayNames[index]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="h-6" /> {/* Spacer for labels */}
      </section>
    </>
  );
}
