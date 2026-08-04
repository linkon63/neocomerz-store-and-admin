"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { ProductCardProps } from '@/data/types';
import { useWishlist } from '@/app/_providers/wishlist-provider';
import { useAuth } from '@/app/_providers/auth-provider';
import type { WishlistProduct } from '@/lib/types';

const NO_IMAGE = '/images/no-image-icon-6.png';

function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const target = e.currentTarget;
  if (target.src !== NO_IMAGE) {
    target.src = NO_IMAGE;
  }
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  slug,
}: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, setShowAuthModal } = useAuth();
  const inWishlist = !!id && isInWishlist(id);
  const priceNum = parseFloat(price.replace(/[^0-9.-]/g, '')) || 0;

  const wishlistProduct: WishlistProduct = {
    id: id ?? '',
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    price: priceNum,
    image: image || NO_IMAGE,
    color: '',
    size: '',
    category: '',
    team: '',
  };

  return (
    <div className="relative z-0 w-full bg-white border border-stone-100 gap-8 overflow-hidden flex flex-col justify-start items-start group shadow-xs hover:shadow-lg transition-all duration-300 mx-auto">
      {/* Decorative Border Overlay */}
      <div className="absolute inset-2 pointer-events-none z-30">
        <Image
          src="/images/products/product-card-border.png"
          alt="Product Card Border"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-fill"
        />
      </div>

      {(slug || id) && (
        <Link
          href={`/products/${slug || id}`}
          className="absolute inset-0 z-20 cursor-pointer"
          aria-label={`View details for ${name}`}
        />
      )}

      <div className="w-full h-full flex flex-col justify-start items-start">
        <div className="self-stretch h-[290px] p-2 flex flex-col justify-center items-center relative overflow-hidden w-full z-0">
          <div className="w-full h-full relative overflow-hidden rounded-xs">
            <Image
              src={image || NO_IMAGE}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out transform-gpu"
              onError={handleImageError}
            />
          </div>
        </div>

        <div className="self-stretch px-6 md:px-9 pt-4 pb-6 md:pb-9 flex flex-col justify-between w-full relative">
          <div className="absolute top-4 right-4 md:right-6 z-40">
            <button
              onClick={() => id && (isAuthenticated ? toggleWishlist(wishlistProduct) : setShowAuthModal(true))}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all cursor-pointer"
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg
                className={`w-5 h-5 transition-colors ${
                  inWishlist ? 'text-brand-primary fill-brand-primary' : 'text-gray-600'
                }`}
                fill={inWishlist ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <div className="w-full flex justify-between items-start gap-4 mt-12">
            <div className="flex-1">
              <h3 className="text-stone-855 hover:text-brand-3 transition-colors duration-200 text-sm sm:text-base md:text-[17px] font-normal font-gotham line-clamp-2 leading-snug">
                {name}
              </h3>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex justify-end items-baseline gap-2">
                <span className="text-stone-855 text-sm sm:text-base md:text-[17px] font-normal font-gotham whitespace-nowrap">
                  {price}
                </span>
                {originalPrice && (
                  <span className="text-stone-400 text-xs sm:text-sm font-normal font-gotham line-through whitespace-nowrap">
                    {originalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
