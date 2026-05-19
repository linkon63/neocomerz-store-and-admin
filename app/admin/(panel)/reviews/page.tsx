"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { StarRating } from "../../_components/review-components";
import { ConfirmModal } from "../../_components/confirm-modal";
import { apiRequest, formatDate, type Review } from "../../../../lib/admin-api";

type Tab = "New" | "Reviewed";

interface ProductGroup {
  id: string;
  name: string;
  slug: string;
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

  async function loadReviews() {
    setError("");
    setIsLoading(true);
    try {
      const data = await apiRequest<Review[]>("/reviews/pending");
      setReviews(data);
      if (data.length > 0) {
        setSelectedId((prev) => prev ?? data[0].product?.id ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadReviews(); }, []);

  const groupsMap = useMemo(() => {
    const map = new Map<string, ProductGroup>();
    for (const r of reviews) {
      if (!r.product) continue;
      if (!map.has(r.product.id)) {
        map.set(r.product.id, { id: r.product.id, name: r.product.name, slug: r.product.slug, newCount: 0, reviews: [] });
      }
      const g = map.get(r.product.id)!;
      if (!r.isApproved) g.newCount++;
      g.reviews.push(r);
    }
    return map;
  }, [reviews]);

  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase();
    return Array.from(groupsMap.values()).filter(
      (g) => !q || g.name.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q)
    );
  }, [groupsMap, search]);

  const selectedGroup = groupsMap.get(selectedId ?? "") ?? null;

  const activeReviews = useMemo(
    () => selectedGroup?.reviews.filter((r) => (activeTab === "New" ? !r.isApproved : r.isApproved)) ?? [],
    [selectedGroup, activeTab]
  );

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
        title="Product Reviews"
        description="Approve or remove customer reviews across all products."
        action={
          <button
            onClick={loadReviews}
            className="grid h-12 w-12 place-items-center rounded-lg border border-slate-300 bg-white"
          >
            <AdminIcon className="h-5 w-5" name="refresh" />
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total Reviews", value: reviews.length },
          { label: "Pending", value: reviews.filter((r) => !r.isApproved).length },
          { label: "Products", value: groupsMap.size },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-3">
            <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3">
              <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent text-sm font-medium outline-none"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
          <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <p className="px-4 py-8 text-center text-sm font-medium text-slate-400">Loading reviews...</p>
            ) : filteredGroups.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm font-medium text-slate-400">No products with reviews.</p>
            ) : (
              filteredGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => { setSelectedId(group.id); setActiveTab("New"); }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 ${
                    selectedId === group.id ? "bg-blue-50 border-l-2 border-blue-600" : ""
                  }`}
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200 font-black">
                    {group.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-800">{group.name}</p>
                    <p className="truncate text-xs font-medium text-slate-400">{group.slug}</p>
                  </div>
                  {group.newCount > 0 && (
                    <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-black text-red-700">
                      {group.newCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {selectedGroup ? (
            <>
              <div className="border-b border-slate-200 p-4">
                <p className="font-black text-slate-800">{selectedGroup.name}</p>
                <p className="text-xs font-medium text-slate-400">{selectedGroup.slug}</p>
              </div>

              <div className="flex border-b border-slate-200 px-4">
                {(["New", "Reviewed"] as Tab[]).map((tab) => {
                  const count = selectedGroup.reviews.filter((r) => (tab === "New" ? !r.isApproved : r.isApproved)).length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative pb-3 pt-4 text-sm font-bold mr-6 ${
                        activeTab === tab ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab} ({count})
                      {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                    </button>
                  );
                })}
              </div>

              {actionError && (
                <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {actionError}
                </div>
              )}

              <div className="divide-y divide-slate-100">
                {activeReviews.length === 0 ? (
                  <p className="px-4 py-12 text-center text-sm font-medium text-slate-400">
                    No {activeTab.toLowerCase()} reviews for this product.
                  </p>
                ) : (
                  activeReviews.map((review) => (
                    <div key={review.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-black text-slate-800">{review.user?.name ?? "Anonymous"}</p>
                          <p className="text-xs font-medium text-slate-400">{formatDate(review.createdAt)}</p>
                          <div className="mt-2">
                            <StarRating rating={review.rating} />
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          {!review.isApproved && (
                            <button
                              disabled={isActioning}
                              onClick={() => handleApprove(review)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-black text-white disabled:opacity-50"
                            >
                              <AdminIcon className="h-3.5 w-3.5" name="check" />
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => { setReviewToDelete(review); setDeleteModalOpen(true); }}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <AdminIcon className="h-4 w-4" name="x" />
                          </button>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center">
              <p className="text-sm font-medium text-slate-400">Select a product to view its reviews.</p>
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
