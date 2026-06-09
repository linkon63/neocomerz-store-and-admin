"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
};

type AddToCartInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: AddToCartInput) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const savedCart = window.localStorage.getItem("humana-cart");
      return savedCart ? (JSON.parse(savedCart) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem("humana-cart", JSON.stringify(items));
  }, [items]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      addItem: (item) => {
        setItems((currentItems) => {
          const existingItem = currentItems.find((cartItem) => cartItem.slug === item.slug);

          if (existingItem) {
            return currentItems.map((cartItem) =>
              cartItem.slug === item.slug
                ? { ...cartItem, quantity: cartItem.quantity + (item.quantity ?? 1) }
                : cartItem,
            );
          }

          return [...currentItems, { ...item, price: Number(item.price), quantity: item.quantity ?? 1 }];
        });
        showToast("Item added to cart");
      },
      removeItem: (slug) => {
        setItems((currentItems) => currentItems.filter((item) => item.slug !== slug));
      },
      updateQuantity: (slug, quantity) => {
        setItems((currentItems) =>
          currentItems
            .map((item) => (item.slug === slug ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        );
      },
      clearCart: () => setItems([]),
    };
  }, [items, showToast]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <div
        className={`fixed bottom-6 right-6 z-[100] rounded-full bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white shadow-xl transition-all duration-300 ${
          toastMessage ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        {toastMessage}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
