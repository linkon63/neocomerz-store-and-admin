"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/_providers/cart-provider";
import { useWishlist } from "@/app/_providers/wishlist-provider";
import { useAuth } from "@/app/_providers/auth-provider";
import { useCurrency } from "@/lib/currency-context";
import { LuMinus, LuPlus, LuArrowLeft, LuLock, LuChevronUp, LuTrash2, LuLoader } from "react-icons/lu";
import { IoHeartOutline, IoHeart, IoChevronDownOutline, IoAlertCircleOutline } from "react-icons/io5";
import type { WishlistProduct, CartItem } from "@/lib/types";
import { clearBuyNowItem } from "@/lib/buy-now";
import { fetchShopProductById } from "@/lib/shop-api";
import { resolveImageUrl } from "@/lib/admin-api";
import type { Product as AdminProduct } from "@/lib/admin-api";


export default function CartPage() {
  const { items, updateQuantity, removeItem, addItem } = useCart();
  const { isAuthenticated, setShowAuthModal } = useAuth();
  const { formatCurrency } = useCurrency();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();
  const [promoOpen, setPromoOpen] = useState(false);

  const [openDropdownSlug, setOpenDropdownSlug] = useState<string | null>(null);
  const [cartProducts, setCartProducts] = useState<Record<string, AdminProduct>>({});
  const [loadingProducts, setLoadingProducts] = useState<Record<string, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const handleDropdownToggle = useCallback(async (slug: string, productId: string, currentItem: CartItem) => {
    if (openDropdownSlug === slug) {
      setOpenDropdownSlug(null);
      return;
    }
    setOpenDropdownSlug(slug);

    // Pre-fill selectedOptions with active item details
    const initialOptions: Record<string, string> = {};
    if (currentItem.color) initialOptions["Color"] = currentItem.color;
    if (currentItem.size) initialOptions["Size"] = currentItem.size;
    if (currentItem.attributes) {
      Object.assign(initialOptions, currentItem.attributes);
    }
    setSelectedOptions(initialOptions);

    if (productId && !cartProducts[productId] && !loadingProducts[productId]) {
      setLoadingProducts((prev) => ({ ...prev, [productId]: true }));
      try {
        const prod = await fetchShopProductById(productId);
        if (prod) {
          setCartProducts((prev) => ({ ...prev, [productId]: prod }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProducts((prev) => ({ ...prev, [productId]: false }));
      }
    }
  }, [openDropdownSlug, cartProducts, loadingProducts]);

  const getProductVariants = useCallback((productId: string) => {
    const prod = cartProducts[productId];
    if (!prod) return [];
    return (prod.variants ?? []).map((v) => {
      const priceNum = Number(v.price ?? 0);
      const costNum = v.cost ? Number(v.cost) : 0;
      const discountNum = prod.discountPrice ? Number(prod.discountPrice) : 0;
      const showOriginal = discountNum > 0 && discountNum < priceNum;
      const activePrice = showOriginal ? discountNum : priceNum;

      const attributesMap: Record<string, string> = {};
      (v as any).attributes?.forEach((attr: any) => {
        const attrName = attr.attributeValue?.attribute?.name;
        const attrVal = attr.attributeValue?.value;
        if (attrName && attrVal) {
          attributesMap[attrName] = attrVal;
        }
      });
      const optionNames = Object.values(attributesMap).filter(Boolean).join(" / ");

      const variantImages = (v as any).media
        ? ((v as any).media as any[])
            .slice()
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((m) => resolveImageUrl(m.media?.url))
            .filter(Boolean) as string[]
        : [];
      const variantImage = variantImages[0] ?? undefined;

      return {
        id: v.id,
        name: optionNames || "Default",
        price: activePrice,
        image: variantImage,
        attributes: attributesMap,
        stockQuantity: v.stockQuantity,
      };
    });
  }, [cartProducts]);

  const getMatchedVariant = useCallback((productId: string) => {
    const variantsList = getProductVariants(productId);
    if (variantsList.length === 0) return null;
    return (
      variantsList.find((v) => {
        return Object.entries(selectedOptions).every(
          ([k, selectVal]) => v.attributes[k] === selectVal
        );
      }) ?? null
    );
  }, [getProductVariants, selectedOptions]);

  const getUniqueAttributes = useCallback((productId: string) => {
    const variantsList = getProductVariants(productId);
    const attrs: Record<string, Set<string>> = {};
    variantsList.forEach((v) => {
      Object.entries(v.attributes).forEach(([key, val]) => {
        if (!attrs[key]) {
          attrs[key] = new Set<string>();
        }
        attrs[key].add(val);
      });
    });
    return Object.entries(attrs).reduce((acc, [key, set]) => {
      acc[key] = Array.from(set);
      return acc;
    }, {} as Record<string, string[]>);
  }, [getProductVariants]);

  const getMatchedVariantImage = useCallback((item: CartItem) => {
    const matched = getMatchedVariant(item.productId || "");
    return matched?.image || item.image;
  }, [getMatchedVariant]);

  const getMatchedVariantPrice = useCallback((item: CartItem) => {
    const matched = getMatchedVariant(item.productId || "");
    return matched ? formatCurrency(matched.price) : formatCurrency(item.price);
  }, [getMatchedVariant, formatCurrency]);

  const isMatchedVariantOutOfStock = useCallback((item: CartItem) => {
    const matched = getMatchedVariant(item.productId || "");
    return matched ? matched.stockQuantity <= 0 : false;
  }, [getMatchedVariant]);

  const isApplyDisabled = useCallback((item: CartItem) => {
    const matched = getMatchedVariant(item.productId || "");
    if (!matched) return true;
    if (matched.stockQuantity <= 0) return true;
    return matched.id === item.variantId;
  }, [getMatchedVariant]);

  const handleUpdateVariant = useCallback(
    async (
      oldItem: CartItem,
      newVariantId: string,
      newPrice: number,
      newImage: string,
      newAttributes: Record<string, string>
    ) => {
      const nameWithoutOptions = oldItem.name.replace(/\s*\([^)]+\)$/, "");
      const optionNames = Object.values(newAttributes).filter(Boolean).join(", ");
      const newDisplayName = optionNames ? `${nameWithoutOptions} (${optionNames})` : nameWithoutOptions;

      const newColor = newAttributes.Color || newAttributes.Colour || newAttributes.color || "";
      const newSize = newAttributes.Size || newAttributes.size || "";
      const newSlug = `${oldItem.slug.split("-variant-")[0]}-variant-${newVariantId}`;

      const newItem = {
        slug: newSlug,
        name: newDisplayName,
        price: newPrice,
        image: newImage,
        color: newColor,
        size: newSize,
        productId: oldItem.productId,
        variantId: newVariantId,
        attributes: newAttributes,
        quantity: oldItem.quantity,
      };

      await removeItem(oldItem.slug);
      await addItem(newItem, { silent: true });
      setOpenDropdownSlug(null);
    },
    [removeItem, addItem, setOpenDropdownSlug]
  );

  const handleApplyChange = useCallback(async (item: CartItem) => {
    const matched = getMatchedVariant(item.productId || "");
    if (!matched) return;
    try {
      await handleUpdateVariant(item, matched.id, matched.price, matched.image || item.image, matched.attributes);
    } catch (err) {
      console.error(err);
    }
  }, [getMatchedVariant, handleUpdateVariant]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const handleDecrement = useCallback(
    (slug: string, currentQty: number) => {
      if (currentQty <= 1) {
        removeItem(slug);
      } else {
        updateQuantity(slug, currentQty - 1);
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
                  const inWishlist = isInWishlist(item.productId || item.id || item.slug);
                  const productUrl = item.productId ? `/products/${item.productId}` : null;

                  // Parse name and attributes if item.name is formatted like "Vol. 2 Royal Collection (Premium White)"
                  const match = item.name.match(/^(.*?)\s*\(([^)]+)\)$/);
                  const displayName = match ? match[1] : item.name;
                  const optionSummary = match ? match[2] : (item.color || item.size || "");

                  return (
                    <div
                      key={item.slug}
                      className="border-b border-zinc-100 py-6 group"
                    >
                      <div className="flex gap-4 sm:gap-6 items-start">
                        {productUrl ? (
                          <Link
                            href={productUrl}
                            className="w-24 sm:w-32 h-24 sm:h-32 relative bg-stone-50 rounded-2xl shrink-0 overflow-hidden cursor-pointer border border-stone-100"
                          >
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="(max-width: 640px) 96px, 128px"
                                className="object-contain p-1.5 sm:p-2"
                              />
                            )}
                          </Link>
                        ) : (
                          <div className="w-24 sm:w-32 h-24 sm:h-32 relative bg-stone-50 rounded-2xl shrink-0 overflow-hidden border border-stone-100">
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="(max-width: 640px) 96px, 128px"
                                className="object-contain p-1.5 sm:p-2"
                              />
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[96px] sm:min-h-[128px]">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              {productUrl ? (
                                <Link href={productUrl} className="cursor-pointer">
                                  <h3 className="font-bembo text-lg sm:text-2xl text-stone-800 leading-tight hover:text-[#BD2A36] transition-colors">
                                    {displayName}
                                  </h3>
                                </Link>
                              ) : (
                                <h3 className="font-bembo text-lg sm:text-2xl text-stone-800 leading-tight">
                                  {displayName}
                                </h3>
                              )}

                              {optionSummary && (
                                <div className="relative inline-block text-left mt-1.5 z-10">
                                  <button
                                    type="button"
                                    onClick={() => handleDropdownToggle(item.slug, item.productId || "", item)}
                                    className="flex items-center gap-1 text-stone-500 font-bembo text-sm cursor-pointer hover:text-stone-700 w-fit bg-transparent border-0 outline-none"
                                  >
                                    <span>{optionSummary}</span>
                                    <IoChevronDownOutline className="w-3.5 h-3.5 text-stone-400" />
                                  </button>

                                  {openDropdownSlug === item.slug && (
                                    <>
                                      {/* Click-outside backdrop overlay to close dropdown */}
                                      <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownSlug(null)} />
                                      
                                      <div className="absolute left-0 mt-2 w-72 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-4 space-y-4">
                                        {loadingProducts[item.productId || ""] ? (
                                          <div className="p-4 text-xs text-stone-500 flex items-center gap-2 justify-center font-gotham">
                                            <LuLoader className="w-4 h-4 animate-spin text-[#BD2A36]" />
                                            <span>Loading options...</span>
                                          </div>
                                        ) : (
                                          <div className="space-y-4">
                                            {/* Preview image + price */}
                                            <div className="flex gap-3 items-center border-b border-zinc-100 pb-3">
                                              <div className="w-12 h-12 relative bg-stone-50 rounded overflow-hidden shrink-0 border border-stone-100">
                                                <Image
                                                  src={getMatchedVariantImage(item) || item.image}
                                                  alt={item.name}
                                                  fill
                                                  sizes="48px"
                                                  className="object-contain p-0.5"
                                                />
                                              </div>
                                              <div>
                                                <h4 className="font-bembo text-sm text-stone-800 leading-tight truncate w-44">
                                                  {displayName}
                                                </h4>
                                                <p className="font-gotham text-xs text-[#BD2A36] font-semibold mt-0.5">
                                                  {getMatchedVariantPrice(item)}
                                                </p>
                                              </div>
                                            </div>

                                            {/* Option groups */}
                                            <div className="space-y-3">
                                              {Object.entries(getUniqueAttributes(item.productId || "")).map(([attrName, values]) => (
                                                <div key={attrName} className="space-y-1">
                                                  <p className="font-gotham text-[10px] uppercase tracking-wider text-stone-500 font-medium">
                                                    {attrName}
                                                  </p>
                                                  <div className="flex flex-wrap gap-1.5">
                                                    {values.map((val) => {
                                                      const isSelected = selectedOptions[attrName] === val;
                                                      return (
                                                        <button
                                                          key={val}
                                                          type="button"
                                                          onClick={() => setSelectedOptions((prev) => ({ ...prev, [attrName]: val }))}
                                                          className={`px-3 py-1.5 border text-[11px] font-gotham rounded-md transition-all cursor-pointer ${
                                                            isSelected
                                                              ? "border-[#BD2A36] bg-[#FDF0F1] text-[#BD2A36] font-medium shadow-xs"
                                                              : "border-zinc-200 bg-white text-stone-700 hover:border-stone-400"
                                                          }`}
                                                        >
                                                          {val}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>

                                            {/* Stock warning */}
                                            {isMatchedVariantOutOfStock(item) && (
                                              <div className="flex items-center gap-1.5 p-2 bg-amber-50 text-amber-700 text-[10px] rounded border border-amber-200 font-gotham leading-normal">
                                                <IoAlertCircleOutline className="w-3.5 h-3.5 shrink-0" />
                                                <span>This combination is sold out.</span>
                                              </div>
                                            )}

                                            {/* Apply Button */}
                                            <div className="flex gap-2 pt-1 border-t border-zinc-100">
                                              <button
                                                type="button"
                                                onClick={() => setOpenDropdownSlug(null)}
                                                className="flex-1 py-2 border border-zinc-300 text-stone-700 font-gotham text-[10px] uppercase tracking-wider rounded-md hover:bg-stone-50 transition-colors cursor-pointer"
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                type="button"
                                                disabled={isApplyDisabled(item)}
                                                onClick={() => handleApplyChange(item)}
                                                className="flex-1 py-2 bg-[#BD2A36] hover:bg-opacity-95 text-white font-gotham text-[10px] uppercase tracking-wider rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
                                              >
                                                Apply
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}

                              {item.description && (
                                <p className="hidden sm:block font-bembo text-stone-600 text-sm mt-3 leading-relaxed max-w-xl">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            <div className="sm:text-right shrink-0">
                              <p className="font-bembo text-xl sm:text-2xl lg:text-3xl text-stone-800 font-normal">
                                {formatCurrency(item.price)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="font-bembo text-xs text-stone-400 mt-1">
                                  Total: {formatCurrency(item.price * item.quantity)}
                                </p>
                              )}
                            </div>
                          </div>

                          {item.description && (
                            <p className="block sm:hidden font-bembo text-stone-600 text-xs mt-2 leading-relaxed">
                              {item.description.length > 80
                                ? `${item.description.slice(0, 80)}…`
                                : item.description}
                            </p>
                          )}

                          {/* Actions row */}
                          <div className="flex items-center gap-3 mt-4 sm:mt-6">
                            {/* Quantity Selector */}
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <button
                                onClick={() => handleDecrement(item.slug, item.quantity)}
                                className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center shadow-sm border border-stone-200 bg-white text-stone-800 hover:bg-neutral-100 transition-all cursor-pointer active:scale-95"
                                aria-label="Decrease quantity"
                              >
                                <LuMinus className="w-3 sm:w-4 h-3 sm:h-4" />
                              </button>
                              <div className="w-8 sm:w-12 flex justify-center items-center">
                                <span className="font-gotham text-base sm:text-lg font-normal text-stone-800">
                                  {item.quantity}
                                </span>
                              </div>
                              <button
                                onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                                className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center shadow-sm border border-stone-200 bg-white text-stone-800 hover:bg-neutral-100 transition-all cursor-pointer active:scale-95"
                                aria-label="Increase quantity"
                              >
                                <LuPlus className="w-3 sm:w-4 h-3 sm:h-4" />
                              </button>
                            </div>

                            {/* Wishlist Button */}
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

                            {/* Delete Button */}
                            <button
                              onClick={() => removeItem(item.slug)}
                              className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center shadow-sm border border-stone-200 bg-white text-stone-800 hover:bg-[#d3122f] hover:text-white hover:border-[#d3122f] transition-all cursor-pointer active:scale-95"
                              aria-label="Remove item"
                            >
                              <LuTrash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                            </button>
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
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${promoOpen ? "max-h-20 mt-3" : "max-h-0"
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
