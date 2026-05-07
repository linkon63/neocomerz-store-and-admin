"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AdminIcon, PageHeader, ProductThumb } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import {
  apiRequest,
  formatDate,
  slugify,
  type Brand,
  type Category,
  type PaginatedProducts,
  type Product,
  type ProductMedia,
  type ProductVariant,
} from "../../../../lib/admin-api";

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  status: "active" | "inactive" | "draft";
  brandId: string;
  categoryId: string;
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

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  status: "draft",
  brandId: "",
  categoryId: "",
  sku: "",
  price: "",
  cost: "",
  stockQuantity: "0",
  images: [],
  media: [],
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
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const categoryOptions = useMemo(
    () => flattenCategories(categories),
    [categories],
  );

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

  async function loadProducts(query = search) {
    setError("");
    setIsLoading(true);

    try {
      const params = new URLSearchParams({ limit: "50" });
      if (query.trim()) params.set("search", query.trim());
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
      const [brandList, categoryList] = await Promise.all([
        apiRequest<Brand[]>("/brands"),
        apiRequest<Category[]>("/category"),
      ]);
      setBrands(brandList);
      setCategories(categoryList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load product lookups",
      );
    }
  }

  useEffect(() => {
    loadLookups();
    loadProducts("");
  }, []);

  function updateName(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: current.id ? current.slug : slugify(name),
      sku: current.id || current.sku ? current.sku : slugify(name).toUpperCase(),
    }));
  }

  function openAddModal() {
    setError("");
    setForm({
      ...emptyForm,
      brandId: brands[0]?.id ?? "",
      categoryId: categoryOptions[0]?.id ?? "",
    });
    setIsModalOpen(true);
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
        body.append("isFeatured", String(form.media.length === 0 && index === 0));

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

  function deleteProduct(product: Product) {
    setProductToDelete(product);
    setDeleteModalOpen(true);
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

  return (
    <>
      <PageHeader
        title="Products"
        description="Create products, manage catalog data, variants, stock, and product images."
        action={
          <div className="flex gap-3">
            <button
              className="grid h-14 w-14 place-items-center rounded-lg border border-slate-300 bg-white font-black"
              onClick={() => loadProducts()}
              type="button"
            >
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button
              className="inline-flex h-14 items-center gap-2 rounded-lg bg-blue-600 px-6 font-black text-white shadow-sm"
              onClick={openAddModal}
              type="button"
            >
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Product
            </button>
          </div>
        }
      />

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-black">Products</h2>
          <p className="font-medium text-slate-500">
            Displaying {products.length} of {total} products
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 p-7 sm:flex-row">
            <form
              className="flex h-12 w-full max-w-xl items-center gap-3 rounded-lg border border-slate-300 px-4"
              onSubmit={(event) => {
                event.preventDefault();
                loadProducts();
              }}
            >
              <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent font-medium outline-none"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Enter product name or slug"
                value={search}
              />
            </form>
          </div>

          {error && (
            <p className="mx-7 mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left">
              <thead className="bg-slate-50 text-sm text-slate-900">
                <tr>
                  {[
                    "Products",
                    "Brand",
                    "Category",
                    "Inventory",
                    "Retail Price",
                    "Created At",
                    "Status",
                    "Action",
                  ].map((heading) => (
                    <th className="px-5 py-5 font-black" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td className="px-8 py-8 font-bold text-slate-500" colSpan={8}>
                      Loading products...
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((product) => {
                    const variant = getDefaultVariant(product);
                    const imageUrl = getFeaturedMedia(product);

                    return (
                      <tr className="hover:bg-slate-50" key={product.id}>
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-4">
                            {imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                alt=""
                                className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
                                src={imageUrl}
                              />
                            ) : (
                              <ProductThumb color="#e2e8f0" />
                            )}
                            <div>
                              <p className="max-w-lg font-black uppercase">
                                {product.name}
                              </p>
                              <p className="mt-1 font-medium text-slate-400">
                                {variant?.sku ?? product.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5 font-medium text-slate-700">
                          {product.brand?.name ?? "-"}
                        </td>
                        <td className="px-5 py-5 font-medium text-slate-700">
                          {product.category?.name ?? "-"}
                        </td>
                        <td className="px-5 py-5 font-medium text-slate-700">
                          {variant?.stockQuantity ?? 0}{" "}
                          <span className="text-sm">(pcs)</span>
                        </td>
                        <td className="px-5 py-5 font-medium text-slate-700">
                          {formatMoney(variant?.price)}
                        </td>
                        <td className="px-5 py-5 font-medium text-slate-700">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="px-5 py-5">
                          <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-black capitalize text-slate-700">
                            {product.status}
                          </span>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex gap-2">
                            <button
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-black"
                              onClick={() => openEditModal(product)}
                              type="button"
                            >
                              <AdminIcon className="h-4 w-4" name="edit" />
                              Edit
                            </button>
                            <button
                              className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700"
                              onClick={() => deleteProduct(product)}
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
                    <td className="px-8 py-8 font-bold text-slate-500" colSpan={8}>
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div
          aria-labelledby="product-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
          role="dialog"
        >
          <form
            className="max-h-[calc(100vh-3rem)] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
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
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-xl font-black text-slate-600"
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
                      className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                      className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                    className="min-h-28 w-full rounded-lg border border-slate-300 px-4 py-3 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    value={form.description}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-slate-700">
                      Brand
                    </span>
                    <select
                      className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                    <span className="mb-2 block text-sm font-black text-slate-700">
                      Category
                    </span>
                    <select
                      className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                          {"- ".repeat(category.depth)}
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-slate-700">
                      Status
                    </span>
                    <select
                      className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium capitalize outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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

                <div className="rounded-lg border border-slate-200 p-4">
                  <h3 className="mb-4 text-lg font-black">Default variant</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-slate-700">
                        SKU
                      </span>
                      <input
                        className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                      <span className="mb-2 block text-sm font-black text-slate-700">
                        Price
                      </span>
                      <input
                        className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-slate-700">
                        Cost
                      </span>
                      <input
                        className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-slate-700">
                        Stock
                      </span>
                      <input
                        className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                    className="block w-full rounded-lg border border-slate-300 px-4 py-3 font-medium"
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
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt=""
                            className="aspect-square w-full rounded-lg border border-slate-200 object-cover"
                            src={item.media.url}
                          />
                          <button
                            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-red-600 text-white"
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
                        className="text-sm font-black text-red-700"
                        disabled={isSaving}
                        onClick={clearSelectedImages}
                        type="button"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreviewUrls.map((url, index) => (
                        <div className="overflow-hidden rounded-lg border border-slate-200" key={url}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
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
              <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="h-12 rounded-lg border border-slate-300 bg-white px-5 font-black text-slate-700"
                disabled={isSaving}
                onClick={closeModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-5 font-black text-white disabled:bg-slate-400"
                disabled={isSaving}
                type="submit"
              >
                <AdminIcon
                  className="h-5 w-5"
                  name={form.id ? "check" : "plus"}
                />
                {isSaving
                  ? "Saving..."
                  : form.id
                    ? "Update Product"
                    : "Add Product"}
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
