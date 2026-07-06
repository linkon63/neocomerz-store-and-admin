'use client';

import { useState } from 'react';
import { IoHeartOutline, IoAddOutline, IoRemoveOutline, IoChevronDownOutline } from 'react-icons/io5';
import { useCart } from '@/app/_providers/cart-provider';
import { useWishlist } from '@/app/_providers/wishlist-provider';
import { useAuth } from '@/app/_providers/auth-provider';
import { ProductInfoProps } from '@/lib/shop-api';

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
}: ProductInfoProps) {
  const [activeTea, setActiveTea] = useState<number | null>(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, setShowAuthModal } = useAuth();
  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'dec') {
      setQuantity((q) => (q > 1 ? q - 1 : 1));
    } else {
      setQuantity((q) => q + 1);
    }
  };

  const isItInWishlist = isInWishlist(productId);

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
            {price}
          </span>
          <div className="flex flex-col justify-start">
            <span className="font-bembo text-lg text-stone-800 line-through">
              {originalPrice}
            </span>
            <span className="font-gotham text-[10px] text-stone-800">
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

      {/* Quantity & CTA Panel */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {/* Quantity Selector */}
        <div className="flex items-center">
          <button
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
            onClick={() => handleQuantityChange('inc')}
            className="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-stone-800 cursor-pointer transition-colors"
            aria-label="Increase quantity"
          >
            <IoAddOutline className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() =>
            isAuthenticated
              ? toggleWishlist({
                  id: productId,
                  name: productData.name,
                  slug: productId,
                  price: productData.priceNum,
                  image: productData.image,
                  color: '',
                  size: '',
                  category: productData.category,
                  team: '',
                })
              : setShowAuthModal(true)
          }
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm border border-stone-200 transition-colors cursor-pointer ${
            isWishlisted ? 'bg-[#D31F3A] border-[#d3122f] text-white' : 'bg-white text-stone-800 hover:bg-[#d3122f] hover:text-white'

          }`}
          aria-label="Add to wishlist"
        >
          <IoHeartOutline className={`w-5 h-5 ${isItInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Add to cart Button */}
        <button
          onClick={() =>
            addItem({
              slug: productId,
              name: productData.name,
              price: productData.priceNum,
              image: productData.image,
              color: '',
              size: '',
              variantId: variantId,
              quantity,
            })
          }
          className="flex-1 min-w-[180px] sm:min-w-[220px] px-6 sm:px-10 py-4 whitespace-nowrap bg-[#D31F3A] text-white hover:bg-opacity-95 font-gotham text-sm font-semibold uppercase tracking-wider rounded-full outline outline-1 outline-offset-[-1px] outline-orange-50 flex justify-center items-center shadow-md transition-all cursor-pointer"
        >
          Add to cart
        </button>

        {/* Add to cart Button */}
        <button
          className="flex-1 min-w-[180px] sm:min-w-[220px] px-6 sm:px-10 py-4 whitespace-nowrap bg-[#D31F3A] text-white hover:bg-opacity-95 font-gotham text-sm font-semibold uppercase tracking-wider rounded-full outline outline-1 outline-offset-[-1px] outline-orange-50 flex justify-center items-center shadow-md transition-all cursor-pointer"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
