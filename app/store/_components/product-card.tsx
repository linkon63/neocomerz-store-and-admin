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

  const originalPrice = variant ? parseFloat(variant.price.toString()) * 1.2 : null;
  const isOutOfStock = variant ? variant.stockQuantity === 0 : false;

  return (
    <Link href={`/store/products/${product.slug}`} className="group block outline-none h-full">
      <article
        className="relative overflow-hidden h-full flex flex-col bg-white transition-all duration-200"
        style={{
          border: "1px solid var(--store-border)",
          borderRadius: "12px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1", borderRadius: "12px 12px 0 0" }}>
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white" style={{ backgroundColor: "var(--store-primary)" }}>
              -20%
            </span>
            {isOutOfStock && (
              <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white bg-gray-500">
                স্টক নেই
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={wishlisting}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white shadow-sm border transition-all duration-200 hover:scale-110 cursor-pointer"
            style={{ borderColor: "var(--store-border)" }}
            aria-label="Add to wishlist"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" style={{ color: "var(--store-primary)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="p-3.5 flex flex-col flex-1 gap-2">
          {/* Category & Brand */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.category && (
              <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--store-primary-light)", color: "var(--store-primary)" }}>
                {product.category.name}
              </span>
            )}
            {product.brand && (
              <span className="text-[10px] font-medium" style={{ color: "var(--store-text-muted)" }}>
                {product.brand.name}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="text-[14px] font-semibold leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors" style={{ color: "var(--store-text)" }}>
            {product.name}
          </h3>

          {/* Stars */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[11px]" style={{ color: "var(--store-text-muted)" }}>(4.9)</span>
          </div>

          {/* Price + Cart button */}
          <div className="mt-auto pt-2.5 flex items-center justify-between gap-2" style={{ borderTop: "1px solid var(--store-border)" }}>
            <div className="flex flex-col gap-0.5">
              {originalPrice && (
                <span className="text-[11px] line-through" style={{ color: "var(--store-text-light)" }}>
                  {variant ? formatPrice(originalPrice) : ""}
                </span>
              )}
              <span className="text-[16px] font-bold" style={{ color: "var(--store-primary)" }}>
                {variant ? formatPrice(variant.price) : "—"}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding || !variant || isOutOfStock}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: added ? "var(--store-success)" : "var(--store-primary)",
              }}
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
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
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
