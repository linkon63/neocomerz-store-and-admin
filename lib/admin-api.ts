export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: {
    id: string;
    name: string;
  } | null;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  createdAt?: string;
  products?: unknown[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  children?: Category[];
  products?: unknown[];
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    products?: number;
  };
};

export type AttributeValue = {
  id: string;
  value: string;
  attributeId?: string;
};

export type Attribute = {
  id: string;
  name: string;
  values?: AttributeValue[];
};

export type Unit = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    products?: number;
  };
};

export type ProductMedia = {
  id: string;
  isFeatured: boolean;
  sortOrder: number;
  media: {
    id: string;
    url: string;
    type: "image" | "video";
  };
};

export type ProductVariant = {
  id: string;
  sku: string;
  price: string | number;
  cost?: string | number | null;
  stockQuantity: number;
  stockAlertThreshold: number;
  isDefault: boolean;
  createdAt?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: "active" | "inactive" | "draft";
  createdAt?: string;
  updatedAt?: string;
  brand?: Brand | null;
  brandId?: string;
  category?: Category | null;
  categoryId?: string;
  unit?: Unit | null;
  unitId?: string | null;
  media?: ProductMedia[];
  variants?: ProductVariant[];
};

export type PaginatedProducts = {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

export function getAdminToken() {
  if (typeof document === "undefined") return null;

  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_access_token="))
      ?.split("=")[1] ?? null
  );
}

export function setAdminSession(accessToken: string, user: AdminUser) {
  const maxAge = 60 * 60 * 24 * 7;

  document.cookie = `admin_access_token=${accessToken}; path=/admin; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `admin_user=${encodeURIComponent(
    JSON.stringify(user),
  )}; path=/admin; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAdminSession() {
  document.cookie = "admin_access_token=; path=/admin; max-age=0; SameSite=Lax";
  document.cookie = "admin_user=; path=/admin; max-age=0; SameSite=Lax";
}

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  { auth = true, headers, ...options }: RequestOptions = {},
): Promise<T> {
  const token = getAdminToken();
  const requestHeaders = new Headers(headers);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);

  if (auth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: requestHeaders,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type");
    const payload = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof payload === "object" && payload && "message" in payload
          ? Array.isArray(payload.message)
            ? payload.message.join(", ")
            : String(payload.message)
          : `Request failed with status ${response.status}`;

      throw new Error(message);
    }

    return payload as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Backend API did not respond. Start the backend server and try again.");
    }

    throw err instanceof Error ? err : new Error("API request failed");
  } finally {
    window.clearTimeout(timeout);
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(value?: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
