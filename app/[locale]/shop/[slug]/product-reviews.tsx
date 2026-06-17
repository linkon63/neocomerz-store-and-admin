"use client";

import { useState } from "react";
import { FiStar, FiUser } from "react-icons/fi";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { id: string; name: string };
}

function StarPicker({
  value,
  readOnly = false,
  size = "text-lg",
}: {
  value: number;
  readOnly?: boolean;
  size?: string;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${size} transition-colors ${
            star <= value
              ? "text-[#ffd02f]"
              : "text-neutral-300"
          } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <FiStar className={star <= value ? "fill-[#ffd02f]" : ""} />
        </span>
      ))}
    </div>
  );
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function ProductReviews({
  productId,
  initialReviews,
}: {
  productId: string;
  initialReviews: Review[];
}) {
  const [reviews] = useState<Review[]>(initialReviews);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-16 border-t border-neutral-200 pt-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.12em]">
            Customer Reviews
          </h2>
          {reviews.length > 0 && (
            <div className="mt-2 flex items-center gap-3">
              <StarPicker value={Math.round(avgRating)} readOnly size="text-base" />
              <span className="text-sm font-bold text-neutral-600">
                {avgRating.toFixed(1)} / 5 ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500 italic">
          No reviews yet.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {reviews.map((review) => (
            <article key={review.id} className="border-b border-neutral-100 pb-8 last:border-b-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                    <FiUser className="text-sm text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-neutral-800">{review.user.name}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                      {formatRelativeDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <StarPicker value={review.rating} readOnly size="text-sm" />
              </div>
              {review.comment && (
                <p className="mt-3 pl-12 text-sm leading-6 text-neutral-600">{review.comment}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
