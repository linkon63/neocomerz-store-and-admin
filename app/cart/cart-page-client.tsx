"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FiCheckCircle,
  FiChevronLeft,
  FiMinus,
  FiPlus,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../_components/auth-context";
import { useCart } from "../_components/cart-context";
import {
  type Address,
  type Order,
  type OrderItem,
  type ProductMedia,
  type ProductVariant,
  resolveImageUrl,
} from "../shop/products";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api/v1";

function formatPrice(price: number) {
  return `€${price.toFixed(2)}`;
}

// ─── Address form state type ────────────────────────────────────────────────
type AddressFields = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const EMPTY_ADDRESS: AddressFields = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CartPageClient() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { user, token } = useAuth();

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address" | "success">("cart");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Saved addresses (authenticated users only)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Address form fields
  const [addressFields, setAddressFields] = useState<AddressFields>(EMPTY_ADDRESS);

  // Guest email (for guest order confirmation)
  const [guestEmail, setGuestEmail] = useState("");

  const [checkoutError, setCheckoutError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Coupon code state
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    total: number;
    couponType: string;
    couponValue: number;
  } | null>(null);

  // ── Apply coupon ─────────────────────────────────────────────────────────────
  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    setIsApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch(`${BASE_URL}/coupons/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as { message?: string }).message || "Invalid coupon.");
      }
      setAppliedCoupon({
        code,
        discount: data.discount,
        total: data.total,
        couponType: data.coupon.type,
        couponValue: Number(data.coupon.value),
      });
      setCouponInput("");
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Failed to apply coupon.");
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponError("");
  }

  const orderTotal = appliedCoupon ? appliedCoupon.total : subtotal;

  // Prevent double submission
  const isSubmittingRef = useRef(false);

  // ── Load saved addresses when authenticated user reaches address step ──────
  useEffect(() => {
    if (!token || checkoutStep !== "address") return;

    async function loadAddresses() {
      try {
        const res = await fetch(`${BASE_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data: Address[] = await res.json();
        setSavedAddresses(data);
        if (data.length > 0) {
          const defaultAddr = data.find((a) => a.isDefault) ?? data[0];
          setSelectedAddressId(defaultAddr.id);
          setShowNewAddressForm(false);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error("Failed to load addresses:", err);
      }
    }

    loadAddresses();
  }, [token, checkoutStep]);

  // ── Step transitions ────────────────────────────────────────────────────────
  function handleProceedToCheckout() {
    setCheckoutError("");
    setCheckoutStep("address");
  }

  function handleBackToCart() {
    setCheckoutStep("cart");
    setCheckoutError("");
  }

  // ── Place order (authenticated) ─────────────────────────────────────────────
  async function placeAuthenticatedOrder() {
    if (!token) return;

    let addressId = selectedAddressId;

    if (showNewAddressForm) {
      const { fullName, phone, addressLine1, city, state, postalCode, country } = addressFields;
      if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
        throw new Error("Please fill in all required shipping fields.");
      }

      const res = await fetch(`${BASE_URL}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...addressFields,
          addressLine2: addressFields.addressLine2 || undefined,
          isDefault: savedAddresses.length === 0,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          (errData as { message?: string }).message || "Failed to save shipping address.",
        );
      }

      const newAddress: Address = await res.json();
      addressId = newAddress.id;
    }

    if (!addressId) {
      throw new Error("Please select or add a shipping address.");
    }

    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        addressId,
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        (errData as { message?: string }).message ||
          "Failed to place order. Check product stock.",
      );
    }

    return res.json() as Promise<Order>;
  }

  // ── Place order (guest) ─────────────────────────────────────────────────────
  async function placeGuestOrder() {
    const { fullName, phone, addressLine1, city, state, postalCode, country } = addressFields;
    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
      throw new Error("Please fill in all required shipping fields.");
    }
    if (!guestEmail) {
      throw new Error("Please enter your email address for order confirmation.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      throw new Error("Please enter a valid email address.");
    }

    // Build line items from the local cart
    const lineItems = items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const res = await fetch(`${BASE_URL}/orders/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: guestEmail,
        address: {
          ...addressFields,
          addressLine2: addressFields.addressLine2 || undefined,
        },
        items: lineItems,
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        (errData as { message?: string }).message ||
          "Failed to place order. Please check stock availability.",
      );
    }

    return res.json() as Promise<Order>;
  }

  // ── Unified submit handler ──────────────────────────────────────────────────
  async function handlePlaceOrder() {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setCheckoutError("");
    setIsProcessing(true);

    try {
      const order = token ? await placeAuthenticatedOrder() : await placeGuestOrder();
      if (order) {
        setPlacedOrder(order);
        await clearCart();
        setCheckoutStep("success");
      }
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "An unexpected error occurred during checkout.",
      );
    } finally {
      setIsProcessing(false);
      isSubmittingRef.current = false;
    }
  }

  function updateAddressField(field: keyof AddressFields, value: string) {
    setAddressFields((prev) => ({ ...prev, [field]: value }));
  }

  // ─── Success screen ─────────────────────────────────────────────────────────
  if (checkoutStep === "success" && placedOrder) {
    const orderDate = placedOrder.placedAt
      ? new Date(placedOrder.placedAt).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

    const confirmationEmail = placedOrder.user?.email ?? user?.email ?? guestEmail;

    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-16 text-[#151515] sm:px-8">
        <section className="w-full max-w-xl border border-neutral-200 bg-white p-6 shadow-lg sm:p-10">
          <div className="text-center">
            <FiCheckCircle className="mx-auto text-5xl text-green-500" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-green-600">
              Order Confirmed
            </p>
            <h1 className="mt-2 text-3xl font-bold">Thank you for your purchase!</h1>
            {confirmationEmail && (
              <p className="mt-2 text-xs text-neutral-500">
                A confirmation has been sent to{" "}
                <span className="font-bold">{confirmationEmail}</span>.
              </p>
            )}
          </div>

          {/* Order meta */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-neutral-200 py-6 text-xs font-semibold">
            <div>
              <p className="uppercase tracking-[0.06em] text-neutral-400">Order Number</p>
              <p className="mt-1 text-sm font-black text-neutral-800">{placedOrder.orderNumber}</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.06em] text-neutral-400">Placed At</p>
              <p className="mt-1 font-bold text-neutral-800">{orderDate}</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.06em] text-neutral-400">Payment Status</p>
              <p className="mt-1 font-bold capitalize text-neutral-800">
                {placedOrder.paymentStatus || "Unpaid"}
              </p>
            </div>
            <div>
              <p className="uppercase tracking-[0.06em] text-neutral-400">Shipping Status</p>
              <p className="mt-1 font-bold capitalize text-neutral-800">
                {placedOrder.status || "Pending"}
              </p>
            </div>
          </div>

          {/* Items */}
          {placedOrder.items && placedOrder.items.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400">
                Items Ordered
              </h3>
              <div className="max-h-60 divide-y divide-neutral-100 overflow-y-auto pr-1">
                {placedOrder.items.map((item: OrderItem) => {
                  const featuredMedia =
                    item.product?.media?.find((m: ProductMedia) => m.isFeatured) ??
                    item.product?.media?.[0];
                  const image = resolveImageUrl(featuredMedia?.media?.url);

                  let color = "–";
                  let size = "–";
                  if (item.variant?.attributes) {
                    for (const attr of item.variant.attributes as VariantAttribute[]) {
                      const val = attr.attributeValue?.value;
                      if (!val) continue;
                      const attrName = attr.attributeValue?.attribute?.name?.toLowerCase();
                      if (attrName === "size" || ["S", "M", "L", "XL", "XXL"].includes(val)) {
                        size = val;
                      } else {
                        color = val;
                      }
                    }
                  }

                  return (
                    <div key={item.id} className="flex items-center gap-4 py-4">
                      <div className="relative h-16 w-16 shrink-0 border border-neutral-100 bg-neutral-50">
                        <Image
                          src={image}
                          alt={item.product?.name ?? "Product"}
                          fill
                          sizes="64px"
                          className="object-cover p-2"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-xs font-black uppercase text-neutral-800">
                          {item.product?.name}
                        </h4>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.04em] text-neutral-500">
                          {color} · Size {size}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-neutral-400">
                          Qty {item.quantity} · €{Number(item.unitPrice).toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-right text-sm font-black text-neutral-900">
                        €{Number(item.totalPrice).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="mt-6 space-y-2 border-t border-neutral-200 pt-6 text-xs font-bold text-neutral-500">
            {Number(placedOrder.discount) > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-green-600">-€{Number(placedOrder.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-neutral-900">
              <span>Total</span>
              <span>€{Number(placedOrder.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping address */}
          {placedOrder.address && (
            <div className="mt-8 border-t border-neutral-200 pt-6">
              <h3 className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-neutral-400">
                Shipping Destination
              </h3>
              <div className="border border-neutral-100 bg-neutral-50 p-4 text-xs">
                <p className="font-bold text-neutral-800">{placedOrder.address.fullName}</p>
                <p className="mt-1 font-semibold text-neutral-500">
                  Phone: {placedOrder.address.phone}
                </p>
                <p className="mt-1 leading-relaxed text-neutral-500">
                  {placedOrder.address.addressLine1}
                  {placedOrder.address.addressLine2
                    ? `, ${placedOrder.address.addressLine2}`
                    : ""}
                  <br />
                  {placedOrder.address.city}, {placedOrder.address.state},{" "}
                  {placedOrder.address.postalCode}
                  <br />
                  <span className="font-bold">{placedOrder.address.country}</span>
                </p>
              </div>
            </div>
          )}

          <Link
            href="/shop"
            className="mt-8 block w-full bg-black py-4 text-center text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-neutral-800"
          >
            Continue Shopping
          </Link>
        </section>
      </main>
    );
  }

  // ─── Cart / Checkout screen ──────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white px-4 py-16 text-[#151515] sm:px-8">
      <section className="mx-auto max-w-[1400px]">
        <p className="text-xs font-bold uppercase tracking-[0.14em]">
          {checkoutStep === "cart" ? "Cart" : "Checkout"}
        </p>
        <h1 className="mt-4 text-5xl font-bold">
          {checkoutStep === "cart" ? "Shopping cart" : "Shipping & Checkout"}
        </h1>

        {checkoutError && (
          <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {checkoutError}
          </div>
        )}

        {items.length === 0 && checkoutStep === "cart" ? (
          <div className="mt-10 border border-neutral-200 px-6 py-12">
            <h2 className="text-xl font-black">Your shopping bag is empty</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
              Add archive pieces from the shop and review them here before checkout.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
            {/* ── Left column ─────────────────────────────────────────── */}
            {checkoutStep === "cart" ? (
              <CartItemList
                items={items}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
              />
            ) : (
              <AddressStep
                user={user}
                token={token}
                savedAddresses={savedAddresses}
                selectedAddressId={selectedAddressId}
                showNewAddressForm={showNewAddressForm}
                addressFields={addressFields}
                guestEmail={guestEmail}
                onSelectAddress={(id) => {
                  setSelectedAddressId(id);
                  setShowNewAddressForm(false);
                }}
                onShowNewForm={() => setShowNewAddressForm(true)}
                onHideNewForm={() => setShowNewAddressForm(false)}
                onAddressFieldChange={updateAddressField}
                onGuestEmailChange={setGuestEmail}
                onBack={handleBackToCart}
              />
            )}

            {/* ── Right column: order summary ──────────────────────────── */}
            <aside className="h-fit border border-neutral-200 p-6">
              <h2 className="text-sm font-black uppercase tracking-[0.12em]">Order Summary</h2>
              <div className="mt-6 space-y-4 border-b border-neutral-200 pb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-black">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span className="font-black">€0.00</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{formatPrice(appliedCoupon.discount)}</span>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-between text-lg font-black">
                <span>Total</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>

              {/* Coupon input */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 border border-neutral-200 px-3 py-2 text-sm uppercase outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className="bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition hover:bg-neutral-800 disabled:bg-neutral-400"
                      >
                        {isApplyingCoupon ? "Applying" : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs font-bold text-red-650">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-neutral-50 p-3 border border-neutral-200">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                        Code Applied
                      </p>
                      <p className="text-sm font-black uppercase mt-0.5">{appliedCoupon.code}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-black uppercase tracking-[0.12em] text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {checkoutStep === "cart" ? (
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="mt-6 w-full bg-black px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-neutral-800"
                >
                  Checkout
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="mt-6 flex w-full items-center justify-center gap-2 bg-black px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
                >
                  {isProcessing ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing…
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              )}

              {checkoutStep === "cart" && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-4 w-full border border-neutral-200 px-6 py-3 text-xs font-black uppercase tracking-[0.12em] transition hover:bg-neutral-50"
                >
                  Clear Cart
                </button>
              )}
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

// ─── CartItemList sub-component ───────────────────────────────────────────────
type CartItem = ReturnType<typeof useCart>["items"][number];

function CartItemList({
  items,
  updateQuantity,
  removeItem,
}: {
  items: CartItem[];
  updateQuantity: (slug: string, qty: number) => void;
  removeItem: (slug: string) => void;
}) {
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <article
          key={item.slug}
          className="grid gap-5 border border-neutral-200 p-4 sm:grid-cols-[140px_1fr]"
        >
          <div className="relative aspect-square bg-neutral-50">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="140px"
              className="object-cover p-4"
            />
          </div>

          <div className="flex flex-col justify-between gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-black uppercase">{item.name}</h2>
                <p className="mt-2 text-sm text-neutral-500">
                  {item.color} · Size {item.size}
                </p>
                <p className="mt-3 text-base font-black">€{item.price.toFixed(2)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.slug)}
                className="text-xl text-neutral-400 transition hover:text-black"
                aria-label={`Remove ${item.name}`}
              >
                <FiTrash2 />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                className="flex h-9 w-9 items-center justify-center border border-neutral-200 transition hover:bg-neutral-50"
                aria-label="Decrease quantity"
              >
                <FiMinus />
              </button>
              <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                className="flex h-9 w-9 items-center justify-center border border-neutral-200 transition hover:bg-neutral-50"
                aria-label="Increase quantity"
              >
                <FiPlus />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

// ─── AddressStep sub-component ────────────────────────────────────────────────
type VariantAttribute = {
  id: string;
  attributeValue?: {
    id: string;
    value: string;
    attribute?: { id: string; name: string };
  };
};

function AddressStep({
  user,
  token,
  savedAddresses,
  selectedAddressId,
  showNewAddressForm,
  addressFields,
  guestEmail,
  onSelectAddress,
  onShowNewForm,
  onHideNewForm,
  onAddressFieldChange,
  onGuestEmailChange,
  onBack,
}: {
  user: { id: string; name: string; email: string } | null;
  token: string | null;
  savedAddresses: Address[];
  selectedAddressId: string;
  showNewAddressForm: boolean;
  addressFields: AddressFields;
  guestEmail: string;
  onSelectAddress: (id: string) => void;
  onShowNewForm: () => void;
  onHideNewForm: () => void;
  onAddressFieldChange: (field: keyof AddressFields, value: string) => void;
  onGuestEmailChange: (val: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6 border border-neutral-200 p-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-black uppercase text-neutral-500 transition hover:text-black"
      >
        <FiChevronLeft className="text-sm" />
        Back to Cart
      </button>

      {/* Guest email section */}
      {!token && (
        <div className="space-y-3 border-b border-neutral-100 pb-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em]">
            <FiUser className="text-sm text-neutral-400" />
            <span>Guest Checkout</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            You&apos;re checking out as a guest. Enter your email to receive your order
            confirmation.{" "}
            <span className="font-bold text-neutral-700">
              Create an account to track your order easily.
            </span>
          </p>
          <input
            type="email"
            placeholder="Your email address *"
            required
            value={guestEmail}
            onChange={(e) => onGuestEmailChange(e.target.value)}
            className="w-full border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-black"
          />
        </div>
      )}

      {/* Saved addresses (auth users) */}
      {token && savedAddresses.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.08em]">
            Select Shipping Address
          </h2>
          <div className="space-y-3">
            {savedAddresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex cursor-pointer items-start gap-3 border p-4 transition ${
                  selectedAddressId === addr.id && !showNewAddressForm
                    ? "border-black bg-neutral-50"
                    : "border-neutral-200 hover:bg-neutral-50/50"
                }`}
              >
                <input
                  type="radio"
                  name="addressSelect"
                  checked={selectedAddressId === addr.id && !showNewAddressForm}
                  onChange={() => onSelectAddress(addr.id)}
                  className="mt-1 accent-black"
                />
                <div className="text-xs">
                  <p className="font-bold">
                    {addr.fullName}{" "}
                    <span className="text-[10px] font-semibold text-neutral-400">
                      ({addr.phone})
                    </span>
                  </p>
                  <p className="mt-1 text-neutral-500">{addr.addressLine1}</p>
                  <p className="text-neutral-500">
                    {addr.city}, {addr.state}, {addr.postalCode}
                  </p>
                  <p className="font-bold text-neutral-500">{addr.country}</p>
                </div>
              </label>
            ))}
          </div>

          {!showNewAddressForm && (
            <button
              type="button"
              onClick={onShowNewForm}
              className="mt-4 text-xs font-black uppercase tracking-[0.08em] underline hover:text-neutral-600"
            >
              + Add a new shipping address
            </button>
          )}
        </div>
      )}

      {/* New / guest address form */}
      {(showNewAddressForm || !token) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.08em]">
              {token && savedAddresses.length > 0 ? "New Shipping Address" : "Shipping Address"}
            </h2>
            {token && savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={onHideNewForm}
                className="text-xs font-semibold text-neutral-500 underline hover:text-black"
              >
                Use saved address
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Full name *"
              required
              value={addressFields.fullName}
              onChange={(e) => onAddressFieldChange("fullName", e.target.value)}
              className="w-full border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-black"
            />
            <input
              type="tel"
              placeholder="Phone number *"
              required
              value={addressFields.phone}
              onChange={(e) => onAddressFieldChange("phone", e.target.value)}
              className="w-full border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-black"
            />
          </div>
          <input
            type="text"
            placeholder="Address Line 1 *"
            required
            value={addressFields.addressLine1}
            onChange={(e) => onAddressFieldChange("addressLine1", e.target.value)}
            className="w-full border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-black"
          />
          <input
            type="text"
            placeholder="Apartment, suite, etc. (optional)"
            value={addressFields.addressLine2}
            onChange={(e) => onAddressFieldChange("addressLine2", e.target.value)}
            className="w-full border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-black"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              type="text"
              placeholder="City *"
              required
              value={addressFields.city}
              onChange={(e) => onAddressFieldChange("city", e.target.value)}
              className="w-full border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-black"
            />
            <input
              type="text"
              placeholder="State / Region *"
              required
              value={addressFields.state}
              onChange={(e) => onAddressFieldChange("state", e.target.value)}
              className="w-full border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-black"
            />
            <input
              type="text"
              placeholder="Postal code *"
              required
              value={addressFields.postalCode}
              onChange={(e) => onAddressFieldChange("postalCode", e.target.value)}
              className="w-full border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-black"
            />
          </div>
          <input
            type="text"
            placeholder="Country *"
            required
            value={addressFields.country}
            onChange={(e) => onAddressFieldChange("country", e.target.value)}
            className="w-full border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-black"
          />
        </div>
      )}
    </div>
  );
}
