import { getCustomerToken } from "@/lib/storefront-api";
import { resolveImageUrl } from "@/lib/admin-api";
import type { BackendCartResponse, BackendCartItem, CartItem } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
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

export function mapBackendCartItem(item: BackendCartItem): CartItem {
  const p = item.variant.product;
  const featured = p.media?.find((m) => m.isFeatured);
  const first = p.media?.[0];
  return {
    id: item.id,
    slug: p.slug,
    name: p.name,
    price: Number(item.variant.price),
    image: resolveImageUrl(featured?.media.url ?? first?.media.url ?? ""),
    color: "",
    size: "",
    quantity: item.quantity,
    productId: p.id,
    variantId: item.variantId,
  };
}

export function mapBackendCart(response: BackendCartResponse): CartItem[] {
  return response.items.map(mapBackendCartItem);
}

export function getCart(): Promise<BackendCartResponse> {
  return authFetch<BackendCartResponse>("/cart");
}

export function addCartItem(
  variantId: string,
  quantity: number,
): Promise<BackendCartResponse> {
  return authFetch<BackendCartResponse>("/cart/items", {
    method: "POST",
    body: JSON.stringify({ variantId, quantity }),
  });
}

export function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<BackendCartResponse> {
  return authFetch<BackendCartResponse>(`/cart/items/${cartItemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(
  cartItemId: string,
): Promise<BackendCartResponse> {
  return authFetch<BackendCartResponse>(`/cart/items/${cartItemId}`, {
    method: "DELETE",
  });
}
