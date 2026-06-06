"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { wishlistApi, cartApi, type WishlistItem, formatPrice, getProductImage, getDefaultVariant, getStoreToken, syncCartCount } from "@/lib/store-api";

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
      .then((data) => {
        setItems(data);
        localStorage.setItem("store_wishlist_count", String(data.length));
        window.dispatchEvent(new Event("wishlist-updated"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  async function handleRemove(productId: string) {
    setRemoving(productId);
    try {
      await wishlistApi.remove(productId);
      setItems((prev) => {
        const remaining = prev.filter((i) => i.product.id !== productId);
        localStorage.setItem("store_wishlist_count", String(remaining.length));
        window.dispatchEvent(new Event("wishlist-updated"));
        return remaining;
      });
    } catch { /* ignore */ }
    finally { setRemoving(null); }
  }

  async function handleAddToCart(item: WishlistItem) {
    const variant = getDefaultVariant(item.product);
    if (!variant) return;
    setAdding(item.product.id);
    try {
      await cartApi.addItem(variant.id, 1);
      await syncCartCount();
    } catch { /* ignore */ }
    finally { setAdding(null); }
  }

  if (loading) {
    return (
      <div className="w-full px-6 py-12 sm:px-12 lg:px-16 font-sans">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-stone-200 animate-pulse">
              <div className="aspect-[4/3] bg-stone-100 border-b border-stone-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-stone-100 w-3/4" />
                <div className="h-3.5 bg-stone-100 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-10 sm:px-12 lg:px-16 font-sans">
      <div className="mb-8 flex flex-col gap-1 border-b pb-5 border-stone-200">
        <h1 className="text-2xl font-bold font-serif uppercase text-stone-850">
          পছন্দের তালিকা
        </h1>
        <p className="text-xs text-stone-500 font-semibold tracking-wide">
          আপনার বুকমার্ক করা আমসমূহ (Wishlist)
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-stone-200/60 p-16 text-center shadow-xs">
          <p className="text-3xl mb-4">💖</p>
          <p className="text-sm font-bold uppercase tracking-wider text-stone-800">
            পছন্দের তালিকায় কিছু নেই
          </p>
          <p className="mt-2 text-xs text-stone-500 font-semibold">
            আমাদের কালেকশন ব্রাউজ করে আপনার পছন্দের আমটি যোগ করুন।
          </p>
          <Link
            href="/store/products"
            className="mt-6 inline-flex btn-premium px-6 py-3 text-xs font-bold tracking-widest uppercase text-white hover:opacity-95 transition cursor-pointer"
          >
            আমসমূহ দেখুন
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
                className="bg-white border border-stone-200/60 overflow-hidden shadow-xs hover:border-[#15803d] transition-all duration-300 flex flex-col"
              >
                <Link href={`/store/products/${item.product.slug}`} className="block">
                  <div className="aspect-[4/3] overflow-hidden bg-stone-50 border-b border-stone-200">
                    <img
                      src={image}
                      alt={item.product.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-102"
                    />
                  </div>
                </Link>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="min-h-[40px]">
                    <Link
                      href={`/store/products/${item.product.slug}`}
                      className="text-sm font-bold leading-relaxed line-clamp-2 text-stone-800 hover:text-[#15803d] transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    {item.product.category && (
                      <p className="text-[9px] font-extrabold tracking-wider text-[#15803d] mt-1.5 uppercase font-display">
                        {item.product.category.name.replace(/Clothing|Fashion|Shoes|Accessories/gi, "নাওগাঁর আম")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-auto border-t border-stone-100">
                    <span className="text-sm font-black text-[#15803d] font-display">
                      {variant ? formatPrice(variant.price) : "—"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={adding === item.product.id || !variant}
                        className="border border-[#15803d] px-4 py-2 text-[10px] font-bold bg-transparent text-[#15803d] hover:bg-[#ff9f00] hover:border-[#ff9f00] hover:text-stone-900 transition-all duration-250 disabled:opacity-50 cursor-pointer"
                      >
                        {adding === item.product.id ? "যোগ হচ্ছে..." : "কার্টে যোগ করুন"}
                      </button>
                      <button
                        onClick={() => handleRemove(item.product.id)}
                        disabled={removing === item.product.id}
                        className="border border-rose-200 hover:border-rose-500 px-4 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                        aria-label="Remove from wishlist"
                      >
                        বাদ দিন
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
