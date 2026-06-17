"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth-context";
import { type ShopProduct, type DBProduct, type ProductVariant, type ProductMedia, resolveImageUrl } from "@/app/_components/products";

type WishlistContextValue = {
  wishlistItems: ShopProduct[];
  itemCount: number;
  toggleWishlist: (product: ShopProduct) => Promise<void>;
  isInWishlist: (productId?: string) => boolean;
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

interface BackendWishlistItem {
  id: string;
  productId: string;
  product: DBProduct;
}

function mapBackendWishlistItem(item: BackendWishlistItem): ShopProduct {
  const p = item.product;
  const defaultVariant = p.variants?.find((v: ProductVariant) => v.isDefault) || p.variants?.[0];
  const price = defaultVariant ? Number(defaultVariant.price) : 0;

  let color = "Black";
  let size = "M";

  if (defaultVariant?.attributes) {
    for (const attr of defaultVariant.attributes) {
      const val = attr.attributeValue?.value;
      if (!val) continue;
      const attrName = attr.attributeValue?.attribute?.name?.toLowerCase();
      if (attrName === "size" || ["S", "M", "L", "XL", "XXL"].includes(val)) {
        size = val;
      } else {
        color = val;
      }
    }
  }

  const featuredMedia = p.media?.find((m: ProductMedia) => m.isFeatured) || p.media?.[0];
  const image = resolveImageUrl(featuredMedia?.media?.url);

  const allColors = new Set<string>();
  const allSizes = new Set<string>();
  if (p.variants) {
    for (const v of p.variants) {
      if (v.attributes) {
        for (const attr of v.attributes) {
          const val = attr.attributeValue?.value;
          const name = attr.attributeValue?.attribute?.name?.toLowerCase();
          if (val) {
            if (name === "size" || ["S", "M", "L", "XL", "XXL"].includes(val)) {
              allSizes.add(val);
            } else {
              allColors.add(val);
            }
          }
        }
      }
    }
  }

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category?.name || "Football Corner",
    team: p.brand?.name || "Juventus",
    price,
    color,
    size,
    image,
    variantId: defaultVariant?.id,
    colors: Array.from(allColors),
    sizes: Array.from(allSizes),
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api/v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<ShopProduct[]>([]);

  useEffect(() => {
    if (!token) {
      try {
        const saved = sessionStorage.getItem("humana-wishlist");
        setWishlistItems(saved ? (JSON.parse(saved) as ShopProduct[]) : []);
      } catch {
        setWishlistItems([]);
      }
      return;
    }

    async function syncWishlist() {
      try {
        const local = sessionStorage.getItem("humana-wishlist");
        const localItems: ShopProduct[] = local ? JSON.parse(local) : [];

        if (localItems.length > 0) {
          for (const item of localItems) {
            if (item.id) {
              await fetch(`${BASE_URL}/wishlist`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId: item.id }),
              });
            }
          }
          sessionStorage.removeItem("humana-wishlist");
        }

        const res = await fetch(`${BASE_URL}/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const mapped = (data || []).map(mapBackendWishlistItem);
          setWishlistItems(mapped);
        }
      } catch (err) {
        console.error("Failed to sync wishlist with server:", err);
      }
    }

    syncWishlist();
  }, [token]);

  useEffect(() => {
    if (!token) {
      sessionStorage.setItem("humana-wishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, token]);

  const value = useMemo<WishlistContextValue>(() => {
    const itemCount = wishlistItems.length;

    const isInWishlist = (productId?: string) => {
      if (!productId) return false;
      return wishlistItems.some((item) => item.id === productId);
    };

    const toggleWishlist = async (product: ShopProduct) => {
      if (!product.id) return;

      const isItemInWishlist = isInWishlist(product.id);

      if (token) {
        try {
          if (isItemInWishlist) {
            const res = await fetch(`${BASE_URL}/wishlist/${product.id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (res.ok) {
              setWishlistItems((curr) => curr.filter((item) => item.id !== product.id));
            }
          } else {
            const res = await fetch(`${BASE_URL}/wishlist`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ productId: product.id }),
            });
            if (res.ok) {
              const data = await res.json();
              const mapped = mapBackendWishlistItem(data);
              setWishlistItems((curr) => [mapped, ...curr]);
            }
          }
        } catch (err) {
          console.error("Failed to toggle wishlist item on server:", err);
        }
      } else {
        setWishlistItems((curr) => {
          if (isItemInWishlist) {
            return curr.filter((item) => item.id !== product.id);
          } else {
            return [product, ...curr];
          }
        });
      }
    };

    const clearWishlist = () => {
      setWishlistItems([]);
    };

    return {
      wishlistItems,
      itemCount,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
    };
  }, [wishlistItems, token]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return context;
}
