// ─── Store API Client ─────────────────────────────────────────────────────────
// Handles all customer-facing API calls to the NestJS backend.
//
// In the browser we route through the Next.js rewrite proxy (/api/v1 → backend)
// to avoid CORS issues. On the server side (SSR/RSC) we hit the backend directly.

const API_BASE =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1")
    : "/api/v1";

export const STORE_CHECKOUT_COUPON_KEY = "store_checkout_coupon";

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getStoreToken(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("store_access_token="))
      ?.split("=")[1] ?? null
  );
}

export function setStoreSession(token: string, user: StoreUser) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `store_access_token=${token}; path=/store; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `store_user=${encodeURIComponent(JSON.stringify(user))}; path=/store; max-age=${maxAge}; SameSite=Lax`;
}

export function clearStoreSession() {
  document.cookie = "store_access_token=; path=/store; max-age=0; SameSite=Lax";
  document.cookie = "store_user=; path=/store; max-age=0; SameSite=Lax";
}

export function getStoredUser(): StoreUser | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((r) => r.startsWith("store_user="))
    ?.split("=")
    .slice(1)
    .join("=");
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

async function req<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = false, headers, ...rest } = options;
  const h = new Headers(headers);
  if (auth) {
    const token = getStoreToken();
    if (token) h.set("Authorization", `Bearer ${token}`);
  }
  if (!h.has("Content-Type") && rest.body && typeof rest.body === "string") {
    h.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: h });
  const ct = res.headers.get("content-type");
  const payload = ct?.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const msg =
      typeof payload === "object" && payload && "message" in payload
        ? Array.isArray(payload.message)
          ? payload.message.join(", ")
          : String(payload.message)
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return payload as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type StoreUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  children?: Category[];
};

export type Brand = { id: string; name: string; slug: string; logoUrl?: string | null };

export type ProductVariant = {
  id: string;
  sku: string;
  price: number | string;
  stockQuantity: number;
  isDefault: boolean;
  optionValues?: { value: string; attribute: { name: string } }[];
};

export type ProductMedia = {
  id: string;
  isFeatured: boolean;
  sortOrder: number;
  media: { id: string; url: string; type: "image" | "video" };
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: string;
  brand?: Brand | null;
  category?: Category | null;
  media?: ProductMedia[];
  variants?: ProductVariant[];
  tags?: { id: string; name: string }[];
  _count?: { reviews?: number };
};

export type PaginatedProducts = {
  data: Product[];
  meta: { page: number; limit: number; total: number };
};

export type CartItem = {
  id: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    price: number | string;
    product: { id: string; name: string; slug: string; media?: ProductMedia[] };
  };
};

export type Cart = {
  id: string;
  items: CartItem[];
};

export type WishlistItem = {
  id: string;
  product: Product;
};

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number | string;
  discount: number | string;
  shippingCost: number | string;
  placedAt: string;
  address?: Address;
  payments?: {
    id: string;
    method: string;
    status: "pending" | "success" | "failed" | string;
    amount: number | string;
  }[];
  items: {
    id: string;
    quantity: number;
    unitPrice: number | string;
    totalPrice: number | string;
    product: { id: string; name: string; slug: string };
    variant: { id: string; sku: string; price: number | string };
  }[];
};

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  isApproved: boolean;
  createdAt: string;
  user: { id: string; name: string };
};

export type Campaign = {
  id: string;
  title: string;
  description?: string | null;
  hasDiscount: boolean;
  startAt: string;
  endAt?: string | null;
  status: 'active' | 'inactive';
  section: {
    id: string;
    title: string;
    page: string;
    position: number;
  };
  images?: {
    id: string;
    images: string[];
  };
  discount?: {
    id: string;
    name: string;
    type: string;
    value: number;
    products?: {
      product: Product;
    }[];
  };
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    req<{ accessToken: string; user: StoreUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    req<{ accessToken: string; user: StoreUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => req<StoreUser>("/auth/me", { auth: true }),
};

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.search) qs.set("search", params.search);
    if (params?.categoryId) qs.set("categoryId", params.categoryId);
    if (params?.brandId) qs.set("brandId", params.brandId);
    if (params?.status) qs.set("status", params.status);
    if (params?.sort) qs.set("sort", params.sort);
    if (params?.minPrice) qs.set("minPrice", params.minPrice);
    if (params?.maxPrice) qs.set("maxPrice", params.maxPrice);
    return req<PaginatedProducts>(`/products?${qs}`);
  },

  bySlug: (slug: string) => req<Product>(`/products/slug/${slug}`),
  byId: (id: string) => req<Product>(`/products/${id}`),
};

// ─── Categories ───────────────────────────────────────────────────────────────


export const categoriesApi = {
  list: () => req<Category[]>("/category"),
};

// ─── Brands ───────────────────────────────────────────────────────────────────

export const brandsApi = {
  list: () => req<Brand[]>("/brands"),
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const cartApi = {
  get: () => req<Cart>("/cart", { auth: true }),
  addItem: (variantId: string, quantity: number) =>
    req<Cart>("/cart/items", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ variantId, quantity }),
    }),
  updateItem: (itemId: string, quantity: number) =>
    req<Cart>(`/cart/items/${itemId}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify({ quantity }),
    }),
  removeItem: (itemId: string) =>
    req<void>(`/cart/items/${itemId}`, { method: "DELETE", auth: true }),
  clear: () => req<void>("/cart/clear", { method: "DELETE", auth: true }),
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const wishlistApi = {
  get: () => req<WishlistItem[]>("/wishlist", { auth: true }),
  add: (productId: string) =>
    req<WishlistItem>("/wishlist", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ productId }),
    }),
  remove: (productId: string) =>
    req<void>(`/wishlist/${productId}`, { method: "DELETE", auth: true }),
};

