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
  sortOrder?: number;
  createdAt?: string;
  children?: Category[];
  products?: unknown[];
};

export type ReorderCategoryItem = {
  id: string;
  parentId: string | null;
  sortOrder: number;
};

/**
 * Persist a new category tree layout. Send the full flat list of categories
 * with their new parentId and zero-based sortOrder; the API applies every
 * change in one transaction and returns the freshly ordered tree.
 */
export async function reorderCategories(
  items: ReorderCategoryItem[],
): Promise<Category[]> {
  return apiRequest<Category[]>("/category/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
}

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

export type VariantMedia = {
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
  optionValues?: { value: string; attribute: { name: string } }[];
  media?: VariantMedia[];
  createdAt?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  discountPrice?: string | number | null;
  isFeatured?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  status: "active" | "inactive" | "draft";
  createdAt?: string;
  updatedAt?: string;
  brand?: Brand | null;
  brandId?: string;
  category?: Category | null;
  categoryId?: string;
  unit?: Unit | null;
  unitId?: string | null;
  tags?: Tag[];
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

export type WholesaleRequestStatus =
  | "pending"
  | "info_requested"
  | "approved"
  | "rejected"
  | "converted";

export type CustomerAddress = {
  id: string;
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
};

export type WholesaleRequestUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  addresses?: CustomerAddress[];
};

export type WholesaleRequestItem = {
  id: string;
  productId?: string;
  product?: Product | null;
  variantId?: string | null;
  variant?: ProductVariant | null;
  requestedQuantity: number;
  targetPrice?: string | number | null;
  note?: string | null;
};

export type WholesaleOrderRequest = {
  id: string;
  requestNumber: string;
  status: WholesaleRequestStatus;
  customerNote?: string | null;
  adminNote?: string | null;
  infoRequestMessage?: string | null;
  contactPhone?: string | null;
  user: WholesaleRequestUser;
  items: WholesaleRequestItem[];
  orderId?: string | null;
  order?: { id: string; orderNumber?: string } | null;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string | null;
};

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type OrderPaymentStatus = "unpaid" | "paid" | "refunded";

export type MetricValue = {
  value: number;
  trend: number | null;
};

export type DashboardRecentOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  total: number;
  placedAt: string;
  user: { id: string; name: string; email: string } | null;
};

export type DashboardSummary = {
  range: { start: string; end: string };
  totalSales: MetricValue;
  totalOrders: MetricValue;
  pendingOrders: MetricValue;
  avgOrderValue: MetricValue;
  refundAmount: MetricValue;
  newCustomers: MetricValue;
  lowStockProducts: MetricValue;
  totalCustomers: MetricValue;
  totalProducts: MetricValue;
  recentOrders: DashboardRecentOrder[];
};

export type SalesTrendPoint = {
  date: string;
  total: number;
  orders: number;
};

export type TopProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  unitsSold: number;
  revenue: number;
  stock: number;
};

export type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
  product?: Product | null;
  variant?: ProductVariant | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  total: string | number;
  discount?: string | number;
  shippingCost?: string | number;
  tax?: string | number;
  orderType?: "retail" | "wholesale";
  placedAt: string;
  user?: { id: string; name: string; email: string; phone?: string | null } | null;
  address?: CustomerAddress | null;
  items?: OrderItem[];
  payments?: { id: string; amount: string | number; method: string; status: string }[];
};

export type PaginatedOrders = {
  data: Order[];
  meta: { page: number; limit: number; total: number };
};

export type OrderTotals = {
  subtotal: number;
  shipping: number;
  discount: number;
  grand: number;
  paid: number;
  due: number;
};

// ─── Settings ──────────────────────────────────────────────────────────────

export type SettingsContactEntry = { title: string; value: string };

/**
 * The API stores contactNumber and email as a JSON object with an "entries" array.
 * Shape on the wire: { entries: SettingsContactEntry[] }
 * We flatten/unflatten on the frontend for array-based editing.
 */
export type SettingsContactJson = { entries: SettingsContactEntry[] };

export type SettingsSocialContact = {
  tiktok?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
};

