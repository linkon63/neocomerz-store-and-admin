"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/_providers/auth-provider";
import {
  getCart,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  mapBackendCart,
} from "@/lib/cart-api";
import type { CartItem, CartContextValue } from "@/lib/types";

const STORAGE_KEY = "humana-cart";

const CartContext = createContext<CartContextValue | null>(null);

function sortItems(items: CartItem[]): CartItem[] {
  return [...items].sort((a, b) => (a.slug ?? "").localeCompare(b.slug ?? ""));
}

function loadLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function clearLocalCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [initialised, setInitialised] = useState(false);
  const prevAuth = useRef(isAuthenticated);

  const fetchServerCart = useCallback(async () => {
    try {
      const data = await getCart();
      setItems(mapBackendCart(data));
    } catch {
      setItems([]);
    }
  }, []);

  const mergeLocalCartToServer = useCallback(async () => {
    const local = loadLocalCart();
    if (local.length === 0) {
      await fetchServerCart();
      return;
    }
    try {
      for (const item of local) {
        if (item.variantId) {
          await addCartItem(item.variantId, item.quantity);
        }
      }
    } catch {
      /* merge silently — fetch will get actual state */
    }
    clearLocalCart();
    await fetchServerCart();
  }, [fetchServerCart]);

  useEffect(() => {
    if (initialised) return;

    if (isAuthenticated) {
      mergeLocalCartToServer().finally(() => setInitialised(true));
    } else {
      setItems(loadLocalCart());
      setInitialised(true);
    }
  }, [isAuthenticated, initialised, mergeLocalCartToServer]);

  useEffect(() => {
    if (!initialised) return;

    const authed = isAuthenticated;
    const was = prevAuth.current;
    prevAuth.current = authed;

    if (authed && !was) {
      mergeLocalCartToServer();
    } else if (!authed && was) {
      saveLocalCart(items);
      setItems(loadLocalCart());
    }
  }, [isAuthenticated, initialised, items, mergeLocalCartToServer]);

  const addItem = useCallback(
    (input: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      if (isAuthenticated) {
        const qty = input.quantity ?? 1;
        const vId = input.variantId;
        if (!vId) {
          toast.error("Cannot add item: missing variant");
          return;
        }
        addCartItem(vId, qty)
          .then((data) => {
            setItems(mapBackendCart(data));
            toast.success("Added to cart");
          })
          .catch((err: Error) => toast.error(err.message));
      } else {
        setItems((prev) => {
          const existing = prev.find((i) => i.slug === input.slug);
          const next = existing
            ? sortItems(
                prev.map((i) =>
                  i.slug === input.slug
                    ? { ...i, quantity: i.quantity + (input.quantity ?? 1) }
                    : i,
                ),
              )
            : sortItems([...prev, { ...input, quantity: input.quantity ?? 1 } as CartItem]);
          saveLocalCart(next);
          return next;
        });
        toast.success("Added to cart");
      }
    },
    [isAuthenticated],
  );

  const removeItem = useCallback(
    (slug: string) => {
      if (isAuthenticated) {
        const target = items.find((i) => i.slug === slug);
        const cartItemId = target?.id;
        if (!cartItemId) return;
        removeCartItem(cartItemId)
          .then((data) => {
            setItems(mapBackendCart(data));
            toast.success("Removed from cart");
          })
          .catch((err: Error) => toast.error(err.message));
      } else {
        setItems((prev) => {
          const next = prev.filter((i) => i.slug !== slug);
          saveLocalCart(next);
          return next;
        });
        toast.success("Removed from cart");
      }
    },
    [isAuthenticated, items],
  );

  const updateQuantity = useCallback(
    (slug: string, quantity: number) => {
      if (isAuthenticated) {
        if (quantity <= 0) {
          removeItem(slug);
          return;
        }
        const target = items.find((i) => i.slug === slug);
        const cartItemId = target?.id;
        if (!cartItemId) return;
        updateCartItemQuantity(cartItemId, quantity)
          .then((data) => setItems(mapBackendCart(data)))
          .catch((err: Error) => toast.error(err.message));
      } else {
        setItems((prev) => {
          if (quantity <= 0) {
            const next = prev.filter((i) => i.slug !== slug);
            saveLocalCart(next);
            return next;
          }
          const next = prev.map((i) =>
            i.slug === slug ? { ...i, quantity } : i,
          );
          saveLocalCart(next);
          return next;
        });
      }
    },
    [isAuthenticated, items, removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    if (!isAuthenticated) {
      clearLocalCart();
    }
    toast.success("Cart cleared");
  }, [isAuthenticated]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
