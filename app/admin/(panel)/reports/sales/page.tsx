"use client";

import { Fragment } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { AdminIcon } from "../../../_components/admin-shell";
import { PageHeader } from "../../../_components/page-header";
import { DownloadButton } from "../../../_components/download-button";
import {
  formatDate,
  formatMoney,
} from "../../../../../lib/admin-api";
import { useCurrency } from "../../../../../lib/currency-context";
import { useSalesReport } from "../../../_hooks/use-sales-report";

export default function SalesReportPage() {
  const { symbol } = useCurrency();
  const { report, isLoading, error, dateValue, setDateValue, expandedOrders, setExpandedOrders } = useSalesReport();

  function toggleOrder(orderId: string) {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  const summary = report?.summary;

  return (
    <>
      <PageHeader
        title="Sales Report"
        description="Overview of all sales transactions and revenue"
        action={
          <div className="flex items-center gap-3">
            <DownloadButton endpoint="sales" dateValue={dateValue} />
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
            </div>
          }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 font-black text-rose-700">
          {error}
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-3">
        {[
          {
            label: "Total Revenue",
            value: summary?.totalRevenue,
            icon: "report" as const,
            isMoney: true,
          },
          {
            label: "Total Orders",
            value: summary?.totalOrders,
            icon: "orders" as const,
            isMoney: false,
          },
          {
            label: "Avg Order Value",
            value: summary?.avgOrderValue,
            icon: "discount" as const,
            isMoney: true,
          },
        ].map(({ label, value, icon, isMoney }) => (
          <article
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            key={label}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-50 text-blue-600">
                <AdminIcon className="h-4 w-4" name={icon} />
              </span>
              <p className="font-black text-slate-500">{label}</p>
            </div>
            {isLoading ? (
              <div className="h-9 w-28 animate-pulse rounded bg-slate-100" />
            ) : (
              <p className="text-3xl font-black">
                {value !== undefined
                  ? isMoney
                    ? formatMoney(value, symbol)
                    : value.toLocaleString("en")
                  : "-"}
              </p>
            )}
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-black">Orders</h2>
        </div>
        {isLoading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="h-12 animate-pulse rounded bg-slate-100" key={i} />
            ))}
          </div>
        ) : report?.orders?.items?.length === 0 ? (
          <div className="p-6 text-center font-medium text-slate-400">
            No orders in this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400">
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="w-10 px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {report?.orders?.items?.map((order) => (
                  <Fragment key={order.orderId}>
                    <tr
                      className="cursor-pointer border-b border-slate-50 font-black transition hover:bg-slate-50/50"
                      onClick={() => toggleOrder(order.orderId)}
                    >
                      <td className="px-6 py-4">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4">{formatMoney(order?.total, symbol)}</td>
                      <td className="px-6 py-4">
                        {formatMoney(order.discount, symbol)}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(order.placedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <AdminIcon
                          className={`h-4 w-4 text-slate-400 transition ${
                            expandedOrders.has(order.orderId) ? "rotate-90" : ""
                          }`}
                          name="chevronRight"
                        />
                      </td>
                    </tr>
                    {expandedOrders.has(order.orderId) && (
                      <tr key={`${order.orderId}-items`}>
                        <td className="bg-slate-50 px-6 py-4" colSpan={6}>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs font-black uppercase text-slate-400">
                                <th className="px-4 py-2 text-left">
                                  Product
                                </th>
                                <th className="px-4 py-2 text-left">SKU</th>
                                <th className="px-4 py-2 text-right">Qty</th>
                                <th className="px-4 py-2 text-right">
                                  Unit Price
                                </th>
                                <th className="px-4 py-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order?.items?.map((item, idx) => (
                                <tr
                                  className="font-medium text-slate-600"
                                  key={idx}
                                >
                                  <td className="px-4 py-2">{item.product}</td>
                                  <td className="px-4 py-2">{item.sku}</td>
                                  <td className="px-4 py-2 text-right">
                                    {item.quantity}
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    {formatMoney(item.unitPrice, symbol)}
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    {formatMoney(item?.totalPrice, symbol)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-black">Product Breakdown</h2>
        </div>
        {isLoading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="h-12 animate-pulse rounded bg-slate-100" key={i} />
            ))}
          </div>
        ) : report?.productBreakdown?.length === 0 ? (
          <div className="p-6 text-center font-medium text-slate-400">
            No products sold in this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4 text-right">Quantity</th>
                  <th className="px-6 py-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {report?.productBreakdown?.map((product) => (
                  <tr
                    className="border-b border-slate-50 font-black transition hover:bg-slate-50/50"
                    key={product.productId}
                  >
                    <td className="px-6 py-4">{product.productName}</td>
                    <td className="px-6 py-4 text-slate-500">{product.sku}</td>
                    <td className="px-6 py-4 text-right">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatMoney(product.revenue, symbol)}
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
