"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  type Product,
  cartApi,
  wishlistApi,
  formatPrice,
  getProductImage,
  getDefaultVariant,
  getStoreToken,
  syncCartCount,
} from "@/lib/store-api";
import { showToast } from "./toast";

interface ProductCardProps {
  product: Product;
  onCartUpdate?: () => void;
  compact?: boolean;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, onCartUpdate, compact = false, viewMode = 'grid' }: ProductCardProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);
  const [added, setAdded] = useState(false);

  const variant = getDefaultVariant(product);
  const image = getProductImage(product);
  const isLoggedIn = typeof window !== "undefined" && !!getStoreToken();

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!variant) return;
    if (!isLoggedIn) {
      window.location.href = `/store/login?redirect=/store/products/${product.slug}`;
      return;
    }
    setAdding(true);
    try {
      await cartApi.addItem(variant.id, 1);
      setAdded(true);
      await syncCartCount();
      onCartUpdate?.();
      showToast("কার্টে যোগ হয়েছে!", "success");
      // Trigger mini cart events to open drawer and update count
      window.dispatchEvent(new Event("open-mini-cart"));
      window.dispatchEvent(new Event("cart-updated"));
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "কার্টে যোগ করা যায়নি", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    if (!variant) return;
    if (!isLoggedIn) {
      window.location.href = `/store/login?redirect=/store/checkout`;
      return;
    }
    setBuyingNow(true);
    try {
      await cartApi.addItem(variant.id, 1);
      await syncCartCount();
      router.push("/store/checkout");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "ব্যর্থ হয়েছে", "error");
      setBuyingNow(false);
    }
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      window.location.href = `/store/login?redirect=/store/products/${product.slug}`;
      return;
    }
    setWishlisting(true);
    try {
      await wishlistApi.add(product.id);
      showToast("উইশলিস্টে যোগ হয়েছে!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("already")) showToast("Failed to add to wishlist", "error");
    } finally {
      setWishlisting(false);
    }
  }

  const originalPrice = variant ? parseFloat(variant.price.toString()) * 1.25 : null;
  const isOutOfStock = variant ? variant.stockQuantity === 0 : false;

  const isMango =
    product.category?.name.includes("আম") ||
    product.category?.name.toLowerCase().includes("mango") ||
    product.name.includes("আম") ||
    product.name.toLowerCase().includes("mango");

  const reviewCount = product._count?.reviews ?? 0;

  if (viewMode === 'list') {
    return (
      <Link href={`/store/products/${product.slug}`} className="group block outline-none">
        <article
          className="border border-stone-100 bg-white hover:border-[#15803d] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-4 p-4"
          style={{ borderRadius: "4px" }}
        >
          {/* Left: Image */}
          <div
            className="relative overflow-hidden bg-stone-50 w-full sm:w-48 h-48 sm:h-auto aspect-square sm:aspect-auto shrink-0 border border-stone-100 flex items-center justify-center rounded-sm"
          >
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Badges on image */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isMango && (
                <span
                  className="bg-[#15803d] text-white px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-xs rounded-[3px]"
                >
                  তাজা আম
                </span>
              )}
              {isOutOfStock && (
                <span
                  className="bg-stone-500 text-white px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-sm rounded-[3px]"
                >
                  স্টক নেই
                </span>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold tracking-wider uppercase text-[#0D623B]">
                  {product.category && (
                    <span
                      className="bg-[#E6F3EC] px-2 py-0.5 text-[#0D623B] rounded-[3px]"
                    >
                      {product.category.name}
                    </span>
                  )}
                  {product.brand && (
                    <span className="text-stone-450 font-medium">• {product.brand.name}</span>
                  )}
                </div>

                {/* Wishlist */}
                <button
                  onClick={handleWishlist}
                  disabled={wishlisting}
                  className="p-1.5 bg-white border border-stone-100 text-stone-400 hover:text-rose-500 hover:border-rose-100 transition-all duration-200 cursor-pointer shadow-xs rounded-[4px]"
                  aria-label="Add to wishlist"
                >
                  <svg
                    className="w-3.5 h-3.5 fill-none hover:fill-rose-500 transition-colors"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <h3 className="font-bold text-base leading-snug text-stone-850 group-hover:text-[#0D623B] transition-colors duration-150 line-clamp-2">
                {product.name}
              </h3>

              {product.description && (
                <p className="text-xs text-stone-500 line-clamp-2 font-medium leading-relaxed mt-1">
                  {product.description}
                </p>
              )}

              {/* Stars */}
              <div className="flex items-center gap-1.5">
                <div className="flex text-[#FF9F00]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {reviewCount > 0 ? (
                  <span className="text-[10px] font-bold text-stone-400">({reviewCount})</span>
                ) : (
                  <span className="text-[10px] font-medium text-stone-300">নতুন</span>
                )}
              </div>
            </div>

            {/* Price & Actions Row */}
            <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {originalPrice && (
                  <span className="text-xs font-medium text-stone-400 line-through">
                    {variant ? formatPrice(originalPrice) : ""}
                  </span>
                )}
                <span className="font-extrabold text-lg text-stone-900">
                  {variant ? formatPrice(variant.price) : "—"}
                </span>
              </div>

              <div className="flex gap-2 min-w-[220px]">
                <button
                  onClick={handleAddToCart}
                  disabled={adding || !variant || isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-md active:scale-95 shadow-xs ${
                    added
                      ? "bg-emerald-800 border-emerald-800 text-white"
                      : "bg-[#15803d] border-[#15803d] text-white hover:bg-[#166534] hover:border-[#166534]"
                  }`}
                >
                  {adding ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : added ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      যোগ হয়েছে
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      কার্ট
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={buyingNow || !variant || isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#ff9f00] border border-[#ff9f00] text-slate-900 font-black px-4 py-2.5 text-xs rounded-md uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e08b00] hover:border-[#e08b00] active:scale-95 shadow-xs"
                >
                  {buyingNow ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      এখনই কিনুন
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/store/products/${product.slug}`} className="group block outline-none h-full">
      <article
        className={`store-card relative overflow-hidden h-full flex flex-col bg-white transition-all duration-300 ${
          compact
            ? "border border-stone-100 hover:border-emerald-700/50 hover:shadow-md"
            : "border border-stone-100 hover:border-emerald-700 shadow-xs hover:shadow-md"
        }`}
        style={{ borderRadius: "4px" }}
      >
        {/* Image */}
        <div
          className="relative overflow-hidden bg-stone-50 aspect-square border-b border-stone-100"
          style={{ borderRadius: "4px 4px 0 0" }}
        >
          <img
            src={image}
            alt={product.name}
            className={`h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 ${
              compact ? "p-3" : "p-6"
            }`}
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isMango && (
              <span
                className="bg-[#15803d] text-white px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-xs"
                style={{ borderRadius: "3px" }}
              >
                তাজা আম
              </span>
            )}
            {isOutOfStock && (
              <span
                className="bg-stone-500 text-white px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-sm"
                style={{ borderRadius: "3px" }}
              >
                স্টক নেই
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={wishlisting}
            className="absolute top-2 right-2 p-1.5 bg-white border border-stone-100 text-stone-400 hover:text-rose-500 hover:border-rose-100 transition-all duration-200 cursor-pointer shadow-xs"
            style={{ borderRadius: "4px" }}
            aria-label="Add to wishlist"
          >
            <svg
              className="w-3.5 h-3.5 fill-none hover:fill-rose-500 transition-colors"
              stroke="currentColor"
              strokeWidth={2.2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className={`flex flex-col flex-1 ${compact ? "p-3 gap-1.5" : "p-3 sm:p-4 gap-2"}`}>
          {/* Category & Brand */}
          <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold tracking-wider uppercase text-[#0D623B]">
            {product.category && (
              <span
                className="bg-[#E6F3EC] px-2 py-0.5 text-[#0D623B]"
                style={{ borderRadius: "3px" }}
              >
                {product.category.name}
              </span>
            )}
            {!compact && product.brand && (
              <span className="text-stone-450 font-medium">• {product.brand.name}</span>
            )}
          </div>

          {/* Name */}
          <h3
            className={`font-bold leading-snug text-stone-800 line-clamp-2 transition-colors duration-150 group-hover:text-[#0D623B] ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {product.name}
          </h3>

          {/* Stars */}
          {!compact && (
            <div className="flex items-center gap-1.5">
              <div className="flex text-[#FF9F00]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {reviewCount > 0 ? (
                <span className="text-[10px] font-bold text-stone-400">({reviewCount})</span>
              ) : (
                <span className="text-[10px] font-medium text-stone-300">নতুন</span>
              )}
            </div>
          )}

          {/* Price row */}
          <div className="mt-auto pt-2 border-t border-stone-100">
            {/* Price display */}
            <div className="flex items-center gap-2 mb-2">
              {originalPrice && (
                <span className="text-[10px] font-medium text-stone-400 line-through">
                  {variant ? formatPrice(originalPrice) : ""}
                </span>
              )}
              <span
                className={`font-extrabold text-stone-900 ${compact ? "text-[13px]" : "text-[15px]"}`}
              >
                {variant ? formatPrice(variant.price) : "—"}
              </span>
            </div>

            {/* Action buttons */}
            {compact ? (
              /* Compact: single cart button */
              <button
                onClick={handleAddToCart}
                disabled={adding || !variant || isOutOfStock}
                className={`w-full flex items-center justify-center gap-1 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border px-2 py-1.5 text-[10px] font-bold ${
                  added
                    ? "bg-[#0D623B] border-[#0D623B] text-white"
                    : "bg-stone-50 border-stone-100 text-[#0D623B] hover:bg-[#ff9f00] hover:border-[#ff9f00] hover:text-stone-900"
                }`}
                style={{ borderRadius: "3px" }}
              >
                {adding ? (
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : added ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    যোগ হয়েছে
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    কার্টে যোগ
                  </>
                )}
              </button>
            ) : (
              /* Full: two buttons — Cart + Buy Now */
              <div className="flex gap-1.5">
                <button
                  onClick={handleAddToCart}
                  disabled={adding || !variant || isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-1 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border px-2 py-2 text-[10px] font-bold ${
                    added
                      ? "bg-[#0D623B] border-[#0D623B] text-white"
                      : "bg-stone-50 border-stone-100 text-[#0D623B] hover:bg-[#ff9f00] hover:border-[#ff9f00] hover:text-stone-900"
                  }`}
                  style={{ borderRadius: "3px" }}
                >
                  {adding ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : added ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      যোগ হয়েছে
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      কার্ট
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={buyingNow || !variant || isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-1 bg-[#f59e0b] hover:bg-[#d97706] border border-[#f59e0b] hover:border-[#d97706] text-stone-900 font-bold px-2 py-2 text-[10px] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderRadius: "3px" }}
                >
                  {buyingNow ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      এখনই কিনুন
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
