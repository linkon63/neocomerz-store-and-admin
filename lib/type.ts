import { ProductMedia } from "./admin-api";

export type ProductDiscount = {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number | string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
  _count?: { products: number };
  products?: Array<{
    product: { id: string; name: string; media?: ProductMedia[]; variants: Array<{ price: number }> };
  }>;
};

export type PaginatedDiscounts = {
  data: ProductDiscount[];
  meta: { page: number; limit: number; total: number };
};

export type DiscountForm = {
  id?: string;
  name: string;
  type: "percentage" | "fixed";
  value: string;
  productIds: string[];
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
};