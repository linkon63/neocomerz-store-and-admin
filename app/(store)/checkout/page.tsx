"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/app/_providers/cart-provider";
import { useAuth } from "@/app/_providers/auth-provider";
import { useCurrency } from "@/lib/currency-context";
import { usePlaceOrder } from "@/app/_hooks/use-place-order";
import { LuLoader, LuArrowLeft, LuLock, LuMapPin } from "react-icons/lu";
import type { AddressForm } from "@/lib/types";

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
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [orderNote, setOrderNote] = useState("");

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
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const estTax = 0;
  const promoCodeDiscount = 0;
  const total = subtotal + shipping + estTax - promoCodeDiscount;

  async function handlePlaceOrder(e: FormEvent) {
    e.preventDefault();
    if (!agreeToTerms) {
      alert("Please agree to the terms and conditions.");
      return;
    }
    try {
      const result = await placeOrder(address);
      sessionStorage.setItem("orderResult", JSON.stringify(result));
      router.push("/confirmation");
    } catch {
      // error toast handled inside the hook
    }
  }

  return (
    <main className="flex-grow bg-white w-full min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left Section - Billing Details */}
          <div className="lg:col-span-8">
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <Link href="/cart" className="text-stone-800 hover:text-stone-600 transition-colors">
                  <LuArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-bembo text-2xl lg:text-3xl text-stone-800">Billing Details</h1>
              </div>

              {/* User Information - display if logged in, otherwise show input fields */}
              {isAuthenticated && user ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Name
                    </label>
                    <p className="text-stone-800 font-medium">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Email
                    </label>
                    <p className="text-stone-800 font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Phone *
                    </label>
                    <input
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="w-full border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      placeholder="Enter email address"
                      className="w-full border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Phone *
                    </label>
                    <input
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="w-full border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Province/Region *
                  </label>
                  <input
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="Enter province/region name"
                    className="w-full border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    City *
                  </label>
                  <input
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="Enter city name"
                    className="w-full border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Town *
                  </label>
                  <input
                    required
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    placeholder="Enter town name"
                    className="w-full border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500 rounded-lg"
                  />
                </div>
              </div>

              {/* Full Address with Map Button */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Full Address *
                </label>
                <div className="flex gap-2">
                  <input
                    required
                    value={address.addressLine1}
                    onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                    placeholder="Full address"
                    className="flex-1 border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500 rounded-lg"
                  />
                  <button
                    type="button"
                    className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LuMapPin className="w-4 h-4" />
                    Set from Map
                  </button>
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Country *
                </label>
                <select
                  required
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="w-full border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500 rounded-lg"
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

              {/* Use same address checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sameAddress"
                  checked={useSameAddressForShipping}
                  onChange={(e) => setUseSameAddressForShipping(e.target.checked)}
                  className="w-4 h-4 text-stone-600 rounded focus:ringstone-500 cursor-pointer"
                />
                <label htmlFor="sameAddress" className="text-sm text-stone-700 cursor-pointer">
                  Use same address for shipping
                </label>
              </div>

              {/* Order Note */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Order note (Optional)
                </label>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  rows={3}
                  className="w-full border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500 rounded-lg resize-none"
                  placeholder="Write here..."
                />
              </div>
            </form>
          </div>

          {/* Right Section - Summary */}
          <div className="lg:col-span-4">
            <div className="bg-stone-50 rounded-lg p-6 lg:p-8 space-y-6">
              <h2 className="font-bembo text-2xl text-stone-800">Summary</h2>

              {/* Order Totals */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-medium text-stone-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">Promo Code Discount</span>
                  <span className="font-medium text-stone-800">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">Est. Tax</span>
                  <span className="font-medium text-stone-800">-</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-stone-200">
                  <span className="font-semibold text-stone-800 text-lg">Total</span>
                  <span className="font-semibold text-stone-800 text-lg">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-4 border-t border-stone-200">
                <p className="text-xs text-stone-500 mb-4">All transactions are secure and encrypted.</p>
                
                <div className="space-y-3">
                  {/* Online Payment */}
                  <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'online' ? 'border-brand-primary bg-brand-primary/5' : 'border-stone-200 hover:border-stone-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'cod')}
                      className="mt-1 w-4 h-4 text-brand-primary focus:ring-brand-primary cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-stone-800">Online Payment</p>
                      <p className="text-xs text-stone-500 mt-1">
                        After clicking 'Place Order', you will be redirected to online payment to complete your purchase securely.
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-10 h-6 bg-white border border-stone-200 rounded flex items-center justify-center text-[10px] font-bold text-stone-600">
                          AMEX
                        </div>
                        <div className="w-10 h-6 bg-white border border-stone-200 rounded flex items-center justify-center text-[10px] font-bold text-stone-600">
                          VISA
                        </div>
                        <div className="w-10 h-6 bg-white border border-stone-200 rounded flex items-center justify-center text-[10px] font-bold text-stone-600">
                          MC
                        </div>
                        <div className="w-10 h-6 bg-white border border-stone-200 rounded flex items-center justify-center text-[10px] font-bold text-stone-600">
                          শিওরক্যাশ
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'cod' ? 'border-brand-primary bg-brand-primary/5' : 'border-stone-200 hover:border-stone-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'cod')}
                      className="mt-1 w-4 h-4 text-brand-primary focus:ring-brand-primary cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-stone-800">Cash on delivery</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2 pt-4 border-t border-stone-200">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-stone-600 rounded focus:ring-stone-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-stone-700 cursor-pointer">
                  I have read and agree to the{" "}
                  <Link href="/terms" className="text-brand-primary hover:underline">
                    terms and conditions
                  </Link>
                </label>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={submitting || !agreeToTerms}
                onClick={handlePlaceOrder}
                className="w-full py-4 bg-[#D31F3A] text-white font-gotham text-sm font-semibold uppercase tracking-wider rounded-full hover:bg-opacity-95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting && <LuLoader className="w-4 h-4 animate-spin" />}
                {submitting ? "PLACING ORDER..." : "PLACE ORDER"}
              </button>

              {/* Security Section */}
              <div className="flex items-start gap-3 pt-4 border-t border-stone-200">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <LuLock className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800">Security & Privacy</p>
                  <p className="text-xs text-stone-500 mt-1">
                    We protect your privacy and keep your personal details safe and secure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
