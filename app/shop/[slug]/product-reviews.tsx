"use client";

import { useState, useEffect } from "react";
import { FiStar, FiUser } from "react-icons/fi";
import { useAuth } from "../../_components/auth-context";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { id: string; name: string };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api/v1";

function StarPicker({
  value,
  onChange,
  readOnly = false,
  size = "text-lg",
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: string;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`${size} transition-colors ${
            star <= (hovered || value)
              ? "text-[#ffd02f]"
              : "text-neutral-300"
          } ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <FiStar className={star <= (hovered || value) ? "fill-[#ffd02f]" : ""} />
        </button>
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
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (rating < 1 || rating > 5) {
      setSubmitError("Please select a rating between 1 and 5 stars.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message || "Failed to submit review.");
      }

      setSubmitSuccess(true);
      setComment("");
      setRating(5);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
          No reviews yet. Be the first to review this product.
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

      {/* Submit review */}
      <div className="mt-10 border-t border-neutral-100 pt-8">
        <h3 className="text-xs font-black uppercase tracking-[0.12em] text-neutral-800">
          Write a Review
        </h3>

        {!token ? (
          <div className="mt-4 border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-sm text-neutral-600">
              Please{" "}
              <a href="/sign-in" className="font-black underline hover:text-black">
                sign in
              </a>{" "}
              to leave a review.
            </p>
          </div>
        ) : submitSuccess ? (
          <div className="mt-4 border border-green-200 bg-green-50 p-5">
            <p className="text-sm font-bold text-green-700">
              ✓ Thank you! Your review has been submitted and is pending approval.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.06em] text-neutral-500">
                Rating *
              </label>
              <StarPicker value={rating} onChange={setRating} size="text-2xl" />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.06em] text-neutral-500">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience with this product..."
                rows={4}
                className="w-full border border-neutral-200 px-4 py-3 text-sm leading-6 outline-none focus:border-black resize-none"
              />
            </div>

            {submitError && (
              <p className="text-sm font-bold text-red-600">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-black px-8 py-3 text-xs font-black uppercase tracking-[0.1em] text-white hover:bg-neutral-800 transition disabled:bg-neutral-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting…
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
