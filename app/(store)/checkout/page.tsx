"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/app/_providers/cart-provider";
import { useAuth } from "@/app/_providers/auth-provider";
import { useCurrency } from "@/lib/currency-context";
import { usePlaceOrder } from "@/app/_hooks/use-place-order";
import { LuLoader, LuArrowLeft, LuLock, LuMapPin } from "react-icons/lu";
import type { AddressForm, CartItem } from "@/lib/types";
import { getBuyNowItem, clearBuyNowItem } from "@/lib/buy-now";
import MapPickerModal from "./_components/map-picker-modal";

const emptyAddress: AddressForm = {
  email: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export default function CheckoutPage() {
  const { items } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { formatCurrency } = useCurrency();
  const router = useRouter();
  const { placeOrder, submitting } = usePlaceOrder();

  const [address, setAddress] = useState<AddressForm>(() => ({
    ...emptyAddress,
    email: user?.email || "",
    fullName: user?.name || "",
  }));
  const [useSameAddressForShipping, setUseSameAddressForShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("cod");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  useEffect(() => {
    setBuyNowItem(getBuyNowItem());
  }, []);

  const checkoutItems = buyNowItem ? [buyNowItem] : items;

  const handleMapSelect = useCallback(
    (data: { addressLine1: string; city: string; state: string; postalCode: string; country: string }) => {
      setAddress((prev) => ({ ...prev, ...data }));
      setMapPickerOpen(false);
    },
    []
  );

  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        email: user.email || prev.email,
        fullName: user.name || prev.fullName,
      }));
    }
  }, [user]);

  const shipping = 0;
  const subtotal = checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const estTax = 0;
  const promoCodeDiscount = 0;
  const total = subtotal + shipping + estTax - promoCodeDiscount;

  async function handlePlaceOrder(e: FormEvent) {
    e.preventDefault();
    if (!agreeToTerms) {
      alert("Please agree to the terms and conditions.");
      return;
    }
    if (checkoutItems.length === 0) {
      alert("Your cart is empty. Please add items before placing an order.");
      return;
    }
    try {
      const result = await placeOrder(address, {
        paymentMethod,
        orderNote: orderNote || undefined,
        items: buyNowItem ? checkoutItems : undefined,
      });
      clearBuyNowItem();
      sessionStorage.setItem("orderResult", JSON.stringify(result));
      router.push("/confirmation");
    } catch {
      // error toast handled inside the hook
    }
  }

  return (
    <main className="flex-grow bg-white w-full min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_384px] gap-8 lg:gap-16">
            {/* ── Left Column: Billing Details ── */}
            <div>
              {/* Back Arrow & Title */}
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <Link href="/cart" className="text-[#4A4A4A] hover:text-stone-600 transition-colors">
                  <LuArrowLeft className="w-5 sm:w-6 h-5 sm:h-6" />
                </Link>
                <h1 className="font-bembo text-3xl sm:text-4xl leading-9 sm:leading-10 text-[#4A4A4A] font-normal">
                  Billing Details
                </h1>
              </div>

              {/* Dashed Border Billing Box */}
              <div className="border border-dashed border-zinc-300 p-4 rounded-sm space-y-5">
                {/* User Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full p-3 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-300 font-gotham text-sm text-[#222222] placeholder:text-zinc-300 placeholder:text-xs placeholder:font-medium placeholder:font-['Gotham'] leading-4 focus:outline-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                      Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      placeholder="Enter email address"
                      className="w-full p-3 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-300 font-gotham text-sm text-[#222222] placeholder:text-zinc-300 placeholder:text-xs placeholder:font-medium placeholder:font-['Gotham'] leading-4 focus:outline-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                      Phone *
                    </label>
                    <input
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="w-full p-3 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-300 font-gotham text-sm text-[#222222] placeholder:text-zinc-300 placeholder:text-xs placeholder:font-medium placeholder:font-['Gotham'] leading-4 focus:outline-stone-500"
                    />
                  </div>
                </div>

                {/* Province, City, Town Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                      Province/Region *
                    </label>
                    <input
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="Enter province/region name"
                      className="w-full p-3 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-300 font-gotham text-sm text-[#222222] placeholder:text-zinc-300 placeholder:text-xs placeholder:font-medium placeholder:font-['Gotham'] leading-4 focus:outline-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                      City *
                    </label>
                    <input
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Enter city name"
                      className="w-full p-3 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-300 font-gotham text-sm text-[#222222] placeholder:text-zinc-300 placeholder:text-xs placeholder:font-medium placeholder:font-['Gotham'] leading-4 focus:outline-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                      Town *
                    </label>
                    <input
                      required
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      placeholder="Enter town name"
                      className="w-full p-3 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-300 font-gotham text-sm text-[#222222] placeholder:text-zinc-300 placeholder:text-xs placeholder:font-medium placeholder:font-['Gotham'] leading-4 focus:outline-stone-500"
                    />
                  </div>
                </div>

                {/* Full Address with Map Button */}
                <div>
                  <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                    Full Address *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      required
                      value={address.addressLine1}
                      onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                      placeholder="Full address"
                      className="flex-1 p-3 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-300 font-gotham text-sm text-[#222222] placeholder:text-zinc-300 placeholder:text-xs placeholder:font-medium placeholder:font-['Gotham'] leading-4 focus:outline-stone-500"
                    />
                    <button
                      type="button"
                      onClick={() => setMapPickerOpen(true)}
                      className="w-full sm:w-auto px-4 py-3 bg-stone-100 hover:bg-stone-200 text-[#222222] text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer font-gotham"
                    >
                      <LuMapPin className="w-4 h-4" />
                      Set from Map
                    </button>
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                    Country *
                  </label>
                  <select
                    required
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className="w-full p-3 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-300 font-gotham text-sm text-[#222222] leading-4 focus:outline-stone-500 cursor-pointer"
                  >
                    <option value="">Select country</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="India">India</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Checkbox: Same Address for Shipping */}
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      id="sameAddress"
                      checked={useSameAddressForShipping}
                      onChange={(e) => setUseSameAddressForShipping(e.target.checked)}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="sameAddress"
                      className="w-5 h-5 border border-zinc-400 rounded cursor-pointer flex items-center justify-center peer-checked:bg-[#A3A3A3] peer-checked:border-[#A3A3A3] transition-colors"
                    >
                      {useSameAddressForShipping && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </label>
                  </div>
                  <label htmlFor="sameAddress" className="font-gotham text-sm sm:text-lg text-[#222222] cursor-pointer select-none">
                    Use same address for shipping
                  </label>
                </div>
              </div>

              {/* Order Note (outside dashed box) */}
              <div className="mt-8">
                <label className="block font-gotham text-base sm:text-lg text-[#222222] mb-2">
                  Order note (Optional)
                </label>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-300 font-gotham text-sm text-[#222222] placeholder:text-zinc-300 placeholder:text-xs placeholder:font-medium placeholder:font-['Gotham'] leading-4 focus:outline-stone-500 resize-none"
                  placeholder="Write here ..."
                  style={{ height: "100px" }}
                />
              </div>
            </div>

            {/* ── Right Column: Summary & Payment ── */}
            <div className="w-full lg:w-96">
              <h2 className="font-bembo text-3xl sm:text-4xl text-[#4A4A4A] font-normal mb-6">
                Summary
              </h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {checkoutItems.map((item) => (
                  <div key={item.slug} className="flex items-center gap-3">
                    <div className="w-14 h-14 relative bg-stone-50 rounded-md shrink-0 overflow-hidden">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-contain p-1.5"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-gotham text-sm text-[#222222] truncate">{item.name}</p>
                      <p className="font-gotham text-xs text-[#999999]">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-gotham text-sm font-medium text-[#222222] whitespace-nowrap">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="h-px bg-zinc-200 mb-5" />

              {/* Pricing Rows */}
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="font-bembo text-base text-[#555555]">Subtotal</span>
                  <span className="font-gotham text-base font-medium text-[#222222]">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="h-px bg-zinc-200" />
                <div className="flex justify-between items-center">
                  <span className="font-bembo text-base text-[#555555]">Promo Code Discount</span>
                  <span className="font-gotham text-base font-medium text-[#222222]">--</span>
                </div>
                <div className="h-px bg-zinc-200" />
                <div className="flex justify-between items-center">
                  <span className="font-bembo text-base text-[#555555]">Est. Tax</span>
                  <span className="font-gotham text-base font-medium text-[#222222]">--</span>
                </div>
                <div className="border-t border-dashed border-zinc-200/80" />
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4">
                <span className="font-bembo text-3xl sm:text-4xl text-[#4A4A4A] font-normal">Total</span>
                <span className="font-bembo text-3xl sm:text-4xl text-[#4A4A4A] font-normal">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="border-b border-solid border-zinc-300 mb-6" />

              {/* Payment Method */}
              <div className="mb-6">
                <p className="font-gotham text-xs uppercase tracking-wider text-[#999999] mb-1">
                  Payment Method
                </p>
                <p className="font-gotham text-lg text-[#222222] mb-4">
                  All transactions are secure and encrypted.
                </p>

                <div className="space-y-3">
                  {/* Online Payment */}
                  <label className={`flex items-start gap-3 p-4 border rounded-md cursor-pointer transition-colors hover:border-stone-400 ${paymentMethod === "online" ? "border-[#A3926B]" : "border-[#D1D5DB]"}`}>
                    <div className="mt-0.5 shrink-0">
                      {paymentMethod === "online" ? (
                        <div className="w-5 h-5 rounded-full bg-[#A3926B] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-zinc-300" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={(e) => setPaymentMethod(e.target.value as "online" | "cod")}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="font-gotham text-base font-medium text-[#222222]">Online Payment</p>
                      <p className="font-gotham text-sm text-[#999999] mt-1">
                        After clicking &quot;Place Order&quot;, you will be redirected to online payment to complete your purchase securely.
                      </p>
                      <div className="mt-3">
                        <Image
                          src="/images/payment/all-payment.jpg"
                          alt="Payment methods"
                          width={280}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`flex items-start gap-3 p-4 border rounded-md cursor-pointer transition-colors hover:border-stone-400 ${paymentMethod === "cod" ? "border-[#A3926B]" : "border-[#D1D5DB]"}`}>
                    <div className="mt-0.5 shrink-0">
                      {paymentMethod === "cod" ? (
                        <div className="w-5 h-5 rounded-full bg-[#A3926B] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-zinc-300" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value as "online" | "cod")}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="font-gotham text-base font-medium text-[#222222]">Cash on delivery</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-b border-solid border-zinc-300 mb-6" />

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 mb-6">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="terms"
                    className="w-5 h-5 border border-zinc-400 rounded cursor-pointer flex items-center justify-center peer-checked:bg-[#A3926B] peer-checked:border-[#A3926B] transition-colors"
                  >
                    {agreeToTerms && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </label>
                </div>
                <label htmlFor="terms" className="font-gotham text-sm text-[#222222] cursor-pointer select-none">
                  I have read and agree to the{" "}
                  <Link href="/terms" className="underline hover:text-stone-600">
                    terms and conditions
                  </Link>
                  <span className="text-[#A3926B]"> *</span>
                </label>
              </div>

              <div className="border-t border-dashed border-zinc-200/80 mb-6" />

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={submitting || !agreeToTerms}
                className="w-full py-4 bg-[#BD2A36] text-white font-gotham text-base font-bold uppercase tracking-wider rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting && <LuLoader className="w-5 h-5 animate-spin" />}
                {submitting ? "PLACING ORDER..." : "PLACE ORDER"}
              </button>

              {/* Security & Privacy Footer */}
              <div className="flex items-start gap-3 mt-6">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <LuLock className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-gotham text-sm font-medium text-[#222222]">Security & Privacy</p>
                  <p className="font-bembo text-xs text-[#888888] mt-0.5">
                    We protect your privacy and keep your personal details safe and secure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <MapPickerModal
        open={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        onSelect={handleMapSelect}
      />
    </main>
  );
}
