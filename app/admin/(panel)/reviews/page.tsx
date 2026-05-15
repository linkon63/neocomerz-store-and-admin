"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { StarRating } from "../../_components/review-components";
import { ConfirmModal } from "../../_components/confirm-modal";
import {
  Button,
  Card,
  Badge,
  Input,
  Alert,
  StatsCard,
  EmptyState,
  Typography,
} from "../../_components/enterprise-ui";
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
    return false;
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

  const totalNew = reviews.filter(r => !r.isApproved).length;
  const totalApproved = reviews.filter(r => r.isApproved).length;

  return (
    <>
      <PageHeader
        title="Product Reviews"
        description="Manage customer feedback, approve or moderate reviews across all products"
        action={
          <div className="flex gap-3">
            <Button
              variant="neutral"
              size="md"
              icon={<AdminIcon className="h-5 w-5" name="refresh" />}
              onClick={() => loadReviews()}
            >
              Refresh
            </Button>
            <Button
              variant="neutral"
              size="md"
              icon={<AdminIcon className="h-5 w-5" name="download" />}
            >
              Export
            </Button>
          </div>
        }
      />

      {/* Stats Dashboard */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Reviews"
          value={reviews.length}
          icon={<AdminIcon className="h-6 w-6" name="reviews" />}
        />
        <StatsCard
          label="Pending Approval"
          value={totalNew}
          icon={<AdminIcon className="h-6 w-6" name="x" />}
        />
        <StatsCard
          label="Approved"
          value={totalApproved}
          icon={<AdminIcon className="h-6 w-6" name="check" />}
        />
        <StatsCard
          label="Products"
          value={groupsMap.size}
          icon={<AdminIcon className="h-6 w-6" name="package" />}
        />
      </div>

      {error && (
        <Alert variant="danger" className="mb-6" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        {/* Product Sidebar */}
        <Card className="flex flex-col overflow-hidden p-0 h-fit">
          {/* Search Header */}
          <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 p-4 bg-white">
            <div className="flex-1">
              <Input
                icon={<AdminIcon className="h-5 w-5 text-gray-400" name="search" />}
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-[15px] h-10"
              />
            </div>
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto max-h-[700px]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center py-24">
                <div className="text-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto mb-4" />
                  <p className={`${Typography.body} text-gray-500`}>Loading reviews...</p>
                </div>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-16">
                <EmptyState
                  icon={<AdminIcon className="h-8 w-8 text-gray-400" name="reviews" />}
                  title="No Products Found"
                  description="No products with reviews matching your search."
                />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => {
                      setSelectedId(group.id);
                      setActiveTab("New");
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-all duration-200 hover:bg-gray-50 ${
                      selectedId === group.id 
                        ? "bg-blue-50 border-l-2 border-blue-600" 
                        : "border-l-4 border-transparent"
                    }`}
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 font-black text-[15px]">
                      {group.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`${Typography.h4} text-gray-900 truncate`}>{group.name}</p>
                      <p className={`${Typography.caption} text-gray-500 mt-0.5 uppercase tracking-wide truncate`}>
                        {group.slug}
                      </p>
                    </div>
                    {group.newCount > 0 && (
                      <Badge variant="danger" size="sm" className="shrink-0">
                        {group.newCount} new
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Review Content Panel */}
        <div key={selectedId || 'none'} className="animate-in fade-in slide-in-from-right-2 duration-300">
          {selectedGroup ? (
            <Card className="flex flex-col overflow-hidden p-0 min-h-[600px]">
              {/* Product Header */}
              <div className="border-b border-gray-200 p-4 bg-white">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 font-black text-xl">
                    {selectedGroup.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className={`${Typography.h2} text-gray-900`}>{selectedGroup.name}</h2>
                    <p className={`${Typography.body} text-gray-500 uppercase tracking-wide mt-1`}>{selectedGroup.slug}</p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-6 border-b border-gray-200 px-4">
                {TABS.map((tab) => {
                  const count = selectedGroup.reviews.filter(r => {
                    if (tab === "New") return !r.isApproved;
                    if (tab === "Reviewed") return r.isApproved;
                    return false;
                  }).length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 pt-4 text-[15px] font-bold transition-colors relative ${
                        activeTab === tab
                          ? "text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {tab}
                        <Badge variant={activeTab === tab ? "primary" : "neutral"} size="sm">
                          {count}
                        </Badge>
                      </span>
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {actionError && (
                <div className="px-6 pt-4">
                  <Alert variant="danger" onClose={() => setActionError("")}>
                    {actionError}
                  </Alert>
                </div>
              )}

              {/* Review List */}
              <div key={activeTab} className="flex-1 overflow-y-auto">
                {activeReviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <EmptyState
                      icon={<AdminIcon className="h-8 w-8 text-gray-400" name="reviews" />}
                      title="No Reviews"
                      description={`No ${activeTab.toLowerCase()} reviews for this product.`}
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {activeReviews.map(review => (
                      <div key={review.id} className="p-4 transition-colors hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500 border border-red-200">
                              <AdminIcon className="h-5 w-5" name="user" />
                            </div>
                            <div>
                              <p className={`${Typography.h4} text-gray-900`}>
                                {review.user?.name ?? "Anonymous User"}
                              </p>
                              <p className={`${Typography.caption} text-gray-400 mt-0.5`}>
                                {formatDate(review.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!review.isApproved && (
                              <Button
                                variant="success"
                                size="sm"
                                disabled={isActioning}
                                isLoading={isActioning}
                                onClick={() => handleApprove(review)}
                                icon={<AdminIcon className="h-4 w-4" name="check" />}
                              >
                                Approve
                              </Button>
                            )}
                            <button
                              onClick={() => { setReviewToDelete(review); setDeleteModalOpen(true); }}
                              className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                            >
                              <AdminIcon className="h-4 w-4" name="actions" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 pl-[3.75rem]">
                          <StarRating rating={review.rating} />
                          {review.comment && (
                            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                              <p className={`${Typography.body} text-gray-700 leading-relaxed`}>
                                &ldquo;{review.comment}&rdquo;
                              </p>
                            </div>
                          )}
                          {review.isApproved && (
                            <div className="mt-4">
                              <Badge variant="success" size="sm">
                                Approved
                              </Badge>
                            </div>
                          )}
                          <div className="mt-4 flex items-center justify-end">
                            <Button
                              variant="neutral"
                              size="sm"
                              icon={<AdminIcon className="h-4 w-4" name="reviews" />}
                            >
                              Add Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="flex items-center justify-center min-h-[600px]">
              <EmptyState
                icon={<AdminIcon className="h-8 w-8 text-gray-400" name="reviews" />}
                title="No Product Selected"
                description="Select a product from the list to view its reviews."
              />
            </Card>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setReviewToDelete(null); }}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText={isActioning ? "Deleting\u2026" : "Delete Review"}
        isDestructive
      />
    </>
  );
}
