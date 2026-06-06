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
      <div className="w-full px-6 py-12 sm:px-12 lg:px-16">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 border border-stone-200/50 shadow-xs flex gap-4">
              <div className="w-20 h-20 bg-stone-100 border border-stone-200/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-stone-100 w-1/2" />
                <div className="h-3 bg-stone-100 w-1/4" />
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
    <div className="w-full px-6 py-10 sm:px-12 lg:px-16 font-sans">
      <div className="mb-8 flex items-center justify-between border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-black text-stone-900 font-display">আপনার শপিং কার্ট</h1>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs font-bold tracking-wider uppercase text-rose-600 hover:underline cursor-pointer"
          >
            কার্ট খালি করুন
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-stone-200 p-16 text-center shadow-xs">
          <p className="text-4xl mb-4">🛒</p>
          <p className="text-sm font-extrabold uppercase tracking-wider text-stone-750 font-display">আপনার শপিং কার্ট খালি</p>
          <p className="mt-2 text-xs text-stone-400 font-medium">আম কিনতে আমাদের কালেকশন ব্রাউজ করুন।</p>
          <Link
            href="/store/products"
            className="mt-6 inline-flex bg-[#15803d] hover:bg-[#166534] px-6 py-3.5 text-xs font-bold tracking-widest uppercase text-white shadow-xs transition"
          >
            আম কালেকশন দেখুন
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start">
          <div className="space-y-4">
            {items.map((item) => {
              const product = item.variant.product;
              const imgUrl = item.variant.product.media?.[0]?.media.url;
              const resolvedImg = imgUrl
                ? imgUrl
                : "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=200&q=80";

              return (
                <div key={item.id} className={`bg-white p-4 border border-stone-200 flex flex-col sm:flex-row gap-4 transition-all duration-200 shadow-xs ${updating === item.id ? "opacity-50" : ""}`}>
                  {/* Product Image & Details Row */}
                  <div className="flex gap-4 flex-1">
                    <Link href={`/store/products/${product.slug}`} className="shrink-0">
                      <img
                        src={resolvedImg}
                        alt={product.name}
                        className="w-20 h-20 object-cover bg-stone-50 border border-stone-200"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/store/products/${product.slug}`} className="font-bold text-xs text-stone-900 hover:text-[#15803d] transition hover:underline line-clamp-2">
                        {product.name}
                      </Link>
                      <p className="text-[10px] text-stone-450 mt-1 font-bold uppercase tracking-wider">জাত/ওজন: {item.variant.sku}</p>
                      <p className="text-xs font-extrabold text-stone-700 mt-1.5">{formatPrice(item.variant.price)}</p>
                    </div>
                  </div>

                  {/* Actions Column/Row */}
                  <div className="flex sm:flex-col justify-between sm:items-end items-center gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-stone-200">
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer p-1.5 hover:bg-stone-50 order-2 sm:order-none"
                      aria-label="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Quantity Selector & Total Price */}
                    <div className="flex items-center gap-4 w-full justify-between sm:justify-end order-1 sm:order-none">
                      <div className="flex items-center border border-stone-200 overflow-hidden bg-white h-9">
                        <button
                          onClick={() => handleQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-sm font-bold hover:bg-stone-50 transition cursor-pointer text-stone-500"
                        >−</button>
                        <span className="px-3 py-1 text-xs font-extrabold min-w-[2rem] text-center text-stone-900">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-sm font-bold hover:bg-stone-50 transition cursor-pointer text-stone-500"
                        >+</button>
                      </div>
                      <p className="text-xs font-extrabold text-stone-950">{formatPrice(parseFloat(String(item.variant.price)) * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-stone-50 p-6 border border-stone-200 shadow-xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 border-l-2 border-[#15803d] pl-2 mb-4">অর্ডারের বিবরণ</h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-505 font-bold">মোট মূল্য ({items.length} টি আইটেম)</span>
                  <span className="font-extrabold text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#15803d]">
                    <span className="font-bold">কুপন ছাড় (Coupon discount)</span>
                    <span className="font-black">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-505 font-bold">ডেলিভারি চার্জ (Shipping)</span>
                  <span className="font-extrabold text-[#15803d]">চেকআউটে হিসাব করা হবে</span>
                </div>
                <hr className="border-stone-200 my-2" />
                <div className="flex justify-between text-sm font-black text-stone-900">
                  <span>সর্বমোট</span>
                  <span className="text-[#15803d]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-6">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 mb-2.5 font-display">ডিসকাউন্ট কুপন</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="কুপন কোড লিখুন"
                    className="flex-1 border border-stone-200 px-3.5 py-2 text-xs focus:border-[#15803d] focus:outline-none focus:ring-1 focus:ring-[#15803d] bg-white text-stone-900 placeholder-stone-400 font-medium"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="px-4 py-2.5 text-xs font-bold bg-[#15803d] hover:bg-[#166534] text-white disabled:opacity-50 cursor-pointer"
                  >
                    {applyingCoupon ? "..." : "প্রয়োগ"}
                  </button>
                </div>
                {couponMsg && <p className="mt-2 text-[10px] text-[#15803d] font-bold">{couponMsg}</p>}
                {couponError && <p className="mt-2 text-[10px] text-rose-650 font-bold">{couponError}</p>}
              </div>

              <Link
                href="/store/checkout"
                className="mt-6 block w-full bg-[#15803d] hover:bg-[#166534] py-3.5 text-center text-xs font-black uppercase tracking-widest text-white shadow-xs transition duration-200 cursor-pointer font-display"
              >
                অর্ডার সম্পূর্ণ করতে এগিয়ে যান
              </Link>
              <Link
                href="/store/products"
                className="mt-3 block w-full border border-stone-200 py-3.5 text-center text-xs font-black uppercase tracking-widest text-stone-600 hover:border-[#15803d] hover:text-[#15803d] transition bg-white cursor-pointer font-display"
              >
                কেনাকাটা চালিয়ে যান
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
