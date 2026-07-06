"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/_providers/cart-provider";
import { useAuth } from "@/app/_providers/auth-provider";
import { useCurrency } from "@/lib/currency-context";
import { LuMinus, LuPlus, LuArrowLeft, LuLock } from "react-icons/lu";
import { IoHeartOutline, IoChevronDownOutline } from "react-icons/io5";

export default function CartPage() {
  const { items, updateQuantity } = useCart();
  const { isAuthenticated, setShowAuthModal } = useAuth();
  const { formatCurrency } = useCurrency();
  const router = useRouter();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = 0;

  return (
    <main className="flex-grow bg-white w-full min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500 font-bembo text-xl mb-6">
              Your shopping bag is empty.
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-stone-800 text-white text-sm font-semibold uppercase tracking-wider hover:bg-stone-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            {/* Left Section - Cart Items */}
            <div className="lg:col-span-8">
              {/* Header with back button */}
              <div className="flex items-center gap-3 mb-6">
                <Link href="/shop" className="text-stone-800 hover:text-stone-600 transition-colors">
                  <LuArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-bembo text-2xl lg:text-3xl text-stone-800">Cart</h1>
              </div>

              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.slug}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                  >
                    <div className="w-full sm:w-32 h-32 sm:h-40 relative bg-stone-50 rounded-lg shrink-0">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-3"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bembo text-xl lg:text-2xl text-stone-800 leading-tight">
                        {item.name}
                      </h3>
                      
                      {/* Subtitle with dropdown */}
                      <div className="flex items-center gap-2 mt-2 cursor-pointer group">
                        <p className="font-bembo text-base text-stone-600">
                          Premium English Breakfast
                        </p>
                        <IoChevronDownOutline className="w-4 h-4 text-stone-500 group-hover:text-stone-700 transition-colors" />
                      </div>

                      {/* Description */}
                      <p className="font-bembo text-stone-500 text-sm mt-3 leading-relaxed">
                        Each product consists of a beautifully crafted box containing three types of our hand-stitched tea bags.
                      </p>

                      {/* Quantity selector and wishlist */}
                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                            className="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-stone-800 cursor-pointer transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <LuMinus className="w-5 h-5" />
                          </button>
                          <div className="w-14 px-3 py-4 flex justify-center items-center">
                            <span className="font-gotham text-xl font-normal text-stone-800">
                              {item.quantity}
                            </span>
                          </div>
                          <button
                            onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                            className="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-stone-800 cursor-pointer transition-colors"
                            aria-label="Increase quantity"
                          >
                            <LuPlus className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Wishlist button */}
                        <button
                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm border border-stone-200 bg-white text-stone-800 hover:bg-[#d3122f] hover:text-white hover:border-[#d3122f] transition-colors cursor-pointer"
                          aria-label="Add to wishlist"
                        >
                          <IoHeartOutline className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="font-bembo text-2xl lg:text-3xl text-brand-primary font-normal">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section - Summary */}
            <div className="lg:col-span-4">
              <div className="bg-stone-50 rounded-lg p-6 lg:p-8 space-y-6">
                <h2 className="font-bembo text-2xl text-stone-800">Summary</h2>

                {/* Promo Code */}
                <div className="space-y-2">
                  <p className="text-sm text-stone-600 font-medium">Have Any Promo Code?</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-400 transition-colors"
                    />
                    <button className="px-4 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors cursor-pointer">
                      <LuArrowLeft className="w-5 h-5 rotate-180" />
                    </button>
                  </div>
                </div>

                {/* Order Totals */}
                <div className="space-y-3 pt-4 border-t border-stone-200">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="font-medium text-stone-800">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Est. Tax</span>
                    <span className="font-medium text-stone-800">-</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-stone-200">
                    <span className="font-semibold text-stone-800 text-lg">Total</span>
                    <span className="font-semibold text-stone-800 text-lg">{formatCurrency(subtotal + shipping)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() =>
                    isAuthenticated
                      ? router.push("/checkout")
                      : setShowAuthModal(true)
                  }
                  className="w-full py-4 bg-[#D31F3A] text-white font-gotham text-sm font-semibold uppercase tracking-wider rounded-full hover:bg-opacity-95 transition-colors cursor-pointer"
                >
                  PROCEED TO CHECKOUT
                </button>

                {/* Payment Methods */}
                <div className="pt-4 border-t border-stone-200">
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">We Using Safe Payment For</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-12 h-8 bg-white border border-stone-200 rounded flex items-center justify-center text-xs font-bold text-stone-600">
                      AMEX
                    </div>
                    <div className="w-12 h-8 bg-white border border-stone-200 rounded flex items-center justify-center text-xs font-bold text-stone-600">
                      VISA
                    </div>
                    <div className="w-12 h-8 bg-white border border-stone-200 rounded flex items-center justify-center text-xs font-bold text-stone-600">
                      MC
                    </div>
                    <div className="w-12 h-8 bg-white border border-stone-200 rounded flex items-center justify-center text-xs font-bold text-stone-600">
                      PP
                    </div>
                  </div>
                </div>

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
        )}
      </div>
    </main>
  );
}
