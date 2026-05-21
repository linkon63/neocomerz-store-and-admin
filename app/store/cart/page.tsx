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
            <div key={i} className="rounded-2xl bg-white p-5 shadow-sm flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-[#ede8e1]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#ede8e1] rounded w-1/2" />
                <div className="h-3 bg-[#ede8e1] rounded w-1/4" />
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight">Cart</h1>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-sm font-bold text-red-500 hover:text-red-700 transition"
          >
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-xl font-black">Your cart is empty</p>
          <p className="mt-2 text-sm text-[#756b60]">Add some products to get started.</p>
          <Link
            href="/store/products"
            className="mt-6 inline-flex rounded-full bg-[#171412] px-6 py-3 text-sm font-black text-white hover:bg-[#3c332b] transition"
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
                <div key={item.id} className={`rounded-2xl bg-white p-4 shadow-sm flex gap-4 transition ${updating === item.id ? "opacity-50" : ""}`}>
                  <Link href={`/store/products/${product.slug}`} className="shrink-0">
                    <img
                      src={resolvedImg}
                      alt={product.name}
                      className="w-20 h-20 rounded-xl object-cover bg-[#f0ece6]"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/store/products/${product.slug}`} className="font-black text-sm hover:underline line-clamp-2">
                      {product.name}
                    </Link>
                    <p className="text-xs text-[#756b60] mt-0.5">SKU: {item.variant.sku}</p>
                    <p className="text-sm font-black mt-1">{formatPrice(item.variant.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-[#9a9088] hover:text-red-500 transition"
                      aria-label="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="flex items-center rounded-xl border border-[#cfc6ba] overflow-hidden">
                      <button
                        onClick={() => handleQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1.5 text-sm font-bold hover:bg-[#f0ece6] transition"
                      >−</button>
                      <span className="px-3 py-1.5 text-sm font-black min-w-[2rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1.5 text-sm font-bold hover:bg-[#f0ece6] transition"
                      >+</button>
                    </div>
                    <p className="text-sm font-black">{formatPrice(parseFloat(String(item.variant.price)) * item.quantity)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#756b60]">Subtotal ({items.length} items)</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon discount</span>
                    <span className="font-bold">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#756b60]">Shipping</span>
                  <span className="font-bold text-green-600">Calculated at checkout</span>
                </div>
                <hr className="border-[#ede8e1] my-2" />
                <div className="flex justify-between text-base font-black">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-wider text-[#756b60] mb-2">Coupon Code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 rounded-xl border border-[#cfc6ba] px-3 py-2 text-sm focus:border-[#171412] focus:outline-none"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="rounded-xl bg-[#171412] px-3 py-2 text-sm font-bold text-white hover:bg-[#3c332b] transition disabled:opacity-50"
                  >
                    {applyingCoupon ? "..." : "Apply"}
                  </button>
                </div>
                {couponMsg && <p className="mt-1.5 text-xs text-green-600 font-semibold">{couponMsg}</p>}
                {couponError && <p className="mt-1.5 text-xs text-red-500 font-semibold">{couponError}</p>}
              </div>

              <Link
                href="/store/checkout"
                className="mt-5 block w-full rounded-full bg-[#171412] py-3 text-center text-sm font-black text-white hover:bg-[#3c332b] transition"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/store/products"
                className="mt-3 block w-full rounded-full border border-[#cfc6ba] py-3 text-center text-sm font-bold hover:border-[#171412] transition"
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
