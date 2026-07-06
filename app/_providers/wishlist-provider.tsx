"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { getCustomerToken } from "@/lib/storefront-api";
import { resolveImageUrl } from "@/lib/admin-api";
import type { WishlistProduct, BackendWishlistItem, WishlistContextValue } from "@/lib/types";
import { useAuth } from "./auth-provider";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

const WishlistContext = createContext<WishlistContextValue | null>(null);

function mapBackendItem(item: BackendWishlistItem): WishlistProduct {
  const p = item.product;
  const defaultVariant = p.variants?.find((v) => v.isDefault) ?? p.variants?.[0];
  const featured = p.media?.find((m) => m.isFeatured);
  const first = p.media?.[0];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(defaultVariant?.price ?? p.price ?? 0),
    image: resolveImageUrl(featured?.media.url ?? first?.media.url ?? ""),
    color: defaultVariant?.attributes?.Color ?? defaultVariant?.attributes?.Colour ?? "",
    size: defaultVariant?.attributes?.Size ?? defaultVariant?.attributes?.size ?? "",
    category: p.category?.name ?? "",
    team: p.brand?.name ?? "",
    variantId: defaultVariant?.id,
  };
}

async function authenticatedRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getCustomerToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      authenticatedRequest<BackendWishlistItem[]>("/wishlist")
        .then((data) => setItems(data.map(mapBackendItem)))
        .catch(() => setItems([]));
    } else {
      setItems([]);
    }
  }, [isAuthenticated]);

  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.id === productId),
    [items],
  );

  const toggleWishlist = useCallback(
    (product: WishlistProduct) => {
      const token = getCustomerToken();
      if (!token) return;

      const exists = items.some((i) => i.id === product.id);

      if (exists) {
        authenticatedRequest(`/wishlist/${product.id}`, { method: "DELETE" })
          .then(() => {
            setItems((prev) => prev.filter((i) => i.id !== product.id));
            toast.success("Removed from wishlist");
          })
          .catch(() => toast.error("Failed to update wishlist"));
      } else {
        authenticatedRequest<BackendWishlistItem>("/wishlist", {
          method: "POST",
          body: JSON.stringify({ productId: product.id }),
        })
          .then((serverItem) => {
            setItems((prev) => [mapBackendItem(serverItem), ...prev]);
            toast.success("Added to wishlist");
          })
          .catch(() => toast.error("Failed to update wishlist"));
      }
    },
    [items],
  );

  const clearWishlist = useCallback(() => {
    const token = getCustomerToken();
    if (!token) return;

    Promise.all(items.map((i) =>
      authenticatedRequest(`/wishlist/${i.id}`, { method: "DELETE" }),
    ))
      .then(() => {
        setItems([]);
        toast.success("Wishlist cleared");
      })
      .catch(() => toast.error("Failed to clear wishlist"));
  }, [items]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
