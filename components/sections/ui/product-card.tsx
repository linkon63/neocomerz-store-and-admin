import Image from 'next/image';
import Link from 'next/link';
import type { ProductCardProps } from '@/data/types';

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
}: ProductCardProps) {
  return (
    <div className="relative w-full bg-white border border-stone-100 gap-8 overflow-hidden flex flex-col justify-start items-start group shadow-sm hover:shadow-md transition-shadow duration-300 mx-auto">
      {/* Decorative Border Frame PNG Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <Image
          src="/images/products/product-card-border.png"
          alt="Product Card Border"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-fill"
        />
      </div>

      {/* Card Content */}
      <div className="w-full h-full flex flex-col justify-start items-start">
        {/* Product Image */}
        {id ? (
          <Link href={`/products/${id}`} className="self-stretch h-[290px] flex flex-col justify-center items-center relative overflow-hidden cursor-pointer w-full">
            <Image
              src={image || '/images/no-image-icon-6.png'}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
          </Link>
        ) : (
          <div className="self-stretch h-[290px]  flex flex-col justify-center items-center relative overflow-hidden w-full">
            <Image
              src={image || '/images/no-image-icon-6.png'}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
          </div>
        )}

        {/* Card Body */}
        <div className="self-stretch px-6 md:px-9 pt-4 pb-6 md:pb-9 flex flex-col justify-between z-20 w-full relative">
          {/* Heart Icon - Top Right */}
          <div className="absolute top-4 right-6 md:right-9">
            <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all">
              <svg className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Bottom Section - Title and Price */}
          <div className="w-full flex justify-between items-end gap-4 mt-8">
            {/* Product Title - Bottom Left */}
            <div className="flex-1">
              {id ? (
                <Link href={`/products/${id}`} className="cursor-pointer">
                  <h3 className="text-stone-800 hover:text-brand-3 transition-colors duration-200 text-lg md:text-xl lg:text-2xl font-normal font-gotham line-clamp-2 leading-tight">
                    {name}
                  </h3>
                </Link>
              ) : (
                <h3 className="text-stone-800 text-lg md:text-xl lg:text-2xl font-normal font-gotham leading-tight">
                  {name}
                </h3>
              )}
            </div>

            {/* Pricing and VAT - Bottom Right */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex justify-end items-baseline gap-2">
                <span className="text-stone-800 text-lg md:text-xl font-semibold font-gotham whitespace-nowrap">
                  {price}
                </span>
                <span className="text-stone-400 text-sm md:text-base font-normal font-gotham line-through whitespace-nowrap">
                  {originalPrice}
                </span>
              </div>
              <span className="text-stone-400 text-xs font-medium font-gotham whitespace-nowrap">
                VAT Included
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
