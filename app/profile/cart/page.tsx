// app/profile/cart/page.tsx
'use client';

import { useCart } from '@/app/_components/cart-context';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600 mb-6">Your cart is empty.</p>
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
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>
      
      <div className="space-y-4">
        {items.filter(item => item.slug).map((item) => (
          <div key={item.slug} className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="relative w-24 h-32 bg-gray-100 rounded flex-shrink-0">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{item.name}</h3>
              {item.color && <p className="text-sm text-gray-600 mb-1">Color: {item.color}</p>}
              {item.size && <p className="text-sm text-gray-600 mb-2">Size: {item.size}</p>}
              <p className="font-semibold">€{item.price?.toFixed(2)}</p>
              
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => updateQuantity(item.slug!, Math.max(1, item.quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                  aria-label="Decrease quantity"
                >
                  <FiMinus className="text-xs" />
                </button>
                <span className="w-12 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.slug!, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                  aria-label="Increase quantity"
                >
                  <FiPlus className="text-xs" />
                </button>
                
                <button
                  onClick={() => removeItem(item.slug!)}
                  className="ml-auto flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                >
                  <FiTrash2 />
                  Remove
                </button>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold">€{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-6 border-t border-gray-200 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Subtotal</span>
          <span className="text-xl font-bold">€{subtotal.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">Shipping and taxes calculated at checkout</p>
        <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition font-medium">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}