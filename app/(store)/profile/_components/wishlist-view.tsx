"use client";

import { FiHeart, FiTrash2 } from "react-icons/fi";
import { useWishlist } from "@/app/_providers/wishlist-provider";
import { useCart } from "@/app/_providers/cart-provider";
import { toast } from "sonner";
import ResolvedImage from "./image-resolver";

export default function WishlistView() {
  const { items: wishlistItems, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[10px] font-bold tracking-[0.16em] uppercase text-zinc-400 mb-1">
          Wishlist
        </h2>
        <p className="font-['Bembo_Std'] text-zinc-650 text-base italic">
          Your saved selection of premium items.
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-200">
          <FiHeart className="mx-auto text-4xl text-zinc-300 mb-4 animate-pulse" />
          <p className="font-sans text-sm text-zinc-500">
            Your wishlist is empty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="border border-stone-200 p-4 flex flex-col justify-between gap-4 bg-white relative group">
              <button
                type="button"
                onClick={() => toggleWishlist(item)}
                className="absolute top-2 right-2 bg-stone-50 border border-stone-100 hover:border-red-200 hover:text-red-500 rounded-full p-2 transition z-10 cursor-pointer animate-fadeIn"
                aria-label={`Remove ${item.name} from wishlist`}
              >
                <FiTrash2 className="text-xs" />
              </button>
              
              <div className="relative w-full aspect-square bg-stone-50 flex items-center justify-center border border-stone-100">
                <ResolvedImage
                  src={item.image}
                  alt={item.name}
                  className="object-contain p-2"
                />
              </div>

              <div className="text-center space-y-1">
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-800 line-clamp-1">
                  {item.name}
                </h4>
                <p className="font-sans text-xs text-zinc-500 font-semibold">
                  ${Number(item.price).toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => {
                  addItem({
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                    price: item.price,
                    image: item.image,
                    quantity: 1,
                    variantId: item.variantId || "",
                    color: item.color,
                    size: item.size
                  });
                  toast.success("Added to cart!");
                }}
                className="w-full bg-[#1A1A1A] hover:bg-stone-850 text-white font-sans text-[10px] font-bold tracking-[0.14em] py-2.5 rounded transition uppercase cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
