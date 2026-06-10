"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import {
  apiRequest,
  slugify,
  type Attribute,
  type Brand,
  type Category,
  type Product,
  type Tag,
  type Unit,
} from "../../../../../lib/admin-api";

type CategoryOption = Category & {
  depth: number;
};

type VariantSelection = {
  key: string;
  optionId: string;
  pendingValueId: string;
  valueIds: string[];
};

type ProductCreateForm = {
  name: string;
  categoryId: string;
  slug: string;
  description: string;
  brandId: string;
  unitId: string;
  status: "active" | "inactive" | "draft";
  tagIds: string[];
  productType: "simple" | "variant";
  sku: string;
  unitPrice: string;
  retailPrice: string;
  images: File[];
};

const emptyForm: ProductCreateForm = {
  name: "",
  categoryId: "",
  slug: "",
  description: "",
  brandId: "",
  unitId: "",
  status: "active",
  tagIds: [],
  productType: "simple",
  sku: "",
  unitPrice: "",
  retailPrice: "",
  images: [],
};

const emptyVariantSelection: VariantSelection = {
  key: "variant-option-1",
  optionId: "",
  pendingValueId: "",
  valueIds: [],
};

function flattenCategories(categories: Category[], depth = 0): CategoryOption[] {
  return categories.flatMap((category) => [
    { ...category, depth },
    ...flattenCategories(category.children ?? [], depth + 1),
  ]);
}

function makeSkuSeed(name: string, unitCode?: string) {
  const base = slugify(name).replace(/-/g, "").slice(0, 14).toUpperCase();
  const suffix = unitCode ? unitCode.toUpperCase().replace(/[^A-Z0-9]/g, "") : "SKU";

  return [base || "PRODUCT", suffix].join("-");
}

function cartesianProduct<T>(groups: T[][]): T[][] {
  return groups.reduce<T[][]>(
    (acc, group) => acc.flatMap((items) => group.map((item) => [...items, item])),
    [[]],
  );
}

