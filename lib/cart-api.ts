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
  
  // Try to find image from variant media
  const vMedia = item.variant.media;
  const vFeatured = vMedia?.find((m) => m.isFeatured);
  const vFirst = vMedia?.[0];
  const variantMediaUrl = vFeatured?.media?.url ?? vFirst?.media?.url;

  // Fallback to product media
  const pFeatured = p.media?.find((m) => m.isFeatured);
  const pFirst = p.media?.[0];
  const finalImageUrl = variantMediaUrl ?? pFeatured?.media?.url ?? pFirst?.media?.url ?? "";

  // Parse attributes array into key-value map
  const attributesMap: Record<string, string> = {};
  item.variant.attributes?.forEach((attr) => {
    const attrName = attr.attributeValue?.attribute?.name;
    const attrVal = attr.attributeValue?.value;
    if (attrName && attrVal) {
      attributesMap[attrName] = attrVal;
    }
  });

  const optionSummary = Object.values(attributesMap).filter(Boolean).join(", ");
  const finalName = optionSummary ? `${p.name} (${optionSummary})` : p.name;

  const priceNum = Number(item.variant.price);
  const variantDiscounted = item.variant.discountedPrice;
  const productDiscounted = (p as { discountPrice?: string | number | null }).discountPrice;
  const discountNum = Number(variantDiscounted ?? productDiscounted ?? 0);
  const showOriginal = discountNum > 0 && discountNum < priceNum;

  return {
    id: item.id,
    slug: p.slug,
    name: finalName,
    price: showOriginal ? discountNum : priceNum,
    image: resolveImageUrl(finalImageUrl),
    description: p.description ?? '',
    color: attributesMap.Color ?? attributesMap.Colour ?? attributesMap.color ?? '',
    size: attributesMap.Size ?? attributesMap.size ?? '',
    quantity: item.quantity,
    productId: p.id,
    variantId: item.variantId,
    attributes: attributesMap,
    ...attributesMap,
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

export function updateCartItemApi(
  cartItemId: string,
  updates: { quantity?: number; variantId?: string },
): Promise<BackendCartResponse> {
  return authFetch<BackendCartResponse>(`/cart/items/${cartItemId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function removeCartItem(
  cartItemId: string,
): Promise<BackendCartResponse> {
  return authFetch<BackendCartResponse>(`/cart/items/${cartItemId}`, {
    method: "DELETE",
  });
}
