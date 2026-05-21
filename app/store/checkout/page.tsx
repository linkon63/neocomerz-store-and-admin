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
        <div className="h-8 bg-[#ede8e1] rounded w-1/4 mb-8" />
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="h-40 bg-white rounded-2xl shadow-sm" />
            <div className="h-32 bg-white rounded-2xl shadow-sm" />
          </div>
          <div className="h-64 bg-white rounded-2xl shadow-sm" />
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + parseFloat(String(i.variant.price)) * i.quantity, 0);
  const discount = Math.min(couponDiscount, subtotal);
  const total = Math.max(subtotal - discount, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-[#756b60]">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-bold">Your cart is empty</p>
          <Link href="/store/products" className="mt-4 inline-flex rounded-full bg-[#171412] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#3c332b] transition">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left: Address + Payment */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black">Delivery Address</h2>
                <button
                  onClick={() => setShowAddressForm((o) => !o)}
                  className="text-sm font-bold text-[#171412] underline decoration-[#d7f36b] decoration-2 underline-offset-2"
                >
                  {showAddressForm ? "Cancel" : "+ Add New"}
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleSaveAddress} className="mb-5 rounded-xl border border-[#ede8e1] p-4 space-y-3">
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
                        <label className="block text-xs font-bold text-[#756b60] mb-1">{label}</label>
                        <input
                          type="text"
                          required={key !== "addressLine2"}
                          value={addressForm[key as keyof typeof addressForm]}
                          onChange={(e) => setAddressForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full rounded-xl border border-[#cfc6ba] px-3 py-2 text-sm focus:border-[#171412] focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="rounded-full bg-[#171412] px-5 py-2 text-sm font-black text-white hover:bg-[#3c332b] transition disabled:opacity-50"
                  >
                    {savingAddress ? "Saving..." : "Save Address"}
                  </button>
                </form>
              )}

              {addresses.length === 0 && !showAddressForm ? (
                <p className="text-sm text-[#756b60]">No addresses saved. Add one above.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex gap-3 rounded-xl border p-4 cursor-pointer transition ${selectedAddress === addr.id ? "border-[#171412] bg-[#f7f4ef]" : "border-[#ede8e1] hover:border-[#cfc6ba]"}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-0.5 accent-[#171412]"
                      />
                      <div className="text-sm">
                        <p className="font-black">{addr.fullName}</p>
                        <p className="text-[#756b60]">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                        <p className="text-[#756b60]">{addr.city}, {addr.state} {addr.postalCode}, {addr.country}</p>
                        <p className="text-[#756b60]">{addr.phone}</p>
                        {addr.isDefault && <span className="text-xs font-black text-[#d7f36b] bg-[#171412] px-2 py-0.5 rounded-full mt-1 inline-block">Default</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black mb-4">Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition ${paymentMethod === method ? "border-[#171412] bg-[#f7f4ef]" : "border-[#ede8e1] hover:border-[#cfc6ba]"}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="accent-[#171412]"
                    />
                    <span className="text-sm font-bold capitalize">{method.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div>
            <div className="rounded-2xl bg-white p-6 shadow-sm sticky top-20">
              <h2 className="text-lg font-black mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#51483f] line-clamp-1 flex-1 mr-2">
                      {item.variant.product.name} × {item.quantity}
                    </span>
                    <span className="font-bold shrink-0">
                      {formatPrice(parseFloat(String(item.variant.price)) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <hr className="border-[#ede8e1] mb-4" />
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#756b60]">Subtotal</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon{couponCode ? ` (${couponCode})` : ""}</span>
                    <span className="font-bold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black pt-2 border-t border-[#ede8e1]">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 font-semibold">
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddress}
                className="w-full rounded-full bg-[#171412] py-3 text-sm font-black text-white hover:bg-[#3c332b] transition disabled:opacity-50"
              >
                {placing ? "Placing Order..." : "Place Order"}
              </button>
              <Link
                href="/store/cart"
                className="mt-3 block w-full rounded-full border border-[#cfc6ba] py-3 text-center text-sm font-bold hover:border-[#171412] transition"
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
