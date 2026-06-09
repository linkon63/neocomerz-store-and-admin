"use client";

import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { useCart } from "./cart-context";
import { useWishlist } from "./wishlist-context";
import { productSlug, type ShopProduct } from "../shop/products";

export default function ProductCard({ product, viewMode = "grid" }: { product: ShopProduct; viewMode?: "grid" | "list" }) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  return (
    <article className={viewMode === "grid" ? "group" : "group grid gap-5 sm:grid-cols-[220px_1fr]"}>
      <div className="relative group/image overflow-hidden border border-neutral-100 bg-white">
        <Link href={`/shop/${productSlug(product)}`} className="block">
          <div className={viewMode === "grid" ? "relative aspect-square" : "relative aspect-square sm:h-full"}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 45vw, 50vw"
              className="object-cover object-center p-6 transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addItem({
              slug: productSlug(product),
              name: product.name,
              price: product.price,
              image: product.image,
              color: product.color,
              size: product.size,
              variantId: product.variantId,
            });
          }}
          className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg border border-neutral-200 transition-all duration-300 opacity-0 scale-90 group-hover/image:opacity-100 group-hover/image:scale-100 hover:bg-black hover:text-white"
          title="Add to Cart"
        >
          <FiShoppingBag className="text-base" />
        </button>
      </div>

      <div className={viewMode === "grid" ? "mt-4 flex items-start justify-between gap-3" : "flex items-start justify-between gap-4 py-2"}>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase text-neutral-400">
            {product.category}, {product.team}, {product.color}, Size {product.size}
          </p>
          <h3 className="mt-1 truncate text-sm font-black uppercase text-neutral-800">
            {product.name}
          </h3>
          {viewMode === "list" && (
            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
              A curated vintage football piece from the Humana archive, selected for condition,
              color, and everyday styling.
            </p>
          )}
          <p className="mt-2 text-base font-black text-neutral-800">
            €{product.price.toFixed(2)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          className="mt-1 shrink-0 text-lg hover:text-red-500 transition-colors"
          aria-label="Add to wishlist"
        >
          <FiHeart className={product.id && isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-neutral-600"} />
        </button>
      </div>
    </article>
  );
}
