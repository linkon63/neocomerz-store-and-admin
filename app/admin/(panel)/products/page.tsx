"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AdminIcon, PageHeader, ProductThumb, StatusToggle } from "../../_components/admin-shell";
import { AdjustInventoryModal } from "../../_components/adjust-inventory-modal";
import { ConfirmModal } from "../../_components/confirm-modal";
import { InfiniteScroll } from "../../_components/infinite-scroll";
import {
  apiRequest,
  slugify,
  type Brand,
  type Category,
  type PaginatedProducts,
  type Product,
  type ProductMedia,
  type ProductVariant,
  type VariantMedia,
  type Unit,
  type InventoryLog,
  type InventoryLogResponse,
} from "../../../../lib/admin-api";

function VariantRow({
  variant,
  label,
  radioName,
  disabled,
  onSave,
  onMakeDefault,
}: {
  variant: ProductVariant;
  label: string;
  radioName: string;
  disabled: boolean;
  onSave: (patch: Partial<ProductVariant>) => void;
  onMakeDefault: () => void;
}) {
  const [sku, setSku] = useState(variant.sku);
  const [cost, setCost] = useState(variant.cost !== undefined && variant.cost !== null ? String(variant.cost) : "");
  const [price, setPrice] = useState(variant.price !== undefined && variant.price !== null ? String(variant.price) : "");

  // Keep row state in sync after reload.
  useEffect(() => {
    setSku(variant.sku);
    setCost(variant.cost !== undefined && variant.cost !== null ? String(variant.cost) : "");
    setPrice(variant.price !== undefined && variant.price !== null ? String(variant.price) : "");
  }, [variant.cost, variant.price, variant.sku]);

  const baseCost = variant.cost !== undefined && variant.cost !== null ? String(variant.cost) : "";
  const basePrice = variant.price !== undefined && variant.price !== null ? String(variant.price) : "";
  const dirty = sku !== variant.sku || cost !== baseCost || price !== basePrice;

  return (
    <tr>
      <td className="px-3 py-2">
        <input
          type="radio"
          name={radioName}
          checked={Boolean(variant.isDefault)}
          disabled={disabled}
          onChange={onMakeDefault}
        />
      </td>
      <td className="px-3 py-2 text-sm font-bold text-slate-700">{label}</td>
      <td className="px-3 py-2">
        <input
          className="h-9 w-56 rounded-lg border border-slate-300 px-3 text-xs font-black uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          disabled={disabled}
        />
      </td>
      <td className="px-3 py-2">
        <input
          className="h-9 w-28 rounded-lg border border-slate-300 px-3 text-xs font-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          min="0"
          step="0.01"
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          disabled={disabled}
        />
      </td>
      <td className="px-3 py-2">
        <input
          className="h-9 w-28 rounded-lg border border-slate-300 px-3 text-xs font-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          min="0"
          step="0.01"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={disabled}
        />
      </td>
      <td className="px-3 py-2">
        <button
          type="button"
          className="inline-flex h-9 items-center rounded-lg bg-blue-600 px-3 text-xs font-black text-white disabled:opacity-40"
          disabled={disabled || !dirty || !sku.trim() || !price}
          onClick={() => onSave({ sku, cost, price })}
        >
          Save
        </button>
      </td>
    </tr>
  );
}