/** Shape returned by GET /settings */
export type AppSettings = {
  id?: string;
  shopName?: string;
  logo?: string | null;
  icon?: string | null;
  favicon?: string | null;
  slogan?: string | null;
  isTopBarVisible?: boolean;
  hideOutOfStock?: boolean;
  branchName?: string | null;
  branchAddress?: string | null;
  branchLat?: number | null;
  branchLng?: number | null;
  /** Raw JSON from API — { entries: [...] } */
  contactNumber?: SettingsContactJson | null;
  /** Raw JSON from API — { entries: [...] } */
  email?: SettingsContactJson | null;
  socialContact?: SettingsSocialContact | null;
  currency?: string;
  language?: string;
  copyrightYear?: string | null;
  parentCompany?: string | null;
  parentCompanyLink?: string | null;
  deliveryChargeInside?: number | string | null;
  deliveryChargeOutside?: number | string | null;
  deliveryChargeNearCity?: number | string | null;
  createdAt?: string;
  updatedAt?: string;
};

/** Helper: extract entries array from the API's JSON object format */
export function getContactEntries(
  field: SettingsContactJson | null | undefined,
): SettingsContactEntry[] {
  if (!field) return [{ title: "", value: "" }];
  if (Array.isArray(field)) {
    // guard against old shape
    return field.length > 0 ? (field as unknown as SettingsContactEntry[]) : [{ title: "", value: "" }];
  }
  const entries = field.entries;
  return Array.isArray(entries) && entries.length > 0
    ? entries
    : [{ title: "", value: "" }];
}

/** Helper: pack entries array back into the API's JSON object format */
export function packContactEntries(entries: SettingsContactEntry[]): SettingsContactJson {
  return { entries };
}

// ─── Policies ──────────────────────────────────────────────────────────────

export type PolicyEntry = { title: string; content: string };

export type AppPolicies = {
  id?: string;
  delivery?: PolicyEntry;
  refund?: PolicyEntry;
  return?: PolicyEntry;
  cancellation?: PolicyEntry;
  privacy?: PolicyEntry;
  terms?: PolicyEntry;
  createdAt?: string;
  updatedAt?: string;
};

// ─── Campaigns ─────────────────────────────────────────────────────────────

export type CampaignImage = {
  id: string;
  images: string[];
};

export type CampaignSection = {
  id: string;
  title: string;
  position: number;
  page: string;
};

export type Campaign = {
  id: string;
  title: string;
  description?: string;
  status: "active" | "inactive";
  startAt: string;
  endAt?: string | null;
  hasDiscount?: boolean;
  discountId?: string | null;
  sectionId: string;
  section?: CampaignSection;
  images?: CampaignImage[];
  createdAt?: string;
  updatedAt?: string;
};

export type SalesReportSummary = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  period: { start: string; end: string };
};

export type ProductBreakdown = {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  revenue: number;
};

export type SalesReportOrder = {
  orderId: string;
  orderNumber: string;
  customer: string;
  total: number;
  discount: number;
  placedAt: string;
  items: {
    product: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

export type SalesReport = {
  summary: SalesReportSummary;
  productBreakdown: ProductBreakdown[];
  orders: { items: SalesReportOrder[]; meta: PaginationMeta };
};

export type UserReportUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  registeredAt: string;
};

export type UserReport = {
  summary: {
    totalNewUsers: number;
    totalCustomers: number;
    newCustomersThisWeek: number;
    period: { start: string; end: string };
  };
  users: { items: UserReportUser[]; meta: PaginationMeta };
};

export type CouponBreakdown = {
  id: string;
  code: string;
  type: string;
  value: number;
  usedCount: number;
  maxUsage: number;
  expiresAt: string | null;
};

export type DiscountedOrder = {
  orderId: string;
  orderNumber: string;
  customer: string;
  discountAmount: number;
  orderTotal: number;
  placedAt: string;
};

export type ProductDiscountBreakdown = {
  discountId: string;
  discountName: string;
  type: string;
  value: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  products: {
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }[];
};

export type DiscountReport = {
  summary: {
    totalDiscountGiven: number;
    ordersWithDiscount: number;
    totalCoupons: number;
    period: { start: string; end: string };
  };
  couponBreakdown: CouponBreakdown[];
  discountedOrders: { items: DiscountedOrder[]; meta: PaginationMeta };
  productDiscountBreakdown: ProductDiscountBreakdown[];
};

export type ReportOverviewSales = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  period: { start: string; end: string };
};

