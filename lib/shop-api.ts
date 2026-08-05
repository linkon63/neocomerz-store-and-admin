import { type PaginatedProducts, type Product as AdminProduct, resolveImageUrl } from "./admin-api";

const API_BASE_URL =
  typeof window === "undefined"
    ? (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1")
    : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1");

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  team: string;
  price: number;
  originalPrice?: number;
  image: string;
};

export type FetchShopProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
};

export type ShopProductsResponse = {
  data: ShopProduct[];
  total: number;
};

export type MappedProduct = {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  collection: string;
  priceNum: number;
  category: string;
  origin: string;
  subtitle: string;
  description: string;
  teas: { name: string; description: string }[];
  ingredients: string[];
  galleryImages: string[];
  variantId: string;
};

export interface TeaItem {
  name: string;
  description: string;
}

export interface ProductInfoProps {
  name: string;
  subtitle: string;
  price: string;
  originalPrice: string;
  teas: TeaItem[];
  productId: string;
  variantId: string;
  productData: {
    name: string;
    priceNum: number;
    image: string;
    category: string;
    description: string;
  };
}
export type ShopBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
};

export type ShopCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  parentId?: string | null;
  children?: ShopCategory[];
};

export type ShopSettings = {
  id: string;
  shopName: string;
  slogan: string;
  contactNumber?: any;
  email?: any;
  socialContact?: any;
  currency: string;
  language: string;
  deliveryChargeInside: string;
  deliveryChargeOutside: string;
  deliveryChargeNearCity: string;
  youtubeUrl?: string | null;
  youtubeThumbnailImage?: string | null;
  youtubeTitle?: string | null;
  youtubeDescription?: string | null;
};

function mapProduct(product: AdminProduct): ShopProduct {
  const defaultVariant = product.variants?.find((v) => v.isDefault) ?? product.variants?.[0];

  const featuredMedia = product.media?.find((m) => m.isFeatured);
  const firstMedia = product.media?.[0];
  const rawImage = featuredMedia?.media.url ?? firstMedia?.media.url ?? "";

  const priceNum = Number(defaultVariant?.price ?? 0);
  const costNum = defaultVariant?.cost ? Number(defaultVariant.cost) : 0;
  const discountPrice = product.discountPrice ? Number(product.discountPrice) : 0;
  const showOriginal = discountPrice > 0 && discountPrice < priceNum;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category?.name ?? "",
    team: product.brand?.name ?? "",
    price: showOriginal ? discountPrice : priceNum,
    originalPrice: showOriginal ? priceNum : (costNum > priceNum ? costNum : undefined),
    image: resolveImageUrl(rawImage),
  };
}

export async function fetchShopProducts(
  params: FetchShopProductsParams = {},
): Promise<ShopProductsResponse> {
  const { page = 1, limit = 12, search, categoryId, brandId } = params;

  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));
  if (search) {
    searchParams.set("search", search);
  }
  if (categoryId) {
    searchParams.set("categoryId", categoryId);
  }
  if (brandId) {
    searchParams.set("brandId", brandId);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/products?${searchParams.toString()}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.status !== 200) {
      return { data: [], total: 0 };
    }

    const paginated: PaginatedProducts = await res.json();
    return {
      data: (paginated.data ?? []).map(mapProduct),
      total: paginated.meta?.total ?? 0,
    };
  } catch {
    return { data: [], total: 0 };
  }
}

export async function fetchShopProductById(id: string): Promise<AdminProduct | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.status !== 200) return null;

    return await res.json() as AdminProduct;
  } catch {
    return null;
  }
}

export async function fetchShopProductBySlug(slug: string): Promise<AdminProduct | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/slug/${encodeURIComponent(slug)}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.status !== 200) return null;

    return await res.json() as AdminProduct;
  } catch {
    return null;
  }
}
async function safeFetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    return await res.json() as T;
  } catch {
    return fallback;
  }
}

export function fetchShopBrands(): Promise<ShopBrand[]> {
  return safeFetchJson<ShopBrand[]>(`${API_BASE_URL}/brands`, []);
}

export function fetchShopCategories(): Promise<ShopCategory[]> {
  return safeFetchJson<ShopCategory[]>(`${API_BASE_URL}/category`, []);
}

export function fetchShopSettings(): Promise<ShopSettings | null> {
  return safeFetchJson<ShopSettings | null>(`${API_BASE_URL}/settings`, null);
}

export function fetchShopTags(): Promise<any[]> {
  return safeFetchJson<any[]>(`${API_BASE_URL}/tags`, []);
}

export function fetchShopAttributes(): Promise<any[]> {
  return safeFetchJson<any[]>(`${API_BASE_URL}/attributes`, []);
}

