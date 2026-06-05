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
      showToast(`কার্টে ${quantity} টি যোগ হয়েছে!`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "ব্যর্থ হয়েছে", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist() {
    if (!product) return;
    if (!isLoggedIn) { router.push("/store/login"); return; }
    try {
      await wishlistApi.add(product.id);
      showToast("উইশলিস্টে যোগ হয়েছে!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("already")) showToast("ব্যর্থ হয়েছে", "error");
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
      showToast("রিভিউ সাবমিট হয়েছে!", "success");
      const updated = await reviewsApi.forProduct(product.id);
      setReviews(updated);
    } catch {
      showToast("রিভিউ সাবমিট ব্যর্থ হয়েছে", "error");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1800px] w-full px-6 py-12 sm:px-12 lg:px-16 animate-pulse">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square bg-stone-100 rounded-2xl border border-stone-200/50" />
          <div className="space-y-6">
            <div className="h-8 bg-stone-100 rounded-xl w-3/4" />
            <div className="h-6 bg-stone-100 rounded-xl w-1/4" />
            <div className="h-24 bg-stone-100 rounded-xl" />
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
    <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16 font-sans">
      <Breadcrumb items={[
        { label: "হোম", href: "/store" },
        { label: "আমের কালেকশন", href: "/store/products" },
        { label: product.name }
      ]} />

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="sticky top-24 h-fit">
          <ImageGallery media={product.media || []} productName={product.name} />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {/* Header Info */}
          <div className="mb-6 border-b border-stone-200 pb-6">
            <div className="flex items-center gap-2 mb-3">
              {product.category && (
                <span className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 border border-stone-200 text-stone-500 rounded-lg bg-stone-50">
                  {product.category.name}
                </span>
              )}
              {product.brand && (
                <span className="text-xs font-bold text-stone-400">
                  / {product.brand.name}
                </span>
              )}
            </div>

            <h1 className="text-2.5xl sm:text-3xl font-black mb-4 leading-tight text-stone-900 font-display">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 text-xs font-semibold text-stone-500">
              <div className="flex items-center gap-1">
                <span className="text-[#FFC72C] text-sm">★</span>
                <span className="font-extrabold text-stone-900">{avgRating}</span>
                <span className="text-stone-400 font-medium">({reviews.length} রিভিউ)</span>
              </div>
              <span className="text-stone-200">|</span>
              <span className={`font-bold ${isOutOfStock ? "text-rose-600" : "text-[#2E7D32]"}`}>
                {isOutOfStock ? "স্টক শেষ" : "[ স্টকে আছে ]"}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-black text-stone-900">
                {selectedVariant ? formatPrice(selectedVariant.price) : "—"}
              </span>
              {selectedVariant && discount > 0 && (
                <span className="text-base line-through font-medium mb-1 text-stone-400">
                  {formatPrice(discount)}
                </span>
              )}
              <span className="ml-2 rounded-lg px-2.5 py-1 text-[9px] font-black text-stone-950 mb-1.5 bg-[#FFC72C] tracking-wider uppercase shadow-xs">
                আজকের স্পেশাল অফার
              </span>
            </div>
            <p className="text-[10px] font-bold text-stone-400">ডেলিভারি চার্জ কুরিয়ারে ক্যাশ অন হোম সার্ভিসে প্রযোজ্য</p>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm leading-relaxed mb-8 text-stone-600 font-medium">
            {product.description || "এই আমের জাতের বিস্তারিত বিবরণ পাওয়া যায়নি। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।"}
          </p>

          {/* Variants */}
          {product.variants && product.variants.length > 1 && (
            <div className="mb-6">
              <p className="text-xs font-extrabold mb-3 uppercase tracking-widest text-stone-600 font-display">[ ক্যারেট সাইজ / ওজন নির্বাচন করুন ]</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stockQuantity === 0}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      selectedVariant?.id === v.id
                        ? "border-[#2E7D32] text-white bg-[#2E7D32]"
                        : "border-stone-200 hover:border-stone-400 bg-white text-stone-700"
                    } ${v.stockQuantity === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    {v.sku}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="mb-8 p-6 rounded-2xl bg-[#FFF8E7]/30 border border-stone-200/60">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center justify-between bg-white border border-stone-200 rounded-xl overflow-hidden w-[130px] shrink-0 h-11">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-full flex items-center justify-center text-lg font-bold text-stone-500 hover:bg-stone-50 cursor-pointer">−</button>
                <span className="font-extrabold text-sm text-stone-900">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(selectedVariant?.stockQuantity ?? 99, q + 1))} className="w-10 h-full flex items-center justify-center text-lg font-bold text-stone-500 hover:bg-stone-50 cursor-pointer">+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl text-white font-bold text-xs tracking-wider uppercase h-11 transition-all duration-200 bg-[#2E7D32] hover:bg-[#1B5E20] cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {adding ? "অপেক্ষা করুন..." : isOutOfStock ? "স্টক শেষ" : "কার্টে যোগ করুন"}
              </button>

              <button
                onClick={handleWishlist}
                className="w-11 h-11 rounded-xl bg-white border border-stone-200 text-stone-500 flex items-center justify-center hover:bg-stone-50 hover:text-rose-500 hover:border-rose-200 transition-colors cursor-pointer shadow-xs"
              >
                <svg className="w-5 h-5 fill-none hover:fill-rose-500 transition-colors" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            
            {/* Delivery Features */}
            <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-stone-200/60">
              <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-wider uppercase text-stone-600 font-display">
                <span className="text-base">🚚</span> ফাস্ট হোম ডেলিভারি
              </div>
              <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-wider uppercase text-stone-600 font-display">
                <span className="text-base">🛡️</span> ১০০% ফরমালিন মুক্ত আম
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS SECTION ── */}
      <div className="mt-16 rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs">
        <div className="flex border-b border-stone-200 overflow-x-auto scrollbar-hide">
          {[
            { id: "description", label: "বিবরণ" },
            { id: "specifications", label: "স্পেসিফিকেশন" },
            { id: "reviews", label: `রিভিউ (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`px-8 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b transition-all duration-150 cursor-pointer ${
                activeTab === tab.id 
                  ? "text-[#2E7D32] border-[#2E7D32] bg-[#FFF8E7]/30" 
                  : "text-stone-500 border-transparent hover:text-stone-850 hover:bg-stone-50/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-10 min-h-[250px]">
          {/* Tab 1: Description */}
          {activeTab === "description" && (
            <div className="prose max-w-none text-xs sm:text-sm leading-relaxed text-stone-700 font-medium">
              <p>{product.description || "এই আমের বিবরণ শীঘ্রই যুক্ত করা হবে।"}</p>
            </div>
          )}

          {/* Tab 2: Specs */}
          {activeTab === "specifications" && (
            <div className="space-y-1">
              <div className="grid grid-cols-3 py-3 border-b border-stone-100 text-xs">
                <span className="font-extrabold text-stone-400 uppercase tracking-widest font-display">[ বাগান / ব্র্যান্ড ]</span>
                <span className="col-span-2 font-bold text-stone-700">{product.brand?.name || "জানা নেই"}</span>
              </div>
              <div className="grid grid-cols-3 py-3 border-b border-stone-100 text-xs">
                <span className="font-extrabold text-stone-400 uppercase tracking-widest font-display">[ ক্যাটাগরি ]</span>
                <span className="col-span-2 font-bold text-stone-700">{product.category?.name || "জানা নেই"}</span>
              </div>
              {selectedVariant && (
                <div className="grid grid-cols-3 py-3 border-b border-stone-100 text-xs">
                  <span className="font-extrabold text-stone-400 uppercase tracking-widest font-display">[ প্রোডাক্ট কোড ]</span>
                  <span className="col-span-2 font-bold text-stone-700">{selectedVariant.sku}</span>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Reviews */}
          {activeTab === "reviews" && (
            <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
              {/* Write Review */}
              <div className="bg-[#FFF8E7]/30 rounded-2xl p-6 h-fit border border-stone-200/50">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-stone-800 mb-4 font-display">[ রিভিউ লিখুন ]</h3>
                {!isLoggedIn ? (
                  <p className="text-xs text-stone-500 font-medium">রিভিউ দিতে অনুগ্রহ করে <Link href="/store/login" className="text-[#2E7D32] font-bold hover:underline">লগইন</Link> করুন।</p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" onClick={() => setReviewForm(f => ({...f, rating: s}))} className="text-xl cursor-pointer hover:scale-105 transition-transform">
                            <span className={s <= reviewForm.rating ? "text-amber-500" : "text-stone-200"}>★</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))}
                      className="w-full border border-stone-200 rounded-xl p-3 text-xs focus:border-[#2E7D32] focus:outline-none focus:ring-1 focus:ring-[#2E7D32] bg-white placeholder-stone-400 font-medium"
                      rows={4}
                      placeholder="আপনার মতামত লিখুন..."
                      required
                    />
                    <button disabled={submittingReview} type="submit" className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] font-bold text-xs tracking-wider uppercase py-3 rounded-xl disabled:opacity-50 cursor-pointer text-white shadow-xs">
                      সাবমিট করুন
                    </button>
                  </form>
                )}
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {reviewLoading ? <p className="text-xs text-stone-500 font-semibold animate-pulse">লোড হচ্ছে...</p> : reviews.length === 0 ? (
                  <div className="text-center py-12 bg-stone-50 border border-dashed border-stone-200 rounded-2xl">
                    <p className="text-stone-400 text-xs font-bold">এখনও কোনো রিভিউ দেওয়া হয়নি।</p>
                  </div>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className="border-b border-stone-100 pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-extrabold text-xs text-stone-850">{r.user?.name || "গ্রাহক"}</p>
                          <div className="flex text-amber-500 text-[10px] mt-0.5">
                            {"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}
                          </div>
                        </div>
                        <span className="text-[10px] text-stone-400 font-bold">{new Date(r.createdAt).toLocaleDateString('bn-BD')}</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed font-semibold">{r.comment}</p>
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
