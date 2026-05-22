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
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-1/4 mb-8" />
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="h-40 bg-white border rounded-2xl shadow-sm" style={{ borderColor: "var(--store-border)" }} />
            <div className="h-32 bg-white border rounded-2xl shadow-sm" style={{ borderColor: "var(--store-border)" }} />
          </div>
          <div className="h-64 bg-white border rounded-2xl shadow-sm" style={{ borderColor: "var(--store-border)" }} />
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + parseFloat(String(i.variant.price)) * i.quantity, 0);
  const discount = Math.min(couponDiscount, subtotal);
  const total = Math.max(subtotal - discount, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 min-h-[calc(100vh-280px)]">
      <div className="mb-6 border-b pb-5" style={{ borderColor: "var(--store-border)" }}>
        <h1 className="text-[26px] font-black tracking-tight" style={{ color: "var(--store-text)" }}>Checkout</h1>
        <p className="mt-1 text-xs font-semibold" style={{ color: "var(--store-text-muted)" }}>{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border" style={{ borderColor: "var(--store-border)" }}>
          <p className="text-lg font-bold" style={{ color: "var(--store-text)" }}>Your cart is empty</p>
          <Link
            href="/store/products"
            className="mt-4 inline-flex rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--store-primary)" }}
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start">
          {/* Left: Address + Payment */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="rounded-2xl bg-white p-6 border" style={{ borderColor: "var(--store-border)" }}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: "var(--store-border)" }}>
                <h2 className="text-[14px] font-bold uppercase tracking-wider" style={{ color: "var(--store-text)" }}>Delivery Address</h2>
                <button
                  onClick={() => setShowAddressForm((o) => !o)}
                  className="text-xs font-bold underline decoration-2 underline-offset-2 transition cursor-pointer"
                  style={{ color: "var(--store-primary)" }}
                >
                  {showAddressForm ? "Cancel" : "+ Add New"}
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleSaveAddress} className="mb-5 rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--store-border)", backgroundColor: "var(--store-bg)" }}>
                  <div className="grid gap-3 sm:grid-cols-2">
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
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--store-text-muted)" }}>{label}</label>
                        <input
                          type="text"
                          required={key !== "addressLine2"}
                          value={addressForm[key as keyof typeof addressForm]}
                          onChange={(e) => setAddressForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full rounded-xl border bg-white px-3 py-2 text-xs font-semibold focus:outline-none"
                          style={{ borderColor: "var(--store-border)", color: "var(--store-text)" }}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="rounded-xl px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all disabled:opacity-50 hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: "var(--store-primary)" }}
                  >
                    {savingAddress ? "Saving..." : "Save Address"}
                  </button>
                </form>
              )}

              {addresses.length === 0 && !showAddressForm ? (
                <p className="text-xs font-medium" style={{ color: "var(--store-text-muted)" }}>No addresses saved. Add one above.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex gap-3 rounded-xl border p-4 cursor-pointer transition ${
                        selectedAddress === addr.id
                          ? "bg-[var(--store-primary-light)]"
                          : "bg-white hover:bg-slate-50"
                      }`}
                      style={{
                        borderColor: selectedAddress === addr.id ? "var(--store-primary)" : "var(--store-border)"
                      }}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-0.5"
                        style={{ accentColor: "var(--store-primary)" }}
                      />
                      <div className="text-xs">
                        <p className="font-bold" style={{ color: "var(--store-text)" }}>{addr.fullName}</p>
                        <p className="font-medium mt-0.5" style={{ color: "var(--store-text-muted)" }}>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                        <p className="font-medium" style={{ color: "var(--store-text-muted)" }}>{addr.city}, {addr.state} {addr.postalCode}, {addr.country}</p>
                        <p className="font-bold mt-1" style={{ color: "var(--store-primary)" }}>{addr.phone}</p>
                        {addr.isDefault && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded-full mt-2 inline-block" style={{ backgroundColor: "var(--store-accent)" }}>
                            Default
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl bg-white p-6 border" style={{ borderColor: "var(--store-border)" }}>
              <h2 className="text-[14px] font-bold uppercase tracking-wider mb-4 pb-3 border-b" style={{ borderColor: "var(--store-border)", color: "var(--store-text)" }}>Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition ${
                      paymentMethod === method
                        ? "bg-[var(--store-primary-light)]"
                        : "bg-white hover:bg-slate-50"
                    }`}
                    style={{
                      borderColor: paymentMethod === method ? "var(--store-primary)" : "var(--store-border)"
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      style={{ accentColor: "var(--store-primary)" }}
                    />
                    <span className="text-xs font-bold capitalize" style={{ color: "var(--store-text)" }}>{method.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div>
            <div className="rounded-2xl bg-white p-6 border sticky top-20" style={{ borderColor: "var(--store-border)" }}>
              <h2 className="text-[14px] font-bold uppercase tracking-wider mb-4 pb-3 border-b" style={{ borderColor: "var(--store-border)", color: "var(--store-text)" }}>Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="line-clamp-1 flex-1 mr-2 font-medium" style={{ color: "var(--store-text-muted)" }}>
                      {item.variant.product.name} × {item.quantity}
                    </span>
                    <span className="font-bold shrink-0" style={{ color: "var(--store-text)" }}>
                      {formatPrice(parseFloat(String(item.variant.price)) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <hr className="mb-4" style={{ borderColor: "var(--store-border)" }} />
              <div className="space-y-2 mb-6 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: "var(--store-text-muted)" }}>Subtotal</span>
                  <span className="font-bold" style={{ color: "var(--store-text)" }}>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon{couponCode ? ` (${couponCode})` : ""}</span>
                    <span className="font-bold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black pt-3 border-t" style={{ borderColor: "var(--store-border)" }}>
                  <span style={{ color: "var(--store-text)" }}>Total</span>
                  <span style={{ color: "var(--store-primary)" }}>{formatPrice(total)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600 font-semibold border border-red-200">
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddress}
                className="w-full rounded-xl py-3 text-xs font-bold uppercase tracking-widest text-white transition-all disabled:opacity-50 hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: "var(--store-primary)" }}
              >
                {placing ? "Placing Order..." : "Place Order"}
              </button>
              <Link
                href="/store/cart"
                className="mt-3 block w-full rounded-xl border py-3 text-center text-xs font-bold uppercase tracking-widest bg-white transition hover:bg-slate-50"
                style={{ borderColor: "var(--store-border)", color: "var(--store-text-muted)" }}
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