export default function NewProductPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [variantOptions, setVariantOptions] = useState<Attribute[]>([]);
  const [form, setForm] = useState<ProductCreateForm>(emptyForm);
  const [variantSelections, setVariantSelections] = useState<VariantSelection[]>([
    emptyVariantSelection,
  ]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const categoryOptions = useMemo(
    () => flattenCategories(categories),
    [categories],
  );
  const selectedUnit = units.find((unit) => unit.id === form.unitId);
  const selectedVariantGroups = useMemo(() => {
    return variantSelections
      .map((selection) => {
        const option = variantOptions.find(
          (item) => item.id === selection.optionId,
        );

        if (!option) return null;

        return {
          ...option,
          values: selection.valueIds
            .map((id) => (option.values ?? []).find((value) => value.id === id))
            .filter((val): val is NonNullable<typeof val> => Boolean(val)),
        };
      })
      .filter((option): option is Attribute & { values: NonNullable<Attribute["values"]> } =>
        Boolean(option && option.values.length > 0),
      );
  }, [variantOptions, variantSelections]);
  const variantPreview = useMemo(() => {
    const groups = selectedVariantGroups.map((option) => option.values);
    if (groups.length === 0) return [];

    return cartesianProduct(groups).map((values) => ({
      label: values.map((value) => value.value).join(" / "),
      valueIds: values.map((value) => value.id),
      sku: `${form.sku || makeSkuSeed(form.name, selectedUnit?.code)}-${values
        .map((value) => slugify(value.value).replace(/-/g, "").toUpperCase())
        .join("-")}`,
    }));
  }, [form.name, form.sku, selectedUnit?.code, selectedVariantGroups]);

  useEffect(() => {
    async function loadLookups() {
      setError("");

      try {
        const [brandList, categoryList, unitList, tagList, attributeList] =
          await Promise.all([
            apiRequest<Brand[]>("/brands"),
            apiRequest<Category[]>("/category"),
            apiRequest<Unit[]>("/units"),
            apiRequest<Tag[]>("/tags"),
            apiRequest<Attribute[]>("/attributes"),
          ]);
        const activeUnits = unitList.filter((unit) => unit.isActive);
        const activeTags = tagList.filter((tag) => tag.isActive);

        setBrands(brandList);
        setCategories(categoryList);
        setUnits(activeUnits);
        setTags(activeTags);
        setVariantOptions(attributeList);
        setVariantSelections((current) =>
          current.map((selection, index) =>
            index === 0 && !selection.optionId
              ? { ...selection, optionId: attributeList[0]?.id || "" }
              : selection,
          ),
        );
        setForm((current) => ({
          ...current,
          brandId: current.brandId || brandList[0]?.id || "",
          categoryId:
            current.categoryId || flattenCategories(categoryList)[0]?.id || "",
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
    }));
  }

  function generateSku() {
    setForm((current) => ({
      ...current,
      sku: makeSkuSeed(current.name, selectedUnit?.code),
    }));
  }

  function toggleTag(tagId: string) {
    setForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((id) => id !== tagId)
        : [...current.tagIds, tagId],
    }));
  }

  function addVariantSelection() {
    setVariantSelections((current) => [
      ...current,
      {
        ...emptyVariantSelection,
        key: `variant-option-${Date.now()}`,
        optionId:
          variantOptions.find(
            (option) => !current.some((selection) => selection.optionId === option.id),
          )?.id ?? "",
      },
    ]);
  }

  function updateVariantSelection(
    key: string,
    patch: Partial<Omit<VariantSelection, "key">>,
  ) {
    setVariantSelections((current) =>
      current.map((selection) =>
        selection.key === key ? { ...selection, ...patch } : selection,
      ),
    );
  }

  function removeVariantSelection(key: string) {
    setVariantSelections((current) =>
      current.length === 1
        ? [{ ...emptyVariantSelection }]
        : current.filter((selection) => selection.key !== key),
    );
  }

  function removeVariantValue(key: string, valueId: string) {
    setVariantSelections((current) =>
      current.map((selection) =>
        selection.key === key
          ? {
              ...selection,
              valueIds: selection.valueIds.filter((id) => id !== valueId),
            }
          : selection,
      ),
    );
  }

  function getAttributeValueLabel(optionId: string, valueId: string) {
    const option = variantOptions.find((item) => item.id === optionId);
    const value = option?.values?.find((item) => item.id === valueId);

    return value?.value ?? valueId;
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
        if (index === 0) body.append("isFeatured", "true");

        return apiRequest(`/products/${productId}/media`, {
          method: "POST",
          body,
        });
      }),
    );
  }

  function buildVariants() {
    if (form.productType === "simple") {
      const sku = form.sku.trim() || `${slugify(form.name || "product")}-default`;
      return [{
        sku,
        price: form.retailPrice ? Number(form.retailPrice) : 0,
        cost: form.unitPrice ? Number(form.unitPrice) : undefined,
        stockQuantity: 0,
        isDefault: true,
      }];
    }

    const basePayload = {
      price: form.retailPrice ? Number(form.retailPrice) : 0,
      cost: form.unitPrice ? Number(form.unitPrice) : undefined,
      stockQuantity: 0,
    };

    return variantPreview.map((variant, index) => ({
      ...basePayload,
      sku: variant.sku,
      isDefault: index === 0,
      attributeValueIds: variant.valueIds,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.productType === "variant" && variantPreview.length === 0) {
      setError("Select at least one variant option value.");
      return;
    }

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
          tagIds: form.tagIds,
          variants: buildVariants(),
        }),
      });

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
        description="Create product details, pricing, tags, images, and optional variants."
        action={
          <Link
            className="inline-flex h-12 items-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-xs hover:bg-slate-50 transition"
            href="/admin/products"
          >
            <AdminIcon className="h-4 w-4 text-slate-400" name="chevronRight" />
            Products
          </Link>
        }
      />

      <form
        className="mx-auto max-w-5xl space-y-6 rounded-lg border border-slate-200/60 bg-white p-6 shadow-xs"
        onSubmit={handleSubmit}
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Product name
              </span>
              <input
                autoFocus
                className="h-12 w-full rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition"
                onChange={(event) => updateName(event.target.value)}
                placeholder="Premium Green Tea"
                required
                value={form.name}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Category
              </span>
              <select
                className="h-12 w-full rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition cursor-pointer"
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
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Product slug
            </span>
            <input
              className="h-12 w-full rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition"
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

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Description
            </span>
            <textarea
              className="min-h-28 w-full rounded-md border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition"
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

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Brand
              </span>
              <select
                className="h-12 w-full rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition cursor-pointer"
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
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Unit
              </span>
              <select
                className="h-12 w-full rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition cursor-pointer"
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
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Status
              </span>
              <select
                className="h-12 w-full rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition cursor-pointer"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as ProductCreateForm["status"],
                  }))
                }
                value={form.status}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          <div>
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Tags
            </span>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = form.tagIds.includes(tag.id);

                  return (
                    <button
                      className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        selected
                          ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      type="button"
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-xs font-medium text-slate-400">
                No active tags found.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-800">Product type and pricing</h2>
              <button
                className="inline-flex h-10 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer shadow-xs"
                onClick={generateSku}
                type="button"
              >
                <AdminIcon className="h-3.5 w-3.5 text-slate-500" name="refresh" />
                Generate SKU
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1">
              {[
                ["simple", "No variant product"],
                ["variant", "Variant product"],
              ].map(([value, label]) => (
                <button
                  className={`h-10 rounded-md text-sm font-bold transition cursor-pointer ${
                    form.productType === value
                      ? "bg-white text-slate-800 shadow-xs font-extrabold"
                      : "text-slate-550 hover:text-slate-700"
                  }`}
                  key={value}
                  onClick={() => {
                    setForm((current) => ({
                      ...current,
                      productType: value as ProductCreateForm["productType"],
                    }));
                    if (value === "simple") {
                      setVariantSelections([{ ...emptyVariantSelection }]);
                    }
                  }}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  SKU
                </span>
                <input
                  className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium uppercase outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sku: event.target.value }))
                  }
                  placeholder="PREMIUMTEA-PCS"
                  value={form.sku}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Unit price
                </span>
                <input
                  className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition"
                  min="0"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      unitPrice: event.target.value,
                    }))
                  }
                  placeholder="320"
                  step="0.01"
                  type="number"
                  value={form.unitPrice}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Retail price
                </span>
                <input
                  className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition"
                  min="0"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      retailPrice: event.target.value,
                    }))
                  }
                  placeholder="450"
                  step="0.01"
                  type="number"
                  value={form.retailPrice}
                />
              </label>
            </div>

            {form.productType === "variant" && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-800">Variant options</h3>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    Choose a variant option first, then choose values from that option.
                  </p>
                </div>
                {variantOptions.length > 0 ? (
                  <div className="space-y-4">
                    {variantSelections.map((selection, index) => {
                      const option = variantOptions.find(
                        (item) => item.id === selection.optionId,
                      );
                      const usedOptionIds = new Set(
                        variantSelections
                           .filter((item) => item.key !== selection.key)
                           .map((item) => item.optionId)
                           .filter(Boolean),
                      );

                      return (
                        <div
                          className="rounded-md border border-slate-200/70 bg-white p-4"
                          key={selection.key}
                        >
                          <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-50 pb-3">
                            <p className="text-sm font-bold text-slate-800">
                              Variant option {index + 1}
                            </p>
                            <button
                              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-rose-50 hover:bg-rose-100 px-3 text-sm font-semibold text-rose-700 transition cursor-pointer"
                              onClick={() => removeVariantSelection(selection.key)}
                              type="button"
                            >
                              <AdminIcon className="h-3.5 w-3.5" name="x" />
                              Remove
                            </button>
                          </div>
                          <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
                            <label className="block">
                              <span className="mb-2 block text-sm font-bold text-slate-700">
                                Variant option
                              </span>
                              <select
                                className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition cursor-pointer"
                                onChange={(event) =>
                                  updateVariantSelection(selection.key, {
                                    optionId: event.target.value,
                                    pendingValueId: "",
                                    valueIds: [],
                                  })
                                }
                                value={selection.optionId}
                              >
                                <option value="">Select option</option>
                                {variantOptions
                                  .filter(
                                    (item) =>
                                      item.id === selection.optionId ||
                                      !usedOptionIds.has(item.id),
                                  )
                                  .map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                              </select>
                            </label>
                            <div className="block">
                              <span className="mb-2 block text-sm font-bold text-slate-700">
                                Option values
                              </span>
                              {option ? (
                                <div className="space-y-3">
                                  <div className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded-md bg-slate-50/50 min-h-12">
                                    {(option.values ?? []).map((val) => {
                                      const isSelected = selection.valueIds.includes(val.id);
                                      return (
                                        <button
                                          key={val.id}
                                          type="button"
                                          onClick={() => {
                                            const nextValueIds = isSelected
                                              ? selection.valueIds.filter((id) => id !== val.id)
                                              : [...selection.valueIds, val.id];
                                            updateVariantSelection(selection.key, {
                                              valueIds: nextValueIds,
                                            });
                                          }}
                                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold border transition cursor-pointer ${
                                            isSelected
                                              ? "bg-slate-900 border-slate-900 text-white shadow-xs font-bold"
                                              : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:text-slate-800"
                                          }`}
                                        >
                                          <span>{val.value}</span>
                                          {isSelected && (
                                            <AdminIcon className="h-3 w-3 text-white/80" name="check" />
                                          )}
                                        </button>
                                      );
                                    })}
                                    {(option.values ?? []).length === 0 && (
                                      <span className="text-sm font-medium text-slate-400 p-1">
                                        No values found for this option
                                      </span>
                                    )}
                                  </div>

                                  {selection.valueIds.length > 1 && (
                                    <div className="rounded-md border border-slate-100 bg-slate-50/30 p-2.5">
                                      <p className="mb-2 text-xs font-bold text-slate-500">
                                        Drag and drop value tags to reorder them:
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {selection.valueIds.map((valId, idx) => {
                                          const label = getAttributeValueLabel(selection.optionId, valId);
                                          return (
                                            <div
                                              key={valId}
                                              draggable
                                              onDragStart={(e) => {
                                                e.dataTransfer.setData("text/plain", idx.toString());
                                              }}
                                              onDragOver={(e) => {
                                                e.preventDefault();
                                              }}
                                              onDrop={(e) => {
                                                e.preventDefault();
                                                const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
                                                const toIndex = idx;
                                                if (fromIndex === toIndex || isNaN(fromIndex)) return;
                                                const next = [...selection.valueIds];
                                                const [removed] = next.splice(fromIndex, 1);
                                                next.splice(toIndex, 0, removed);
                                                updateVariantSelection(selection.key, { valueIds: next });
                                              }}
                                              className="cursor-grab active:cursor-grabbing inline-flex items-center gap-2 rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-350 transition"
                                              title="Drag to reorder"
                                            >
                                              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <circle cx="9" cy="5" r="1.2" fill="currentColor" />
                                                <circle cx="9" cy="12" r="1.2" fill="currentColor" />
                                                <circle cx="9" cy="19" r="1.2" fill="currentColor" />
                                                <circle cx="15" cy="5" r="1.2" fill="currentColor" />
                                                <circle cx="15" cy="12" r="1.2" fill="currentColor" />
                                                <circle cx="15" cy="19" r="1.2" fill="currentColor" />
                                              </svg>
                                              <span>{label}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center min-h-12 border border-slate-200 border-dashed bg-slate-50/30 rounded-md px-3 text-sm font-semibold text-slate-400">
                                  Select a variant option first
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      className="inline-flex h-10 items-center gap-1.5 rounded-md border border-slate-200 hover:bg-slate-50 bg-white px-4 text-sm font-semibold text-slate-600 disabled:opacity-50 transition cursor-pointer"
                      disabled={
                        variantSelections.length >= variantOptions.length
                      }
                      onClick={addVariantSelection}
                      type="button"
                    >
                      <AdminIcon className="h-3.5 w-3.5 text-slate-500" name="plus" />
                      Add another variant option
                    </button>

                    {variantPreview.length > 0 && (
                      <div className="rounded-md border border-slate-200 bg-slate-50/50 p-4">
                        <p className="mb-2 text-sm font-bold text-slate-700">
                          Variants to create
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {variantPreview.map((variant) => (
                            <span
                              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm font-semibold text-slate-700"
                              key={variant.sku}
                            >
                              {variant.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-400 text-center">
                    No variant options found. Add options from Variant Options first.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5 border-t border-slate-100 pt-6">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Product images
            </span>
            <input
              accept="image/*"
              className="block w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500"
              multiple
              onChange={(event) => updateImages(event.target.files)}
              ref={imageInputRef}
              type="file"
            />
          </label>

          {imagePreviewUrls.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-slate-700">
                  Selected images
                </h2>
                <button
                  className="text-sm font-semibold text-red-700"
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
                    className="relative overflow-hidden rounded-md border border-slate-200 bg-white cursor-grab active:cursor-grabbing transition hover:border-slate-350 hover:shadow-2xs"
                    key={url}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", index.toString());
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
                      const toIndex = index;
                      if (fromIndex === toIndex || isNaN(fromIndex)) return;
                      setForm((current) => {
                        const next = [...current.images];
                        const [removed] = next.splice(fromIndex, 1);
                        next.splice(toIndex, 0, removed);
                        return { ...current, images: next };
                      });
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      className="aspect-square w-full object-cover pointer-events-none"
                      src={url}
                    />
                    <div className="absolute top-1 left-1 flex gap-1 pointer-events-none">
                      {index === 0 ? (
                        <span className="rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-black text-white backdrop-blur-xs">
                          Featured
                        </span>
                      ) : (
                        <span className="rounded bg-slate-500/80 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 p-2 pointer-events-none">
                      <svg className="h-3.5 w-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <circle cx="9" cy="5" r="1.2" fill="currentColor" />
                        <circle cx="9" cy="12" r="1.2" fill="currentColor" />
                        <circle cx="9" cy="19" r="1.2" fill="currentColor" />
                        <circle cx="15" cy="5" r="1.2" fill="currentColor" />
                        <circle cx="15" cy="12" r="1.2" fill="currentColor" />
                        <circle cx="15" cy="19" r="1.2" fill="currentColor" />
                      </svg>
                      <p className="truncate flex-1 text-right pl-2 text-xs font-semibold text-slate-650">
                        {form.images[index]?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid min-h-48 place-items-center rounded-md border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-slate-450">
              <div>
                <AdminIcon className="mx-auto h-8 w-8 text-slate-350" name="upload" />
                <p className="mt-3 text-xs font-medium">
                  Upload product gallery images. The first selected image becomes featured.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-md border border-slate-200/60 bg-slate-50 p-4">
            <h2 className="text-sm font-bold text-slate-800">Stock adjustment</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Stock is not adjusted here. New variants start with 0 stock and should be updated from Stock Management.
            </p>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Link
              className="inline-flex h-12 items-center rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              href="/admin/products"
            >
              Cancel
            </Link>
            <button
              className="inline-flex h-12 items-center gap-1.5 rounded-md bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:opacity-60 cursor-pointer shadow-xs transition"
              disabled={isSaving}
              type="submit"
            >
              <AdminIcon className="h-4 w-4" name="plus" />
              {isSaving ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
