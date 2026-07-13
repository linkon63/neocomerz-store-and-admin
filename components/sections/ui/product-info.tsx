'use client';

import { useState, useEffect, useMemo } from 'react';
import { IoHeartOutline, IoHeart, IoAddOutline, IoRemoveOutline, IoChevronDownOutline } from 'react-icons/io5';
import { useCart } from '@/app/_providers/cart-provider';
import { useWishlist } from '@/app/_providers/wishlist-provider';
import { useAuth } from '@/app/_providers/auth-provider';
import { ProductInfoProps as BaseProductInfoProps } from '@/lib/shop-api';
import type { ParsedVariant } from '../product-details';

interface ProductInfoProps extends Omit<BaseProductInfoProps, 'price' | 'originalPrice' | 'variantId'> {
  variants?: ParsedVariant[];
  price?: string;
  originalPrice?: string;
  variantId?: string;
  productSlug?: string;
  onVariantChange?: (variant: ParsedVariant | null) => void;
}

export default function ProductInfo({
  name,
  subtitle,
  price,
  originalPrice,
  vatMessage,
  teas,
  productId,
  variantId,
  productData,
  variants,
  productSlug,
  onVariantChange,
}: ProductInfoProps) {
  const [activeTea, setActiveTea] = useState<number | null>(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, setShowAuthModal } = useAuth();

  // Selected variant state
  const [selectedVariant, setSelectedVariant] = useState<ParsedVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (variants && variants.length > 0) {
      const def = variants.find((v) => v.isDefault) ?? variants[0] ?? null;
      setSelectedVariant(def);
    }
  }, [variants]);

  // Sync variant to parent component
  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariant);
    }
  }, [selectedVariant, onVariantChange]);

  useEffect(() => {
    if (selectedVariant) {
      setSelectedOptions(selectedVariant.attributes);
    }
  }, [selectedVariant]);

  // Extract all unique attribute groups and values
  const allAttributes = useMemo(() => {
    if (!variants) return {};
    const attrs: Record<string, Set<string>> = {};
    variants.forEach((v) => {
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
  }, [variants]);

  const handleOptionSelect = (attrName: string, val: string) => {
    const nextOptions = { ...selectedOptions, [attrName]: val };
    setSelectedOptions(nextOptions);

    if (variants) {
      const match = variants.find((v) => {
        return Object.entries(nextOptions).every(([k, selectVal]) => v.attributes[k] === selectVal);
      });
      if (match) {
        setSelectedVariant(match);
      }
    }
  };

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'dec') {
      setQuantity((q) => (q > 1 ? q - 1 : 1));
    } else {
      setQuantity((q) => q + 1);
    }
  };

  const isItInWishlist = isInWishlist(productId);

  const displayPrice = selectedVariant ? selectedVariant.priceFormatted : price;
  const displayOriginalPrice = selectedVariant ? selectedVariant.originalPriceFormatted : originalPrice;
  const activeVariantId = selectedVariant ? selectedVariant.id : variantId;

  const handleAddToCart = () => {
    const finalPrice = selectedVariant ? selectedVariant.priceNum : productData.priceNum;
    const colorVal = selectedVariant?.attributes.Color ?? selectedVariant?.attributes.Colour ?? '';
    const sizeVal = selectedVariant?.attributes.Size ?? selectedVariant?.attributes.size ?? '';
    const activeVarId = activeVariantId ?? '';

    // Append options to display name to make it clear in cart
    const optionSummary = selectedVariant 
      ? Object.entries(selectedVariant.attributes).map(([_, v]) => v).join(', ')
      : '';
    const finalName = optionSummary 
      ? `${productData.name} (${optionSummary})` 
      : productData.name;

    addItem({
      slug: productSlug ?? productId,
      name: finalName,
      price: finalPrice,
      image: productData.image,
      color: colorVal,
      size: sizeVal,
      variantId: activeVarId,
      quantity,
    });
  };

  const handleToggleWishlist = () => {
    const finalPrice = selectedVariant ? selectedVariant.priceNum : productData.priceNum;
    const colorVal = selectedVariant?.attributes.Color ?? selectedVariant?.attributes.Colour ?? '';
    const sizeVal = selectedVariant?.attributes.Size ?? selectedVariant?.attributes.size ?? '';
    const activeVarId = activeVariantId ?? '';

    const optionSummary = selectedVariant 
      ? Object.entries(selectedVariant.attributes).map(([_, v]) => v).join(', ')
      : '';
    const finalName = optionSummary 
      ? `${productData.name} (${optionSummary})` 
      : productData.name;

    toggleWishlist({
      id: productId,
      name: finalName,
      slug: productSlug ?? productId,
      price: finalPrice,
      image: productData.image,
      color: colorVal,
      size: sizeVal,
      category: productData.category,
      team: '',
      variantId: activeVarId,
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Product Title & Subtitle */}
      <div className="flex flex-col gap-3">
        <h1 className="font-bembo text-4xl sm:text-5xl lg:text-6xl font-normal text-stone-800 leading-tight">
          {name}
        </h1>
        <p className="font-bembo text-base sm:text-lg text-stone-600 leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="h-px bg-stone-200 w-full" />

      {/* Price & VAT */}
      <div className="flex flex-col gap-2">
        <span className="font-bembo text-sm uppercase text-stone-500 tracking-wider">
          Price
        </span>
        <div className="flex items-start gap-1">
          <span className="font-bembo text-3xl sm:text-4xl text-brand-primary font-normal">
            {displayPrice}
          </span>
          <div className="flex flex-col justify-start">
            <span className="font-bembo text-lg text-stone-850 line-through">
              {displayOriginalPrice}
            </span>
            <span className="font-gotham text-[10px] text-stone-850">
              {vatMessage}
            </span>
          </div>
        </div>
      </div>

      {/* Tea Accordion Selector */}
      <div className="flex flex-col">
        {teas.map((tea, idx) => {
          const isOpen = activeTea === idx;
          return (
            <div
              key={idx}
              className="border-b border-zinc-300 py-2.5 flex flex-col justify-start items-start gap-1 cursor-pointer transition-all duration-200"
              onClick={() => setActiveTea(isOpen ? null : idx)}
            >
              <div className="flex justify-between items-center w-full">
                <span className="font-gotham text-sm font-medium text-stone-800 uppercase tracking-wider hover:text-brand-3 transition-colors">
                  {tea.name}
                </span>
                <IoChevronDownOutline className={`w-4 h-4 text-stone-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <p className="font-bembo text-stone-600 text-base leading-relaxed">
                  {tea.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Variant Selectors */}
      {Object.keys(allAttributes).length > 0 && (
        <div className="flex flex-col gap-4 py-4 border-b border-stone-200">
          {Object.entries(allAttributes).map(([attrName, values]) => (
            <div key={attrName} className="flex flex-col gap-2">
              <span className="font-bembo text-sm uppercase text-stone-500 tracking-wider">
                Select {attrName}
              </span>
              <div className="flex flex-wrap gap-2">
                {values.map((val) => {
                  const isSelected = selectedOptions[attrName] === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleOptionSelect(attrName, val)}
                      className={`px-4 py-2 font-bembo text-sm border rounded-full transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-primary border-brand-primary text-white font-normal'
                          : 'bg-white border-stone-200 text-stone-600 hover:border-brand-primary hover:text-brand-primary'
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
      )}

      {/* Quantity & CTA Panel */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {/* Quantity Selector */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => handleQuantityChange('dec')}
            className="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-stone-800 cursor-pointer transition-colors"
            aria-label="Decrease quantity"
          >
            <IoRemoveOutline className="w-5 h-5" />
          </button>
          <div className="w-14 px-3 py-4 flex justify-center items-center">
            <span className="font-gotham text-xl font-normal text-stone-800">
              {quantity}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleQuantityChange('inc')}
            className="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-stone-800 cursor-pointer transition-colors"
            aria-label="Increase quantity"
          >
            <IoAddOutline className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={() =>
            isAuthenticated
              ? handleToggleWishlist()
              : setShowAuthModal(true)
          }
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm border transition-colors cursor-pointer ${
            isItInWishlist
              ? 'bg-brand-primary border-brand-primary text-white hover:bg-opacity-95'
              : 'bg-white text-stone-850 hover:bg-brand-primary hover:text-white border-stone-200'
          }`}
          aria-label="Add to wishlist"
        >
          {isItInWishlist ? (
            <IoHeart className="w-5 h-5" />
          ) : (
            <IoHeartOutline className="w-5 h-5" />
          )}
        </button>

        {/* Add to cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 min-w-[180px] sm:min-w-[220px] px-6 sm:px-10 py-4 whitespace-nowrap bg-[#D31F3A] text-white hover:bg-opacity-95 font-gotham text-sm font-semibold uppercase tracking-wider rounded-full outline outline-1 outline-offset-[-1px] outline-orange-50 flex justify-center items-center shadow-md transition-all cursor-pointer"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
