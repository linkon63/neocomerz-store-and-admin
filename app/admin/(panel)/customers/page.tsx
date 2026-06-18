"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import {
  formatDate,
  formatMoney,
  listCustomers,
  type CustomerListItem,
} from "../../../../lib/admin-api";

const PAGE_SIZE = 20;

export default function CustomersPage() {
  const [rows, setRows] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await listCustomers({ search: query, page, limit: PAGE_SIZE });
      setRows(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    load();
  }, [load]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Browse customers and open any profile to see their orders, abandoned cart and wishlist."
      />

      <form onSubmit={submitSearch} className="mb-5 flex max-w-md items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <AdminIcon name="search" className="h-4 w-4" />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="h-11 w-full rounded-lg border border-slate-300 pl-10 pr-3 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>
        <button
          type="submit"
          className="h-11 rounded-lg bg-slate-900 px-5 text-sm font-black text-white hover:bg-slate-800"
        >
          Search
        </button>
      </form>

      {error && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4 text-sm font-black text-slate-500">
          {total} customer(s)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-center">Orders</th>
                <th className="px-6 py-3 text-right">Total spent</th>
                <th className="px-6 py-3 text-center">Cart</th>
                <th className="px-6 py-3 text-center">Wishlist</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center font-black text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center font-bold text-slate-400">
                    No customers found.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <Link href={`/admin/customers/${c.id}`} className="block">
                        <span className="block font-black text-slate-900">{c.name}</span>
                        <span className="block text-xs font-medium text-slate-500">{c.email}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">{c.phone || "—"}</td>
                    <td className="px-6 py-4 font-medium text-slate-500">{formatDate(c.createdAt)}</td>
                    <td className="px-6 py-4 text-center font-black">{c.ordersCount}</td>
                    <td className="px-6 py-4 text-right font-black">{formatMoney(c.totalSpent)}</td>
                    <td className="px-6 py-4 text-center">
                      <Pill value={c.abandonedCartItems} tone="amber" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Pill value={c.wishlistCount} tone="rose" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-50"
                      >
                        View <AdminIcon name="chevronRight" className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm font-bold">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-slate-600 disabled:text-slate-300"
            >
              Previous
            </button>
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="text-slate-600 disabled:text-slate-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({ value, tone }: { value: number; tone: "amber" | "rose" }) {
  if (!value) return <span className="text-slate-300">—</span>;
  const cls =
    tone === "amber"
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";
  return (
    <span className={`inline-flex min-w-[28px] justify-center rounded-full px-2 py-1 text-xs font-black ${cls}`}>
      {value}
    </span>
  );
}
