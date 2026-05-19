"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  productsApi,
  cartApi,
  wishlistApi,
  reviewsApi,
  type Product,
  type ProductVariant,
  type Review,
  formatPrice,
  getStoreToken,
} from "@/lib/store-api";
import { ImageGallery } from "../../_components/image-gallery";
import { RelatedProducts } from "../../_components/related-products";
import { Breadcrumb } from "../../_components/breadcrumb";
import { showToast } from "../../_components/toast";
import { RecentlyViewed } from "../../_components/recently-viewed";

type ActiveTab = "description" | "specifications" | "reviews";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("description");
  
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const isLoggedIn = typeof window !== "undefined" && !!getStoreToken();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productsApi
      .bySlug(slug)
      .then((p) => {
        setProduct(p);
        setSelectedVariant(p.variants?.find((v) => v.isDefault) ?? p.variants?.[0] ?? null);
        
        // Tracking
        try {
          const stored = localStorage.getItem("store_recently_viewed");
          let ids: string[] = stored ? JSON.parse(stored) : [];
          ids = ids.filter(id => id !== p.id);
          ids.unshift(p.id);
          if (ids.length > 10) ids = ids.slice(0, 10);
          localStorage.setItem("store_recently_viewed", JSON.stringify(ids));
        } catch {}
      })
      .catch(() => router.push("/store/products"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  useEffect(() => {
    if (!product) return;
    setReviewLoading(true);
    reviewsApi
      .forProduct(product.id)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setReviewLoading(false));
  }, [product]);

  async function handleAddToCart() {
    if (!selectedVariant || !product) return;
    if (!isLoggedIn) { router.push("/store/login"); return; }
    setAdding(true);
    try {
      await cartApi.addItem(selectedVariant.id, quantity);
      const current = parseInt(localStorage.getItem("store_cart_count") ?? "0", 10);
      localStorage.setItem("store_cart_count", String(current + quantity));
      window.dispatchEvent(new Event("cart-updated"));
      showToast(`কার্টে ${quantity} টি যোগ হয়েছে!`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "ব্যর্থ হয়েছে", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist() {
    if (!product) return;
    if (!isLoggedIn) { router.push("/store/login"); return; }
    try {
      await wishlistApi.add(product.id);
      showToast("উইশলিস্টে যোগ হয়েছে!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("already")) showToast("ব্যর্থ হয়েছে", "error");
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    if (!isLoggedIn) { router.push("/store/login"); return; }
    setSubmittingReview(true);
    try {
      await reviewsApi.create(product.id, reviewForm);
      setReviewForm({ rating: 5, comment: "" });
      showToast("রিভিউ সাবমিট হয়েছে!", "success");
      const updated = await reviewsApi.forProduct(product.id);
      setReviews(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "ব্যর্থ হয়েছে", "error");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 animate-pulse">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="space-y-6">
            <div className="h-8 bg-gray-100 rounded-lg w-3/4" />
            <div className="h-6 bg-gray-100 rounded-lg w-1/4" />
            <div className="h-24 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "5.0";
  const discount = selectedVariant ? Math.round(parseFloat(selectedVariant.price.toString()) * 1.25) : 0;
  const isOutOfStock = selectedVariant?.stockQuantity === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[
        { label: "হোম", href: "/store" },
        { label: "পণ্য", href: "/store/products" },
        { label: product.name }
      ]} />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="sticky top-24 h-fit">
          <ImageGallery media={product.media || []} productName={product.name} />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {/* Header Info */}
          <div className="mb-6 border-b pb-6" style={{ borderColor: "var(--store-border)" }}>
            <div className="flex items-center gap-2 mb-3">
              {product.category && (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md" style={{ backgroundColor: "var(--store-primary-light)", color: "var(--store-primary)" }}>
                  {product.category.name}
                </span>
              )}
              {product.brand && (
                <span className="text-[12px] font-semibold" style={{ color: "var(--store-text-muted)" }}>
                  • {product.brand.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black mb-3 leading-tight" style={{ color: "var(--store-text)" }}>
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-lg">★</span>
                <span className="text-sm font-bold">{avgRating}</span>
                <span className="text-xs" style={{ color: "var(--store-text-muted)" }}>({reviews.length} রিভিউ)</span>
              </div>
              <span style={{ color: "var(--store-border-dark)" }}>|</span>
              <span className="text-sm font-medium" style={{ color: "var(--store-success)" }}>
                {isOutOfStock ? "স্টক শেষ" : "স্টকে আছে"}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-black" style={{ color: "var(--store-primary)" }}>
                {selectedVariant ? formatPrice(selectedVariant.price) : "—"}
              </span>
              {selectedVariant && discount > 0 && (
                <span className="text-lg line-through font-semibold mb-1" style={{ color: "var(--store-text-light)" }}>
                  {formatPrice(discount)}
                </span>
              )}
              <span className="ml-2 rounded px-2 py-1 text-[10px] font-bold text-white mb-1.5" style={{ backgroundColor: "var(--store-accent)" }}>
                ২০% ছাড়
              </span>
            </div>
            <p className="text-xs font-medium" style={{ color: "var(--store-text-muted)" }}>ভ্যাট ও অন্যান্য কর অন্তর্ভুক্ত (প্রযোজ্য ক্ষেত্রে)</p>
          </div>

          {/* Short Description */}
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--store-text)" }}>
            {product.description || "এই পণ্যের কোন বিবরণ দেওয়া হয়নি। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।"}
          </p>

          {/* Variants */}
          {product.variants && product.variants.length > 1 && (
            <div className="mb-6">
              <p className="text-sm font-bold mb-3" style={{ color: "var(--store-text)" }}>ভ্যারিয়েন্ট নির্বাচন করুন</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stockQuantity === 0}
                    className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all ${
                      selectedVariant?.id === v.id
                        ? "border-[var(--store-primary)] text-[var(--store-primary)] bg-[var(--store-primary-light)]"
                        : "border-[var(--store-border)] hover:border-[var(--store-border-dark)]"
                    } ${v.stockQuantity === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {v.sku}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="mb-8 p-5 rounded-2xl" style={{ backgroundColor: "var(--store-surface-2)" }}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center justify-between bg-white border rounded-xl overflow-hidden" style={{ borderColor: "var(--store-border)", width: "140px" }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center text-lg hover:bg-gray-50">−</button>
                <span className="font-bold text-sm">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(selectedVariant?.stockQuantity ?? 99, q + 1))} className="w-10 h-11 flex items-center justify-center text-lg hover:bg-gray-50">+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl text-white font-bold h-11 transition-transform active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "var(--store-primary)" }}
              >
                {adding ? "অপেক্ষা করুন..." : isOutOfStock ? "স্টক শেষ" : "কার্টে যোগ করুন"}
              </button>

              <button
                onClick={handleWishlist}
                className="w-11 h-11 rounded-xl bg-white border flex items-center justify-center hover:bg-gray-50 transition-colors"
                style={{ borderColor: "var(--store-border)", color: "var(--store-text)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            
            {/* Delivery Features */}
            <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t" style={{ borderColor: "var(--store-border)" }}>
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--store-text-muted)" }}>
                <span className="text-lg">🚚</span> দ্রুত ডেলিভারি
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--store-text-muted)" }}>
                <span className="text-lg">🛡️</span> ১০০% অরিজিনাল
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS SECTION ── */}
      <div className="mt-16 rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "var(--store-border)" }}>
        <div className="flex border-b overflow-x-auto scrollbar-hide" style={{ borderColor: "var(--store-border)" }}>
          {[
            { id: "description", label: "বিবরণ" },
            { id: "specifications", label: "স্পেসিফিকেশন" },
            { id: "reviews", label: `রিভিউ (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`px-8 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id ? "text-[var(--store-primary)] border-[var(--store-primary)]" : "text-[var(--store-text-muted)] border-transparent hover:text-[var(--store-text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-10 min-h-[300px]">
          {/* Tab 1: Description */}
          {activeTab === "description" && (
            <div className="prose max-w-none text-sm leading-relaxed" style={{ color: "var(--store-text)" }}>
              <p>{product.description || "এই পণ্যের বিস্তারিত বিবরণ শীঘ্রই যুক্ত করা হবে।"}</p>
            </div>
          )}

          {/* Tab 2: Specs */}
          {activeTab === "specifications" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 py-3 border-b text-sm" style={{ borderColor: "var(--store-border)" }}>
                <span className="font-bold text-gray-500">ব্র্যান্ড</span>
                <span className="col-span-2 font-medium">{product.brand?.name || "জানা নেই"}</span>
              </div>
              <div className="grid grid-cols-3 py-3 border-b text-sm" style={{ borderColor: "var(--store-border)" }}>
                <span className="font-bold text-gray-500">ক্যাটাগরি</span>
                <span className="col-span-2 font-medium">{product.category?.name || "জানা নেই"}</span>
              </div>
              {selectedVariant && (
                <div className="grid grid-cols-3 py-3 border-b text-sm" style={{ borderColor: "var(--store-border)" }}>
                  <span className="font-bold text-gray-500">SKU</span>
                  <span className="col-span-2 font-medium">{selectedVariant.sku}</span>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Reviews */}
          {activeTab === "reviews" && (
            <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
              {/* Write Review */}
              <div className="bg-gray-50 rounded-xl p-6 h-fit border" style={{ borderColor: "var(--store-border)" }}>
                <h3 className="font-bold mb-4">রিভিউ দিন</h3>
                {!isLoggedIn ? (
                  <p className="text-sm text-gray-500">রিভিউ দিতে <Link href="/store/login" className="text-[var(--store-primary)] font-bold">লগইন</Link> করুন।</p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" onClick={() => setReviewForm(f => ({...f, rating: s}))} className="text-2xl">
                            <span className={s <= reviewForm.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))}
                      className="w-full border rounded-lg p-3 text-sm focus:outline-[var(--store-primary)]"
                      style={{ borderColor: "var(--store-border)" }}
                      rows={4}
                      placeholder="আপনার মতামত লিখুন..."
                      required
                    />
                    <button disabled={submittingReview} type="submit" className="w-full bg-[var(--store-primary)] text-white font-bold py-2.5 rounded-lg disabled:opacity-50">
                      সাবমিট করুন
                    </button>
                  </form>
                )}
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {reviewLoading ? <p>লোড হচ্ছে...</p> : reviews.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed" style={{ borderColor: "var(--store-border)" }}>
                    <p className="text-gray-500">এখনও কোনো রিভিউ নেই।</p>
                  </div>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className="border-b pb-4 last:border-0" style={{ borderColor: "var(--store-border)" }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-sm">{r.user?.name || "গ্রাহক"}</p>
                          <div className="flex text-yellow-400 text-xs">
                            {"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('bn-BD')}</span>
                      </div>
                      <p className="text-sm text-gray-600">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <RelatedProducts productId={product.id} categoryId={product.category?.id} />
      <RecentlyViewed />
    </div>
  );
}
