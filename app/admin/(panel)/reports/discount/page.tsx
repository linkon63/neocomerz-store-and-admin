"use client";

import { useEffect, useState } from "react";
import Datepicker, { type DateValueType } from "react-tailwindcss-datepicker";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import {
  apiRequest,
  formatDate,
  formatMoney,
  type DiscountReport,
} from "../../../../../lib/admin-api";

function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function DiscountReportPage() {
  const currentYear = new Date().getFullYear();
  const [report, setReport] = useState<DiscountReport | null>(null);
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

        const data = await apiRequest<DiscountReport>(
          `/reports/discounts?${params.toString()}`,
        );
        if (!active) return;
        setReport(data);
      } catch (err) {
        if (active)
          setError(
            err instanceof Error ? err.message : "Failed to load discount report",
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

  const summary = report?.summary;
  const avgDiscount =
    summary && summary.ordersWithDiscount > 0
      ? summary.totalDiscountGiven / summary.ordersWithDiscount
      : 0;

  return (
    <>
      <PageHeader
        title="Discount Report"
        description="Analysis of discounts, promotions and voucher usage"
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

      <section className="grid gap-5 sm:grid-cols-4">
        {[
          {
            label: "Total Discount Given",
            value: summary?.totalDiscountGiven,
            icon: "discount" as const,
            isMoney: true,
          },
          {
            label: "Orders with Discount",
            value: summary?.ordersWithDiscount,
            icon: "orders" as const,
            isMoney: false,
          },
          {
            label: "Total Coupons",
            value: summary?.totalCoupons,
            icon: "voucher" as const,
            isMoney: false,
          },
          {
            label: "Avg Discount per Order",
            value: avgDiscount,
            icon: "report" as const,
            isMoney: true,
          },
        ].map(({ label, value, icon, isMoney }) => (
          <article
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            key={label}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-purple-50 text-purple-600">
                <AdminIcon className="h-4 w-4" name={icon} />
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
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-black">Coupon Breakdown</h2>
        </div>
        {isLoading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="h-12 animate-pulse rounded bg-slate-100" key={i} />
            ))}
          </div>
        ) : report?.couponBreakdown.length === 0 ? (
          <div className="p-6 text-center font-medium text-slate-400">
            No coupons used in this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Value</th>
                  <th className="px-6 py-4 text-right">Used</th>
                  <th className="px-6 py-4 text-right">Max Usage</th>
                  <th className="px-6 py-4">Expires</th>
                </tr>
              </thead>
              <tbody>
                {report?.couponBreakdown.map((coupon) => (
                  <tr
                    className="border-b border-slate-50 font-black transition hover:bg-slate-50/50"
                    key={coupon.id}
                  >
                    <td className="px-6 py-4">{coupon.code}</td>
                    <td className="px-6 py-4 capitalize text-slate-600">
                      {coupon.type}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {coupon.type === "percentage"
                        ? `${coupon.value}%`
                        : formatMoney(coupon.value)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {coupon.usedCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {coupon.maxUsage}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-black">Discounted Orders</h2>
        </div>
        {isLoading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="h-12 animate-pulse rounded bg-slate-100" key={i} />
            ))}
          </div>
        ) : report?.discountedOrders.length === 0 ? (
          <div className="p-6 text-center font-medium text-slate-400">
            No discounted orders in this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400">
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Discount</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {report?.discountedOrders.map((order) => (
                  <tr
                    className="border-b border-slate-50 font-black transition hover:bg-slate-50/50"
                    key={order.orderId}
                  >
                    <td className="px-6 py-4">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 text-right text-rose-600">
                      -{formatMoney(order.discountAmount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatMoney(order.orderTotal)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(order.placedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
