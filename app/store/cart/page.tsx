"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cartApi,
  couponsApi,
  type Cart,
  formatPrice,
  getStoreToken,
  STORE_CHECKOUT_COUPON_KEY,
} from "@/lib/store-api";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const isLoggedIn = typeof window !== "undefined" && !!getStoreToken();

  useEffect(() => {
    if (!isLoggedIn) { router.push("/store/login"); return; }
    fetchCart();
  }, [isLoggedIn]);

  async function fetchCart() {
    setLoading(true);
    try {
      const c = await cartApi.get();
      setCart(c);
      localStorage.setItem("store_cart_count", String(c.items.length));
      window.dispatchEvent(new Event("cart-updated"));
    } catch { setCart(null); }
    finally { setLoading(false); }
  }

  async function handleQuantity(itemId: string, qty: number) {
    if (qty < 1) return handleRemove(itemId);
    setUpdating(itemId);
    try { await cartApi.updateItem(itemId, qty); await fetchCart(); }
    catch { /* ignore */ }
    finally { setUpdating(null); }
  }

  async function handleRemove(itemId: string) {
    setUpdating(itemId);
    try { await cartApi.removeItem(itemId); await fetchCart(); }
    catch { /* ignore */ }
    finally { setUpdating(null); }
  }

  async function handleClear() {
    try { await cartApi.clear(); await fetchCart(); }
    catch { /* ignore */ }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError(null);
    setCouponMsg(null);
    try {
      const subtotal = cart?.items.reduce((s, i) => s + parseFloat(String(i.variant.price)) * i.quantity, 0) ?? 0;
      const res = await couponsApi.apply(couponCode.trim(), subtotal);
      const msg = res.message ?? `কুপন প্রয়োগ হয়েছে! -${formatPrice(res.discount)}`;
      setCouponDiscount(res.discount);
      setCouponMsg(msg);
      localStorage.setItem(STORE_CHECKOUT_COUPON_KEY, JSON.stringify({ code: couponCode.trim(), discount: res.discount, message: msg }));
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "অবৈধ কুপন কোড");
      localStorage.removeItem(STORE_CHECKOUT_COUPON_KEY);
    } finally { setApplyingCoupon(false); }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 flex gap-4" style={{ border: "1px solid var(--store-border)" }}>
              <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + parseFloat(String(i.variant.price)) * i.quantity, 0);
  const total = Math.max(0, subtotal - couponDiscount);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" style={{ color: "var(--store-text)" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-5" style={{ borderBottom: "2px solid var(--store-border)" }}>
        <div>
          <h1 className="text-[26px] font-black" style={{ color: "var(--store-text)" }}>আমার কার্ট</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--store-text-muted)" }}>
            {items.length} টি পণ্য কার্টে আছে
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-[13px] font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            কার্ট খালি করুন
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center" style={{ border: "1px solid var(--store-border)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "var(--store-primary-light)" }}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "var(--store-primary)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.076.721-.506 1.393-1.234 1.393H4.365c-.728 0-1.31-.672-1.234-1.393l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
          </div>
          <h2 className="text-[20px] font-bold mb-2" style={{ color: "var(--store-text)" }}>কার্ট খালি আছে</h2>
          <p className="text-[14px] mb-6" style={{ color: "var(--store-text-muted)" }}>পণ্য যোগ করুন এবং কেনাকাটা শুরু করুন।</p>
          <Link
            href="/store/products"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[14px] font-bold text-white transition-all"
            style={{ backgroundColor: "var(--store-primary)" }}
          >
            পণ্য দেখুন
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* Cart Items */}
          <div className="space-y-3">
            {items.map((item) => {
              const product = item.variant.product;
              const imgUrl = item.variant.product.media?.[0]?.media.url;
              const resolvedImg = imgUrl
                ? imgUrl.startsWith("http") ? imgUrl : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ?? "http://localhost:5010"}${imgUrl}`
                : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80";

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl p-4 flex gap-4 transition-all ${updating === item.id ? "opacity-50" : ""}`}
                  style={{ border: "1px solid var(--store-border)" }}
                >
                  {/* Image */}
                  <Link href={`/store/products/${product.slug}`} className="shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img src={resolvedImg} alt={product.name} className="w-full h-full object-contain p-1" />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/store/products/${product.slug}`}
                      className="text-[14px] font-semibold line-clamp-2 hover:underline"
                      style={{ color: "var(--store-text)" }}
                    >
                      {product.name}
                    </Link>
                    <p className="text-[11px] mt-0.5 font-medium" style={{ color: "var(--store-text-muted)" }}>
                      SKU: {item.variant.sku}
                    </p>
                    <p className="text-[15px] font-bold mt-1.5" style={{ color: "var(--store-primary)" }}>
                      {formatPrice(item.variant.price)}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                      aria-label="সরিয়ে দিন"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>

                    <div className="flex items-center rounded-lg overflow-hidden" style={{ border: "1.5px solid var(--store-border)" }}>
                      <button
                        onClick={() => handleQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-[16px] font-bold hover:bg-gray-50 transition-colors"
                        style={{ color: "var(--store-text)" }}
                      >−</button>
                      <span className="w-9 h-8 flex items-center justify-center text-[13px] font-bold border-x" style={{ borderColor: "var(--store-border)", color: "var(--store-text)" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-[16px] font-bold hover:bg-gray-50 transition-colors"
                        style={{ color: "var(--store-text)" }}
                      >+</button>
                    </div>

                    <p className="text-[13px] font-bold" style={{ color: "var(--store-text)" }}>
                      {formatPrice(parseFloat(String(item.variant.price)) * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Continue shopping */}
            <Link
              href="/store/products"
              className="flex items-center gap-2 text-[13px] font-semibold mt-2 transition-colors hover:underline"
              style={{ color: "var(--store-primary)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              কেনাকাটা চালিয়ে যান
            </Link>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 sticky top-20" style={{ border: "1px solid var(--store-border)" }}>
              <h2 className="text-[18px] font-black mb-5 pb-4" style={{ color: "var(--store-text)", borderBottom: "1px solid var(--store-border)" }}>
                অর্ডার সারসংক্ষেপ
              </h2>

              <div className="space-y-3 text-[14px]">
                <div className="flex justify-between">
                  <span style={{ color: "var(--store-text-muted)" }}>সাবটোটাল ({items.length} টি পণ্য)</span>
                  <span className="font-semibold" style={{ color: "var(--store-text)" }}>{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>কুপন ছাড়</span>
                    <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: "var(--store-text-muted)" }}>ডেলিভারি চার্জ</span>
                  <span className="font-semibold text-green-600 text-[12px]">পরবর্তী ধাপে</span>
                </div>
                <div className="flex justify-between text-[16px] font-black pt-3 mt-1" style={{ borderTop: "2px solid var(--store-border)", color: "var(--store-text)" }}>
                  <span>মোট</span>
                  <span style={{ color: "var(--store-primary)" }}>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--store-border)" }}>
                <p className="text-[12px] font-bold uppercase tracking-wide mb-2.5" style={{ color: "var(--store-text-muted)" }}>
                  🎟️ প্রোমো কোড
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="কুপন কোড লিখুন"
                    className="flex-1 rounded-lg px-3 py-2.5 text-[13px] outline-none transition-all"
                    style={{
                      border: "1.5px solid var(--store-border)",
                      backgroundColor: "var(--store-bg)",
                      color: "var(--store-text)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--store-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--store-border)")}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="rounded-lg px-4 py-2.5 text-[13px] font-bold text-white transition-all disabled:opacity-50"
                    style={{ backgroundColor: "var(--store-secondary)" }}
                  >
                    {applyingCoupon ? "..." : "প্রয়োগ"}
                  </button>
                </div>
                {couponMsg && (
                  <p className="mt-2 text-[12px] font-semibold text-green-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {couponMsg}
                  </p>
                )}
                {couponError && (
                  <p className="mt-2 text-[12px] font-semibold text-red-500">{couponError}</p>
                )}
              </div>

              {/* Checkout button */}
              <Link
                href="/store/checkout"
                className="mt-5 flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-[15px] font-bold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "var(--store-primary)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                চেকআউট করুন
              </Link>

              {/* Trust badges */}
              <div className="mt-4 flex items-center justify-center gap-4 text-[11px]" style={{ color: "var(--store-text-muted)" }}>
                <span>🔒 নিরাপদ পেমেন্ট</span>
                <span>🚚 দ্রুত ডেলিভারি</span>
                <span>🔄 সহজ রিটার্ন</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
