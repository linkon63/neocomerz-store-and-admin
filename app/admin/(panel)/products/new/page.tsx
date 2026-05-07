"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import {
  apiRequest,
  slugify,
  type Brand,
  type Category,
  type Product,
  type Unit,
} from "../../../../../lib/admin-api";

type CategoryOption = Category & {
  depth: number;
};

type ProductCreateForm = {
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
};

const emptyForm: ProductCreateForm = {
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
};

function flattenCategories(categories: Category[], depth = 0): CategoryOption[] {
  return categories.flatMap((category) => [
    { ...category, depth },
    ...flattenCategories(category.children ?? [], depth + 1),
  ]);
}

export default function NewProductPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [form, setForm] = useState<ProductCreateForm>(emptyForm);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const categoryOptions = useMemo(
    () => flattenCategories(categories),
    [categories],
  );

  useEffect(() => {
    async function loadLookups() {
      setError("");

      try {
        const [brandList, categoryList, unitList] = await Promise.all([
          apiRequest<Brand[]>("/brands"),
          apiRequest<Category[]>("/category"),
          apiRequest<Unit[]>("/units"),
        ]);
        const activeUnits = unitList.filter((unit) => unit.isActive);

        setBrands(brandList);
        setCategories(categoryList);
        setUnits(activeUnits);
        setForm((current) => ({
          ...current,
          brandId: current.brandId || brandList[0]?.id || "",
          categoryId: current.categoryId || flattenCategories(categoryList)[0]?.id || "",
          unitId: current.unitId || activeUnits[0]?.id || "",
        }));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load product form data",
        );
      }
    }

    loadLookups();
  }, []);

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

  function updateName(name: string) {
    const generatedSlug = slugify(name);

    setForm((current) => ({
      ...current,
      name,
      slug: current.slug ? current.slug : generatedSlug,
      sku: current.sku ? current.sku : generatedSlug.toUpperCase(),
    }));
  }

  function updateImages(files: FileList | null) {
    setForm((current) => ({
      ...current,
      images: files ? Array.from(files) : [],
    }));
  }

  function clearImages() {
    if (imageInputRef.current) imageInputRef.current.value = "";
    setForm((current) => ({ ...current, images: [] }));
  }

  async function uploadImages(productId: string) {
    await Promise.all(
      form.images.map((image, index) => {
        const body = new FormData();
        body.append("file", image);
        body.append("type", "image");
        body.append("sortOrder", String(index));
        if (index === 0) {
          body.append("isFeatured", "true");
        }

        return apiRequest(`/products/${productId}/media`, {
          method: "POST",
          body,
        });
      }),
    );
  }

  async function createDefaultVariant(productId: string) {
    if (!form.sku.trim() || !form.price) return;

    await apiRequest(`/products/${productId}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: form.sku.trim(),
        price: Number(form.price),
        cost: form.cost ? Number(form.cost) : undefined,
        stockQuantity: Number(form.stockQuantity || 0),
        isDefault: true,
      }),
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const product = await apiRequest<Product>("/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || slugify(form.name),
          description: form.description.trim() || undefined,
          status: form.status,
          brandId: form.brandId,
          categoryId: form.categoryId,
          unitId: form.unitId || undefined,
        }),
      });

      await createDefaultVariant(product.id);
      await uploadImages(product.id);

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Add Product"
        description="Create catalog details, attach a unit of measurement, default variant, and multiple product images."
        action={
          <Link
            className="inline-flex h-14 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 font-black"
            href="/admin/products"
          >
            <AdminIcon className="h-5 w-5" name="chevronRight" />
            Products
          </Link>
        }
      />

      <form
        className="grid gap-6 rounded-xl border border-slate-100 bg-white p-6 shadow-sm xl:grid-cols-[1.1fr_0.9fr]"
        onSubmit={handleSubmit}
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700">
                Product name
              </span>
              <input
                autoFocus
                className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                onChange={(event) => updateName(event.target.value)}
                placeholder="Premium Green Tea"
                required
                value={form.name}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700">
                Product slug
              </span>
              <input
                className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    slug: event.target.value,
                  }))
                }
                placeholder="premium-green-tea"
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
              className="min-h-32 w-full rounded-lg border border-slate-300 px-4 py-3 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Short product details for admin and storefront display"
              value={form.description}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700">
                Brand
              </span>
              <select
                className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                onChange={(event) =>
                  setForm((current) => ({ ...current, brandId: event.target.value }))
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
                Unit
              </span>
              <select
                className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                onChange={(event) =>
                  setForm((current) => ({ ...current, unitId: event.target.value }))
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
              <span className="mb-2 block text-sm font-black text-slate-700">
                Status
              </span>
              <select
                className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium capitalize outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as ProductCreateForm["status"],
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
            <h2 className="mb-4 text-lg font-black">Default variant</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  SKU
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium uppercase outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sku: event.target.value }))
                  }
                  placeholder="PREMIUM-GREEN-TEA-PCS"
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
                    setForm((current) => ({ ...current, price: event.target.value }))
                  }
                  placeholder="450"
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
                    setForm((current) => ({ ...current, cost: event.target.value }))
                  }
                  placeholder="320"
                  step="0.01"
                  type="number"
                  value={form.cost}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Opening stock
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
                  placeholder="120"
                  type="number"
                  value={form.stockQuantity}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700">
              Product images
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

          {imagePreviewUrls.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-black text-slate-700">
                  Selected images
                </h2>
                <button
                  className="text-sm font-black text-red-700"
                  disabled={isSaving}
                  onClick={clearImages}
                  type="button"
                >
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {imagePreviewUrls.map((url, index) => (
                  <div
                    className="overflow-hidden rounded-lg border border-slate-200"
                    key={url}
                  >
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
          ) : (
            <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
              <div>
                <AdminIcon className="mx-auto h-8 w-8" name="upload" />
                <p className="mt-3 font-medium">
                  Upload product gallery images. The first selected image becomes featured.
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Link
              className="inline-flex h-12 items-center rounded-lg border border-slate-300 bg-white px-5 font-black text-slate-700"
              href="/admin/products"
            >
              Cancel
            </Link>
            <button
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-5 font-black text-white disabled:bg-slate-400"
              disabled={isSaving}
              type="submit"
            >
              <AdminIcon className="h-5 w-5" name="plus" />
              {isSaving ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
