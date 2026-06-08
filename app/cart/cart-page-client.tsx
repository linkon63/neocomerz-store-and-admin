"use client";

import Image from "next/image";
import Link from "next/link";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useCart } from "../_components/cart-context";

function formatPrice(price: number) {
  return `€${price.toFixed(2)}`;
}

export default function CartPageClient() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <main className="min-h-screen bg-white px-4 py-16 text-[#151515] sm:px-8">
      <section className="mx-auto max-w-[1200px]">
        <p className="text-xs font-bold uppercase tracking-[0.14em]">Cart</p>
        <h1 className="mt-4 font-bembo text-5xl font-bold">Shopping cart</h1>

        {items.length === 0 ? (
          <div className="mt-10 border border-neutral-200 px-6 py-12">
            <h2 className="text-xl font-black">Your shopping bag is empty</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
              Add archive pieces from the shop and review them here before checkout.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
            <div className="space-y-5">
              {items.map((item) => (
                <article key={item.slug} className="grid gap-5 border border-neutral-200 p-4 sm:grid-cols-[140px_1fr]">
                  <div className="relative aspect-square bg-neutral-50">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="140px"
                      className="object-cover p-4"
                    />
                  </div>

                  <div className="flex flex-col justify-between gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-base font-black uppercase">{item.name}</h2>
                        <p className="mt-2 text-sm text-neutral-500">
                          {item.color} · Size {item.size}
                        </p>
                        <p className="mt-3 text-base font-black">{formatPrice(item.price)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.slug)}
                        className="text-xl text-neutral-500 hover:text-black"
                        aria-label={`Remove ${item.name}`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center border border-neutral-200"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus />
                      </button>
                      <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center border border-neutral-200"
                        aria-label="Increase quantity"
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit border border-neutral-200 p-6">
              <h2 className="text-sm font-black uppercase tracking-[0.12em]">Order Summary</h2>
              <div className="mt-6 space-y-4 border-b border-neutral-200 pb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-black">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span className="font-black">Calculated at checkout</span>
                </div>
              </div>
              <div className="mt-6 flex justify-between text-lg font-black">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <button
                type="button"
                className="mt-6 w-full bg-black px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white"
              >
                Checkout
              </button>
              <button
                type="button"
                onClick={clearCart}
                className="mt-4 w-full border border-neutral-200 px-6 py-3 text-xs font-black uppercase tracking-[0.12em]"
              >
                Clear Cart
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