export type ReportOverviewCustomers = {
  totalNewUsers: number;
  totalCustomers: number;
  newCustomersThisWeek: number;
  period: { start: string; end: string };
};

export type ReportOverviewDiscounts = {
  totalDiscountGiven: number;
  ordersWithDiscount: number;
  totalCoupons: number;
  period: { start: string; end: string };
};

export type ReportOverviewInventory = {
  totalStockIn: number;
  totalStockOut: number;
  totalTransactions: number;
  lowStockAlerts: number;
  period: { start: string; end: string };
};

export type InventoryVariant = {
  id: string | null;
  sku: string | null;
  price: string | null;
  cost: string | null;
  stockQuantity: number;
  stockAlertThreshold: number;
  isDefault: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
    status: string;
    media?: { media: { url: string } }[];
  };
};

export type PaginatedInventory = {
  data: InventoryVariant[];
  meta: { page: number; limit: number; total: number };
};

export type InventoryLog = {
  id: string;
  change: number;
  reason: "sale" | "restock" | "return" | "correction" | "manual";
  referenceId?: string | null;
  note?: string | null;
  createdAt: string;
  variantId: string;
};

export type InventoryLogResponse = InventoryLog & {
  variant: {
    sku: string;
    product: { id: string; name: string };
  };
};

export type AdjustInventoryPayload = {
  variantId: string;
  change: number;
  reason: "sale" | "restock" | "return" | "correction" | "manual";
  referenceId?: string;
  note?: string;
};

export type ReportOverviewPurchases = {
  totalPurchases: number;
  totalUnits: number;
  totalCost: number;
  period: { start: string; end: string };
};

export type ReportOverview = {
  period: { start: string; end: string };
  sales: ReportOverviewSales;
  customers: ReportOverviewCustomers;
  discounts: ReportOverviewDiscounts;
  inventory: ReportOverviewInventory;
  purchases: ReportOverviewPurchases;
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
    const text = await response.text();

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      if (text) {
        try {
          const parsed = JSON.parse(text);
          if (parsed && "message" in parsed) {
            message = Array.isArray(parsed.message)
              ? parsed.message.join(", ")
              : String(parsed.message);
          }
        } catch {
          message = text;
        }
      }
      throw new Error(message);
    }

    if (!text) return undefined as T;

    const payload = contentType?.includes("application/json")
      ? JSON.parse(text)
      : text;

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

export async function apiRequestRaw(
  path: string,
  { auth = true, ...options }: RequestOptions = {},
): Promise<Response> {
  const token = getAdminToken();
  const requestHeaders = new Headers(options.headers);

  if (auth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: requestHeaders,
  });

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  return response;
}

export enum ReportFormat {
  JSON = "json",
  CSV = "csv",
  PDF = "pdf",
}

