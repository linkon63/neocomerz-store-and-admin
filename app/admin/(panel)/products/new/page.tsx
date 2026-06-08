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
        values: (option.values ?? []).filter((value) =>
          selection.valueIds.includes(value.id),
        ),
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
            className="inline-flex h-14 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 font-black"
            href="/admin/products"
          >
            <AdminIcon className="h-5 w-5" name="chevronRight" />
            Products
          </Link>
        }
      />

      <form
        className="mx-auto max-w-5xl space-y-6 rounded-xl border border-slate-100 bg-white p-6 shadow-sm"
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
          </div>

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
              placeholder="Short product details for admin and storefront display"
              value={form.description}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
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
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          <div>
            <span className="mb-2 block text-sm font-black text-slate-700">
              Tags
            </span>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = form.tagIds.includes(tag.id);

                  return (
                    <button
                      className={`rounded-lg border px-3 py-2 text-sm font-black ${
                        selected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-300 bg-white text-slate-700"
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
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 font-medium text-slate-500">
                No active tags found.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">Product type and pricing</h2>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-black"
                onClick={generateSku}
                type="button"
              >
                <AdminIcon className="h-4 w-4" name="refresh" />
                Generate SKU
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              {[
                ["simple", "No variant product"],
                ["variant", "Variant product"],
              ].map(([value, label]) => (
                <button
                  className={`h-11 rounded-lg text-sm font-black ${
                    form.productType === value
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600"
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
                <span className="mb-2 block text-sm font-black text-slate-700">
                  SKU
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium uppercase outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sku: event.target.value }))
                  }
                  placeholder="PREMIUMTEA-PCS"
                  value={form.sku}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Unit price
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Retail price
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                  <h3 className="text-base font-black">Variant options</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
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
                          className="rounded-lg border border-slate-200 p-4"
                          key={selection.key}
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="font-black text-slate-800">
                              Variant option {index + 1}
                            </p>
                            <button
                              className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-50 px-3 text-sm font-black text-red-700"
                              onClick={() => removeVariantSelection(selection.key)}
                              type="button"
                            >
                              <AdminIcon className="h-4 w-4" name="x" />
                              Remove
                            </button>
                          </div>
                          <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
                            <label className="block">
                              <span className="mb-2 block text-sm font-black text-slate-700">
                                Variant option
                              </span>
                              <select
                                className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                              <span className="mb-2 block text-sm font-black text-slate-700">
                                Option values
                              </span>
                              <div className="mb-2 flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
                                {selection.valueIds.length > 0 ? (
                                  selection.valueIds.map((valueId) => (
                                    <button
                                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-2.5 py-1.5 text-sm font-black text-blue-700"
                                      key={valueId}
                                      onClick={() =>
                                        removeVariantValue(selection.key, valueId)
                                      }
                                      type="button"
                                    >
                                      {getAttributeValueLabel(
                                        selection.optionId,
                                        valueId,
                                      )}
                                      <AdminIcon className="h-4 w-4" name="x" />
                                    </button>
                                  ))
                                ) : (
                                  <span className="font-medium text-slate-400">
                                    Selected values will appear here
                                  </span>
                                )}
                              </div>
                              <select
                                className="min-h-28 w-full rounded-lg border border-slate-300 px-4 py-3 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                disabled={!option}
                                multiple
                                onChange={(event) =>
                                  updateVariantSelection(selection.key, {
                                    valueIds: Array.from(
                                      event.target.selectedOptions,
                                      (selectedOption) => selectedOption.value,
                                    ),
                                  })
                                }
                                value={selection.valueIds}
                              >
                                {option?.values?.map((value) => (
                                  <option key={value.id} value={value.id}>
                                    {value.value}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 font-black text-slate-700 disabled:opacity-50"
                      disabled={
                        variantSelections.length >= variantOptions.length
                      }
                      onClick={addVariantSelection}
                      type="button"
                    >
                      <AdminIcon className="h-4 w-4" name="plus" />
                      Add another variant option
                    </button>

                    {variantPreview.length > 0 && (
                      <div className="rounded-lg bg-slate-50 p-4">
                        <p className="mb-2 text-sm font-black text-slate-700">
                          Variants to create
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {variantPreview.map((variant) => (
                            <span
                              className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700"
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
                  <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 font-medium text-slate-500">
                    No variant options found. Add options from Variant Options first.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5 border-t border-slate-100 pt-6">
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

          <div className="rounded-lg bg-slate-50 p-4">
            <h2 className="font-black text-slate-800">Stock adjustment</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Stock is not adjusted here. New variants start with 0 stock and should be updated from Stock Management.
            </p>
          </div>

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
