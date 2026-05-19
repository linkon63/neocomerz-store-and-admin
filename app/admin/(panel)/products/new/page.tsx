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
  type ProductVariant,
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

type VariantDraft = {
  key: string;
  sku: string;
  valueIds: string[];
  label: string;
  price: string;
  cost: string;
  stockQuantity: string;
  images: File[];
  imagePreviews: string[];
  isDefault: boolean;
};

type ProductCreateForm = {
  name: string;
  categoryId: string;
  slug: string;
  description: string;
  brandId: string;
  unitId: string;
  baseUnitId: string;
  status: "active" | "inactive" | "draft";
  tagIds: string[];
  supplierId: string;
  supplierPrice: string;
  branchId: string;
  channelIds: string[];
  vatId: string;
  factor: string;
  markup: string;
  purchaseDate: string;
  purchaseOrderReturnable: boolean;
  includeStock: boolean;
  sizeChart: File | null;
  careGuide: File | null;
  productType: "simple" | "variant";
  sku: string;
  unitPrice: string;
  retailPrice: string;
  stockQuantity: string;
  images: File[];
};

const emptyForm: ProductCreateForm = {
  name: "",
  categoryId: "",
  slug: "",
  description: "",
  brandId: "",
  unitId: "",
  baseUnitId: "",
  status: "active",
  tagIds: [],
  supplierId: "",
  supplierPrice: "",
  branchId: "",
  channelIds: [],
  vatId: "",
  factor: "1",
  markup: "",
  purchaseDate: "",
  purchaseOrderReturnable: false,
  includeStock: true,
  sizeChart: null,
  careGuide: null,
  productType: "simple",
  sku: "",
  unitPrice: "",
  retailPrice: "",
  stockQuantity: "0",
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
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [channels, setChannels] = useState<Array<{ id: string; name: string }>>([]);
  const [vats, setVats] = useState<Array<{ id: string; name: string; rate: number }>>([]);
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
      key: values.map((value) => value.id).join("|") || "variant",
      label: values.map((value) => value.value).join(" / "),
      valueIds: values.map((value) => value.id),
      sku: `${form.sku || makeSkuSeed(form.name, selectedUnit?.code)}-${values
        .map((value) => slugify(value.value).replace(/-/g, "").toUpperCase())
        .join("-")}`,
    }));
  }, [form.name, form.sku, selectedUnit?.code, selectedVariantGroups]);

  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>([]);

  // Keep drafts in sync with the currently selected option values.
  useEffect(() => {
    if (form.productType !== "variant") {
      setVariantDrafts([]);
      return;
    }

    const basePrice = form.retailPrice;
    const baseCost = form.unitPrice;
    const baseStock = form.stockQuantity;

    setVariantDrafts((current) => {
      const next: VariantDraft[] = variantPreview.map((v, idx) => {
        const existing = current.find((d) => d.key === v.key);
        return {
          key: v.key,
          sku: v.sku,
          valueIds: v.valueIds,
          label: v.label,
          price: existing?.price ?? basePrice,
          cost: existing?.cost ?? baseCost,
          stockQuantity: existing?.stockQuantity ?? baseStock,
          images: existing?.images ?? [],
          imagePreviews: existing?.imagePreviews ?? [],
          isDefault: existing?.isDefault ?? idx === 0,
        };
      });

      // Ensure exactly one default.
      const hasDefault = next.some((d) => d.isDefault);
      if (!hasDefault && next.length > 0) next[0] = { ...next[0], isDefault: true };
      const firstDefaultIndex = next.findIndex((d) => d.isDefault);
      return next.map((d, i) => (i !== firstDefaultIndex && d.isDefault ? { ...d, isDefault: false } : d));
    });
  }, [form.productType, form.retailPrice, form.unitPrice, form.stockQuantity, variantPreview]);

  useEffect(() => {
    async function loadLookups() {
      setError("");

      try {
        const [
          brandList,
          categoryList,
          unitList,
          tagList,
          attributeList,
          supplierList,
          branchList,
          channelList,
          vatList,
        ] = await Promise.all([
          apiRequest<Brand[]>("/brands"),
          apiRequest<Category[]>("/category"),
          apiRequest<Unit[]>("/units"),
          apiRequest<Tag[]>("/tags"),
          apiRequest<Attribute[]>("/attributes"),
          apiRequest<Array<{ id: string; name: string }>>("/suppliers"),
          apiRequest<Array<{ id: string; name: string }>>("/branches"),
          apiRequest<Array<{ id: string; name: string }>>("/channels"),
          apiRequest<Array<{ id: string; name: string; rate: number }>>("/vat"),
        ]);
        const activeUnits = unitList.filter((unit) => unit.isActive);
        const activeTags = tagList.filter((tag) => tag.isActive);

        setBrands(brandList);
        setCategories(categoryList);
        setUnits(activeUnits);
        setTags(activeTags);
        setVariantOptions(attributeList);
        setSuppliers(supplierList);
        setBranches(branchList);
        setChannels(channelList);
        setVats(vatList);
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
          baseUnitId: current.baseUnitId || activeUnits[0]?.id || "",
          supplierId: current.supplierId || supplierList[0]?.id || "",
          branchId: current.branchId || branchList[0]?.id || "",
          vatId: current.vatId || vatList[0]?.id || "",
          channelIds:
            current.channelIds.length > 0
              ? current.channelIds
              : channelList.slice(0, 2).map((channel) => channel.id),
        }));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load product form data",
        );
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadLookups();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

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

  function toggleChannel(channelId: string) {
    setForm((current) => ({
      ...current,
      channelIds: current.channelIds.includes(channelId)
        ? current.channelIds.filter((id) => id !== channelId)
        : [...current.channelIds, channelId],
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

  function updateVariantImages(key: string, files: FileList | null) {
    setVariantDrafts((current) =>
      current.map((draft) => {
        if (draft.key !== key) return draft;
        if (!files || files.length === 0) {
          draft.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
          return { ...draft, images: [], imagePreviews: [] };
        }
        const list = Array.from(files);
        const previews = list.map((file) => URL.createObjectURL(file));
        draft.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        return { ...draft, images: list, imagePreviews: previews };
      }),
    );
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

  async function uploadVariantImages(variantId: string, files: File[]) {
    await Promise.all(
      files.map((image, index) => {
        const body = new FormData();
        body.append("file", image);
        body.append("type", "image");
        body.append("sortOrder", String(index));
        if (index === 0) body.append("isFeatured", "true");

        return apiRequest(`/variants/${variantId}/media`, {
          method: "POST",
          body,
        });
      }),
    );
  }

  async function createVariants(productId: string): Promise<ProductVariant[]> {
    if (!form.sku.trim() || !form.retailPrice) return [];

    const basePayload = {
      price: Number(form.retailPrice),
      cost: form.unitPrice ? Number(form.unitPrice) : undefined,
      stockQuantity: Number(form.stockQuantity || 0),
    };

    if (form.productType === "simple") {
      if (!form.sku.trim() || !form.retailPrice) {
        setError("SKU and retail price are required.");
        return [];
      }
      const created = await apiRequest<ProductVariant>(`/products/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...basePayload,
          sku: form.sku.trim(),
          isDefault: true,
        }),
      });
      return [created];
    }

    if (variantDrafts.some((variant) => !variant.sku.trim() || !variant.price)) {
      setError("Every variant needs a SKU and price.");
      return [];
    }

    const createdVariants = await Promise.all(
      variantDrafts.map((variant) =>
        apiRequest<ProductVariant>(`/products/${productId}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...basePayload,
            sku: variant.sku,
            // Allow per-variant pricing; fall back to base retail/unit price.
            price: variant.price ? Number(variant.price) : basePayload.price,
            cost: variant.cost ? Number(variant.cost) : basePayload.cost,
            stockQuantity:
              variant.stockQuantity !== "" && variant.stockQuantity !== undefined
                ? Number(variant.stockQuantity)
                : basePayload.stockQuantity,
            isDefault: Boolean(variant.isDefault),
            attributeValueIds: variant.valueIds,
          }),
        }),
      ),
    );

    return createdVariants;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.productType === "variant" && variantPreview.length === 0) {
      setError("Select at least one variant option value.");
      return;
    }

    if (!form.sku.trim() || !form.retailPrice) {
      setError("SKU and retail price are required.");
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
            baseUnitId: form.baseUnitId || undefined,
            supplierId: form.supplierId || undefined,
            supplierPrice: form.supplierPrice ? Number(form.supplierPrice) : undefined,
            branchId: form.branchId || undefined,
            channelIds: form.channelIds,
            vatId: form.vatId || undefined,
            factor: form.factor ? Number(form.factor) : undefined,
            markup: form.markup ? Number(form.markup) : undefined,
            purchaseDate: form.purchaseDate ? new Date(form.purchaseDate) : undefined,
            purchaseOrderReturnable: form.purchaseOrderReturnable,
            includeStock: form.includeStock,
            tagIds: form.tagIds,
          }),
        });

      const createdVariants = await createVariants(product.id);
      if (!createdVariants?.length) return;
      if (form.productType === "variant" && createdVariants?.length) {
        await Promise.all(
          variantDrafts.map((draft) => {
            if (!draft.images.length) return Promise.resolve();
            const match = createdVariants.find((created) => created.sku === draft.sku);
            if (!match) return Promise.resolve();
            return uploadVariantImages(match.id, draft.images);
          }),
        );
      }
      if (form.sizeChart) {
        const body = new FormData();
        body.append("file", form.sizeChart);
        body.append("type", "image");
        await apiRequest(`/products/${product.id}/size-chart`, {
          method: "POST",
          body,
        });
      }
      if (form.careGuide) {
        const body = new FormData();
        body.append("file", form.careGuide);
        body.append("type", "image");
        await apiRequest(`/products/${product.id}/care-guide`, {
          method: "POST",
          body,
        });
      }
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
          description="Add, view and edit your products all in one place."
          action={
            <div className="flex items-center gap-3">
              <Link
                className="inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-slate-600 hover:text-slate-900"
                href="/admin/products"
              >
                <AdminIcon className="h-4 w-4" name="chevronRight" />
                Back to product list
              </Link>
              <button
                className="inline-flex h-11 items-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700"
                type="button"
                onClick={() => router.push("/admin/products")}
              >
                Cancel
              </button>
              <button
                className="inline-flex h-11 items-center rounded-lg bg-blue-500 px-6 text-sm font-semibold text-white disabled:opacity-60"
                type="submit"
                form="add-product-form"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          }
        />

        <form
          id="add-product-form"
          className="mx-auto max-w-5xl space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-slate-900">General Info</h2>
                <p className="text-xs text-slate-500">Add general information for this product</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">
                    Name
                  </span>
                  <input
                    autoFocus
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                    onChange={(event) => updateName(event.target.value)}
                    placeholder="Enter a product name"
                    required
                    value={form.name}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">
                    Brand
                  </span>
                  <select
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
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
                  <span className="mb-2 block text-xs font-semibold text-slate-700">
                    Category
                  </span>
                  <select
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
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
                  <span className="mb-2 block text-xs font-semibold text-slate-700">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const selected = form.tagIds.includes(tag.id);
                      return (
                        <button
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            selected
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-slate-300 bg-white text-slate-600"
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
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">
                    Base unit
                  </span>
                  <select
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, baseUnitId: event.target.value }))
                    }
                    value={form.baseUnitId}
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
                  <span className="mb-2 block text-xs font-semibold text-slate-700">
                    Unit
                  </span>
                  <select
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
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
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.purchaseOrderReturnable}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          purchaseOrderReturnable: event.target.checked,
                        }))
                      }
                    />
                    Purchase order returnable
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.includeStock}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          includeStock: event.target.checked,
                        }))
                      }
                    />
                    Include stock
                  </label>
                </div>
                <div className="md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Description</span>
                  <textarea
                    className="min-h-28 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Enter description"
                    value={form.description}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-slate-900">Media</h2>
                <p className="text-xs text-slate-500">Upload product, size chart, and care guide files</p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Upload Images</p>
                      <p className="text-xs text-slate-500">Click to upload or drag and drop</p>
                    </div>
                    <label className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700">
                      Upload
                      <input
                        accept="image/*"
                        className="hidden"
                        multiple
                        onChange={(event) => updateImages(event.target.files)}
                        type="file"
                      />
                    </label>
                  </div>
                </div>

                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div
                        className="overflow-hidden rounded-lg border border-slate-200"
                        key={url}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="" className="aspect-square w-full object-cover" src={url} />
                        <p className="truncate px-2 py-1 text-[11px] font-semibold text-slate-600">
                          {form.images[index]?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
                    <p className="text-xs font-semibold text-slate-700">Upload Size Chart</p>
                    <p className="text-xs text-slate-500">Click to upload</p>
                    <label className="mt-3 inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700">
                      Select file
                      <input
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            sizeChart: event.target.files?.[0] ?? null,
                          }))
                        }
                        type="file"
                      />
                    </label>
                    {form.sizeChart && (
                      <p className="mt-2 text-[11px] text-slate-500">{form.sizeChart.name}</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
                    <p className="text-xs font-semibold text-slate-700">Upload Care Guide</p>
                    <p className="text-xs text-slate-500">Click to upload</p>
                    <label className="mt-3 inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700">
                      Select file
                      <input
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            careGuide: event.target.files?.[0] ?? null,
                          }))
                        }
                        type="file"
                      />
                    </label>
                    {form.careGuide && (
                      <p className="mt-2 text-[11px] text-slate-500">{form.careGuide.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-slate-900">Channel & Branch</h2>
                <p className="text-xs text-slate-500">Set where the product is available</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Channel</span>
                  <div className="flex flex-wrap gap-2">
                    {channels.map((channel) => {
                      const selected = form.channelIds.includes(channel.id);
                      return (
                        <button
                          key={channel.id}
                          type="button"
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            selected
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-slate-300 bg-white text-slate-600"
                          }`}
                          onClick={() => toggleChannel(channel.id)}
                        >
                          {channel.name}
                        </button>
                      );
                    })}
                  </div>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Branch</span>
                  <select
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, branchId: event.target.value }))
                    }
                    value={form.branchId}
                  >
                    <option value="">Select branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-slate-900">Inventory</h2>
                <p className="text-xs text-slate-500">Choose the product type and inventory details</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  className={`rounded-xl border p-4 text-left ${
                    form.productType === "simple"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200"
                  }`}
                  onClick={() => {
                    setForm((current) => ({ ...current, productType: "simple" }));
                    setVariantSelections([{ ...emptyVariantSelection }]);
                  }}
                >
                  <p className="text-sm font-semibold text-slate-900">Single/Non variant product</p>
                  <p className="mt-1 text-xs text-slate-500">
                    This product is a single SKU with its own inventory
                  </p>
                </button>
                <button
                  type="button"
                  className={`rounded-xl border p-4 text-left ${
                    form.productType === "variant"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200"
                  }`}
                  onClick={() => setForm((current) => ({ ...current, productType: "variant" }))}
                >
                  <p className="text-sm font-semibold text-slate-900">Variant Product</p>
                  <p className="mt-1 text-xs text-slate-500">
                    This product has multiple variants like size or color
                  </p>
                </button>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-slate-900">Supplier & VAT</h2>
                <p className="text-xs text-slate-500">Supplier, VAT, and purchasing details</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Supplier Name</span>
                  <select
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, supplierId: event.target.value }))
                    }
                    value={form.supplierId}
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Supplier Price</span>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                    type="number"
                    step="0.01"
                    value={form.supplierPrice}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, supplierPrice: event.target.value }))
                    }
                    placeholder="0.00"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Purchase Date</span>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                    type="date"
                    value={form.purchaseDate}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, purchaseDate: event.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">VAT</span>
                  <select
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                    value={form.vatId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, vatId: event.target.value }))
                    }
                  >
                    <option value="">Select VAT</option>
                    {vats.map((vat) => (
                      <option key={vat.id} value={vat.id}>
                        {vat.name} ({vat.rate}%)
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-slate-900">Price</h2>
                <p className="text-xs text-slate-500">Set the selling price details</p>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Factor</span>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                    type="number"
                    step="0.01"
                    value={form.factor}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, factor: event.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Unit Price</span>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                    type="number"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, unitPrice: event.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Retail Price</span>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                    type="number"
                    step="0.01"
                    value={form.retailPrice}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, retailPrice: event.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Markup</span>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                    type="number"
                    step="0.01"
                    value={form.markup}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, markup: event.target.value }))
                    }
                  />
                </label>
              </div>
            </section>

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
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Initial stock
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
                  placeholder="0"
                  step="1"
                  type="number"
                  value={form.stockQuantity}
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
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-700">Variants to create</p>
                            <p className="mt-0.5 text-xs font-bold text-slate-500">
                              Set SKU, price, cost, stock, default, and images per variant.
                            </p>
                          </div>
                          <button
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-black"
                            type="button"
                            onClick={() =>
                              setVariantDrafts((current) =>
                                current.map((d) => ({
                                  ...d,
                                  price: form.retailPrice,
                                  cost: form.unitPrice,
                                  stockQuantity: form.stockQuantity,
                                })),
                              )
                            }
                          >
                            <AdminIcon className="h-4 w-4" name="refresh" />
                            Apply base values
                          </button>
                        </div>

                        <div className="grid gap-3">
                          {variantDrafts.map((v) => (
                            <div
                              key={v.key}
                              className="rounded-lg border border-slate-200 bg-white p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-black text-slate-800">{v.label}</p>
                                  <p className="mt-0.5 text-xs font-bold text-slate-500">
                                    {v.sku}
                                  </p>
                                </div>
                                <label className="inline-flex items-center gap-2 text-xs font-black text-slate-600">
                                  <input
                                    checked={v.isDefault}
                                    onChange={() =>
                                      setVariantDrafts((current) =>
                                        current.map((d) =>
                                          d.key === v.key
                                            ? { ...d, isDefault: true }
                                            : { ...d, isDefault: false },
                                        ),
                                      )
                                    }
                                    type="radio"
                                    name="default-variant"
                                  />
                                  Default
                                </label>
                              </div>

                              <div className="mt-4 grid gap-4 md:grid-cols-[1.3fr_repeat(3,0.7fr)]">
                                <label className="block">
                                  <span className="mb-1 block text-xs font-black text-slate-600">
                                    SKU
                                  </span>
                                  <input
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold uppercase outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    value={v.sku}
                                    onChange={(e) => {
                                      const nextSku = e.target.value;
                                      setVariantDrafts((current) =>
                                        current.map((d) =>
                                          d.key === v.key ? { ...d, sku: nextSku } : d,
                                        ),
                                      );
                                    }}
                                  />
                                </label>
                                <label className="block">
                                  <span className="mb-1 block text-xs font-black text-slate-600">
                                    Cost
                                  </span>
                                  <input
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    min="0"
                                    step="0.01"
                                    type="number"
                                    value={v.cost}
                                    onChange={(e) =>
                                      setVariantDrafts((current) =>
                                        current.map((d) =>
                                          d.key === v.key ? { ...d, cost: e.target.value } : d,
                                        ),
                                      )
                                    }
                                  />
                                </label>
                                <label className="block">
                                  <span className="mb-1 block text-xs font-black text-slate-600">
                                    Price
                                  </span>
                                  <input
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    min="0"
                                    step="0.01"
                                    type="number"
                                    value={v.price}
                                    onChange={(e) =>
                                      setVariantDrafts((current) =>
                                        current.map((d) =>
                                          d.key === v.key ? { ...d, price: e.target.value } : d,
                                        ),
                                      )
                                    }
                                  />
                                </label>
                                <label className="block">
                                  <span className="mb-1 block text-xs font-black text-slate-600">
                                    Stock
                                  </span>
                                  <input
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    min="0"
                                    step="1"
                                    type="number"
                                    value={v.stockQuantity}
                                    onChange={(e) =>
                                      setVariantDrafts((current) =>
                                        current.map((d) =>
                                          d.key === v.key
                                            ? { ...d, stockQuantity: e.target.value }
                                            : d,
                                        ),
                                      )
                                    }
                                  />
                                </label>
                              </div>

                              <div className="mt-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-black text-slate-600">Variant images</p>
                                  {v.images.length > 0 && (
                                    <span className="text-xs font-bold text-slate-500">
                                      {v.images.length} selected
                                    </span>
                                  )}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {(v.imagePreviews ?? []).map((url, index) => (
                                    <div
                                      className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200"
                                      key={`${v.key}-preview-${index}`}
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img alt="" className="h-full w-full object-cover" src={url} />
                                    </div>
                                  ))}
                                  <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-500 hover:bg-slate-50">
                                    <AdminIcon className="h-4 w-4" name="upload" />
                                    <span className="mt-1 text-[10px] font-bold">Add</span>
                                    <input
                                      accept="image/*"
                                      className="hidden"
                                      multiple
                                      onChange={(event) =>
                                        updateVariantImages(v.key, event.target.files)
                                      }
                                      type="file"
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
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
            <h2 className="font-black text-slate-800">Stock management</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Initial stock is set above. You can adjust stock later from Stock Management.
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