function VariantMediaGrid({
  variant,
  onRefresh,
}: {
  variant: ProductVariant;
  onRefresh: () => void;
}) {
  const media = [...(variant.media ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  async function handleReorder(mediaId: string, nextOrder: number) {
    await apiRequest(`/variant-media/${mediaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sortOrder: nextOrder }),
    });
    onRefresh();
  }

  async function handleDelete(mediaId: string) {
    await apiRequest(`/variant-media/${mediaId}`, { method: "DELETE" });
    onRefresh();
  }

  if (media.length === 0) {
    return (
      <p className="text-xs font-medium text-slate-500">
        No variant images yet. Upload from the create page.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {media.map((item, index) => (
        <div
          key={item.id}
          className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="h-28 w-full object-cover" src={item.media.url} />
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[11px] font-bold text-slate-500">
              #{index + 1}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all cursor-pointer"
                disabled={index === 0}
                onClick={() => handleReorder(item.id, Math.max(0, index - 1))}
                title="Move media item up"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7 7 7M12 3v18" />
                </svg>
              </button>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all cursor-pointer"
                disabled={index === media.length - 1}
                onClick={() => handleReorder(item.id, index + 1)}
                title="Move media item down"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7-7-7M12 21V3" />
                </svg>
              </button>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer"
                onClick={() => handleDelete(item.id)}
                title="Delete media item"
              >
                <AdminIcon className="h-4 w-4" name="trash" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  status: "active" | "inactive" | "draft";
  brandId: string;
  categoryId: string;
  unitId: string;
  sku: string;
  price: string;
  cost: string;
  stockQuantity: string;
  images: File[];
  media: ProductMedia[];
  variantId?: string;
};

type CategoryOption = Category & {
  depth: number;
};

type FilterState = {
  categoryId: string;
  brandId: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  stockStatus: string;
};

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  status: "draft",
  brandId: "",
  categoryId: "",
  unitId: "",
  sku: "",
  price: "",
  cost: "",
  stockQuantity: "0",
  images: [],
  media: [],
};

const emptyFilter: FilterState = {
  categoryId: "",
  brandId: "",
  status: "",
  minPrice: "",
  maxPrice: "",
  stockStatus: "",
};

function flattenCategories(categories: Category[], depth = 0): CategoryOption[] {
  return categories.flatMap((category) => [
    { ...category, depth },
    ...flattenCategories(category.children ?? [], depth + 1),
  ]);
}

function getFeaturedMedia(product: Product) {
  return (
    product.media?.find((item) => item.isFeatured)?.media.url ??
    product.media?.[0]?.media.url ??
    null
  );
}

function getDefaultVariant(product: Product): ProductVariant | undefined {
  return product.variants?.find((item) => item.isDefault) ?? product.variants?.[0];
}

function formatMoney(value?: string | number | null) {
  let result = "-";
  if (value !== undefined && value !== null && value !== "") {
    result = `৳${Number(value).toLocaleString("en", { maximumFractionDigits: 2 })}`;
  }
  return result;
}

function HistoryTab({ product }: { product: Product }) {
  const defaultVariant = product.variants?.find((v) => v.isDefault) ?? product.variants?.[0];
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id || "");
  const [logs, setLogs] = useState<InventoryLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedVariantId) {
      const fetchLogs = async () => {
        setIsLoading(true);
        setError("");
        try {
          const data = await apiRequest<InventoryLogResponse[]>(
            `/inventory/logs?variantId=${selectedVariantId}`
          );
          setLogs(data);
        } catch (err) {
          setLogs([]);
        } finally {
          setIsLoading(false);
        }
      };
      void fetchLogs();
    }
  }, [selectedVariantId]);

  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVariantId(e.target.value);
  };

  const optionItems = (product.variants ?? []).map((v) => {
    const label = v.optionValues?.length
      ? v.optionValues.map((ov) => `${ov.attribute.name}: ${ov.value}`).join(" · ")
      : v.sku;
    const optionElement = (
      <option key={v.id} value={v.id}>
        {label} ({v.sku})
      </option>
    );
    return optionElement;
  });

  return (
    <div className="p-5">
      {product.variants && product.variants.length > 1 && (
        <div className="mb-4 flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <label className="text-xs font-semibold text-slate-600">Select Variant:</label>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
            value={selectedVariantId}
            onChange={handleVariantChange}
          >
            {optionItems}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-100 border-t-blue-600" />
          <span className="text-xs font-medium text-slate-400">Loading history...</span>
        </div>
      ) : logs.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 text-xs font-black text-slate-600 uppercase tracking-wider">Branch</th>
                <th className="px-4 py-2.5 text-xs font-black text-slate-600 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-2.5 text-xs font-black text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-xs font-black text-slate-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2.5 text-xs font-black text-slate-600 uppercase tracking-wider">Note</th>
                <th className="px-4 py-2.5 text-xs font-black text-slate-600 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {logs.map((log) => {
                const isAddition = log.change > 0;
                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">Main Branch</td>
                    <td className="px-4 py-3 text-sm font-bold">
                      <span className={isAddition ? "text-emerald-600" : "text-rose-600"}>
                        {isAddition ? "+" : ""}{log.change}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${
                        isAddition
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}>
                        {isAddition ? "In" : "Out"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700 capitalize">
                      {log.reason}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-500 max-w-xs truncate" title={log.note || ""}>
                      {log.note || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-500">
                      {new Date(log.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <svg className="h-8 w-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-bold text-slate-700">No Inventory History</span>
          <span className="text-xs text-slate-500 mt-1">There are no logs for this variant yet.</span>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [filters, setFilters] = useState<FilterState>(emptyFilter);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const totalPages = Math.ceil(total / limit);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);
  const [variantToAdjust, setVariantToAdjust] = useState<ProductVariant | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const reqRef = useRef(0);

  const categoryOptions = useMemo(
    () => flattenCategories(categories),
    [categories],
  );
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const toggleRow = (productId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
        if (!activeTab[productId]) {
          setActiveTab((prev) => ({ ...prev, [productId]: "inventory" }));
        }
      }
      return newSet;
    });
  };

  const setTabForProduct = (productId: string, tab: string) => {
    setActiveTab((prev) => ({ ...prev, [productId]: tab }));
  };

  const openAdjustModal = (product: Product, variant?: ProductVariant) => {
    setProductToAdjust(product);
    setVariantToAdjust(variant ?? getDefaultVariant(product) ?? null);
    setAdjustModalOpen(true);
  };

  const closeAdjustModal = () => {
    setProductToAdjust(null);
    setVariantToAdjust(null);
    setAdjustModalOpen(false);
  };

  async function setDefaultVariant(product: Product, variant: ProductVariant) {
    setError("");
    setIsSaving(true);
    try {
      const all = product.variants ?? [];
      await Promise.all(
        all.map((v) =>
          apiRequest(`/variants/${v.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isDefault: v.id === variant.id }),
          }),
        ),
      );
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update default variant");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAdjustSuccess() {
    closeAdjustModal();
    await loadProducts();
  }

  async function saveVariant(variant: ProductVariant, patch: Partial<ProductVariant>) {
    setError("");
    setIsSaving(true);
    try {
        await apiRequest(`/variants/${variant.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          sku: patch.sku ?? variant.sku,
          price:
            patch.price !== undefined
              ? Number(patch.price)
              : Number(variant.price),
          cost:
            patch.cost !== undefined
              ? patch.cost === null || patch.cost === ""
                ? undefined
                : Number(patch.cost)
              : variant.cost === null || variant.cost === undefined || variant.cost === ""
                ? undefined
                : Number(variant.cost),
          // Default selection is handled separately so we can unset others.
          }),
        });
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save variant");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    const urls = form.images.map((image) => URL.createObjectURL(image));
    const timeoutId = window.setTimeout(() => {
      setImagePreviewUrls(urls);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [form.images]);

  async function loadProducts() {
    const myReq = ++reqRef.current;
    setError("");
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (appliedSearch.trim()) params.set("search", appliedSearch.trim());
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.brandId) params.set("brandId", filters.brandId);
      if (filters.status) params.set("status", filters.status);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.stockStatus === "in-stock") params.set("inStock", "true");
      if (filters.stockStatus === "out-of-stock") params.set("outOfStock", "true");

      const response = await apiRequest<PaginatedProducts>(
        `/products?${params.toString()}`,
      );
      if (myReq !== reqRef.current) return;
      setProducts((prev) =>
        page === 1 ? response.data : [...prev, ...response.data.filter((d) => !prev.some((p) => p.id === d.id))],
      );
      setTotal(response.meta.total);
    } catch (err) {
      if (myReq !== reqRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load products");
      setProducts([]);
    } finally {
      if (myReq === reqRef.current) setIsLoading(false);
    }
  }

  async function loadLookups() {
    try {
      const [brandList, categoryList, unitList] = await Promise.all([
        apiRequest<Brand[]>("/brands"),
        apiRequest<Category[]>("/category"),
        apiRequest<Unit[]>("/units"),
      ]);
      setBrands(brandList);
      setCategories(categoryList);
      setUnits(unitList.filter((unit) => unit.isActive));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load product lookups",
      );
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLookups();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProducts();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [page, filters, appliedSearch]);

  function handleSearch() {
    setPage(1);
    setAppliedSearch(search);
  }

  function clearFilters() {
    setFilters(emptyFilter);
    setPage(1);
  }

  function updateName(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: current.id ? current.slug : slugify(name),
      sku: current.id || current.sku ? current.sku : slugify(name).toUpperCase(),
    }));
  }

  function openEditModal(product: Product) {
    const variant = getDefaultVariant(product);

    setError("");
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      status: product.status,
      brandId: product.brand?.id ?? product.brandId ?? "",
      categoryId: product.category?.id ?? product.categoryId ?? "",
      unitId: product.unit?.id ?? product.unitId ?? "",
      sku: variant?.sku ?? "",
      price: variant?.price ? String(variant.price) : "",
      cost: variant?.cost ? String(variant.cost) : "",
      stockQuantity:
        variant?.stockQuantity !== undefined ? String(variant.stockQuantity) : "0",
      images: [],
      media: product.media ?? [],
      variantId: variant?.id,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;

    setError("");
    setForm(emptyForm);
    setIsModalOpen(false);
  }

  function updateImages(files: FileList | null) {
    if (!files) return;
    setForm((current) => ({
      ...current,
      images: [...current.images, ...Array.from(files)],
    }));
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function removeNewImage(index: number) {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, idx) => idx !== index),
    }));
  }

  function clearSelectedImages() {
    if (imageInputRef.current) imageInputRef.current.value = "";
    setForm((current) => ({ ...current, images: [] }));
  }

  async function uploadProductImages(productId: string) {
    await Promise.all(
      form.images.map((image, index) => {
        const body = new FormData();
        body.append("file", image);
        body.append("type", "image");
        body.append("sortOrder", String(form.media.length + index));
        if (form.media.length === 0 && index === 0) {
          body.append("isFeatured", "true");
        }

        return apiRequest(`/products/${productId}/media`, {
          method: "POST",
          body,
        });
      }),
    );
  }

  async function saveDefaultVariant(productId: string) {
    if (!form.sku.trim() || !form.price) return;

    const body = {
      sku: form.sku.trim(),
      price: Number(form.price),
      cost: form.cost ? Number(form.cost) : undefined,
      stockQuantity: Number(form.stockQuantity || 0),
      isDefault: true,
    };

    await apiRequest(
      form.variantId ? `/variants/${form.variantId}` : `/products/${productId}/variants`,
      {
        method: form.variantId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description.trim() || undefined,
        status: form.status,
        brandId: form.brandId,
        categoryId: form.categoryId,
        unitId: form.unitId || undefined,
      };

      const savedProduct = await apiRequest<Product>(
        form.id ? `/products/${form.id}` : "/products",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      await saveDefaultVariant(savedProduct.id);
      await uploadProductImages(savedProduct.id);

      setForm(emptyForm);
      setIsModalOpen(false);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeMedia(media: ProductMedia) {
    if (isSaving) return;

    setError("");
    setIsSaving(true);

    try {
      await apiRequest(`/product-media/${media.id}`, { method: "DELETE" });
      setForm((current) => ({
        ...current,
        media: current.media.filter((item) => item.id !== media.id),
      }));
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove image");
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!productToDelete) return;

    setError("");

    try {
      await apiRequest(`/products/${productToDelete.id}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setProductToDelete(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  }

  function cancelDelete() {
    setDeleteModalOpen(false);
    setProductToDelete(null);
    setError("");
  }

  async function duplicateProduct(product: Product) {
    setIsDuplicating(product.id);
    setError("");
    try {
      const variant = getDefaultVariant(product);
      const baseName = `Copy of ${product.name}`;
      const baseSlug = slugify(`copy-of-${product.slug}`);

      const created = await apiRequest<Product>("/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: baseName,
          slug: `${baseSlug}-${Date.now()}`,
          description: product.description ?? undefined,
          status: "draft",
          brandId: product.brand?.id ?? product.brandId,
          categoryId: product.category?.id ?? product.categoryId,
          unitId: product.unit?.id ?? product.unitId ?? undefined,
        }),
      });

      if (variant && variant.sku) {
        await apiRequest(`/products/${created.id}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku: `${variant.sku}-COPY-${Date.now()}`,
            price: Number(variant.price),
            cost: variant.cost ? Number(variant.cost) : undefined,
            stockQuantity: 0,
            isDefault: true,
          }),
        });
      }

      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate product");
    } finally {
      setIsDuplicating(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your product catalog with advanced inventory tracking, pricing controls, and comprehensive analytics."
        action={
          <div className="flex gap-3 items-center">
            {showSearchInput ? (
              <div className="relative flex h-11 w-64 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
                <input
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 text-slate-800"
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search products..."
                  value={search}
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearch("");
                    setAppliedSearch("");
                    setShowSearchInput(false);
                    setPage(1);
                  }}
                  className="grid h-6 w-6 place-items-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                  title="Close search"
                  type="button"
                >
                  <AdminIcon className="h-4 w-4" name="x" />
                </button>
              </div>
            ) : (
              <button
                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
                onClick={() => setShowSearchInput(true)}
                type="button"
                title="Search products"
              >
                <AdminIcon className="h-5 w-5 text-slate-600" name="search" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-lg border transition-all shadow-sm ${
                showFilters || hasActiveFilters
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-400"
              }`}
              type="button"
              title="Filters"
            >
              <AdminIcon className="h-5 w-5" name="filter" />
              {hasActiveFilters && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white ring-2 ring-white">
                  {Object.values(filters).filter((v) => v !== "").length}
                </span>
              )}
            </button>
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-[14px] font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 shrink-0 whitespace-nowrap"
              href="/admin/products/new"
            >
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Product
            </Link>
          </div>
        }
      />

      <div className="mb-4" />

      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h3 className="text-[18px] font-bold text-slate-900">Advanced Filters</h3>
                <p className="text-[13px] text-slate-500 mt-0.5">Refine your product search</p>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <AdminIcon className="h-4.5 w-4.5" name="x" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <label className="block">
                <span className="mb-2 block text-[14px] font-semibold text-slate-700">Category</span>
                <select
                  className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-[15px] font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, categoryId: e.target.value }));
                    setPage(1);
                  }}
                  value={filters.categoryId}
                >
                  <option value="">All categories</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {"— ".repeat(cat.depth)}{cat.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[14px] font-semibold text-slate-700">Brand</span>
                <select
                  className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-[15px] font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, brandId: e.target.value }));
                    setPage(1);
                  }}
                  value={filters.brandId}
                >
                  <option value="">All brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[14px] font-semibold text-slate-700">Status</span>
                <select
                  className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-[15px] font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, status: e.target.value }));
                    setPage(1);
                  }}
                  value={filters.status}
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-[14px] font-semibold text-slate-700">Min Price</span>
                  <input
                    className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-[15px] font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, minPrice: e.target.value }));
                      setPage(1);
                    }}
                    placeholder="৳0"
                    type="number"
                    value={filters.minPrice}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[14px] font-semibold text-slate-700">Max Price</span>
                  <input
                    className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-[15px] font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, maxPrice: e.target.value }));
                      setPage(1);
                    }}
                    placeholder="৳10000"
                    type="number"
                    value={filters.maxPrice}
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-[14px] font-semibold text-slate-700">Stock Status</span>
                <select
                  className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-[15px] font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, stockStatus: e.target.value }));
                    setPage(1);
                  }}
                  value={filters.stockStatus}
                >
                  <option value="">All stock</option>
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </label>
            </div>
            <div className="border-t border-slate-200 px-6 py-5 flex items-center gap-3 bg-slate-50">
              {hasActiveFilters && (
                <button
                  onClick={() => { clearFilters(); setShowFilters(false); }}
                  className="flex-1 h-11 rounded-lg border-2 border-slate-200 bg-white text-[15px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 h-11 rounded-lg bg-blue-600 text-[15px] font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-200 px-5 py-4 rounded-xl animate-in shake duration-300 shadow-sm">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-red-900">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="grid h-6 w-6 place-items-center rounded-lg hover:bg-red-200 transition-colors"
            >
              <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-500">
            {total} {total === 1 ? "product" : "products"}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="w-10 px-4 py-4"></th>
                <th className="px-4 py-4 text-sm font-semibold text-slate-700">
                  Products
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-slate-700">
                  Brand
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-slate-700">
                  Category
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-slate-700">
                  Total Inventory
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-slate-700">
                  Retail Price
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-slate-700">
                  Created At
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-slate-700 text-center">
                  Status
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-slate-700 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && page === 1 ? (
                <tr>
                  <td className="px-8 py-32 text-center" colSpan={9}>
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600" />
                      <span className="text-sm font-medium text-slate-400">Fetching products...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                <>
                  {products.map((product) => {
                  const variant = getDefaultVariant(product);
                  const featuredMedia = getFeaturedMedia(product);
                  const isExpanded = expandedRows.has(product.id);
                  const currentTab = activeTab[product.id] || "inventory";

                  return (
                    <React.Fragment key={product.id}>
                      <tr className="hover:bg-blue-50/30 transition-all duration-200 group">
                        <td className="px-4 py-4">
                          <button
                            onClick={() => toggleRow(product.id)}
                            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all duration-200"
                          >
                            <svg
                              className={`h-3.5 w-3.5 text-slate-600 transition-transform duration-200 ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-white flex-shrink-0 group-hover:border-slate-300 transition-all duration-200 shadow-sm">
                              {featuredMedia ? (
                                <img
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                  src={featuredMedia}
                                />
                              ) : (
                                <ProductThumb color="bg-slate-100" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate max-w-[280px] group-hover:text-blue-600 transition-colors">
                                {product.name}
                              </p>
                              <p className="text-xs font-normal text-slate-400 mt-0.5">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {product.brand?.name || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {product.category?.name || "-"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-semibold text-slate-800">
                              {variant?.stockQuantity ?? 0}
                            </span>
                            <span className="text-xs text-slate-400">
                              pcs
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                          ৳{Number(variant?.price || 0).toLocaleString("en")}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {product.createdAt
                            ? new Date(product.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="inline-flex justify-center w-full">
                            <StatusToggle
                              checked={product.status === "active"}
                              onChange={async () => {
                                try {
                                  await apiRequest(`/products/${product.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      status: product.status === "active" ? "inactive" : "active",
                                    }),
                                  });
                                  await loadProducts();
                                } catch (err) {
                                  setError(
                                    err instanceof Error ? err.message : "Failed to update status"
                                  );
                                }
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="relative inline-block">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-all shadow-sm"
                              title="More actions"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                              
                              {openMenuId === product.id && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setOpenMenuId(null)}
                                  />
                                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                      onClick={() => {
                                        openEditModal(product);
                                        setOpenMenuId(null);
                                      }}
                                      className="flex w-full items-center gap-3 px-4 py-3 text-[15px] font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all"
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      Edit Product
                                    </button>
                                    <button
                                      onClick={() => {
                                        duplicateProduct(product);
                                        setOpenMenuId(null);
                                      }}
                                      disabled={isDuplicating === product.id}
                                      className="flex w-full items-center gap-3 px-4 py-3 text-[15px] font-medium text-violet-700 hover:bg-violet-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isDuplicating === product.id ? (
                                        <>
                                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          Duplicating...
                                        </>
                                      ) : (
                                        <>
                                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                          </svg>
                                          Duplicate Product
                                        </>
                                      )}
                                    </button>
                                    <div className="my-1.5 border-t border-slate-200" />
                                    <button
                                      onClick={() => {
                                        setProductToDelete(product);
                                        setDeleteModalOpen(true);
                                        setOpenMenuId(null);
                                      }}
                                      className="flex w-full items-center gap-3 px-4 py-3 text-[15px] font-medium text-red-700 hover:bg-red-50 transition-all"
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      Delete Product
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={9} className="bg-gradient-to-b from-blue-50/30 to-slate-50/30 px-4 py-0 border-t-0">
                              <div className="py-6 px-6">
                                {/* Tabs */}
                                <div className="flex items-center justify-between border-b-2 border-slate-200 mb-6">
                                  <div className="flex items-center gap-8">
                                    {["Inventory", "Pricing", "History", "Details"].map((tab) => (
                                      <button
                                        key={tab}
                                        onClick={() => setTabForProduct(product.id, tab.toLowerCase())}
                                        className={`pb-3.5 text-[15px] font-semibold transition-all relative ${
                                          currentTab === tab.toLowerCase()
                                            ? "text-blue-600"
                                            : "text-slate-500 hover:text-slate-700"
                                        }`}
                                      >
                                        {tab}
                                        {currentTab === tab.toLowerCase() && (
                                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-3 pb-2">
                                    <button 
                                      onClick={() => openAdjustModal(product)}
                                      className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all shadow-xs"
                                      title="Adjust stock"
                                    >
                                      <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => duplicateProduct(product)}
                                      disabled={isDuplicating === product.id}
                                      className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100 hover:border-violet-300 hover:text-violet-800 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                      title={isDuplicating === product.id ? "Duplicating..." : "Duplicate product"}
                                    >
                                      {isDuplicating === product.id ? (
                                        <svg className="animate-spin h-4.5 w-4.5" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                      ) : ( 
                                        <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setProductToDelete(product);
                                        setDeleteModalOpen(true);
                                      }}
                                      className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 hover:text-red-800 transition-all shadow-xs"
                                      title="Delete product"
                                    >
                                      <AdminIcon className="h-4.5 w-4.5" name="trash" />
                                    </button>
                                    <button
                                      onClick={() => openEditModal(product)}
                                      className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all shadow-xs"
                                      title="Edit product"
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>

                                {/* Tab Content */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                  {currentTab === "inventory" && (
                                    <div className="p-6">
                                      <div className="grid grid-cols-3 gap-8">
                                        <div>
                                          <p className="text-[13px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                                            Branch
                                          </p>
                                          <p className="text-[16px] font-semibold text-slate-900">
                                            Main Branch
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[13px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                                            Address
                                          </p>
                                          <p className="text-[16px] font-semibold text-slate-900">
                                            Dhaka
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[13px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                                            Current Inventory
                                          </p>
                                          <p className="text-[18px] font-bold text-blue-600">
                                            {variant?.stockQuantity ?? 0}
                                          </p>
                                        </div>
                                      </div>

                                      {(product.variants?.length ?? 0) > 1 && (
                                        <div className="mt-6">
                                          <div className="mb-3 flex items-center justify-between">
                                            <p className="text-[13px] font-semibold text-slate-600 uppercase tracking-wide">
                                              Variants
                                            </p>
                                            <p className="text-[12px] font-medium text-slate-500">
                                              {product.variants?.length ?? 0} variants
                                            </p>
                                          </div>
                                          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                                            <table className="min-w-full text-left">
                                              <thead className="bg-slate-50">
                                                <tr>
                                                  <th className="px-3 py-2 text-xs font-black text-slate-600">Default</th>
                                                  <th className="px-3 py-2 text-xs font-black text-slate-600">Variant</th>
                                                  <th className="px-3 py-2 text-xs font-black text-slate-600">SKU</th>
                                                  <th className="px-3 py-2 text-xs font-black text-slate-600">Stock</th>
                                                  <th className="px-3 py-2 text-xs font-black text-slate-600">Action</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100">
                                                {(product.variants ?? []).map((v) => {
                                                  const label = v.optionValues?.length
                                                    ? v.optionValues
                                                        .map((ov) => `${ov.attribute.name}: ${ov.value}`)
                                                        .join(" · ")
                                                    : v.sku;
                                                  return (
                                                    <tr key={v.id}>
                                                      <td className="px-3 py-2">
                                                        <input
                                                          type="radio"
                                                          name={`default-${product.id}`}
                                                          checked={Boolean(v.isDefault)}
                                                          disabled={isSaving}
                                                          onChange={() => setDefaultVariant(product, v)}
                                                        />
                                                      </td>
                                                      <td className="px-3 py-2 text-sm font-bold text-slate-700">
                                                        {label}
                                                      </td>
                                                      <td className="px-3 py-2 text-sm font-bold text-slate-700 uppercase">
                                                        {v.sku}
                                                      </td>
                                                      <td className="px-3 py-2 text-sm font-bold text-slate-900">
                                                        {v.stockQuantity ?? 0}
                                                      </td>
                                                      <td className="px-3 py-2">
                                                        <button
                                                          type="button"
                                                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-black text-slate-700 hover:bg-slate-50"
                                                          onClick={() => openAdjustModal(product, v)}
                                                        >
                                                          Adjust
                                                        </button>
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {currentTab === "pricing" && (
                                    <div className="p-5">
                                      <div className="grid grid-cols-4 gap-6">
                                        <div>
                                          <p className="text-[12px] font-semibold text-slate-600 mb-2">
                                            Units
                                          </p>
                                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-600 text-white">
                                            <span className="text-[12px] font-medium">pcs (1)</span>
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-[12px] font-semibold text-slate-600 mb-2">
                                            Unit Price
                                          </p>
                                          <p className="text-[14px] font-semibold text-slate-900">
                                            BDT {Number(variant?.cost || 0).toLocaleString("en", { minimumFractionDigits: 2 })}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[12px] font-semibold text-slate-600 mb-2">
                                            Retail Price
                                          </p>
                                          <p className="text-[14px] font-semibold text-slate-900">
                                            BDT {Number(variant?.price || 0).toLocaleString("en", { minimumFractionDigits: 2 })}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[12px] font-semibold text-slate-600 mb-2">
                                            Created At
                                          </p>
                                          <p className="text-[14px] font-normal text-slate-900">
                                            {product.createdAt
                                              ? new Date(product.createdAt).toLocaleDateString("en-US", {
                                                  month: "short",
                                                  day: "numeric",
                                                  year: "numeric",
                                                })
                                              : "-"}
                                          </p>
                                        </div>
                                      </div>

                                      {(product.variants?.length ?? 0) > 0 && (
                                        <div className="mt-6 space-y-6">
                                          <div>
                                            <div className="mb-3 flex items-center justify-between">
                                              <p className="text-[13px] font-semibold text-slate-600 uppercase tracking-wide">
                                                Variant pricing
                                              </p>
                                              <p className="text-[12px] font-medium text-slate-500">
                                                Save updates per variant
                                              </p>
                                            </div>
                                            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                                              <table className="min-w-full text-left">
                                                <thead className="bg-slate-50">
                                                  <tr>
                                                    <th className="px-3 py-2 text-xs font-black text-slate-600">Default</th>
                                                    <th className="px-3 py-2 text-xs font-black text-slate-600">Variant</th>
                                                    <th className="px-3 py-2 text-xs font-black text-slate-600">SKU</th>
                                                    <th className="px-3 py-2 text-xs font-black text-slate-600">Cost</th>
                                                    <th className="px-3 py-2 text-xs font-black text-slate-600">Price</th>
                                                    <th className="px-3 py-2 text-xs font-black text-slate-600">Action</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                  {(product.variants ?? []).map((v) => {
                                                    const label = v.optionValues?.length
                                                      ? v.optionValues
                                                          .map((ov) => `${ov.attribute.name}: ${ov.value}`)
                                                          .join(" · ")
                                                      : v.sku;
                                                    return (
                                                      <VariantRow
                                                        key={v.id}
                                                        label={label}
                                                        variant={v}
                                                        radioName={`default-${product.id}`}
                                                        disabled={isSaving}
                                                        onSave={(patch) => saveVariant(v, patch)}
                                                        onMakeDefault={() => setDefaultVariant(product, v)}
                                                      />
                                                    );
                                                  })}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>

                                          <div>
                                            <div className="mb-3 flex items-center justify-between">
                                              <p className="text-[13px] font-semibold text-slate-600 uppercase tracking-wide">
                                                Variant images
                                              </p>
                                              <p className="text-[12px] font-medium text-slate-500">
                                                Reorder or delete
                                              </p>
                                            </div>
                                            <div className="space-y-4">
                                              {(product.variants ?? []).map((v) => {
                                                const label = v.optionValues?.length
                                                  ? v.optionValues
                                                      .map((ov) => `${ov.attribute.name}: ${ov.value}`)
                                                      .join(" · ")
                                                  : v.sku;
                                                return (
                                                  <div key={`media-${v.id}`} className="rounded-lg border border-slate-200 bg-white p-4">
                                                    <div className="mb-3 flex items-center justify-between">
                                                      <p className="text-sm font-bold text-slate-700">{label}</p>
                                                      <span className="text-xs font-medium text-slate-500">SKU: {v.sku}</span>
                                                    </div>
                                                    <VariantMediaGrid variant={v} onRefresh={loadProducts} />
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {currentTab === "history" && (
                                    <HistoryTab product={product} />
                                  )}

                                  {currentTab === "details" && (
                                    <div className="p-5">
                                      <div className="grid grid-cols-4 gap-x-8 gap-y-5">
                                        <div>
                                          <p className="text-[12px] font-semibold text-slate-600 mb-2">
                                            Category
                                          </p>
                                          <p className="text-[14px] font-normal text-slate-900">
                                            {product.category?.name || "-"}
                                          </p>
                                        </div>
                                        <div className="col-span-2">
                                          <p className="text-[12px] font-semibold text-slate-600 mb-2">
                                            Description
                                          </p>
                                          <p className="text-[14px] font-normal text-slate-900 line-clamp-2">
                                            {product.description || "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[12px] font-semibold text-slate-600 mb-2">
                                            Tags
                                          </p>
                                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                            <span className="text-[12px] font-normal">{variant?.sku || "flat-brim-cap"}</span>
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-[12px] font-semibold text-slate-600 mb-2">
                                            Size Chart
                                          </p>
                                          <p className="text-[14px] font-normal text-slate-900">
                                            --
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[12px] font-semibold text-slate-600 mb-2">
                                            Supplier
                                          </p>
                                          <p className="text-[14px] font-normal text-slate-900">
                                            {product.category?.name || "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[12px] font-semibold text-slate-600 mb-2">
                                            Supplier Price
                                          </p>
                                          <p className="text-[14px] font-semibold text-slate-900">
                                            BDT {Number(variant?.cost || 0).toLocaleString("en", { minimumFractionDigits: 2 })}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[12px] font-semibold text-slate-600 mb-2">
                                            Retail Price
                                          </p>
                                          <p className="text-[14px] font-semibold text-slate-900">
                                            BDT {Number(variant?.price || 0).toLocaleString("en", { minimumFractionDigits: 2 })}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[12px] font-semibold text-slate-600 mb-2">
                                            Purchase Order Returnable
                                          </p>
                                          <p className="text-[14px] font-normal text-slate-900">
                                            No
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}

                </>
              ) : (
                  <tr>
                    <td className="px-8 py-40 text-center" colSpan={9}>
                      <div className="flex flex-col items-center gap-5">
                        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-slate-50 text-slate-200 border border-slate-100">
                          <AdminIcon className="h-10 w-10" name="package" />
                        </div>
                        <div>
                          <p className="text-[16px] font-semibold text-slate-800">No products found</p>
                          <p className="text-[14px] font-normal text-slate-400 mt-2 max-w-[320px] mx-auto leading-relaxed">
                            We couldn&apos;t find any products matching your current search criteria.
                          </p>
                        </div>
                        <button
                          onClick={() => { setSearch(""); setAppliedSearch(""); clearFilters(); }}
                          className="inline-flex h-10 items-center rounded-lg px-5 bg-slate-900 text-white text-[14px] font-semibold hover:bg-slate-800 transition-colors"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        {products.length > 0 && (
          <InfiniteScroll
            hasMore={page < totalPages}
            isLoading={isLoading}
            onLoadMore={() => setPage((p) => p + 1)}
            total={total}
            loaded={products.length}
            itemLabel="products"
            loadingLabel="Loading more..."
            allLoadedLabel="All products loaded"
          />
        )}
      </section>

      {adjustModalOpen && productToAdjust && variantToAdjust && (
        <AdjustInventoryModal
          product={{
            id: productToAdjust.id,
            name: productToAdjust.name,
            slug: productToAdjust.slug,
            imageUrl: getFeaturedMedia(productToAdjust) ?? undefined,
          }}
          variant={{
            id: variantToAdjust.id,
            sku: variantToAdjust.sku,
            stockQuantity: variantToAdjust.stockQuantity,
          }}
          onClose={closeAdjustModal}
          onSuccess={handleAdjustSuccess}
        />
      )}

      {/* Edit Product Modal */}
      {isModalOpen && (
        <div
          aria-labelledby="product-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 py-6"
          role="dialog"
        >
          <form
            className="max-h-[calc(100vh-3rem)] w-full max-w-5xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-8 shadow-2xl"
            onSubmit={handleSubmit}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-semibold text-slate-900" id="product-modal-title">
                  {form.id ? "Update Product" : "Add Product"}
                </h2>
                <p className="mt-1 text-[14px] font-normal text-slate-500">
                  {form.id ? "Update the details of your product" : "Product details, default variant, and multiple images."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {form.id && (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-slate-600">Change Status</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.status === "active"}
                        onChange={() => setForm((current) => ({
                          ...current,
                          status: current.status === "active" ? "inactive" : "active",
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                )}
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  disabled={isSaving}
                  onClick={closeModal}
                  type="button"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-6 p-5 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-[15px] font-semibold text-slate-900 mb-1">Product Info</h3>
              <p className="text-[13px] font-normal text-slate-500 mb-5">Update general information for this product</p>

              <div className="grid gap-5 lg:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-slate-700">
                    Name <span className="text-red-500">*</span> <span className="text-slate-400 text-[11px]">ⓘ</span>
                  </span>
                  <input
                    autoFocus
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-[14px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    onChange={(event) => updateName(event.target.value)}
                    required
                    value={form.name}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-slate-700">
                    Brand <span className="text-red-500">*</span>
                  </span>
                  <select
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[14px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        brandId: event.target.value,
                      }))
                    }
                    required
                    value={form.brandId}
                  >
                    <option value="">Select brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-slate-700">
                    Tags
                  </span>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-[14px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="flat-brim-cap"
                    value={form.sku}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sku: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-slate-700">
                    Suppliers
                  </span>
                  <select
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[14px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        categoryId: event.target.value,
                      }))
                    }
                    required
                    value={form.categoryId}
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {"— ".repeat(category.depth)}
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block lg:col-span-2">
                  <span className="mb-2 block text-[13px] font-semibold text-slate-700">
                    Description <span className="text-slate-400 text-[11px]">ⓘ</span>
                  </span>
                  <textarea
                    className="min-h-24 w-full rounded-lg border border-slate-300 px-4 py-3 text-[14px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    value={form.description}
                  />
                </label>
              </div>
            </div>

            <div className="mb-6 p-5 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-[15px] font-semibold text-slate-900 mb-5">Upload Images <span className="text-slate-400 text-[11px]">ⓘ</span></h3>

              <div className="flex items-start gap-4">
                {form.media.length > 0 && form.media.map((item) => (
                  <div className="relative" key={item.id}>
                    <img
                      alt=""
                      className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                      src={item.media.url}
                    />
                    <button
                      className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                      disabled={isSaving}
                      onClick={() => removeMedia(item)}
                      type="button"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {imagePreviewUrls.length > 0 && imagePreviewUrls.map((url, index) => (
                  <div className="relative" key={url}>
                    <img
                      alt=""
                      className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                      src={url}
                    />
                    <button
                      className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                      disabled={isSaving}
                      onClick={() => removeNewImage(index)}
                      type="button"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 transition-colors">
                  <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <input
                    accept="image/*"
                    className="hidden"
                    multiple
                    onChange={(event) => updateImages(event.target.files)}
                    ref={imageInputRef}
                    type="file"
                  />
                </label>
              </div>
            </div>

            {error && (
              <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
              <button
                className="h-11 rounded-lg border border-slate-200 bg-white px-6 text-[14px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                disabled={isSaving}
                onClick={closeModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-6 text-[14px] font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? "Saving..." : form.id ? "Update" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        cancelText="No"
        confirmText="Yes"
        isDestructive={true}
        isOpen={deleteModalOpen}
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Product"
        error={error}
      />
    </>
  );
}
