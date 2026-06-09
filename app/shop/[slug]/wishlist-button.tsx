"use client";

import { FiHeart } from "react-icons/fi";
import { useWishlist } from "../../_components/wishlist-context";
import { type ShopProduct } from "../products";

export default function WishlistButton({ product }: { product: ShopProduct }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isSaved = product.id ? isInWishlist(product.id) : false;

  return (
    <button
      onClick={() => toggleWishlist(product)}
      className="ml-1 inline-flex items-center gap-2 text-xs font-black uppercase hover:text-red-500 transition-colors"
      type="button"
    >
      <FiHeart className={`text-lg ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
      {isSaved ? "Saved to wishlist" : "Add to wishlist"}
    </button>
  );
}
