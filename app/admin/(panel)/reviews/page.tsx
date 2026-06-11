"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { apiRequest } from "@/lib/admin-api";

type Review = {
  id: string;
  name: string;
  detail: string;
  meta: "Approved" | "Pending moderation" | "Needs response";
  status: "Active" | "Draft";
};

type ReviewForm = {
  id?: string;
  name: string;
  rating: string;
  product: string;
  meta: "Approved" | "Pending moderation" | "Needs response";
  status: "Active" | "Draft";
};

const DEFAULT_REVIEWS: Review[] = [
  { id: "1", name: "Imran Hossain", detail: "5 stars on Elegante Zero", meta: "Approved", status: "Active" },
  { id: "2", name: "Sadia Rahman", detail: "4 stars on Bucket Hat", meta: "Pending moderation", status: "Draft" },
  { id: "3", name: "Rakib Hasan", detail: "3 stars on Triple AAA Cap", meta: "Needs response", status: "Draft" },
  { id: "4", name: "Amina Begum", detail: "5 stars on Juventus 2012-13 Black Shirt", meta: "Approved", status: "Active" },
  { id: "5", name: "Tahmid Islam", detail: "2 stars on Manchester United Red Drill Top", meta: "Needs response", status: "Draft" },
];

const emptyForm: ReviewForm = {
  name: "",
  rating: "5",
  product: "",
  meta: "Approved",
  status: "Active",
};

function metaTone(meta: string) {
  switch (meta) {
    case "Approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Pending moderation":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Needs response":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function LocalStatusToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
        active ? "bg-slate-900" : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
          active ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ReviewForm>(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const loadReviewsFromApi = async () => {
    try {
      const data = await apiRequest<any[]>("/reviews");
      const mapped = data.map((r) => ({
        id: r.id,
        name: r.user?.name || r.user?.email || "Anonymous",
        detail: `${r.rating} stars on ${r.product?.name || "Unknown Product"}${r.comment ? `: "${r.comment}"` : ""}`,
        meta: r.isApproved ? "Approved" as const : "Pending moderation" as const,
        status: r.isApproved ? "Active" as const : "Draft" as const,
      }));
      setReviews(mapped);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  };

  useEffect(() => {
    loadReviewsFromApi();
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) =>
      `${review.name} ${review.detail} ${review.meta}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [reviews, search]);

  const handleToggleStatus = async (id: string) => {
    const review = reviews.find((r) => r.id === id);
    if (!review) return;
    const isApproved = review.status !== "Active";
    try {
      if (isApproved) {
        await apiRequest(`/reviews/${id}/approve`, { method: "PATCH" });
      } else {
        await apiRequest(`/reviews/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isApproved: false }),
        });
      }
      await loadReviewsFromApi();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle status");
    }
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (review: Review) => {
    const match = review.detail.match(/^(\d+)\s+stars?\s+on\s+([^:]+)/i);
    const rating = match ? match[1] : "5";
    const product = match ? match[2] : review.detail;

    setForm({
      id: review.id,
      name: review.name,
      rating,
      product,
      meta: review.meta,
      status: review.status,
    });
    setIsModalOpen(true);
  };

  const deleteReview = (review: Review) => {
    setReviewToDelete(review);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await apiRequest(`/reviews/${reviewToDelete.id}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setReviewToDelete(null);
      await loadReviewsFromApi();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete review");
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setReviewToDelete(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.id) {
      try {
        await apiRequest(`/reviews/${form.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: Number(form.rating),
            isApproved: form.meta === "Approved" || form.status === "Active",
          }),
        });
        setIsModalOpen(false);
        setForm(emptyForm);
        await loadReviewsFromApi();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to update review");
      }
    } else {
      alert("Manual review creation is not supported. Reviews are created by customers on the storefront.");
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Moderate product reviews before they appear in the store"
        action={
          <div className="flex gap-3">
            <button
              onClick={loadReviewsFromApi}
              className="grid h-14 w-14 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition cursor-pointer font-black"
              type="button"
            >
              <AdminIcon className="h-5 w-5 text-slate-500" name="refresh" />
            </button>
          </div>
        }
      />

      <section>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Reviews list</h2>
              <p className="font-medium text-slate-650">
                Displaying {filteredReviews.length} reviews
              </p>
            </div>
            <label className="flex h-12 w-full max-w-md items-center gap-3 rounded-md border border-slate-300 bg-white px-4 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all">
              <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent text-sm font-medium outline-none text-slate-700 placeholder:text-slate-400"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews"
                value={search}
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm font-medium text-slate-650">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-500">
                <tr>
                  {["Name", "Detail", "Meta", "Status", "Actions"].map((heading) => (
                    <th className="px-5 py-4 font-black" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((row) => (
                    <tr className="hover:bg-slate-50/50 transition-colors" key={row.id}>
                      <td className="px-5 py-4 font-black text-slate-800">
                        {row.name}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {row.detail}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-bold capitalize ${metaTone(row.meta)}`}>
                          {row.meta}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <LocalStatusToggle
                            active={row.status === "Active"}
                            onToggle={() => handleToggleStatus(row.id)}
                          />
                          <span className={`text-sm font-bold ${row.status === "Active" ? "text-slate-800" : "text-slate-400"}`}>
                            {row.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-750 transition cursor-pointer hover:bg-slate-50"
                            onClick={() => openEditModal(row)}
                            type="button"
                          >
                            <AdminIcon className="h-4 w-4" name="edit" />
                            Edit
                          </button>
                          <button
                            className="inline-flex items-center gap-2 rounded-md bg-red-50 hover:bg-red-100 px-3 py-2 text-sm font-black text-red-700 transition cursor-pointer"
                            onClick={() => deleteReview(row)}
                            type="button"
                          >
                            <AdminIcon className="h-4 w-4" name="x" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-400 font-semibold" colSpan={5}>
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <form
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
            onSubmit={handleSubmit}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800" id="review-modal-title">
                  {form.id ? "Edit Review" : "Add Review"}
                </h2>
                <p className="mt-1 font-medium text-slate-605">
                  Fill in the reviewer details and status moderations.
                </p>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-300 text-xl font-black text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                <AdminIcon className="h-5 w-5" name="x" />
              </button>
            </div>
            
            <div className="space-y-4">
              <label className="block text-slate-400">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Reviewer Name
                </span>
                <input
                  disabled={!!form.id}
                  className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-500 outline-none cursor-not-allowed"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  value={form.name}
                  placeholder="e.g. John Doe"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    Rating
                  </span>
                  <select
                    className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition cursor-pointer"
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    value={form.rating}
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} Star{r !== 1 && "s"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    Moderation Meta
                  </span>
                  <select
                    className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition cursor-pointer"
                    onChange={(e) => setForm({ ...form, meta: e.target.value as any })}
                    value={form.meta}
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending moderation">Pending moderation</option>
                    <option value="Needs response">Needs response</option>
                  </select>
                </label>
              </div>

              <label className="block text-slate-400">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Product Name
                </span>
                <input
                  disabled={!!form.id}
                  className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-500 outline-none cursor-not-allowed"
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  required
                  value={form.product}
                  placeholder="e.g. Bucket Hat"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Status
                </span>
                <select
                  className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition cursor-pointer"
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  value={form.status}
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </label>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  className="h-12 rounded-md border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-slate-900 px-5 text-sm font-black text-white hover:bg-slate-800 transition cursor-pointer shadow-xs"
                  type="submit"
                >
                  <AdminIcon className="h-5 w-5" name="check" />
                  {form.id ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Review"
        message={`Are you sure you want to delete this review by "${reviewToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  );
}
