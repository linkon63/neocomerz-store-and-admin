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
      <div className="mx-auto max-w-[1800px] w-full px-6 py-12 sm:px-12 lg:px-16">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-none bg-white p-5 border border-stroke shadow-none flex gap-4">
              <div className="w-20 h-20 rounded-none bg-stone-100 border border-stroke" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-stone-100 rounded-none w-1/2" />
                <div className="h-3 bg-stone-100 rounded-none w-1/4" />
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
    <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16 font-sans">
      <div className="mb-8 flex items-center justify-between border-b border-stroke pb-6">
        <h1 className="text-2xl font-bold tracking-wider font-serif uppercase">Your Cart</h1>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs font-semibold tracking-wider uppercase text-red-650 hover:underline cursor-pointer"
          >
            [ Clear all ]
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-none bg-white border border-stroke p-16 text-center shadow-none">
          <p className="text-4xl mb-4">🛒</p>
          <p className="text-sm font-bold uppercase tracking-wider text-stone-700">Your cart is empty</p>
          <p className="mt-2 text-xs text-stone-400 font-medium">Add products to get started.</p>
          <Link
            href="/store/products"
            className="mt-6 inline-flex rounded-none btn-premium px-6 py-3 text-xs font-bold tracking-widest uppercase text-white hover:opacity-95 transition"
          >
            Browse Products
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
                : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80";

              return (
                <div key={item.id} className={`rounded-none bg-white p-4 border border-stroke flex flex-col sm:flex-row gap-4 transition-all duration-200 shadow-none ${updating === item.id ? "opacity-50" : ""}`}>
                  {/* Product Image & Details Row */}
                  <div className="flex gap-4 flex-1">
                    <Link href={`/store/products/${product.slug}`} className="shrink-0">
                      <img
                        src={resolvedImg}
                        alt={product.name}
                        className="w-20 h-20 rounded-none object-cover bg-stone-50 border border-stroke"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/store/products/${product.slug}`} className="font-bold text-xs text-foreground hover:text-primary transition hover:underline line-clamp-2">
                        {product.name}
                      </Link>
                      <p className="text-[10px] text-stone-400 mt-1 font-semibold uppercase tracking-wider">SKU: {item.variant.sku}</p>
                      <p className="text-xs font-bold text-stone-700 mt-1.5">{formatPrice(item.variant.price)}</p>
                    </div>
                  </div>

                  {/* Actions Column/Row */}
                  <div className="flex sm:flex-col justify-between sm:items-end items-center gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-stroke">
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-stone-400 hover:text-red-500 transition-colors cursor-pointer p-1 rounded-none hover:bg-stone-50 order-2 sm:order-none"
                      aria-label="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Quantity Selector & Total Price */}
                    <div className="flex items-center gap-4 w-full justify-between sm:justify-end order-1 sm:order-none">
                      <div className="flex items-center rounded-none border border-stroke overflow-hidden bg-white">
                        <button
                          onClick={() => handleQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-sm font-bold hover:bg-stone-50 transition cursor-pointer text-stone-500"
                        >−</button>
                        <span className="px-3 py-1 text-xs font-bold min-w-[2rem] text-center text-foreground">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-sm font-bold hover:bg-stone-50 transition cursor-pointer text-stone-500"
                        >+</button>
                      </div>
                      <p className="text-xs font-bold text-foreground">{formatPrice(parseFloat(String(item.variant.price)) * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="rounded-none bg-[#fdfcfb] p-6 border border-stroke shadow-none">
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">[ Order Summary ]</h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-450 font-medium">Subtotal ({items.length} items)</span>
                  <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span className="font-medium">Coupon discount</span>
                    <span className="font-bold">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-450 font-medium">Shipping</span>
                  <span className="font-bold text-emerald-700">Calculated at checkout</span>
                </div>
                <hr className="border-stroke my-2" />
                <div className="flex justify-between text-sm font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-6">
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2.5">Coupon Code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 rounded-none border border-stroke px-3.5 py-2 text-xs focus:border-primary focus:outline-none bg-white text-foreground placeholder-stone-400"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="rounded-none px-4 py-2 text-xs font-bold btn-premium text-white disabled:opacity-50 cursor-pointer"
                  >
                    {applyingCoupon ? "..." : "Apply"}
                  </button>
                </div>
                {couponMsg && <p className="mt-2 text-[10px] text-green-600 font-semibold">{couponMsg}</p>}
                {couponError && <p className="mt-2 text-[10px] text-red-655 font-semibold">{couponError}</p>}
              </div>

              <Link
                href="/store/checkout"
                className="mt-6 block w-full rounded-none bg-primary py-3 text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-primary-hover shadow-none transition duration-200 cursor-pointer"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/store/products"
                className="mt-3 block w-full rounded-none border border-stroke py-3 text-center text-xs font-bold uppercase tracking-widest text-stone-600 hover:border-primary hover:text-primary transition bg-white cursor-pointer"
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
