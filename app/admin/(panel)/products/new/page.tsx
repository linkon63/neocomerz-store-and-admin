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
  stockQuantity: "",
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
  const [variantOptions, setVariantOptions] = useState<Attribute[]>([]);
  const [form, setForm] = useState<ProductCreateForm>(emptyForm);
  // Track whether the user has manually edited the slug so we stop auto-generating
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
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
    let result: Array<{ key: string; label: string; valueIds: string[]; sku: string }> = [];
    if (groups.length > 0) {
      result = cartesianProduct(groups).map((values) => ({
        key: values.map((value) => value.id).join("|") || "variant",
        label: values.map((value) => value.value).join(" / "),
        valueIds: values.map((value) => value.id),
        sku: `${form.sku || makeSkuSeed(form.name, selectedUnit?.code)}-${values
          .map((value) => slugify(value.value).replace(/-/g, "").toUpperCase())
          .join("-")}`,
      }));
      result.sort((a, b) => a.sku.localeCompare(b.sku));
    }
    return result;
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

      // Helper: fetch a lookup but return an empty array on failure
      // so one broken endpoint never blocks the whole form.
      async function safeFetch<T>(path: string): Promise<T[]> {
        try {
          return await apiRequest<T[]>(path);
        } catch {
          return [];
        }
      }

      try {
        // Required lookups — these must succeed; throw if they fail.
        const [brandList, categoryList, unitList, tagList, attributeList] =
          await Promise.all([
            apiRequest<Brand[]>("/brands"),
            apiRequest<Category[]>("/category"),
            apiRequest<Unit[]>("/units"),
            apiRequest<Tag[]>("/tags"),
            apiRequest<Attribute[]>("/attributes"),
          ]);

        // Optional lookups — silently degrade to empty arrays if the
        // backend endpoint doesn't exist yet.
        const [supplierList, branchList, channelList] =
          await Promise.all([
            safeFetch<{ id: string; name: string }>("/suppliers"),
            safeFetch<{ id: string; name: string }>("/branches"),
            safeFetch<{ id: string; name: string }>("/channels"),
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
        setVariantSelections((current) =>
          current.map((selection, index) =>
            index === 0 && !selection.optionId
              ? { ...selection, optionId: attributeList[0]?.id || "" }
              : selection,
          ),
        );
        // Do NOT auto-select any defaults — leave all selects at their placeholder "Select …"
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
    setForm((current) => ({
      ...current,
      name,
      // Auto-generate slug from name only while user hasn't manually edited it
      slug: slugManuallyEdited ? current.slug : slugify(name),
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

  function removeImage(index: number) {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, i) => i !== index),
    }));
  }

  const handleApplyBaseValues = () => {
    setVariantDrafts((current) =>
      current.map((d) => ({
        ...d,
        price: form.retailPrice,
        cost: form.unitPrice,
        stockQuantity: form.stockQuantity,
      })),
    );
  };

  const handleVariantDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.currentTarget.getAttribute("data-key") || "";
    setVariantDrafts((current) =>
      current.map((d) => ({
        ...d,
        isDefault: d.key === key,
      })),
    );
  };

  const handleVariantSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.currentTarget.getAttribute("data-key") || "";
    const nextSku = e.target.value;
    setVariantDrafts((current) =>
      current.map((d) => (d.key === key ? { ...d, sku: nextSku } : d)),
    );
  };

  const handleVariantCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.currentTarget.getAttribute("data-key") || "";
    const nextCost = e.target.value;
    setVariantDrafts((current) =>
      current.map((d) => (d.key === key ? { ...d, cost: nextCost } : d)),
    );
  };

  const handleVariantPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.currentTarget.getAttribute("data-key") || "";
    const nextPrice = e.target.value;
    setVariantDrafts((current) =>
      current.map((d) => (d.key === key ? { ...d, price: nextPrice } : d)),
    );
  };

  const handleVariantStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.currentTarget.getAttribute("data-key") || "";
    const nextStock = e.target.value;
    setVariantDrafts((current) =>
      current.map((d) => (d.key === key ? { ...d, stockQuantity: nextStock } : d)),
    );
  };

  const handleVariantImagesEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.currentTarget.getAttribute("data-key") || "";
    const files = e.target.files;
    if (!files || files.length === 0) {
      setVariantDrafts((current) =>
        current.map((draft) => {
          let updatedDraft = draft;
          if (draft.key === key) {
            draft.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
            updatedDraft = { ...draft, images: [], imagePreviews: [] };
          }
          return updatedDraft;
        })
      );
    } else {
      const list = Array.from(files);
      const previews = list.map((file) => URL.createObjectURL(file));
      setVariantDrafts((current) =>
        current.map((draft) => {
          let updatedDraft = draft;
          if (draft.key === key) {
            draft.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
            updatedDraft = { ...draft, images: list, imagePreviews: previews };
          }
          return updatedDraft;
        })
      );
    }
  };

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
    let result: ProductVariant[] = [];

    const basePayload = {
      price: Number(form.retailPrice),
      cost: form.unitPrice ? Number(form.unitPrice) : undefined,
      stockQuantity: Number(form.stockQuantity || 0),
    };

    if (form.sku.trim() && form.retailPrice) {
      if (form.productType === "simple") {
        const created = await apiRequest<ProductVariant>(`/products/${productId}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...basePayload,
            sku: form.sku.trim(),
            isDefault: true,
          }),
        });
        result = [created];
      } else {
        if (variantDrafts.some((variant) => !variant.sku.trim() || !variant.price)) {
          setError("Every variant needs a SKU and price.");
        } else {
          result = await Promise.all(
            variantDrafts.map((variant) => {
              const body = {
                ...basePayload,
                sku: variant.sku,
                price: variant.price ? Number(variant.price) : basePayload.price,
                cost: variant.cost ? Number(variant.cost) : basePayload.cost,
                stockQuantity:
                  variant.stockQuantity !== "" && variant.stockQuantity !== undefined
                    ? Number(variant.stockQuantity)
                    : basePayload.stockQuantity,
                isDefault: Boolean(variant.isDefault),
                attributeValueIds: variant.valueIds,
              };
              const created = apiRequest<ProductVariant>(`/products/${productId}/variants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });
              return created;
            }),
          );
        }
      }
    }

    return result;
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
            tagIds: form.tagIds,
            supplierId: form.supplierId || undefined,
            supplierPrice: form.supplierPrice ? Number(form.supplierPrice) : undefined,
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
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">
                    Name <span className="text-red-500">*</span>
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
                    Slug <span className="text-red-500">*</span>
                  </span>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                    onChange={(event) => {
                      setSlugManuallyEdited(true);
                      setForm((current) => ({ ...current, slug: event.target.value }));
                    }}
                    placeholder="product-slug"
                    required
                    value={form.slug}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Status</span>
                  <select
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm capitalize outline-none focus:border-blue-500"
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
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">
                    Brand <span className="text-red-500">*</span>
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
                    Category <span className="text-red-500">*</span>
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-700">
                        {imagePreviewUrls.length} image{imagePreviewUrls.length !== 1 ? "s" : ""} selected
                      </p>
                      <button
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (imageInputRef.current) imageInputRef.current.value = "";
                          setForm((current) => ({ ...current, images: [] }));
                        }}
                        type="button"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div
                          className="group relative overflow-hidden rounded-lg border border-slate-200"
                          key={url}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt="" className="aspect-square w-full object-cover" src={url} />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700"
                            title="Remove image"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <p className="truncate px-2 py-1 text-[11px] font-semibold text-slate-600">
                            {form.images[index]?.name}
                          </p>
                        </div>
                      ))}
                    </div>
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
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                    form.productType === "simple"
                      ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => {
                    setForm((current) => ({ ...current, productType: "simple" }));
                    setVariantSelections([{ ...emptyVariantSelection }]);
                  }}
                >
                  <div className="mr-4">
                    <p className="text-sm font-semibold text-slate-900">Single/Non variant product</p>
                    <p className="mt-1 text-xs text-slate-500">
                      This product is a single SKU with its own inventory
                    </p>
                  </div>
                  <div className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    form.productType === "simple" ? "border-blue-500" : "border-slate-300"
                  }`}>
                    {form.productType === "simple" && <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                    form.productType === "variant"
                      ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => setForm((current) => ({ ...current, productType: "variant" }))}
                >
                  <div className="mr-4">
                    <p className="text-sm font-semibold text-slate-900">Variant Product</p>
                    <p className="mt-1 text-xs text-slate-500">
                      This product has multiple variants like size or color
                    </p>
                  </div>
                  <div className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    form.productType === "variant" ? "border-blue-500" : "border-slate-300"
                  }`}>
                    {form.productType === "variant" && <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
                  </div>
                </button>
              </div>

              {form.productType === "simple" && (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="block text-xs font-semibold text-slate-700">
                        SKU <span className="text-red-500">*</span>
                      </span>
                      <button
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                        onClick={generateSku}
                        type="button"
                      >
                        <AdminIcon className="h-3 w-3" name="refresh" />
                        Generate SKU
                      </button>
                    </div>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm uppercase outline-none focus:border-blue-500"
                      onChange={(event) =>
                        setForm((current) => ({ ...current, sku: event.target.value }))
                      }
                      placeholder="PRODUCT-SKU"
                      required
                      value={form.sku}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-slate-700">Initial stock</span>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
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
              )}

              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Supplier & Purchasing</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-2">
                      <span className="block text-xs font-semibold text-slate-700">Supplier Name</span>
                    </div>
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
                  </div>
                  <div>
                    <span className="mb-2 block text-xs font-semibold text-slate-700">Supplier Price</span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">৳</span>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 pl-8 pr-4 text-sm outline-none focus:border-blue-500"
                        type="number"
                        step="0.01"
                        value={form.supplierPrice}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, supplierPrice: event.target.value }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="mb-2 block text-xs font-semibold text-slate-700">Purchase Date</span>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                      type="date"
                      value={form.purchaseDate}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, purchaseDate: event.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </section>



            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-slate-900">Price</h2>
                <p className="text-xs text-slate-500">Set the selling price details</p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-6 rounded-lg bg-slate-50/50 p-4 border border-slate-100">
                <div className="text-sm font-bold text-slate-700 min-w-16">Piece</div>
                <div className="flex-1 grid gap-4 grid-cols-2 md:grid-cols-4">
                  <div>
                    <span className="mb-2 block text-xs font-semibold text-slate-700">Factor</span>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-500"
                      type="number"
                      step="0.01"
                      value={form.factor}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, factor: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <span className="mb-2 block text-xs font-semibold text-slate-700 flex items-center">
                      Unit Price
                      <span className="group relative ml-1.5 inline-block cursor-pointer text-slate-400 hover:text-slate-600">
                        <AdminIcon className="h-3.5 w-3.5" name="info" />
                        <div className="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded bg-slate-850 p-2 text-center text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none shadow-md">
                          Purchase cost per unit before markup
                        </div>
                      </span>
                    </span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">৳</span>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-8 pr-4 text-sm outline-none focus:border-blue-500"
                        type="number"
                        step="0.01"
                        value={form.unitPrice}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, unitPrice: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <span className="mb-2 block text-xs font-semibold text-slate-700 flex items-center">
                      Retail Price <span className="text-red-500 ml-0.5">*</span>
                      <span className="group relative ml-1.5 inline-block cursor-pointer text-slate-400 hover:text-slate-600">
                        <AdminIcon className="h-3.5 w-3.5" name="info" />
                        <div className="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded bg-slate-850 p-2 text-center text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none shadow-md">
                          Selling price to retail customers
                        </div>
                      </span>
                    </span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">৳</span>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-8 pr-4 text-sm outline-none focus:border-blue-500"
                        type="number"
                        step="0.01"
                        value={form.retailPrice}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, retailPrice: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <span className="mb-2 block text-xs font-semibold text-slate-700 flex items-center">
                      Markup
                      <span className="group relative ml-1.5 inline-block cursor-pointer text-slate-400 hover:text-slate-600">
                        <AdminIcon className="h-3.5 w-3.5" name="info" />
                        <div className="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded bg-slate-850 p-2 text-center text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none shadow-md">
                          Profit percentage margin over unit cost
                        </div>
                      </span>
                    </span>
                    <div className="relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-4 pr-8 text-sm outline-none focus:border-blue-500"
                        type="number"
                        step="0.01"
                        value={form.markup}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, markup: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

          {form.productType === "variant" && (
            <section className="rounded-xl border border-slate-200 bg-white p-5">
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
                        <VariantPillsSelector
                          key={selection.key}
                          selection={selection}
                          option={option}
                          usedOptionIds={usedOptionIds}
                          variantOptions={variantOptions}
                          updateVariantSelection={updateVariantSelection}
                          removeVariantSelection={removeVariantSelection}
                          index={index}
                        />
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
                            onClick={handleApplyBaseValues}
                          >
                            <AdminIcon className="h-4 w-4" name="refresh" />
                            Apply base values
                          </button>
                        </div>

                        <div className="grid gap-3">
                          {variantDrafts.map((v) => (
                            <VariantDraftCard
                              key={v.key}
                              v={v}
                              handleVariantDefaultChange={handleVariantDefaultChange}
                              handleVariantSkuChange={handleVariantSkuChange}
                              handleVariantCostChange={handleVariantCostChange}
                              handleVariantPriceChange={handleVariantPriceChange}
                              handleVariantStockChange={handleVariantStockChange}
                              handleVariantImagesEvent={handleVariantImagesEvent}
                            />
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
            </section>
          )}
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
      </form>
    </>
  );
}

type VariantPillsSelectorProps = {
  selection: VariantSelection;
  option?: Attribute;
  usedOptionIds: Set<string>;
  variantOptions: Attribute[];
  updateVariantSelection: (key: string, patch: Partial<Omit<VariantSelection, "key">>) => void;
  removeVariantSelection: (key: string) => void;
  index: number;
};

function VariantPillsSelector({
  selection,
  option,
  usedOptionIds,
  variantOptions,
  updateVariantSelection,
  removeVariantSelection,
  index,
}: VariantPillsSelectorProps) {
  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateVariantSelection(selection.key, {
      optionId: e.target.value,
      pendingValueId: "",
      valueIds: [],
    });
  };

  const handleRemoveClick = () => {
    removeVariantSelection(selection.key);
  };

  const handleToggleValue = (e: React.MouseEvent<HTMLButtonElement>) => {
    const valId = e.currentTarget.getAttribute("data-val") || "";
    const isSelected = selection.valueIds.includes(valId);
    const newValueIds = isSelected
      ? selection.valueIds.filter((id) => id !== valId)
      : [...selection.valueIds, valId];
    updateVariantSelection(selection.key, { valueIds: newValueIds });
  };

  let optionValuesContent;
  if (!option) {
    optionValuesContent = (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs font-medium text-slate-400">
        Select a variant option to see available values
      </div>
    );
  } else {
    optionValuesContent = (
      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
        {option.values && option.values.length > 0 ? (
          option.values.map((val) => {
            const isSelected = selection.valueIds.includes(val.id);
            return (
              <button
                key={val.id}
                type="button"
                data-val={val.id}
                onClick={handleToggleValue}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer select-none ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-xs"
                    : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {val.value}
                {isSelected ? (
                  <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            );
          })
        ) : (
          <span className="text-xs text-slate-500 p-1">No values defined for this option.</span>
        )}
      </div>
    );
  }

  const selectContent = (
    <select
      className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      onChange={handleOptionChange}
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
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
    </select>
  );

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-black text-slate-800">Variant option {index + 1}</p>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-50 px-3 text-sm font-black text-red-700"
          onClick={handleRemoveClick}
          type="button"
        >
          <AdminIcon className="h-4 w-4" name="x" />
          Remove
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-700 flex items-center">
            Variant option
            <span className="group relative ml-1.5 inline-block cursor-pointer text-slate-400 hover:text-slate-600">
              <AdminIcon className="h-3.5 w-3.5" name="info" />
              <div className="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded bg-slate-850 p-2 text-center text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none shadow-md">
                Select an attribute like Color or Size.
              </div>
            </span>
          </span>
          {selectContent}
        </label>
        <div className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-700">
            Option values
          </span>
          {optionValuesContent}
        </div>
      </div>
    </div>
  );
}

type VariantDraftCardProps = {
  v: VariantDraft;
  handleVariantDefaultChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVariantSkuChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVariantCostChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVariantPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVariantStockChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVariantImagesEvent: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function VariantDraftCard({
  v,
  handleVariantDefaultChange,
  handleVariantSkuChange,
  handleVariantCostChange,
  handleVariantPriceChange,
  handleVariantStockChange,
  handleVariantImagesEvent,
}: VariantDraftCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-800">{v.label}</p>
          <p className="mt-0.5 text-xs font-bold text-slate-500">{v.sku}</p>
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-black text-slate-600">
          <input
            checked={v.isDefault}
            data-key={v.key}
            onChange={handleVariantDefaultChange}
            type="radio"
            name="default-variant"
          />
          Default
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1.3fr_repeat(3,0.7fr)]">
        <label className="block">
          <span className="mb-1 block text-xs font-black text-slate-600">
            SKU <span className="text-red-500">*</span>
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold uppercase outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={v.sku}
            data-key={v.key}
            onChange={handleVariantSkuChange}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black text-slate-600">Cost</span>
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            min="0"
            step="0.01"
            type="number"
            value={v.cost}
            data-key={v.key}
            onChange={handleVariantCostChange}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black text-slate-600">
            Price <span className="text-red-500">*</span>
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            min="0"
            step="0.01"
            type="number"
            value={v.price}
            data-key={v.key}
            onChange={handleVariantPriceChange}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black text-slate-600">Stock</span>
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            min="0"
            step="1"
            type="number"
            value={v.stockQuantity}
            data-key={v.key}
            onChange={handleVariantStockChange}
          />
        </label>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black text-slate-600">Variant images</p>
          {v.images.length > 0 && (
            <span className="text-xs font-bold text-slate-500">{v.images.length} selected</span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(v.imagePreviews ?? []).map((url, idx) => (
            <div
              className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200"
              key={`${v.key}-preview-${idx}`}
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
              data-key={v.key}
              onChange={handleVariantImagesEvent}
              type="file"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
