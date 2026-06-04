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

export type SalesReport = {
  summary: SalesReportSummary;
  productBreakdown: ProductBreakdown[];
  orders: SalesReportOrder[];
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
  users: UserReportUser[];
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

export type DiscountReport = {
  summary: {
    totalDiscountGiven: number;
    ordersWithDiscount: number;
    totalCoupons: number;
    period: { start: string; end: string };
  };
  couponBreakdown: CouponBreakdown[];
  discountedOrders: DiscountedOrder[];
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

export function formatMoney(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "-";

  return `৳${Number(value).toLocaleString("en", {
    maximumFractionDigits: 2,
  })}`;
}
