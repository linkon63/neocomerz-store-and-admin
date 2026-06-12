"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./auth-context";
import { type DBProduct, type ProductVariant, type ProductMedia, resolveImageUrl } from "../shop/products";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  id?: string;
  variantId?: string;
};

interface BackendCartItem {
  id: string;
  variantId: string;
  quantity: number;
  variant: ProductVariant & {
    product: DBProduct;
  };
}

type AddToCartInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: AddToCartInput) => Promise<void>;
  removeItem: (slug: string) => Promise<void>;
  updateQuantity: (slug: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function mapBackendCartItem(item: BackendCartItem): CartItem {
  const variant = item.variant;
  const product = variant.product;

  let color = "Black";
  let size = "M";

  if (variant.attributes) {
    for (const attr of variant.attributes) {
      const val = attr.attributeValue?.value;
      if (!val) continue;
      if (["S", "M", "L", "XL", "XXL"].includes(val)) {
        size = val;
      } else {
        color = val;
      }
    }
  }

  const featuredMedia = product.media?.find((m: ProductMedia) => m.isFeatured) || product.media?.[0];
  const image = resolveImageUrl(featuredMedia?.media?.url);

  return {
    id: item.id,
    variantId: item.variantId,
    slug: product.slug,
    name: product.name,
    price: Number(variant.price),
    image,
    color,
    size,
    quantity: item.quantity,
  };
}

function sortCartItems(items: CartItem[]): CartItem[] {
  return [...items].sort((a, b) => {
    const keyA = a.id || a.variantId || a.slug;
    const keyB = b.id || b.variantId || b.slug;
    return keyA.localeCompare(keyB);
  });
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api/v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!token) {
      try {
        const savedCart = sessionStorage.getItem("humana-cart");
        setItems(sortCartItems(savedCart ? (JSON.parse(savedCart) as CartItem[]) : []));
      } catch {
        setItems([]);
      }
      return;
    }

    async function syncCart() {
      try {
        const localCart = sessionStorage.getItem("humana-cart");
        const localItems: CartItem[] = localCart ? JSON.parse(localCart) : [];

        if (localItems.length > 0) {
          for (const item of localItems) {
            if (item.variantId) {
              await fetch(`${BASE_URL}/cart/items`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  variantId: item.variantId,
                  quantity: item.quantity,
                }),
              });
            }
          }
          sessionStorage.removeItem("humana-cart");
        }

        const res = await fetch(`${BASE_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const mapped = (data.items || []).map(mapBackendCartItem);
          setItems(sortCartItems(mapped));
        }
      } catch (err) {
        console.error("Error syncing cart with database:", err);
      }
    }

    syncCart();
  }, [token]);

  useEffect(() => {
    if (!token) {
      sessionStorage.setItem("humana-cart", JSON.stringify(items));
    }
  }, [items, token]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      addItem: async (item) => {
        if (token) {
          try {
            if (!item.variantId) {
              console.error("Cannot add item to server cart: missing variantId");
              return;
            }
            const res = await fetch(`${BASE_URL}/cart/items`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                variantId: item.variantId,
                quantity: item.quantity ?? 1,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              const mapped = (data.items || []).map(mapBackendCartItem);
              setItems(sortCartItems(mapped));
              toast.success("Added to cart");
            }
          } catch (err) {
            console.error("Error adding item to server cart:", err);
          }
        } else {
          setItems((currentItems) => {
            const existingItem = currentItems.find((cartItem) => cartItem.slug === item.slug);

            if (existingItem) {
              return sortCartItems(currentItems.map((cartItem) =>
                cartItem.slug === item.slug
                  ? { ...cartItem, quantity: cartItem.quantity + (item.quantity ?? 1) }
                  : cartItem,
              ));
            }

            return sortCartItems([...currentItems, { ...item, quantity: item.quantity ?? 1 }]);
          });
          toast.success("Added to cart");
        }
      },
      removeItem: async (slug) => {
        if (token) {
          try {
            const itemToRemove = items.find((item) => item.slug === slug);
            if (itemToRemove && itemToRemove.id) {
              const res = await fetch(`${BASE_URL}/cart/items/${itemToRemove.id}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (res.ok) {
                const data = await res.json();
                const mapped = (data.items || []).map(mapBackendCartItem);
                setItems(sortCartItems(mapped));
              }
            }
          } catch (err) {
            console.error("Error removing item from server cart:", err);
          }
        } else {
          setItems((currentItems) => currentItems.filter((item) => item.slug !== slug));
        }
      },
      updateQuantity: async (slug, quantity) => {
        if (token) {
          try {
            const itemToUpdate = items.find((item) => item.slug === slug);
            if (itemToUpdate && itemToUpdate.id) {
              if (quantity <= 0) {
                const res = await fetch(`${BASE_URL}/cart/items/${itemToUpdate.id}`, {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                if (res.ok) {
                  const data = await res.json();
                  const mapped = (data.items || []).map(mapBackendCartItem);
                  setItems(sortCartItems(mapped));
                }
              } else {
                const res = await fetch(`${BASE_URL}/cart/items/${itemToUpdate.id}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ quantity }),
                });
                if (res.ok) {
                  const data = await res.json();
                  const mapped = (data.items || []).map(mapBackendCartItem);
                  setItems(sortCartItems(mapped));
                }
              }
            }
          } catch (err) {
            console.error("Error updating item quantity in server cart:", err);
          }
        } else {
          setItems((currentItems) =>
            sortCartItems(currentItems
               .map((item) => (item.slug === slug ? { ...item, quantity } : item))
               .filter((item) => item.quantity > 0)),
          );
        }
      },
      clearCart: async () => {
        if (token) {
          try {
            const res = await fetch(`${BASE_URL}/cart/clear`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (res.ok) {
              setItems([]);
            }
          } catch (err) {
            console.error("Error clearing server cart:", err);
          }
        } else {
          setItems([]);
        }
      },
    };
  }, [items, token]);

  return (
    <CartContext.Provider value={value}>
      {children}
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
