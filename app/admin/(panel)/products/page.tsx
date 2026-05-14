"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AdminIcon, PageHeader, ProductThumb } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import {
  apiRequest,
  slugify,
  type Brand,
  type Category,
  type PaginatedProducts,
  type Product,
  type ProductMedia,
  type ProductVariant,
  type Unit,
} from "../../../../lib/admin-api";

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
  if (value === undefined || value === null || value === "") return "-";
  return `৳${Number(value).toLocaleString("en", { maximumFractionDigits: 2 })}`;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(emptyFilter);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const categoryOptions = useMemo(
    () => flattenCategories(categories),
    [categories],
  );

  const totalPages = Math.ceil(total / limit);
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  useEffect(() => {
    if (form.images.length === 0) {
      setImagePreviewUrls([]);
      return;
    }

    const urls = form.images.map((image) => URL.createObjectURL(image));
    setImagePreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [form.images]);

  async function loadProducts() {
    setError("");
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        limit: String(limit),
        page: String(page),
      });

      if (search.trim()) params.set("search", search.trim());
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
      setProducts(response.data);
      setTotal(response.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setIsLoading(false);
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
    loadLookups();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, filters]);

  function handleSearch() {
    setPage(1);
    loadProducts();
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
    setForm((current) => ({
      ...current,
      images: files ? Array.from(files) : [],
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        description="Create products, manage catalog data, variants, stock, and product images."
        action={
          <div className="flex gap-3">
            <button
              className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-slate-300 bg-white font-black hover:bg-slate-50 transition-colors"
              onClick={() => loadProducts()}
              type="button"
            >
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <Link
              className="inline-flex h-14 items-center gap-2 rounded-xl bg-blue-600 px-6 font-black text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              href="/admin/products/new"
            >
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Product
            </Link>
          </div>
        }
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in duration-500">
        <div className="relative flex-1 max-w-md">
          <label className="flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
            <input
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by name, SKU or slug..."
              value={search}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                  loadProducts();
                }}
                className="grid h-7 w-7 place-items-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <AdminIcon className="h-3.5 w-3.5" name="x" />
              </button>
            )}
          </label>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl px-4 py-2 bg-slate-100 border border-slate-200">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[13px] font-black text-slate-600 uppercase tracking-wider">
              {total} Products
            </span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative grid h-12 w-12 place-items-center rounded-xl border transition-all group ${
              showFilters || hasActiveFilters
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <AdminIcon className="h-5 w-5 group-hover:rotate-12 transition-transform" name="filter" />
            {hasActiveFilters && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                {Object.values(filters).filter((v) => v !== "").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-slate-950/40 animate-in fade-in duration-300"
            onClick={() => setShowFilters(false)}
          />
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h3 className="text-lg font-black text-slate-900">Advanced Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <AdminIcon className="h-4 w-4" name="x" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">Category</span>
                <select
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                <span className="mb-2 block text-sm font-black text-slate-700">Brand</span>
                <select
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                <span className="mb-2 block text-sm font-black text-slate-700">Status</span>
                <select
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">Min Price</span>
                <input
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                <span className="mb-2 block text-sm font-black text-slate-700">Max Price</span>
                <input
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, maxPrice: e.target.value }));
                    setPage(1);
                  }}
                  placeholder="৳10000"
                  type="number"
                  value={filters.maxPrice}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">Stock Status</span>
                <select
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
            <div className="border-t border-slate-200 px-6 py-5 flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={() => { clearFilters(); setShowFilters(false); }}
                  className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 h-11 rounded-xl bg-blue-600 text-sm font-black text-white hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mb-6 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 border border-red-100 rounded-xl animate-in shake duration-300">
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Image</th>
                  <th className="px-5 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Product Info</th>
                  <th className="px-5 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">SKU</th>
                  <th className="px-5 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Category</th>
                  <th className="px-5 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Price</th>
                  <th className="px-5 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 text-center">Stock</th>
                  <th className="px-5 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td className="px-8 py-32 text-center" colSpan={8}>
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600" />
                        <span className="text-sm font-bold text-slate-400">Fetching products...</span>
                      </div>
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((product, index) => {
                    const variant = getDefaultVariant(product);
                    const featuredMedia = getFeaturedMedia(product);

                    return (
                      <tr key={product.id} className="group hover:bg-slate-50/80 transition-colors animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 30}ms` }}>
                        <td className="px-8 py-4">
                          <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-white ring-4 ring-transparent group-hover:ring-blue-50 transition-all">
                            {featuredMedia ? (
                              <img
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                src={featuredMedia}
                              />
                            ) : (
                              <ProductThumb color="bg-slate-100" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="max-w-[200px]">
                            <p className="truncate text-[15px] font-black text-slate-900 group-hover:text-blue-600 transition-colors">{product.name}</p>
                            <p className="truncate text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wide">{product.slug}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 group-hover:bg-white group-hover:border-slate-300 transition-colors">
                            {variant?.sku || "-"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[13px] font-bold text-slate-600">{product.category?.name || "-"}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-[15px] font-black text-slate-900">{formatMoney(variant?.price)}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 line-through">{formatMoney(Number(variant?.price) * 1.2)}</p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex h-8 min-w-[3.5rem] items-center justify-center rounded-lg px-2 text-[12px] font-black ${
                            variant?.stockQuantity && variant.stockQuantity > 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}>
                            {variant?.stockQuantity ?? 0}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-wider ${
                              product.status === "active"
                                ? "bg-blue-600 text-white"
                                : product.status === "draft"
                                ? "bg-slate-200 text-slate-700"
                                : "bg-rose-600 text-white"
                            }`}
                          >
                            <div className={`h-2 w-2 rounded-full bg-current ${product.status === "active" ? "animate-pulse" : ""}`} />
                            {product.status}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button
                              className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-black text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                              onClick={() => openEditModal(product)}
                              type="button"
                            >
                              <AdminIcon className="h-4 w-4" name="edit" />
                              Edit
                            </button>
                            <button
                              className="flex h-10 items-center gap-2 rounded-lg border border-violet-100 bg-violet-50 px-4 text-[12px] font-black text-violet-600 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => duplicateProduct(product)}
                              disabled={isDuplicating === product.id}
                              type="button"
                              title="Duplicate product"
                            >
                              {isDuplicating === product.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <AdminIcon className="h-4 w-4" name="copy" />
                              )}
                              {isDuplicating === product.id ? "Copying..." : "Duplicate"}
                            </button>
                            <button
                              className="flex h-10 items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-4 text-[12px] font-black text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all"
                              onClick={() => {
                                setProductToDelete(product);
                                setDeleteModalOpen(true);
                              }}
                              type="button"
                            >
                              <AdminIcon className="h-4 w-4" name="x" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="px-8 py-40 text-center" colSpan={8}>
                      <div className="flex flex-col items-center gap-5">
                        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-slate-50 text-slate-200 border border-slate-100">
                          <AdminIcon className="h-10 w-10" name="package" />
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-800">No products found</p>
                          <p className="text-sm font-medium text-slate-400 mt-2 max-w-[320px] mx-auto leading-relaxed">
                            We couldn&apos;t find any products matching your current search criteria.
                          </p>
                        </div>
                        <button
                          onClick={() => { setSearch(""); clearFilters(); }}
                          className="inline-flex h-11 items-center rounded-xl px-6 bg-slate-900 text-white text-[13px] font-black hover:bg-slate-800 transition-colors"
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
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-8 py-5 bg-slate-50/30">
            <p className="text-sm font-medium text-slate-600">
              Showing <span className="font-black">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-black">{Math.min(page * limit, total)}</span> of{" "}
              <span className="font-black">{total}</span> products
            </p>
            <div className="flex items-center gap-2">
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <AdminIcon className="h-4 w-4 rotate-180" name="chevronRight" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`grid h-10 w-10 place-items-center rounded-lg border text-sm font-black transition-all ${
                      page === pageNum
                        ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <AdminIcon className="h-4 w-4" name="chevronRight" />
              </button>
            </div>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div
          aria-labelledby="product-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 py-6 animate-in fade-in duration-300"
          role="dialog"
        >
          <form
            className="max-h-[calc(100vh-3rem)] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
            onSubmit={handleSubmit}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black" id="product-modal-title">
                  {form.id ? "Edit product" : "Add product"}
                </h2>
                <p className="mt-1 font-medium text-slate-600">
                  Product details, default variant, and multiple images.
                </p>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 text-xl font-black text-slate-600 hover:bg-slate-50 transition-colors"
                disabled={isSaving}
                onClick={closeModal}
                type="button"
              >
                <AdminIcon className="h-5 w-5" name="x" />
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-slate-700">
                      Name
                    </span>
                    <input
                      autoFocus
                      className="h-12 w-full rounded-xl border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      onChange={(event) => updateName(event.target.value)}
                      required
                      value={form.name}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-slate-700">
                      Slug
                    </span>
                    <input
                      className="h-12 w-full rounded-xl border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          slug: event.target.value,
                        }))
                      }
                      required
                      value={form.slug}
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    Description
                  </span>
                  <textarea
                    className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    value={form.description}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-black text-slate-700">
                      Brand
                    </span>
                    <select
                      className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                    <span className="mb-2 block text-[13px] font-black text-slate-700">
                      Category
                    </span>
                    <select
                      className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-black text-slate-700">
                      Unit
                    </span>
                    <select
                      className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          unitId: event.target.value,
                        }))
                      }
                      value={form.unitId}
                    >
                      <option value="">Select unit</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.code})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-black text-slate-700">
                      Status
                    </span>
                    <select
                      className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 font-bold capitalize outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status: event.target.value as ProductForm["status"],
                        }))
                      }
                      value={form.status}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[15px] font-black uppercase tracking-wider text-slate-800">Default variant</h3>
                    <AdminIcon className="h-4 w-4 text-slate-400" name="package" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-[13px] font-black text-slate-700">
                        SKU
                      </span>
                      <input
                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            sku: event.target.value,
                          }))
                        }
                        value={form.sku}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[13px] font-black text-slate-700">
                        Price
                      </span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                        <input
                          className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-8 pr-4 font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          min="0"
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              price: event.target.value,
                            }))
                          }
                          step="0.01"
                          type="number"
                          value={form.price}
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[13px] font-black text-slate-700">
                        Cost
                      </span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                        <input
                          className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-8 pr-4 font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          min="0"
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              cost: event.target.value,
                            }))
                          }
                          step="0.01"
                          type="number"
                          value={form.cost}
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[13px] font-black text-slate-700">
                        Stock
                      </span>
                      <input
                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        min="0"
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            stockQuantity: event.target.value,
                          }))
                        }
                        type="number"
                        value={form.stockQuantity}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    Product Images
                  </span>
                  <input
                    accept="image/*"
                    className="block w-full rounded-xl border border-slate-300 px-4 py-3 font-medium file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-black file:text-white hover:file:bg-blue-700"
                    multiple
                    onChange={(event) => updateImages(event.target.files)}
                    ref={imageInputRef}
                    type="file"
                  />
                </label>

                {form.media.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-black text-slate-700">
                      Uploaded images
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {form.media.map((item) => (
                        <div className="relative" key={item.id}>
                          <img
                            alt=""
                            className="aspect-square w-full rounded-xl border border-slate-200 object-cover"
                            src={item.media.url}
                          />
                          <button
                            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                            disabled={isSaving}
                            onClick={() => removeMedia(item)}
                            type="button"
                          >
                            <AdminIcon className="h-4 w-4" name="x" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {imagePreviewUrls.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-black text-slate-700">
                        New images
                      </h3>
                      <button
                        className="text-sm font-black text-red-700 hover:text-red-800 transition-colors"
                        disabled={isSaving}
                        onClick={clearSelectedImages}
                        type="button"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreviewUrls.map((url, index) => (
                        <div className="overflow-hidden rounded-xl border border-slate-200" key={url}>
                          <img
                            alt=""
                            className="aspect-square w-full object-cover"
                            src={url}
                          />
                          <p className="truncate px-2 py-1 text-xs font-bold text-slate-600">
                            {form.images[index]?.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {form.media.length === 0 && imagePreviewUrls.length === 0 && (
                  <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
                    <div>
                      <AdminIcon className="mx-auto h-8 w-8" name="upload" />
                      <p className="mt-3 font-medium">
                        Select multiple images to preview and upload them after saving.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </p>
            )}

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
              <button
                className="h-12 rounded-xl border border-slate-200 bg-white px-8 font-black text-slate-600 transition-colors hover:bg-slate-50"
                disabled={isSaving}
                onClick={closeModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-8 font-black text-white transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-600/20"
                disabled={isSaving}
                type="submit"
              >
                <AdminIcon className="h-4 w-4" name={form.id ? "check" : "plus"} />
                {isSaving ? "Saving..." : form.id ? "Update Product" : "Add Product"}
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
      />
    </>
  );
}
