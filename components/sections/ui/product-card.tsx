import Image from 'next/image';
import Link from 'next/link';

export interface ProductCardProps {
  id?: string;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
}: ProductCardProps) {
  return (
    <div className="relative w-full max-w-[453px] h-[453px] bg-white border border-stone-100 overflow-hidden flex flex-col justify-start items-start group shadow-sm hover:shadow-md transition-shadow duration-300 mx-auto">
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
          <Link href={`/products/${id}`} className="self-stretch h-[290px] bg-white flex flex-col justify-center items-center relative overflow-hidden cursor-pointer w-full">
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        ) : (
          <div className="self-stretch h-[290px] bg-white flex flex-col justify-center items-center relative overflow-hidden w-full">
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Card Body */}
        <div className="self-stretch px-9 pt-4 pb-9 bg-white flex flex-col justify-start items-start gap-1.5 z-20 w-full">
          {id ? (
            <Link href={`/products/${id}`} className="self-stretch justify-start cursor-pointer w-full">
              <h3 className="text-stone-800 hover:text-brand-3 transition-colors duration-200 text-xl font-normal font-gotham leading-6 line-clamp-2 min-h-12">
                {name}
              </h3>
            </Link>
          ) : (
            <h3 className="self-stretch justify-start text-stone-800 text-xl font-normal font-gotham leading-6 line-clamp-2 min-h-12">
              {name}
            </h3>
          )}

          <div className="self-stretch inline-flex justify-between items-center gap-1.5">
            {/* Pricing */}
            <div className="flex-grow flex flex-col justify-start items-start">
              <div className="size- inline-flex justify-start items-baseline gap-1">
                <span className="justify-start text-stone-800 text-lg font-normal font-bembo uppercase leading-6">
                  {price}
                </span>
                <span className="justify-start text-stone-400 text-lg font-normal font-bembo line-through uppercase leading-6">
                  {originalPrice}
                </span>
              </div>
              <span className="text-center justify-start text-stone-400 text-xs font-medium font-gotham leading-4 line-clamp-1">
                VAT Included
              </span>
            </div>

            {/* Gold Add to Cart Button (Round) */}
            <button className="pl-1 pr-3 py-1 bg-brand-3 hover:bg-opacity-95 text-white font-gotham text-[10px] font-semibold uppercase tracking-wider rounded-[100px] flex justify-start items-center gap-1.5 shadow-sm transition-all cursor-pointer z-30">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 relative shadow-inner">
                <Image
                  src="/images/products/Union.png"
                  alt="Union Icon"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <span>ADD TO CART</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
