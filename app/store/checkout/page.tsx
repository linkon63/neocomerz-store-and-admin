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
    city: "", state: "", postalCode: "", country: "US",
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
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      setError("Please select a delivery address");
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
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1800px] w-full px-6 py-12 sm:px-12 lg:px-16 animate-pulse">
        <div className="h-6 bg-stone-200 rounded-none w-1/4 mb-8" />
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="h-40 bg-white border border-stroke rounded-none shadow-none" />
            <div className="h-32 bg-white border border-stroke rounded-none shadow-none" />
          </div>
          <div className="h-64 bg-white border border-stroke rounded-none shadow-none" />
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + parseFloat(String(i.variant.price)) * i.quantity, 0);
  const discount = Math.min(couponDiscount, subtotal);
  const total = Math.max(subtotal - discount, 0);

  return (
    <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16 font-sans">
      <div className="mb-8 border-b border-stroke pb-6">
        <h1 className="text-2xl font-bold tracking-wider font-serif uppercase">Checkout</h1>
        <p className="mt-1 text-xs text-stone-500 font-medium tracking-wider">[ {items.length} item{items.length !== 1 ? "s" : ""} in your cart ]</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-none bg-white p-12 text-center shadow-none border border-stroke">
          <p className="text-sm font-bold uppercase tracking-wider text-stone-700">Your cart is empty</p>
          <Link href="/store/products" className="mt-6 inline-flex rounded-none btn-premium px-6 py-3 text-xs font-bold tracking-widest uppercase text-white hover:opacity-95 transition">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left: Address + Payment */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="rounded-none bg-white p-6 shadow-none border border-stroke">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-stroke">
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">[ Delivery Address ]</h2>
                <button
                  onClick={() => setShowAddressForm((o) => !o)}
                  className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline cursor-pointer"
                >
                  {showAddressForm ? "Cancel" : "+ Add New"}
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleSaveAddress} className="mb-5 rounded-none border border-stroke p-5 bg-stone-50/50 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { key: "fullName", label: "Full Name", placeholder: "John Doe" },
                      { key: "phone", label: "Phone", placeholder: "+1 555 0000" },
                      { key: "addressLine1", label: "Address Line 1", placeholder: "123 Main St" },
                      { key: "addressLine2", label: "Address Line 2 (optional)", placeholder: "Apt 4B" },
                      { key: "city", label: "City", placeholder: "New York" },
                      { key: "state", label: "State", placeholder: "NY" },
                      { key: "postalCode", label: "Postal Code", placeholder: "10001" },
                      { key: "country", label: "Country", placeholder: "US" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-550 mb-1.5">{label}</label>
                        <input
                          type="text"
                          required={key !== "addressLine2"}
                          value={addressForm[key as keyof typeof addressForm]}
                          onChange={(e) => setAddressForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full rounded-none border border-stroke px-3.5 py-2 text-xs focus:border-primary focus:outline-none bg-white text-foreground placeholder-stone-400 font-semibold"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="rounded-none btn-premium text-xs tracking-wider uppercase px-5 py-2.5 disabled:opacity-50 cursor-pointer"
                  >
                    {savingAddress ? "Saving..." : "Save Address"}
                  </button>
                </form>
              )}

              {addresses.length === 0 && !showAddressForm ? (
                <p className="text-xs text-stone-400 font-semibold">No addresses saved. Add one above.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex gap-3 rounded-none border p-4 cursor-pointer transition duration-150 ${selectedAddress === addr.id ? "border-primary bg-stone-50 shadow-none" : "border-stroke hover:border-foreground bg-white"}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-0.5 accent-primary"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-foreground">{addr.fullName}</p>
                        <p className="text-stone-500 font-medium mt-0.5">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                        <p className="text-stone-500 font-medium">{addr.city}, {addr.state} {addr.postalCode}, {addr.country}</p>
                        <p className="text-stone-500 font-semibold mt-1">{addr.phone}</p>
                        {addr.isDefault && <span className="text-[9px] font-bold text-primary bg-primary-light px-2 py-0.5 border border-primary/20 mt-2 inline-block">Default Address</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="rounded-none bg-white p-6 shadow-none border border-stroke">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4 pb-2 border-b border-stroke">[ Payment Method ]</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-3 rounded-none border p-4 cursor-pointer transition duration-150 ${paymentMethod === method ? "border-primary bg-stone-50 shadow-none" : "border-stroke hover:border-foreground bg-white"}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="accent-primary"
                    />
                    <span className="text-xs font-semibold text-stone-700 capitalize">{method.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div>
            <div className="rounded-none bg-[#fdfcfb] p-6 border border-stroke shadow-none sticky top-24">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4 pb-2 border-b border-stroke">[ Order Summary ]</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-stone-700 font-medium line-clamp-1 flex-1 mr-2">
                      {item.variant.product.name} × {item.quantity}
                    </span>
                    <span className="font-bold text-foreground shrink-0">
                      {formatPrice(parseFloat(String(item.variant.price)) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <hr className="border-stroke mb-4" />
              <div className="space-y-2.5 mb-6 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-450 font-medium">Subtotal</span>
                  <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span className="font-medium">Coupon{couponCode ? ` (${couponCode})` : ""}</span>
                    <span className="font-bold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-bold pt-3 border-t border-stroke">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-none bg-red-50 px-4 py-3 text-xs text-red-655 font-bold border border-red-200">
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddress}
                className="w-full rounded-none bg-primary py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-primary-hover shadow-none transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? "Placing Order..." : "Place Order"}
              </button>
              <Link
                href="/store/cart"
                className="mt-3 block w-full rounded-none border border-stroke py-3 text-center text-xs font-bold uppercase tracking-widest text-stone-600 hover:border-primary hover:text-primary transition bg-white cursor-pointer"
              >
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
