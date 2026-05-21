"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { StarRating } from "../../_components/review-components";
import { ConfirmModal } from "../../_components/confirm-modal";
import { apiRequest, formatDate, type Review } from "../../../../lib/admin-api";

type Tab = "pending" | "approved";

interface ProductGroup {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  pendingCount: number;
  approvedCount: number;
  reviews: Review[];
}

function RatingBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 text-xs font-medium text-slate-500">{rating}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs font-medium text-slate-400">{count}</span>
    </div>
  );
}

function ReviewCard({
  review,
  onApprove,
  onDelete,
  isActioning,
}: {
  review: Review;
  onApprove?: () => void;
  onDelete: () => void;
  isActioning: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* User avatar + info */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
            {review.user?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{review.user?.name ?? "Anonymous"}</p>
            <p className="text-xs font-medium text-slate-400">{formatDate(review.createdAt)}</p>
            <div className="mt-1.5">
              <StarRating rating={review.rating} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {onApprove && (
            <button
              disabled={isActioning}
              onClick={onApprove}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              <AdminIcon className="h-3.5 w-3.5" name="check" />
              Approve
            </button>
          )}
          <button
            onClick={onDelete}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          >
            <AdminIcon className="h-3.5 w-3.5" name="x" />
          </button>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium leading-relaxed text-slate-700">
          "{review.comment}"
        </p>
      )}

      {/* Rating badge */}
      <div className="mt-3 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black ${
          review.rating >= 4 ? "bg-emerald-50 text-emerald-700" :
          review.rating === 3 ? "bg-amber-50 text-amber-700" :
          "bg-red-50 text-red-700"
        }`}>
          ★ {review.rating}/5
        </span>
        {review.isApproved && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            <AdminIcon className="h-3 w-3" name="check" /> Published
          </span>
        )}
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [actionError, setActionError] = useState("");

  async function loadReviews() {
    setError("");
    setIsLoading(true);
    try {
      const [pending, approved] = await Promise.all([
        apiRequest<Review[]>("/reviews/pending"),
        apiRequest<Review[]>("/reviews/approved"),
      ]);
      setPendingReviews(pending);
      setApprovedReviews(approved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadReviews(); }, []);

  const allReviews = useMemo(
    () => (activeTab === "pending" ? pendingReviews : approvedReviews),
    [activeTab, pendingReviews, approvedReviews]
  );

  // Build product groups from current tab reviews
  const groupsMap = useMemo(() => {
    const map = new Map<string, ProductGroup>();
    for (const r of allReviews) {
      if (!r.product) continue;
      if (!map.has(r.product.id)) {
        map.set(r.product.id, {
          id: r.product.id,
          name: r.product.name,
          slug: r.product.slug,
          imageUrl: r.product.media?.[0]?.media?.url,
          pendingCount: 0,
          approvedCount: 0,
          reviews: [],
        });
      }
      const g = map.get(r.product.id)!;
      if (!r.isApproved) g.pendingCount++;
      else g.approvedCount++;
      g.reviews.push(r);
    }
    return map;
  }, [allReviews]);

  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase();
    return Array.from(groupsMap.values()).filter(
      (g) => !q || g.name.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q)
    );
  }, [groupsMap, search]);

  // Auto-select first group
  useEffect(() => {
    if (filteredGroups.length > 0 && !selectedProductId) {
      setSelectedProductId(filteredGroups[0].id);
    }
  }, [filteredGroups, selectedProductId]);

  const selectedGroup = groupsMap.get(selectedProductId ?? "") ?? null;

  // Stats for selected product
  const avgRating = useMemo(() => {
    if (!selectedGroup || selectedGroup.reviews.length === 0) return 0;
    return selectedGroup.reviews.reduce((s, r) => s + r.rating, 0) / selectedGroup.reviews.length;
  }, [selectedGroup]);

  const ratingDist = useMemo(() => {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    selectedGroup?.reviews.forEach((r) => { dist[r.rating] = (dist[r.rating] ?? 0) + 1; });
    return dist;
  }, [selectedGroup]);

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
      if (selectedGroup?.reviews.length === 1) setSelectedProductId(null);
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
        description="Manage and moderate customer reviews across all products."
        action={
          <button
            onClick={loadReviews}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
          >
            <AdminIcon className="h-4 w-4" name="refresh" />
          </button>
        }
      />

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Reviews", value: pendingReviews.length + approvedReviews.length, color: "text-slate-800" },
          { label: "Pending", value: pendingReviews.length, color: "text-amber-600" },
          { label: "Published", value: approvedReviews.length, color: "text-emerald-600" },
          { label: "Products", value: new Set([...pendingReviews, ...approvedReviews].map(r => r.product?.id)).size, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-1.5 text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {actionError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      {/* Tab switcher */}
      <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        {([
          { id: "pending" as Tab, label: "Pending", count: pendingReviews.length, color: "text-amber-600" },
          { id: "approved" as Tab, label: "Published", count: approvedReviews.length, color: "text-emerald-600" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedProductId(null); }}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-2 py-0.5 text-xs font-black ${
              activeTab === tab.id ? tab.color + " bg-slate-100" : "bg-slate-200 text-slate-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        {/* Product list sidebar */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-3">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <AdminIcon className="h-3.5 w-3.5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>

          <div className="max-h-[640px] overflow-y-auto divide-y divide-slate-50">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm font-medium text-slate-400">
                No products with {activeTab} reviews.
              </p>
            ) : (
              filteredGroups.map((group) => {
                const isSelected = selectedProductId === group.id;
                const count = activeTab === "pending" ? group.pendingCount : group.approvedCount;
                return (
                  <button
                    key={group.id}
                    onClick={() => setSelectedProductId(group.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                      isSelected ? "bg-blue-50 border-l-[3px] border-l-blue-600" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {group.imageUrl ? (
                        <img src={group.imageUrl} alt={group.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-blue-50 text-sm font-black text-blue-600">
                          {group.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-black ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                        {group.name}
                      </p>
                      <p className="truncate text-xs font-medium text-slate-400">{group.reviews.length} review{group.reviews.length !== 1 ? "s" : ""}</p>
                    </div>
                    {count > 0 && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-black ${
                        activeTab === "pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Review detail panel */}
        <div className="min-w-0">
          {selectedGroup ? (
            <div className="space-y-5">
              {/* Product header */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  {selectedGroup.imageUrl ? (
                    <img src={selectedGroup.imageUrl} alt={selectedGroup.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-blue-50 text-lg font-black text-blue-600">
                      {selectedGroup.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-slate-900">{selectedGroup.name}</h2>
                  <p className="text-xs font-medium text-slate-400">{selectedGroup.slug}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((s) => (
                        <svg key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-sm font-medium text-slate-700">{avgRating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">·</span>
                    <span className="text-xs font-medium text-slate-500">{selectedGroup.reviews.length} total reviews</span>
                  </div>
                </div>

                {/* Rating distribution */}
                <div className="hidden w-40 space-y-1 sm:block">
                  {[5,4,3,2,1].map((r) => (
                    <RatingBar key={r} rating={r} count={ratingDist[r] ?? 0} total={selectedGroup.reviews.length} />
                  ))}
                </div>
              </div>

              {/* Reviews list */}
              <div className="space-y-3">
                {selectedGroup.reviews.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
                    <p className="text-sm font-medium text-slate-400">No reviews for this product.</p>
                  </div>
                ) : (
                  selectedGroup.reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onApprove={!review.isApproved ? () => handleApprove(review) : undefined}
                      onDelete={() => { setReviewToDelete(review); setDeleteModalOpen(true); }}
                      isActioning={isActioning}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
              <div className="text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-slate-100">
                  <AdminIcon className="h-6 w-6 text-slate-400" name="reviews" />
                </div>
                <p className="text-sm font-medium text-slate-500">Select a product to view its reviews</p>
                <p className="mt-1 text-xs font-medium text-slate-400">Choose from the list on the left</p>
              </div>
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
