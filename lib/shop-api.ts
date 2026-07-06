import { type PaginatedProducts, type Product as AdminProduct, resolveImageUrl } from "./admin-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

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
  vatMessage: string;
  teas: TeaItem[];
  productId: string;
  variantId: string;
  productData: {
    name: string;
    priceNum: number;
    image: string;
    category: string;
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

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category?.name ?? "",
    team: product.brand?.name ?? "",
    price: Number(defaultVariant?.price ?? 0),
    originalPrice: defaultVariant?.cost ? Number(defaultVariant.cost) : undefined,
    image: resolveImageUrl(rawImage),
  };
}

export async function fetchShopProducts(
  params: FetchShopProductsParams = {},
): Promise<ShopProductsResponse> {
  const { page = 1, limit = 12 } = params;

  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));

  const res = await fetch(`${API_BASE_URL}/products?${searchParams.toString()}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (res.status !== 200) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }

  const paginated: PaginatedProducts = await res.json();

  return {
    data: paginated.data.map(mapProduct),
    total: paginated.meta.total,
  };
}

export async function fetchShopProductById(id: string): Promise<AdminProduct | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (res.status !== 200) return null;

    return (await res.json()) as AdminProduct;
  } catch {
    return null;
  }
}
export async function fetchShopBrands(): Promise<ShopBrand[]> {
  const res = await fetch(`${API_BASE_URL}/brands`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch brands: ${res.status}`);
  }
  return res.json();
}

export async function fetchShopCategories(): Promise<ShopCategory[]> {
  const res = await fetch(`${API_BASE_URL}/category`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status}`);
  }
  return res.json();
}

export async function fetchShopSettings(): Promise<ShopSettings> {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch settings: ${res.status}`);
  }
  return res.json();
}

