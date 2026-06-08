"use client";

import { useEffect, useState } from "react";
import Datepicker, { type DateValueType } from "react-tailwindcss-datepicker";
import { AdminIcon } from "../../../_components/admin-shell";
import { PageHeader } from "../../../_components/page-header";
import {
  apiRequest,
  formatDate,
  type UserReport,
} from "../../../../../lib/admin-api";
import { toISODate } from "../../../../../lib/utils";

export default function CustomerReportPage() {
  const currentYear = new Date().getFullYear();
  const [report, setReport] = useState<UserReport | null>(null);
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

        const data = await apiRequest<UserReport>(
          `/reports/users?${params.toString()}`,
        );
        if (!active) return;
        setReport(data);
      } catch (err) {
        if (active)
          setError(
            err instanceof Error ? err.message : "Failed to load customer report",
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

  return (
    <>
      <PageHeader
        title="Customer Report"
        description="Insights into customer registrations"
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

      <section className="grid gap-5 sm:grid-cols-3">
        {[
          {
            label: "Total Customers",
            value: report?.summary.totalCustomers,
            icon: "suppliers" as const,
          },
          {
            label: "New Customers (This Week)",
            value: report?.summary.newCustomersThisWeek,
            icon: "report" as const,
          },
          {
            label: "New Customers (Filtered)",
            value: report?.summary.totalNewUsers,
            icon: "orders" as const,
          },
        ].map(({ label, value, icon }) => (
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
                {value !== undefined ? value.toLocaleString("en") : "-"}
              </p>
            )}
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-black">Registered Users</h2>
        </div>
        {isLoading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="h-12 animate-pulse rounded bg-slate-100" key={i} />
            ))}
          </div>
        ) : report?.users.length === 0 ? (
          <div className="p-6 text-center font-medium text-slate-400">
            No users registered in this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Registered At</th>
                </tr>
              </thead>
              <tbody>
                {report?.users.map((user) => (
                  <tr
                    className="border-b border-slate-50 font-black transition hover:bg-slate-50/50"
                    key={user.id}
                  >
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.phone ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-md px-3 py-1 text-xs font-black capitalize ${
                          user.role === "admin"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(user.registeredAt)}
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
