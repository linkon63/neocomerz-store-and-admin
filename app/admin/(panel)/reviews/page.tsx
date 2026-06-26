"use client";

import { useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { InfiniteScroll } from "../../_components/infinite-scroll";
import { ReviewsTableSkeleton } from "../../_components/reviews-table-skeleton";
import { useReviews } from "../../_hooks/use-reviews";

export default function ReviewsPage() {
  const {
    reviews,
    isLoading,
    error,
    search,
    setSearch,
    hasMore,
    total,
    page,
    setPage,
  } = useReviews();
  const [showSearchInput, setShowSearchInput] = useState(false);

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Moderate product reviews before they appear in the store"
        action={
          <div className="flex items-center justify-end gap-3">
            {showSearchInput ? (
              <div className="relative flex h-11 w-64 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <AdminIcon className="h-5 w-5 shrink-0 text-slate-400" name="search" />
                <input
                  autoFocus
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 text-slate-800"
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  onKeyDown={(e) => e.key === "Enter" && setPage(1)}
                  placeholder="Search reviews..."
                  value={search}
                />
                <button
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                    setShowSearchInput(false);
                  }}
                  title="Close search"
                  type="button"
                >
                  <AdminIcon className="h-4 w-4" name="x" />
                </button>
              </div>
            ) : (
              <button
                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm cursor-pointer"
                onClick={() => setShowSearchInput(true)}
                title="Search reviews"
                type="button"
              >
                <AdminIcon className="h-5 w-5 text-slate-600" name="search" />
              </button>
            )}
          </div>
        }
      />

      {error && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-200 px-5 py-4 rounded-xl animate-in shake duration-300 shadow-sm">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-red-900">{error}</p>
            </div>
          </div>
        </div>
      )}

      <section>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {isLoading && reviews.length === 0 ? (
            <ReviewsTableSkeleton />
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                <p className="text-sm font-medium text-slate-500">
                  {total} {total === 1 ? "review" : "reviews"}
                </p>
              </div>
              {reviews.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-2 py-2 text-sm font-semibold text-slate-700">User</th>
                          <th className="px-2 py-2 text-sm font-semibold text-slate-700">Product</th>
                          <th className="px-2 py-2 text-sm font-semibold text-slate-700">Rating</th>
                          <th className="px-2 py-2 text-sm font-semibold text-slate-700">Comment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reviews.map((row) => (
                          <tr className="hover:bg-blue-50/30 transition-all duration-200" key={row.id}>
                            <td className="px-2 py-2 text-sm font-semibold text-slate-800">
                              {row.user?.name ?? "—"}
                            </td>
                            <td className="px-2 py-2 text-sm text-slate-600">
                              {row.product?.name ?? "—"}
                            </td>
                            <td className="px-2 py-2">
                              <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-500">
                                {"★".repeat(Math.min(5, Math.max(0, row.rating)))}
                                {"☆".repeat(Math.max(0, 5 - Math.min(5, Math.max(0, row.rating))))}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm text-slate-600 line-clamp-3 max-w-full">
                              {row.comment ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <InfiniteScroll
                    hasMore={hasMore}
                    isLoading={isLoading}
                    onLoadMore={() => setPage((p) => p + 1)}
                    total={total}
                    loaded={reviews.length}
                    itemLabel="reviews"
                    loadingLabel="Loading more..."
                    allLoadedLabel="All reviews loaded"
                  />
                </>
              ) : (
                <div className="px-5 py-8 text-center text-sm text-slate-400 font-semibold">
                  {search ? "No reviews match your search." : "No reviews yet."}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
