"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/app/_providers/wishlist-provider";
import { useCart } from "@/app/_providers/cart-provider";
import { useCurrency } from "@/lib/currency-context";
import { LuTrash2, LuShoppingBag, LuHeart } from "react-icons/lu";

export default function WishlistPage() {
  const { items, itemCount, toggleWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { formatCurrency } = useCurrency();

  return (
    <main className="flex-grow bg-white w-full min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <h1 className="font-bembo text-3xl text-stone-800 mb-2">Wishlist</h1>
        <p className="text-stone-400 text-sm mb-8">
          {itemCount} {itemCount === 1 ? "item" : "items"} saved
        </p>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <LuHeart className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 font-bembo text-xl mb-6">
              Your wishlist is empty.
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-stone-800 text-white text-sm font-semibold uppercase tracking-wider hover:bg-stone-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((product) => (
              <div
                key={product.id}
                className="flex flex-wrap items-center gap-4 p-4 border border-stone-200 rounded-lg"
              >
                
                <div className="w-20 h-20 sm:w-24 sm:h-24 relative bg-stone-50 rounded shrink-0">
                  <Image
                    src={product.image || "/images/no-image-icon-6.png"}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    {product.category}
                    {product.team ? `, ${product.team}` : ""}
                  </p>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="mt-0.5 font-medium text-stone-800 truncate text-sm hover:text-brand-3 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm font-medium text-stone-800 mt-1">
                    {formatCurrency(product.price)}
                  </p>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className="mt-3 flex items-center gap-1.5 text-sm text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                    aria-label="Remove from wishlist"
                  >
                    <LuTrash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="w-full sm:w-auto shrink-0 flex sm:justify-end">
                  <button
                    onClick={() =>
                      addItem({
                        productId: product.id,
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        description: product.description,
                        color: product.color,
                        size: product.size,
                        variantId: product.variantId || product.id,
                      })
                    }
                    className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-stone-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <LuShoppingBag className="w-3.5 h-3.5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={clearWishlist}
              className="text-sm text-stone-400 hover:text-red-500 transition-colors mt-4 cursor-pointer"
            >
              Clear Wishlist
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
