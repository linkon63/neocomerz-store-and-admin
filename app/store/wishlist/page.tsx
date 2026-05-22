"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { wishlistApi, cartApi, type WishlistItem, formatPrice, getProductImage, getDefaultVariant, getStoreToken } from "@/lib/store-api";

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  const isLoggedIn = typeof window !== "undefined" && !!getStoreToken();

  useEffect(() => {
    if (!isLoggedIn) { router.push("/store/login"); return; }
    wishlistApi.get()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  async function handleRemove(productId: string) {
    setRemoving(productId);
    try {
      await wishlistApi.remove(productId);
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } catch { /* ignore */ }
    finally { setRemoving(null); }
  }

  async function handleAddToCart(item: WishlistItem) {
    const variant = getDefaultVariant(item.product);
    if (!variant) return;
    setAdding(item.product.id);
    try {
      await cartApi.addItem(variant.id, 1);
      const current = parseInt(localStorage.getItem("store_cart_count") ?? "0", 10);
      localStorage.setItem("store_cart_count", String(current + 1));
      window.dispatchEvent(new Event("cart-updated"));
    } catch { /* ignore */ }
    finally { setAdding(null); }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-white border animate-pulse" style={{ borderColor: "var(--store-border)" }}>
              <div className="aspect-[3/4] bg-gray-100 rounded-t-2xl" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3.5 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-1 border-b pb-5" style={{ borderColor: "var(--store-border)" }}>
        <h1 className="text-[26px] font-black tracking-tight" style={{ color: "var(--store-text)" }}>
          My Wishlist
        </h1>
        <p className="text-[13px]" style={{ color: "var(--store-text-muted)" }}>
          Your saved premium choices are preserved here.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white border p-12 text-center" style={{ borderColor: "var(--store-border)" }}>
          <p className="text-2xl mb-3">💖</p>
          <p className="text-[16px] font-bold text-slate-800">
            Your wishlist is empty
          </p>
          <p className="mt-2 text-[13px]" style={{ color: "var(--store-text-muted)" }}>
            Explore our curated luxury collections to add items you love.
          </p>
          <Link
            href="/store/products"
            className="mt-6 inline-flex rounded-xl px-6 py-3 text-[13px] font-bold text-white transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: "var(--store-primary)" }}
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const variant = getDefaultVariant(item.product);
            const image = getProductImage(item.product);
            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                style={{ borderColor: "var(--store-border)" }}
              >
                <Link href={`/store/products/${item.product.slug}`} className="block">
                  <div className="aspect-[4/5] overflow-hidden bg-slate-50">
                    <img
                      src={image}
                      alt={item.product.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
                    />
                  </div>
                </Link>
                <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                  <div className="min-h-[40px]">
                    <Link
                      href={`/store/products/${item.product.slug}`}
                      className="text-[14px] font-bold line-clamp-2 hover:text-[var(--store-primary)] transition-colors"
                      style={{ color: "var(--store-text)" }}
                    >
                      {item.product.name}
                    </Link>
                    {item.product.category && (
                      <p className="text-[11px] mt-1 font-semibold uppercase tracking-wider text-indigo-600">
                        {item.product.category.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-1" style={{ borderTop: "1px solid var(--store-border)" }}>
                    <span className="text-[15px] font-bold" style={{ color: "var(--store-text)" }}>
                      {variant ? formatPrice(variant.price) : "—"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={adding === item.product.id || !variant}
                        className="rounded-lg px-3 py-2 text-[11px] font-bold text-white transition-colors disabled:opacity-50"
                        style={{ backgroundColor: "var(--store-primary)" }}
                      >
                        {adding === item.product.id ? "Adding..." : "Add to Cart"}
                      </button>
                      <button
                        onClick={() => handleRemove(item.product.id)}
                        disabled={removing === item.product.id}
                        className="rounded-lg border px-3 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        style={{ borderColor: "rgba(220,38,38,0.2)" }}
                        aria-label="Remove from wishlist"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
