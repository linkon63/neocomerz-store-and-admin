"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  cartApi,
  addressApi,
  ordersApi,
  type Cart,
  type Address,
  formatPrice,
  getStoreToken,
  STORE_CHECKOUT_COUPON_KEY,
} from "@/lib/store-api";

const PAYMENT_METHODS = ["cash_on_delivery", "bank_transfer", "card"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // New address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "", phone: "", addressLine1: "", addressLine2: "",
    city: "", state: "", postalCode: "", country: "BD",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const isLoggedIn = typeof window !== "undefined" && !!getStoreToken();

  useEffect(() => {
    if (!isLoggedIn) { router.push("/store/login"); return; }
    Promise.all([cartApi.get(), addressApi.list()])
      .then(([c, a]) => {
        setCart(c);
        setAddresses(a);
        const def = a.find((addr) => addr.isDefault);
        try {
          const raw = localStorage.getItem(STORE_CHECKOUT_COUPON_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as { code?: string; discount?: number };
            setCouponCode(parsed.code?.trim() || null);
            setCouponDiscount(Number(parsed.discount ?? 0));
          }
        } catch {
          setCouponCode(null);
          setCouponDiscount(0);
        }
        if (def) setSelectedAddress(def.id);
        else if (a.length > 0) setSelectedAddress(a[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const newAddr = await addressApi.create(addressForm);
      setAddresses((prev) => [...prev, newAddr]);
      setSelectedAddress(newAddr.id);
      setShowAddressForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ঠিকানা সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      setError("অনুগ্রহ করে একটি ডেলিভারি ঠিকানা সিলেক্ট করুন");
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      const order = await ordersApi.create({
        addressId: selectedAddress,
        paymentMethod,
        couponCode: couponCode ?? undefined,
      });
      localStorage.setItem("store_cart_count", "0");
      localStorage.removeItem(STORE_CHECKOUT_COUPON_KEY);
      window.dispatchEvent(new Event("cart-updated"));
      router.push(`/store/orders/${order.id}?success=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "অর্ডার প্লেস করতে ব্যর্থ হয়েছে");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full px-6 py-12 sm:px-12 lg:px-16 animate-pulse">
        <div className="h-6 bg-stone-200 w-1/4 mb-8" />
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="h-40 bg-white border border-stone-200 shadow-xs" />
            <div className="h-32 bg-white border border-stone-200 shadow-xs" />
          </div>
          <div className="h-64 bg-white border border-stone-200 shadow-xs" />
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + parseFloat(String(i.variant.price)) * i.quantity, 0);
  const discount = Math.min(couponDiscount, subtotal);
  const total = Math.max(subtotal - discount, 0);

  return (
    <div className="w-full px-6 py-10 sm:px-12 lg:px-16 font-sans">
      
      {/* Premium Progress Indicator */}
      <div className="max-w-md mx-auto mb-10">
        <div className="flex items-center justify-between text-xs font-bold text-stone-400">
          <div className="flex flex-col items-center gap-1.5 text-[#15803d]">
            <span className="w-7 h-7 bg-[#15803d] text-white flex items-center justify-center font-black">১</span>
            <span>শপিং কার্ট</span>
          </div>
          <div className="flex-1 h-[2px] bg-[#15803d]" />
          <div className="flex flex-col items-center gap-1.5 text-[#15803d]">
            <span className="w-7 h-7 bg-[#15803d] text-white flex items-center justify-center font-black">২</span>
            <span>অর্ডার করুন</span>
          </div>
          <div className="flex-1 h-[2px] bg-stone-250" />
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-7 h-7 bg-stone-200 text-stone-500 flex items-center justify-center font-black">৩</span>
            <span>ধন্যবাদ!</span>
          </div>
        </div>
      </div>

      <div className="mb-8 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-black text-stone-900 font-display">অর্ডার সম্পন্ন করুন (Checkout)</h1>
        <p className="mt-1 text-xs text-stone-500 font-bold tracking-wide">কার্টে {items.length} টি আমের আইটেম রয়েছে</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-12 text-center shadow-xs border border-stone-200">
          <p className="text-sm font-extrabold uppercase tracking-wider text-stone-775 font-display">আপনার শপিং কার্ট খালি</p>
          <Link href="/store/products" className="mt-6 inline-flex bg-[#15803d] px-6 py-3.5 text-xs font-bold tracking-widest uppercase text-white hover:opacity-95 transition">
            আম কালেকশন দেখুন
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left: Address + Payment */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white p-6 shadow-xs border border-stone-200">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200">
                <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 border-l-2 border-[#15803d] pl-2">ডেলিভারি ঠিকানা</h2>
                <button
                  onClick={() => setShowAddressForm((o) => !o)}
                  className="text-xs font-bold uppercase tracking-wider text-[#15803d] hover:underline cursor-pointer"
                >
                  {showAddressForm ? "বাতিল করুন" : "+ নতুন ঠিকানা যুক্ত করুন"}
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleSaveAddress} className="mb-5 border border-stone-200 p-5 bg-stone-50 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { key: "fullName", label: "পুরো নাম", placeholder: "যেমন: আব্দুল্লাহ" },
                      { key: "phone", label: "মোবাইল নম্বর", placeholder: "যেমন: 017xxxxxxxx" },
                      { key: "addressLine1", label: "ঠিকানা (লাইন ১)", placeholder: "গ্রাম, পোস্ট অফিস" },
                      { key: "addressLine2", label: "ঠিকানা লাইন ২ (ঐচ্ছিক)", placeholder: "থানা, উপ-জেলা" },
                      { key: "city", label: "শহর / জেলা", placeholder: "যেমন: নওগাঁ" },
                      { key: "state", label: "বিভাগ (State)", placeholder: "যেমন: রাজশাহী" },
                      { key: "postalCode", label: "পোস্টাল কোড", placeholder: "যেমন: ৬৫০০" },
                      { key: "country", label: "দেশ", placeholder: "BD" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="block text-[9px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5 font-display">{label}</label>
                        <input
                          type="text"
                          required={key !== "addressLine2"}
                          value={addressForm[key as keyof typeof addressForm]}
                          onChange={(e) => setAddressForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full border border-stone-200 px-3.5 py-2 text-xs focus:border-[#15803d] focus:outline-none focus:ring-1 focus:ring-[#15803d] bg-white text-stone-900 placeholder-stone-400 font-bold"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs tracking-wider uppercase px-5 py-2.5 disabled:opacity-50 cursor-pointer shadow-xs transition"
                  >
                    {savingAddress ? "সংরক্ষণ হচ্ছে..." : "ঠিকানা সংরক্ষণ করুন"}
                  </button>
                </form>
              )}

              {addresses.length === 0 && !showAddressForm ? (
                <p className="text-xs text-stone-400 font-semibold">কোনো সংরক্ষিত ঠিকানা পাওয়া যায়নি। উপরে একটি নতুন ঠিকানা যুক্ত করুন।</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex gap-3 border p-4 cursor-pointer transition duration-150 ${selectedAddress === addr.id ? "border-[#15803d] bg-stone-50 shadow-xs" : "border-stone-200 hover:border-stone-400 bg-white"}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-0.5 accent-[#15803d]"
                      />
                      <div className="text-xs">
                        <p className="font-extrabold text-stone-900">{addr.fullName}</p>
                        <p className="text-stone-550 font-semibold mt-0.5">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                        <p className="text-stone-555 font-semibold">{addr.city}, {addr.state} {addr.postalCode}, {addr.country}</p>
                        <p className="text-stone-555 font-bold mt-1">{addr.phone}</p>
                        {addr.isDefault && <span className="text-[9px] font-bold text-[#15803d] bg-emerald-50 px-2 py-0.5 border border-[#15803d]/25 mt-2 inline-block">ডিফল্ট ঠিকানা</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 shadow-xs border border-stone-200">
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 border-l-2 border-[#15803d] pl-2 mb-4">পেমেন্ট পদ্ধতি</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => {
                  let label = method.replace(/_/g, " ");
                  if (method === "cash_on_delivery") label = "ক্যাশ অন ডেলিভারি (আম বুঝে পেয়ে মূল্য দিন)";
                  if (method === "bank_transfer") label = "মোবাইল ব্যাংকিং / বিকাশ / নগদ / রকেট";
                  if (method === "card") label = "ডেবিট / ক্রেডিট কার্ড";

                  return (
                    <label
                      key={method}
                      className={`flex items-center gap-3 border p-4 cursor-pointer transition duration-150 ${paymentMethod === method ? "border-[#15803d] bg-stone-50 shadow-xs" : "border-stone-200 hover:border-stone-400 bg-white"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="accent-[#15803d]"
                      />
                      <span className="text-xs font-bold text-stone-700 capitalize">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div>
            <div className="bg-stone-50 p-6 border border-stone-200 shadow-xs sticky top-24">
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 border-l-2 border-[#15803d] pl-2 mb-4">অর্ডারের বিবরণ</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-stone-700 font-bold line-clamp-1 flex-1 mr-2">
                      {item.variant.product.name} × {item.quantity}
                    </span>
                    <span className="font-extrabold text-stone-900 shrink-0">
                      {formatPrice(parseFloat(String(item.variant.price)) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <hr className="border-stone-200 mb-4" />
              <div className="space-y-2.5 mb-6 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-505 font-bold">মোট আমের মূল্য</span>
                  <span className="font-extrabold text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#15803d]">
                    <span className="font-bold font-display">কুপন ছাড়{couponCode ? ` (${couponCode})` : ""}</span>
                    <span className="font-black">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-bold pt-3 border-t border-stone-200">
                  <span className="text-stone-900 font-display">সর্বমোট মূল্য</span>
                  <span className="text-[#15803d] font-black">{formatPrice(total)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 px-4 py-3 text-xs text-rose-650 font-bold border border-red-200">
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddress}
                className="w-full bg-[#15803d] hover:bg-[#166534] py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-display"
              >
                {placing ? "অর্ডার সাবমিট হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
              </button>
              <Link
                href="/store/cart"
                className="mt-3 block w-full border border-stone-200 py-3.5 text-center text-xs font-black uppercase tracking-widest text-stone-600 hover:border-[#15803d] hover:text-[#15803d] transition bg-white cursor-pointer font-display"
              >
                ← কার্টে ফিরে যান
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
