// app/profile/wishlist/page.tsx
'use client';

import { useWishlist } from '@/app/_components/wishlist-context';
import { useCart } from '@/app/_components/cart-context';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
        <p className="text-gray-600 mb-6">Your wishlist is empty.</p>
        <Link 
          href="/shop" 
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Wishlist ({wishlistItems.length} items)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="relative aspect-[4/5] bg-gray-100">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-3">€{item.price?.toFixed(2)}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => toggleWishlist(item)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
                >
                  <FiTrash2 className="text-red-600" />
                  Remove
                </button>
                
                <button
                  type="button"
                  onClick={() =>
                    addItem({
                      slug: item.slug ?? '',
                      name: item.name,
                      price: item.price,
                      image: item.image,
                      color: item.color,
                      size: item.size,
                      variantId: item.variantId,
                      quantity: 1,
                    })
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition text-sm"
                >
                  <FiShoppingBag />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}