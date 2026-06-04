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
      <div className="mx-auto max-w-[1800px] w-full px-6 py-12 sm:px-12 lg:px-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-none bg-white border border-stroke animate-pulse">
              <div className="aspect-[4/5] bg-stone-100 rounded-none border-b border-stroke" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-stone-100 rounded-none w-3/4" />
                <div className="h-3.5 bg-stone-100 rounded-none w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16">
      <div className="mb-8 flex flex-col gap-1 border-b pb-5 border-stroke">
        <h1 className="text-2xl font-bold font-serif uppercase text-foreground">
          উইশলিস্ট
        </h1>
        <p className="text-xs text-stone-500 font-medium tracking-wide">
          [ আপনার পছন্দের পণ্যগুলো এখানে থাকবে ]
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-none bg-white border border-stroke p-12 text-center shadow-none">
          <p className="text-2xl mb-3">💖</p>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-700">
            এখনো কোনো পণ্য নেই
          </p>
          <p className="mt-2 text-xs text-stone-500 font-medium">
            প্রোডাক্ট ব্রাউজ করে পছন্দেরটি যোগ করুন।
          </p>
          <Link
            href="/store/products"
            className="mt-6 inline-flex rounded-none btn-premium px-6 py-3 text-xs font-bold tracking-widest uppercase text-white hover:opacity-95 transition"
          >
            পণ্য দেখুন
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
                className="rounded-none bg-white border-[0.5px] border-stroke overflow-hidden shadow-none hover:border-foreground transition-colors duration-200 flex flex-col"
              >
                <Link href={`/store/products/${item.product.slug}`} className="block">
                  <div className="aspect-[4/5] overflow-hidden bg-stone-50 border-b border-stroke">
                    <img
                      src={image}
                      alt={item.product.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
                    />
                  </div>
                </Link>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="min-h-[40px]">
                    <Link
                      href={`/store/products/${item.product.slug}`}
                      className="text-xs font-semibold leading-relaxed line-clamp-2 text-foreground"
                    >
                      {item.product.name}
                    </Link>
                    {item.product.category && (
                      <p className="text-[9px] font-medium tracking-wider text-stone-400 mt-1 uppercase">
                        [{item.product.category.name}]
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-auto border-t border-stroke">
                    <span className="text-xs font-bold text-foreground">
                      {variant ? formatPrice(variant.price) : "—"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={adding === item.product.id || !variant}
                        className="rounded-none border border-primary px-3 py-1.5 text-[10px] font-bold bg-transparent text-primary hover:bg-primary hover:text-white transition-colors duration-200 disabled:opacity-50"
                      >
                        {adding === item.product.id ? "Adding..." : "কার্টে যোগ"}
                      </button>
                      <button
                        onClick={() => handleRemove(item.product.id)}
                        disabled={removing === item.product.id}
                        className="rounded-none border border-red-200 hover:border-red-500 px-3 py-1.5 text-[10px] font-bold text-red-650 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
                        aria-label="Remove from wishlist"
                      >
                        মুছুন
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
