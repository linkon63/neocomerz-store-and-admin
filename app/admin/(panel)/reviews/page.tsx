"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { StarRating } from "../../_components/review-components";
import { ConfirmModal } from "../../_components/confirm-modal";
import { apiRequest, formatDate, type Review } from "../../../../lib/admin-api";

const TABS = ["New", "Reviewed", "Archived"] as const;
type Tab = (typeof TABS)[number];



interface ProductGroup {
  id: string;
  name: string;
  slug: string;
  totalCount: number;
  newCount: number;
  reviews: Review[];
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("New");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadReviews = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      const allReviews = await apiRequest<Review[]>("/reviews");
      setReviews(allReviews);

      // Auto-select first product if none selected
      if (allReviews.length > 0 && !selectedId) {
        const firstProductId = allReviews[0].product?.id;
        if (firstProductId) setSelectedId(firstProductId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupsMap = new Map<string, ProductGroup>();
  reviews.forEach(r => {
    if (!r.product) return;
    if (!groupsMap.has(r.product.id)) {
      groupsMap.set(r.product.id, {
        id: r.product.id,
        name: r.product.name,
        slug: r.product.slug,
        totalCount: 0,
        newCount: 0,
        reviews: [],
      });
    }
    const g = groupsMap.get(r.product.id)!;
    g.totalCount++;
    if (!r.isApproved) g.newCount++;
    g.reviews.push(r);
  });

  const q = search.toLowerCase();
  const filteredGroups = Array.from(groupsMap.values()).filter(g =>
    !q || g.name.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q)
  );

  const selectedGroup = groupsMap.get(selectedId ?? "") ?? null;

  const activeReviews = selectedGroup?.reviews.filter(r => {
    if (activeTab === "New") return !r.isApproved;
    if (activeTab === "Reviewed") return r.isApproved;
    return false; // Archived
  }) || [];

  async function handleApprove(review: Review) {
    setActionError("");
    setIsActioning(true);
    try {
      await apiRequest(`/reviews/${review.id}/approve`, { method: "PATCH" });
      await loadReviews();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setIsActioning(false);
    }
  }

  async function handleDelete() {
    if (!reviewToDelete) return;
    setActionError("");
    setIsActioning(true);
    try {
      await apiRequest(`/reviews/${reviewToDelete.id}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setReviewToDelete(null);
      await loadReviews();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsActioning(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Manage your customers"
      />

      {error && (
        <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-0 border-t border-l border-slate-200 xl:grid-cols-[380px_1fr]">
        <aside className="bg-white min-h-[600px] flex flex-col border-r border-slate-200">
          <div className="p-3 border-b border-slate-200">
            <label className="flex h-10 items-center gap-2 border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-500">
              <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex h-full items-center justify-center py-16 text-center text-sm font-medium text-slate-400">
                Loading reviews…
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 grid h-12 w-12 place-items-center bg-slate-100 text-slate-400">
                  <AdminIcon className="h-6 w-6" name="reviews" />
                </div>
                <p className="font-black text-slate-600">No Products Found</p>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  No products with reviews matching your search.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => {
                      setSelectedId(group.id);
                      setActiveTab("New");
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-all duration-200 hover:bg-slate-50 ${
                      selectedId === group.id ? "bg-blue-50 border-l-4 border-blue-600" : "bg-white border-l-4 border-transparent"
                    }`}
                  >
                    <div className="grid h-10 w-10 shrink-0 overflow-hidden place-items-center bg-slate-100 border border-slate-200">
                      <span className="text-sm font-black text-slate-400">{group.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-black text-slate-900">{group.name}</p>
                      <p className="truncate text-[11px] font-medium text-slate-500 mt-0.5 uppercase tracking-wide">
                        {group.slug}
                      </p>
                    </div>
                    {group.newCount > 0 && (
                      <span className="grid h-5 min-w-[1.25rem] place-items-center bg-blue-600 px-1 text-[10px] font-black text-white">
                        {group.newCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div key={selectedId || 'none'} className="flex-1 bg-white">
          {selectedGroup ? (
            <section className="flex flex-col min-h-[600px]">
              <div className="flex items-start justify-between border-b border-slate-200 p-6 bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 overflow-hidden place-items-center bg-white border border-slate-200">
                    <span className="text-lg font-black text-slate-400">{selectedGroup.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-black text-xl text-slate-900">{selectedGroup.name}</p>
                    <p className="text-[13px] font-medium text-slate-500 uppercase tracking-wide">{selectedGroup.slug}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-8 border-b border-slate-200 px-6 pt-3">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-black transition-colors relative ${activeTab === tab
                        ? "text-blue-600"
                        : "text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>

              {actionError && (
                <p className="mx-6 mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {actionError}
                </p>
              )}

              <div key={activeTab} className="flex-1 overflow-y-auto">
                {activeReviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="mb-4 grid h-16 w-16 place-items-center bg-slate-50 text-slate-300">
                       <AdminIcon className="h-8 w-8" name="reviews" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">
                      No {activeTab.toLowerCase()} reviews for this product.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {activeReviews.map(review => (
                      <div key={review.id} className="p-6 transition-colors hover:bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="grid h-10 w-10 place-items-center bg-slate-100 text-sm font-black text-rose-500 border border-slate-200">
                              <AdminIcon className="h-5 w-5" name="user" />
                            </div>
                            <div>
                              <p className="font-black text-[15px] text-slate-900">{review.user?.name ?? "Anonymous User"}</p>
                              <p className="text-[12px] font-medium text-slate-400 mt-0.5">{formatDate(review.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!review.isApproved && (
                              <button
                                disabled={isActioning}
                                onClick={() => handleApprove(review)}
                                className="bg-emerald-600 px-4 py-2 text-[12px] font-black text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                              >
                                {isActioning ? "Approving..." : "Approve"}
                              </button>
                            )}
                            <button
                              onClick={() => { setReviewToDelete(review); setDeleteModalOpen(true); }}
                              className="grid h-9 w-9 place-items-center border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            >
                              <AdminIcon className="h-5 w-5" name="actions" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 pl-14">
                          <StarRating rating={review.rating} />
                          {review.comment && (
                            <p className="mt-4 text-[14px] font-medium leading-relaxed text-slate-600 bg-slate-50 p-4 border border-slate-100">
                              {review.comment}
                            </p>
                          )}
                          <div className="mt-6 flex items-center justify-end">
                            <button className="flex items-center gap-2 text-[13px] font-black text-slate-500 hover:text-blue-600 transition-colors">
                              <AdminIcon className="h-4 w-4" name="reviews" />
                              Add Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <div className="flex flex-col items-center justify-center border border-slate-200 bg-white min-h-[600px] py-24 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center bg-slate-100 text-slate-400">
                <AdminIcon className="h-8 w-8" name="reviews" />
              </div>
              <p className="font-black text-slate-700">No Product Selected</p>
              <p className="mt-1 text-sm font-medium text-slate-400">
                Select a product from the list to view its reviews.
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setReviewToDelete(null); }}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText={isActioning ? "Deleting…" : "Delete Review"}
        isDestructive
      />
    </>
  );
}
