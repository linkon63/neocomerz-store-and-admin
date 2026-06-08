"use client";

import { useEffect, useState } from "react";
import Datepicker, { type DateValueType } from "react-tailwindcss-datepicker";
import { AdminIcon } from "../../_components/admin-shell";
import { PageHeader } from "../../_components/page-header";
import {
  apiRequest,
  formatMoney,
  type ReportOverview,
} from "../../../../lib/admin-api";

function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function SkeletonCard() {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-4 w-24 animate-pulse rounded bg-slate-100" />
      <div className="h-9 w-28 animate-pulse rounded bg-slate-100" />
    </article>
  );
}

function MetricCard({
  label,
  value,
  icon,
  isMoney,
  isLoading,
}: {
  label: string;
  value: number | undefined | null;
  icon: string;
  isMoney: boolean;
  isLoading: boolean;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-50 text-blue-600">
          <AdminIcon className="h-4 w-4" name={icon as any} />
        </span>
        <p className="font-black text-slate-500">{label}</p>
      </div>
      {isLoading ? (
        <div className="h-9 w-28 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="text-3xl font-black">
          {value !== undefined && value !== null
            ? isMoney
              ? formatMoney(value)
              : Number(value).toLocaleString("en")
            : "-"}
        </p>
      )}
    </article>
  );
}

export default function ReportsOverviewPage() {
  const currentYear = new Date().getFullYear();
  const [report, setReport] = useState<ReportOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateValue, setDateValue] = useState<DateValueType>({
    startDate: new Date(currentYear, 0, 1),
    endDate: new Date(currentYear, 11, 31),
  });

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (dateValue?.startDate) {
          params.set("startDate", toISODate(new Date(dateValue.startDate)));
        }
        if (dateValue?.endDate) {
          params.set("endDate", toISODate(new Date(dateValue.endDate)));
        }

        const data = await apiRequest<ReportOverview>(
          `/reports/overview?${params.toString()}`,
        );
        if (!active) return;
        setReport(data);
      } catch (err) {
        if (active)
          setError(
            err instanceof Error ? err.message : "Failed to load report overview",
          );
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [dateValue]);

  const s = report?.sales;
  const c = report?.customers;
  const d = report?.discounts;
  const i = report?.inventory;
  const p = report?.purchases;

  return (
    <>
      <PageHeader
        title="Report Overview"
        description="Consolidated view of sales, customers, discounts, inventory, and purchases"
        action={
          <div className="w-72">
            <Datepicker
              containerClassName="relative rounded-lg border border-slate-300 text-sm font-black shadow-sm"
              displayFormat="MMM DD, YYYY"
              inputClassName="w-full rounded-lg bg-transparent px-4 py-3 font-black text-slate-600 placeholder:text-slate-400 focus:outline-none"
              maxDate={new Date()}
              onChange={(value) => {
                if (value?.startDate && value?.endDate) {
                  setDateValue(value);
                } else {
                  const year = new Date().getFullYear();
                  setDateValue({
                    startDate: new Date(year, 0, 1),
                    endDate: new Date(year, 11, 31),
                  });
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
              popupClassName={(defaults) => `${defaults ?? ""} opacity-100!`}
            />
          </div>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 font-black text-rose-700">
          {error}
        </div>
      )}

      {isLoading && !report ? (
        <section className="grid gap-5 sm:grid-cols-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </section>
      ) : (
        <>
          {/* Sales */}
          <section className="mt-6">
            <h2 className="mb-4 text-xl font-black text-slate-700">Sales</h2>
            <div className="grid gap-5 sm:grid-cols-4">
              <MetricCard label="Total Revenue" value={s?.totalRevenue} icon="report" isMoney isLoading={isLoading} />
              <MetricCard label="Total Orders" value={s?.totalOrders} icon="orders" isMoney={false} isLoading={isLoading} />
              <MetricCard label="Avg Order Value" value={s?.avgOrderValue} icon="discount" isMoney isLoading={isLoading} />
            </div>
          </section>

          {/* Customers */}
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-black text-slate-700">Customers</h2>
            <div className="grid gap-5 sm:grid-cols-4">
              <MetricCard label="New Customers" value={c?.totalNewUsers} icon="store" isMoney={false} isLoading={isLoading} />
              <MetricCard label="Total Customers" value={c?.totalCustomers} icon="store" isMoney={false} isLoading={isLoading} />
            </div>
          </section>

          {/* Discounts */}
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-black text-slate-700">Discounts</h2>
            <div className="grid gap-5 sm:grid-cols-4">
              <MetricCard label="Total Discount Given" value={d?.totalDiscountGiven} icon="discount" isMoney isLoading={isLoading} />
              <MetricCard label="Orders with Discount" value={d?.ordersWithDiscount} icon="orders" isMoney={false} isLoading={isLoading} />
              <MetricCard label="Total Coupons" value={d?.totalCoupons} icon="voucher" isMoney={false} isLoading={isLoading} />
            </div>
          </section>

          {/* Inventory */}
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-black text-slate-700">Inventory</h2>
            <div className="grid gap-5 sm:grid-cols-4">
              <MetricCard label="Stock Transactions" value={i?.totalTransactions} icon="stock" isMoney={false} isLoading={isLoading} />
              <MetricCard label="Low Stock Alerts" value={i?.lowStockAlerts} icon="stock" isMoney={false} isLoading={isLoading} />
              <MetricCard label="Stock In" value={i?.totalStockIn} icon="stock" isMoney={false} isLoading={isLoading} />
              <MetricCard label="Stock Out" value={i?.totalStockOut} icon="stock" isMoney={false} isLoading={isLoading} />
            </div>
          </section>

          {/* Purchases */}
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-black text-slate-700">Purchases</h2>
            <div className="grid gap-5 sm:grid-cols-4">
              <MetricCard label="Total Purchases" value={p?.totalPurchases} icon="suppliers" isMoney={false} isLoading={isLoading} />
              <MetricCard label="Total Units" value={p?.totalUnits} icon="package" isMoney={false} isLoading={isLoading} />
              <MetricCard label="Total Cost" value={p?.totalCost} icon="report" isMoney isLoading={isLoading} />
            </div>
          </section>
        </>
      )}
    </>
  );
}
