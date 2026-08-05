"use client";

import Link from "next/link";
import { FiHeart, FiTrash2, FiShoppingCart } from "react-icons/fi";
import { useWishlist } from "@/app/_providers/wishlist-provider";
import { useCart } from "@/app/_providers/cart-provider";
import { toast } from "sonner";
import ResolvedImage from "./image-resolver";

const SECTION_LABEL = "text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400";

export default function WishlistView() {
  const { items, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: (typeof items)[number]) => {
    if (!item.variantId) {
      toast.error("Cannot add to cart: variant information is missing.");
      return;
    }
    addItem({
      id: item.id,
      productId: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
      description: item.description,
      quantity: 1,
      variantId: item.variantId,
      color: item.color,
      size: item.size,
    });
    toast.success(`${item.name} added to cart.`);
  };

  return (
    <div className="space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <p className={SECTION_LABEL}>Saved Items</p>
        <h2 className="font-['Bembo_Std'] text-2xl text-zinc-850 font-normal mt-1">
          My Wishlist
          {items.length > 0 && (
            <span className="ml-3 font-sans text-sm font-normal text-zinc-400">({items.length})</span>
          )}
        </h2>
        <p className="font-['Bembo_Std'] text-zinc-400 text-sm italic mt-0.5">
          Your curated selection of premium items.
        </p>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-stone-200 rounded-xl">
          <FiHeart className="text-4xl text-zinc-200 mb-4" />
          <p className="font-['Bembo_Std'] text-zinc-400 text-base italic">Your wishlist is empty.</p>
          <p className="font-sans text-xs text-zinc-300 mt-1">
            Browse our collections and save items you love.
          </p>
          <Link
            href="/products"
            className="mt-5 font-sans text-[10px] font-bold tracking-[0.16em] uppercase text-[#C5B382] hover:text-zinc-800 transition"
          >
            Explore Products →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm rounded-xl px-5 py-4 transition-all duration-200"
            >
              {/* Product image */}
              <Link href={`/products/${item.id}`} className="shrink-0 w-16 h-16 bg-stone-50 border border-stone-100 rounded-lg overflow-hidden relative">
                <ResolvedImage
                  src={item.image}
                  alt={item.name}
                  className="object-contain p-1.5 w-full h-full"
                />
              </Link>

              {/* Info */}
              <div className="flex-grow min-w-0">
                <Link href={`/products/${item.id}`} className="group/name">
                  <p className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-800 truncate group-hover/name:text-[#C5B382] transition-colors">
                    {item.name}
                  </p>
                </Link>
                <p className="font-sans text-sm text-zinc-700 font-semibold mt-1">
                  ৳{Number(item.price || 0).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-stone-800 text-white font-sans text-[10px] font-bold tracking-[0.14em] uppercase px-5 py-2.5 rounded-full transition cursor-pointer shadow-sm"
                  title="Add to cart"
                >
                  <FiShoppingCart className="text-xs" />
                  <span className="hidden sm:inline">Add to Cart</span>
                </button>

                <button
                  onClick={() => toggleWishlist(item)}
                  className="w-9 h-9 flex items-center justify-center border border-stone-200 hover:border-red-200 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-full transition cursor-pointer"
                  aria-label={`Remove ${item.name} from wishlist`}
                  title="Remove from wishlist"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