export async function downloadReport(
  endpoint: string,
  format: "csv" | "pdf",
  params: Record<string, string>,
) {
  const searchParams = new URLSearchParams({ ...params, format });
  const res = await apiRequestRaw(`/reports/${endpoint}?${searchParams}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${endpoint}-report.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

export type InventoryRow = {
  id: string;
  sku: string;
  price: string;
  cost: string | null;
  stockQuantity: number;
  stockAlertThreshold: number;
  isDefault: boolean;
  product: { id: string; name: string; slug: string; status: string };
};

export function toInventoryRows(
  variants: Array<{
    id: string;
    sku: string;
    price: { toString(): string };
    cost?: { toString(): string } | null;
    stockQuantity: number;
    stockAlertThreshold: number;
    isDefault: boolean;
    product: { id: string; name: string; slug: string; status: string };
  }>,
): InventoryRow[] {
  return variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    price: v.price.toString(),
    cost: v.cost?.toString() ?? null,
    stockQuantity: v.stockQuantity,
    stockAlertThreshold: v.stockAlertThreshold,
    isDefault: v.isDefault,
    product: v.product,
  }));
}

export function formatMoney(value?: string | number | null, symbol?: string) {
  if (value === undefined || value === null || value === "") return "-";
  const sym = symbol ?? "৳";

  return `${sym}${Number(value).toLocaleString("en", {
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Resolves a raw image URL from the API into a URL safe for use with next/image.
 *
 * Problem: next/image fetches images server-side during optimisation. When the
 * raw URL contains `localhost`, the Next.js server resolves it to a private IP
 * (127.0.0.1 / ::1) and rejects it with "resolved to private ip".
 *
 * Solution: static files served by the NestJS backend (e.g. /products/*.webp)
 * are proxied through a Next.js rewrite rule (`/products/:path*` → NestJS).
 * So we strip the localhost origin from those URLs, leaving a relative path
 * like `/products/abc.webp`. next/image treats relative paths as same-origin
 * and never makes a cross-host fetch, sidestepping the private-IP block.
 *
 * On production the raw URL already contains the real HTTPS hostname (from
 * NEXT_PUBLIC_API_BASE_URL), so the relative-path logic never fires and the
 * full URL is returned unchanged.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return "";

  // ── 1. Already a relative or data URI — return as-is ──────────────────────
  if (
    url.startsWith("/") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  // ── 2. Localhost URL — strip the origin so it becomes a relative path ──────
  // The Next.js rewrite `/products/:path*` proxies this back to the NestJS
  // backend, so next/image only ever sees a same-origin path.
  if (/https?:\/\/localhost(:\d+)?/.test(url)) {
    return url.replace(/^https?:\/\/localhost(:\d+)?/, "");
  }

  // ── 3. Absolute HTTPS/HTTP URL (production) — return unchanged ────────────
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // ── 4. Bare path without a leading slash — derive origin from env ─────────
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  let apiOrigin = "http://localhost:5010";
  if (apiBaseUrl) {
    try {
      apiOrigin = new URL(apiBaseUrl).origin;
    } catch {
      // ignore malformed env value
    }
  }

  return `${apiOrigin}/${url}`;
}

// ─── News / Blog ───────────────────────────────────────────────────────────

export type News = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImageUrl?: string | null;
  author?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Admin: all articles (drafts included).
export async function getAllNews(): Promise<News[]> {
  return apiRequest<News[]>("/news/manage");
}

// Public: published articles only.
export async function getPublishedNews(): Promise<News[]> {
  return apiRequest<News[]>("/news", { auth: false });
}

// Public: a single published article by slug.
export async function getNewsBySlug(slug: string): Promise<News> {
  return apiRequest<News>(`/news/slug/${slug}`, { auth: false });
}

export async function createNews(body: FormData): Promise<News> {
  return apiRequest<News>("/news", { method: "POST", body });
}

export async function updateNews(id: string, body: FormData): Promise<News> {
  return apiRequest<News>(`/news/${id}`, { method: "PATCH", body });
}

export async function deleteNews(id: string): Promise<void> {
  return apiRequest<void>(`/news/${id}`, { method: "DELETE" });
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  productId: string;
  userId: string;
  product?: { id: string; name: string; slug: string };
  user?: { id: string; name: string; email: string };
};

export type PaginatedReviews = {
  data: Review[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UpdateReviewDto = {
  rating?: number;
  comment?: string;
  isApproved?: boolean;
};

export async function getAllReviews(params?: Record<string, string>): Promise<PaginatedReviews> {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  return apiRequest<PaginatedReviews>(`/reviews${qs}`);
}

export async function updateReview(id: string, dto: UpdateReviewDto): Promise<Review> {
  return apiRequest<Review>(`/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export type CreateReviewDto = {
  productId: string;
  rating: number;
  comment?: string;
  isApproved?: boolean;
};

export async function createReview(dto: CreateReviewDto): Promise<Review> {
  return apiRequest<Review>("/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function deleteReview(id: string): Promise<void> {
  return apiRequest<void>(`/reviews/${id}`, { method: "DELETE" });
}