// ─── Addresses ────────────────────────────────────────────────────────────────

export const addressApi = {
  list: () => req<Address[]>("/addresses", { auth: true }),
  create: (data: Omit<Address, "id" | "isDefault">) =>
    req<Address>("/addresses", { method: "POST", auth: true, body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Omit<Address, "id">>) =>
    req<Address>(`/addresses/${id}`, { method: "PATCH", auth: true, body: JSON.stringify(data) }),
  delete: (id: string) => req<void>(`/addresses/${id}`, { method: "DELETE", auth: true }),
  setDefault: (id: string) =>
    req<Address>(`/addresses/${id}/set-default`, { method: "PATCH", auth: true }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ordersApi = {
  myOrders: () => req<Order[]>("/orders/my-orders", { auth: true }),
  byId: (id: string) => req<Order>(`/orders/${id}`, { auth: true }),
  create: (data: {
    addressId: string;
    paymentMethod?: "cash_on_delivery" | "bank_transfer" | "card";
    couponCode?: string;
  }) => req<Order>("/orders", { method: "POST", auth: true, body: JSON.stringify(data) }),
  cancel: (id: string) => req<void>(`/orders/${id}/cancel`, { method: "DELETE", auth: true }),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const reviewsApi = {
  forProduct: (productId: string) =>
    req<Review[]>(`/products/${productId}/reviews`),
  create: (productId: string, data: { rating: number; comment?: string }) =>
    req<Review>(`/products/${productId}/reviews`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(data),
    }),
};

// ─── Search ───────────────────────────────────────────────────────────────────

export const searchApi = {
  products: (q: string) =>
    req<PaginatedProducts>(`/search/products?q=${encodeURIComponent(q)}`),
  suggestions: (q: string) =>
    req<string[]>(`/search/suggestions?q=${encodeURIComponent(q)}`),
};

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const couponsApi = {
  apply: (code: string, subtotal: number) =>
    req<{ discount: number; message: string }>("/coupons/apply", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ code, subtotal }),
    }),
};

// ─── Campaigns ────────────────────────────────────────────────────────────────

export const campaignsApi = {
  getActive: (section?: string) => {
    const qs = section ? `?section=${encodeURIComponent(section)}` : '';
    return req<Campaign[]>(`/campaigns/public${qs}`);
  },
  getHero: () => req<Campaign[]>("/campaigns/public/hero"),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatPrice(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
  }).format(n);
}

export function getProductImage(product: Product): string {
  const featured = product.media?.find((m) => m.isFeatured);
  const first = product.media?.[0];
  const url = featured?.media.url ?? first?.media.url;
  if (!url) return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80";
  // Handle relative URLs from local storage — proxy through Next.js rewrite
  if (url.startsWith("http")) return url;
  // Relative path (e.g. /brands/xxx.webp) — served via the Next.js rewrite
  return url;
}

export function getDefaultVariant(product: Product): ProductVariant | undefined {
  return product.variants?.find((v) => v.isDefault) ?? product.variants?.[0];
}
