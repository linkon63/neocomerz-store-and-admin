"use client";

import Link from "next/link";
import { useState } from "react";
import {
  type Product,
  cartApi,
  wishlistApi,
  formatPrice,
  getProductImage,
  getDefaultVariant,
  getStoreToken,
} from "@/lib/store-api";
import { showToast } from "./toast";

interface ProductCardProps {
  product: Product;
  onCartUpdate?: () => void;
}

export function ProductCard({ product, onCartUpdate }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);
  const [added, setAdded] = useState(false);

  const variant = getDefaultVariant(product);
  const image = getProductImage(product);
  const isLoggedIn = typeof window !== "undefined" && !!getStoreToken();

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!variant) return;
    if (!isLoggedIn) { window.location.href = "/store/login"; return; }
    setAdding(true);
    try {
      await cartApi.addItem(variant.id, 1);
      setAdded(true);
      const current = parseInt(localStorage.getItem("store_cart_count") ?? "0", 10);
      localStorage.setItem("store_cart_count", String(current + 1));
      window.dispatchEvent(new Event("cart-updated"));
      onCartUpdate?.();
      showToast("Added to cart!", "success");
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add to cart", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!isLoggedIn) { window.location.href = "/store/login"; return; }
    setWishlisting(true);
    try {
      await wishlistApi.add(product.id);
      showToast("Added to wishlist!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("already")) showToast("Failed to add to wishlist", "error");
    } finally {
      setWishlisting(false);
    }
  }

  const originalPrice = variant ? parseFloat(variant.price.toString()) * 1.25 : null;
  const isOutOfStock = variant ? variant.stockQuantity === 0 : false;

  return (
    <Link href={`/store/products/${product.slug}`} className="group block outline-none h-full">
      <article className="store-card relative overflow-hidden h-full flex flex-col bg-white rounded-2xl border border-stone-100 hover:border-[#FFC72C]/70 hover:ring-1 hover:ring-[#FFC72C]/40 transition-all duration-300 shadow-xs hover:shadow-sm">
        {/* Image */}
        <div className="relative overflow-hidden bg-stone-50 aspect-square rounded-t-2xl border-b border-stone-100">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className="rounded-lg bg-[#2E7D32] text-white px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase shadow-xs">
              তাজা আম
            </span>
            {isOutOfStock && (
              <span className="rounded-lg bg-stone-500 text-white px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-sm">
                স্টক নেই
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={wishlisting}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white border border-stone-100 text-stone-400 hover:text-rose-500 hover:border-rose-100 transition-all duration-200 cursor-pointer shadow-xs"
            aria-label="Add to wishlist"
          >
            <svg className="w-3.5 h-3.5 fill-none hover:fill-rose-500 transition-colors" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1 gap-2.5">
          {/* Category & Brand */}
          <div className="flex items-center gap-2 flex-wrap text-[9px] font-bold tracking-wider uppercase text-[#2E7D32]">
            {product.category && (
              <span className="bg-[#E8F5E9] px-2 py-0.5 rounded">
                {product.category.name}
              </span>
            )}
            {product.brand && (
              <span className="text-stone-450 font-medium">
                • {product.brand.name}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="text-xs font-bold leading-relaxed text-stone-800 line-clamp-2 transition-colors duration-150 group-hover:text-[#2E7D32]">
            {product.name}
          </h3>

          {/* Stars */}
          <div className="flex items-center gap-1.5">
            <div className="flex text-[#FFC72C]">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[10px] font-bold text-stone-400">(৫.০)</span>
          </div>

          {/* Price + Cart button */}
          <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              {originalPrice && (
                <span className="text-[9px] font-medium text-stone-450 line-through">
                  {variant ? formatPrice(originalPrice) : ""}
                </span>
              )}
              <span className="text-sm font-extrabold text-stone-900">
                {variant ? formatPrice(variant.price) : "—"}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding || !variant || isOutOfStock}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border ${
                added 
                  ? "bg-[#2E7D32] border-[#2E7D32] text-white shadow-xs" 
                  : "bg-amber-50 border-amber-100 text-[#2E7D32] hover:bg-[#2E7D32] hover:border-[#2E7D32] hover:text-white hover:shadow-xs"
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
                  যোগ হয়েছে
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  কার্টে যোগ
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
