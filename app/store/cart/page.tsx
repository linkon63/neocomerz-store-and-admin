"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cartApi,
  couponsApi,
  type Cart,
  formatPrice,
  getProductImage,
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
    if (!isLoggedIn) {
      router.push("/store/login");
      return;
    }
    fetchCart();
  }, [isLoggedIn]);

  async function fetchCart() {
    setLoading(true);
    try {
      const c = await cartApi.get();
      setCart(c);
      localStorage.setItem("store_cart_count", String(c.items.length));
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuantity(itemId: string, qty: number) {
    if (qty < 1) return handleRemove(itemId);
    setUpdating(itemId);
    try {
      await cartApi.updateItem(itemId, qty);
      await fetchCart();
    } catch { /* ignore */ }
    finally { setUpdating(null); }
  }

  async function handleRemove(itemId: string) {
    setUpdating(itemId);
    try {
      await cartApi.removeItem(itemId);
      await fetchCart();
    } catch { /* ignore */ }
    finally { setUpdating(null); }
  }

  async function handleClear() {
    try {
      await cartApi.clear();
      await fetchCart();
    } catch { /* ignore */ }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError(null);
    setCouponMsg(null);
    try {
      const subtotal = cart?.items.reduce((s, i) => s + parseFloat(String(i.variant.price)) * i.quantity, 0) ?? 0;
      const res = await couponsApi.apply(couponCode.trim(), subtotal);
      const msg = res.message ?? `Coupon applied! -${formatPrice(res.discount)}`;
      setCouponDiscount(res.discount);
      setCouponMsg(msg);
      localStorage.setItem(
        STORE_CHECKOUT_COUPON_KEY,
        JSON.stringify({ code: couponCode.trim(), discount: res.discount, message: msg }),
      );
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Invalid coupon");
      localStorage.removeItem(STORE_CHECKOUT_COUPON_KEY);
    } finally {
      setApplyingCoupon(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-5 border flex gap-4" style={{ borderColor: "var(--store-border)" }}>
              <div className="w-20 h-20 rounded-xl bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 min-h-[calc(100vh-280px)]">
      <div className="mb-6 flex items-center justify-between border-b pb-5" style={{ borderColor: "var(--store-border)" }}>
        <h1 className="text-[26px] font-black tracking-tight" style={{ color: "var(--store-text)" }}>
          Shopping Cart
        </h1>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs font-bold text-red-500 hover:text-red-700 transition cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-16 text-center border" style={{ borderColor: "var(--store-border)" }}>
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-xl font-bold" style={{ color: "var(--store-text)" }}>Your cart is empty</p>
          <p className="mt-2 text-sm" style={{ color: "var(--store-text-muted)" }}>Add some products to get started.</p>
          <Link
            href="/store/products"
            className="mt-6 inline-flex rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--store-primary)" }}
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
          <div className="space-y-4">
            {items.map((item) => {
              const product = item.variant.product;
              const imgUrl = item.variant.product.media?.[0]?.media.url;
              const resolvedImg = imgUrl
                ? imgUrl.startsWith("http") ? imgUrl : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ?? "http://localhost:5010"}${imgUrl}`
                : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80";

              return (
                <div key={item.id} className={`rounded-2xl bg-white p-4 border flex gap-4 transition ${updating === item.id ? "opacity-50" : ""}`} style={{ borderColor: "var(--store-border)" }}>
                  <Link href={`/store/products/${product.slug}`} className="shrink-0">
                    <img
                      src={resolvedImg}
                      alt={product.name}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-50"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/store/products/${product.slug}`} className="font-bold text-sm hover:underline line-clamp-2" style={{ color: "var(--store-text)" }}>
                      {product.name}
                    </Link>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--store-text-muted)" }}>SKU: {item.variant.sku}</p>
                    <p className="text-sm font-black mt-1" style={{ color: "var(--store-primary)" }}>{formatPrice(item.variant.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                      aria-label="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="flex items-center rounded-xl border overflow-hidden" style={{ borderColor: "var(--store-border)" }}>
                      <button
                        onClick={() => handleQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-sm font-bold hover:bg-slate-50 transition cursor-pointer"
                      >−</button>
                      <span className="px-3 py-1 text-sm font-black min-w-[2rem] text-center" style={{ color: "var(--store-text)" }}>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-sm font-bold hover:bg-slate-50 transition cursor-pointer"
                      >+</button>
                    </div>
                    <p className="text-sm font-black" style={{ color: "var(--store-text)" }}>{formatPrice(parseFloat(String(item.variant.price)) * item.quantity)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 border" style={{ borderColor: "var(--store-border)" }}>
              <h2 className="text-[14px] font-bold uppercase tracking-wider mb-4" style={{ color: "var(--store-text)" }}>Order Summary</h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: "var(--store-text-muted)" }}>Subtotal ({items.length} items)</span>
                  <span className="font-bold" style={{ color: "var(--store-text)" }}>{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon discount</span>
                    <span className="font-bold">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: "var(--store-text-muted)" }}>Shipping</span>
                  <span className="font-bold text-green-600">Calculated at checkout</span>
                </div>
                <hr className="my-2" style={{ borderColor: "var(--store-border)" }} />
                <div className="flex justify-between text-sm font-black">
                  <span style={{ color: "var(--store-text)" }}>Total</span>
                  <span style={{ color: "var(--store-primary)" }}>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-5 pt-5 border-t" style={{ borderColor: "var(--store-border)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--store-text-muted)" }}>Coupon Code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none bg-white"
                    style={{ borderColor: "var(--store-border)", color: "var(--store-text)" }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-50 hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: "var(--store-primary)" }}
                  >
                    {applyingCoupon ? "..." : "Apply"}
                  </button>
                </div>
                {couponMsg && <p className="mt-1.5 text-xs text-green-600 font-semibold">{couponMsg}</p>}
                {couponError && <p className="mt-1.5 text-xs text-red-500 font-semibold">{couponError}</p>}
              </div>

              <Link
                href="/store/checkout"
                className="mt-5 block w-full rounded-xl py-3 text-center text-xs font-bold uppercase tracking-widest text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "var(--store-primary)" }}
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/store/products"
                className="mt-3 block w-full rounded-xl border py-3 text-center text-xs font-bold uppercase tracking-widest bg-white transition hover:bg-slate-50"
                style={{ borderColor: "var(--store-border)", color: "var(--store-text-muted)" }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
