"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/_providers/cart-provider";
import { useWishlist } from "@/app/_providers/wishlist-provider";
import { useAuth } from "@/app/_providers/auth-provider";
import { useCurrency } from "@/lib/currency-context";
import { LuMinus, LuPlus, LuArrowLeft, LuLock, LuChevronUp, LuTrash2 } from "react-icons/lu";
import { IoHeartOutline, IoHeart, IoChevronDownOutline } from "react-icons/io5";
import type { WishlistProduct } from "@/lib/types";
import { clearBuyNowItem } from "@/lib/buy-now";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const { isAuthenticated, setShowAuthModal } = useAuth();
  const { formatCurrency } = useCurrency();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();
  const [promoOpen, setPromoOpen] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const handleDecrement = useCallback(
    (itemId: string, currentQty: number) => {
      if (currentQty <= 1) {
        removeItem(itemId);
      } else {
        updateQuantity(itemId, currentQty - 1);
      }
    },
    [removeItem, updateQuantity]
  );

  const handleToggleWishlist = useCallback(
    (item: (typeof items)[0]) => {
      const productId = item.productId || item.id || item.slug;
      const wishlistItem: WishlistProduct = {
        id: productId,
        name: item.name,
        slug: item.slug,
        price: item.price,
        image: item.image,
        color: item.color || "",
        size: item.size || "",
        category: "",
        team: "",
        variantId: item.variantId,
      };
      toggleWishlist(wishlistItem);
    },
    [toggleWishlist]
  );

  return (
    <main className="flex-grow bg-white w-full min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4">
            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6">
              <LuTrash2 className="w-6 sm:w-8 h-6 sm:h-8 text-stone-400" />
            </div>
            <p className="font-bembo text-xl sm:text-2xl text-[#4A4A4A] mb-3 text-center">
              Your cart is empty
            </p>
            <p className="font-gotham text-sm text-[#999999] mb-8 text-center">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              href="/products"
              className="inline-block px-8 sm:px-10 py-3 sm:py-3.5 bg-[#BD2A36] text-white font-gotham text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full hover:bg-opacity-90 transition-all cursor-pointer"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_384px] gap-8 lg:gap-16">
            {/* ── Left Column: Cart Items ── */}
            <div>
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <Link href="/products" className="text-[#4A4A4A] hover:text-stone-600 transition-colors">
                  <LuArrowLeft className="w-5 sm:w-6 h-5 sm:h-6" />
                </Link>
                <h1 className="font-bembo text-3xl sm:text-4xl leading-9 sm:leading-10 text-[#4A4A4A] font-normal">
                  Cart
                </h1>
              </div>

              <div>
                {items.map((item) => {
                  const itemId = item.id ?? item.variantId ?? item.slug;
                  const inWishlist = isInWishlist(item.productId || item.id || item.slug);
                  const productUrl = item.slug ? `/products/${item.slug}` : null;
                  return (
                      <div
                        key={itemId}
                        className="border-t border-b border-zinc-100 py-4 sm:py-5 group"
                      >
                        <div className="flex gap-4 sm:gap-6">
                          {productUrl ? (
                            <Link
                              href={productUrl}
                              className="w-20 sm:w-32 h-28 sm:h-40 relative bg-stone-50 rounded-md shrink-0 shadow-sm overflow-hidden cursor-pointer"
                            >
                              {item.image && (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  sizes="(max-width: 640px) 80px, 128px"
                                  className="object-contain p-2 sm:p-3"
                                />
                              )}
                            </Link>
                          ) : (
                            <div className="w-20 sm:w-32 h-28 sm:h-40 relative bg-stone-50 rounded-md shrink-0 shadow-sm">
                              {item.image && (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  sizes="(max-width: 640px) 80px, 128px"
                                  className="object-contain p-2 sm:p-3"
                                />
                              )}
                            </div>
                          )}

                          <div className="flex-1 min-w-0 flex flex-col">
                            {productUrl ? (
                              <Link href={productUrl} className="cursor-pointer">
                                <h3 className="font-gotham text-base sm:text-xl text-[#4A4A4A] leading-tight hover:text-brand-3 transition-colors">
                                  {item.name}
                                </h3>
                              </Link>
                            ) : (
                              <h3 className="font-gotham text-base sm:text-xl text-[#4A4A4A] leading-tight">
                                {item.name}
                              </h3>
                            )}

                            {item.description && (
                              <p className="hidden sm:block font-bembo text-stone-500 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed line-clamp-2">
                                {item.description.length > 120
                                  ? `${item.description.slice(0, 120)}…`
                                  : item.description}
                              </p>
                            )}

                            <div className="mt-auto pt-3 sm:pt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-gotham text-lg sm:text-2xl text-[#222222] font-semibold whitespace-nowrap">
                                    {formatCurrency(item.price)}
                                  </p>
                                  {item.quantity > 1 && (
                                    <p className="font-gotham text-xs text-[#999999] mt-1">
                                      Total: {formatCurrency(item.price * item.quantity)}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="flex items-center">
                                    <button
                                      onClick={() => handleDecrement(itemId, item.quantity)}
                                      className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center shadow-sm border border-stone-200 bg-white text-stone-800 hover:bg-neutral-100 transition-all cursor-pointer active:scale-95"
                                      aria-label="Decrease quantity"
                                    >
                                      <LuMinus className="w-3 sm:w-4 h-3 sm:h-4" />
                                    </button>
                                    <div className="w-8 sm:w-12 flex justify-center items-center">
                                      <span className="font-gotham text-base sm:text-lg font-normal text-[#222222]">
                                        {item.quantity}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                      className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center shadow-sm border border-stone-200 bg-white text-stone-800 hover:bg-neutral-100 transition-all cursor-pointer active:scale-95"
                                      aria-label="Increase quantity"
                                    >
                                      <LuPlus className="w-3 sm:w-4 h-3 sm:h-4" />
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => handleToggleWishlist(item)}
                                    className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center shadow-sm border border-stone-200 bg-white transition-all cursor-pointer active:scale-95 ${
                                      inWishlist
                                        ? "text-[#d3122f] border-[#d3122f]"
                                        : "text-stone-800 hover:bg-[#d3122f] hover:text-white hover:border-[#d3122f]"
                                    }`}
                                    aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                                  >
                                    {inWishlist ? (
                                      <IoHeart className="w-3 sm:w-4 h-3 sm:h-4" />
                                    ) : (
                                      <IoHeartOutline className="w-3 sm:w-4 h-3 sm:h-4" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => removeItem(itemId)}
                                    className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center shadow-sm border border-stone-200 bg-white text-stone-800 hover:bg-[#d3122f] hover:text-white hover:border-[#d3122f] transition-all cursor-pointer active:scale-95"
                                    aria-label="Remove item"
                                  >
                                    <LuTrash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>
            </div>

            {/* ── Right Column: Summary ── */}
            <div className="w-full lg:w-96">
              <h2 className="font-bembo text-3xl sm:text-4xl text-[#4A4A4A] font-normal mb-6">
                Summary
              </h2>

              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setPromoOpen(!promoOpen)}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <p className="font-gotham text-sm text-[#555555] font-medium">Have Any Promo Code?</p>
                  {promoOpen ? (
                    <LuChevronUp className="w-4 h-4 text-[#555555] transition-transform" />
                  ) : (
                    <IoChevronDownOutline className="w-4 h-4 text-[#555555] transition-transform" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    promoOpen ? "max-h-20 mt-3" : "max-h-0"
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="w-full p-3 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-300 font-gotham text-sm text-[#222222] placeholder:text-zinc-300 placeholder:text-xs placeholder:font-medium placeholder:font-['Gotham'] leading-4 focus:outline-stone-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bembo text-base text-[#555555]">Subtotal</span>
                  <span className="font-gotham text-base font-medium text-[#222222]">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bembo text-base text-[#555555]">Est. Tax</span>
                  <span className="font-gotham text-base font-medium text-[#222222]">--</span>
                </div>
              </div>

              <div className="border-t border-dashed border-zinc-300 my-4" />

              <div className="flex justify-between items-center pb-6">
                <span className="font-bembo text-3xl sm:text-4xl text-[#4A4A4A] font-normal">Total</span>
                <span className="font-bembo text-3xl sm:text-4xl text-[#4A4A4A] font-normal">
                  {formatCurrency(total)}
                </span>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowAuthModal(true);
                    return;
                  }
                  clearBuyNowItem();
                  router.push("/checkout");
                }}
                className="w-full py-3.5 sm:py-4 bg-[#BD2A36] text-white font-gotham text-sm sm:text-base font-bold uppercase tracking-wider rounded-full hover:bg-opacity-90 transition-all cursor-pointer active:scale-[0.98]"
              >
                PROCEED TO CHECKOUT
              </button>

              <div className="mt-6">
                <p className="font-gotham text-xs text-[#999999] uppercase tracking-wider mb-3">
                  We Using Safe Payment For
                </p>
                <Image
                  src="/images/payment/all-payment.jpg"
                  alt="Payment methods"
                  width={280}
                  height={40}
                  className="object-contain w-full max-w-[280px]"
                />
              </div>

              <div className="flex items-start gap-3 mt-6 pt-6 border-t border-zinc-200">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
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
        )}
      </div>
    </main>
  );
}
