"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  const [isDragging, setIsDragging] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
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
        sku: `${form.sku || makeSkuSeed(form.name, selectedUnit?.abbreviation)}-${values
          .map((value) => slugify(value.value).replace(/-/g, "").toUpperCase())
          .join("-")}`,
      }));
      result.sort((a, b) => a.sku.localeCompare(b.sku));
    }
    return result;
  }, [form.name, form.sku, selectedUnit?.abbreviation, selectedVariantGroups]);

  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>([]);

  const savedSelectionsRef = useRef<VariantSelection[]>([]);
  const savedDraftsRef = useRef<VariantDraft[]>([]);

  // Keep variant drafts in sync with selected option values
  useEffect(() => {
    if (form.productType !== "variant") {
      return;
    }

    const basePrice = form.retailPrice;
    const baseCost = form.unitPrice;
    const baseStock = form.stockQuantity;

    setVariantDrafts((current) => {
      const source = current.length > 0 ? current : savedDraftsRef.current;
      const next: VariantDraft[] = variantPreview.map((v, idx) => {
        const existing = source.find(
          (d) => d.key === v.key || (d.valueIds.length > 0 && d.valueIds.every((id) => v.valueIds.includes(id)))
        );
        return {
          key: v.key,
          sku: existing?.sku ?? v.sku,
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

      if (next.length === 0 && source.length > 0) {
        return source;
      }

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
      sku: makeSkuSeed(current.name, selectedUnit?.abbreviation),
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
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    setForm((current) => ({
      ...current,
      images: [...current.images, ...newFiles],
    }));
  }

  function removeImage(index: number) {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, i) => i !== index),
    }));
  }

  function reorderImages(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setForm((current) => {
      const list = [...current.images];
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return { ...current, images: list };
    });
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      const msg = "Product name is required.";
      setError(msg);
      toast.error(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!form.categoryId) {
      const msg = "Product category is required.";
      setError(msg);
      toast.error(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!form.brandId) {
      const msg = "Product brand is required.";
      setError(msg);
      toast.error(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (form.productType === "simple") {
      if (!form.sku.trim()) {
        const msg = "SKU is required for single product.";
        setError(msg);
        toast.error(msg);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!form.retailPrice || isNaN(Number(form.retailPrice)) || Number(form.retailPrice) < 0) {
        const msg = "Retail price is required for single product.";
        setError(msg);
        toast.error(msg);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    } else {
      if (variantSelections.length === 0 || variantPreview.length === 0) {
        const msg = "Please select at least one variant option and option value.";
        setError(msg);
        toast.error(msg);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (variantDrafts.length === 0) {
        const msg = "No variants created. Please configure variant options.";
        setError(msg);
        toast.error(msg);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const invalidVariant = variantDrafts.find((v) => !v.sku.trim() || !v.price || isNaN(Number(v.price)));
      if (invalidVariant) {
        const msg = `Every variant requires a valid SKU and retail price (check variant "${invalidVariant.label}").`;
        setError(msg);
        toast.error(msg);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setIsSaving(true);

    try {
      let payloadVariants: any[] = [];
      
      if (form.productType === "simple") {
        payloadVariants = [{
          sku: form.sku.trim(),
          price: Number(form.retailPrice || 0),
          cost: form.unitPrice ? Number(form.unitPrice) : undefined,
          stockQuantity: Number(form.stockQuantity || 0),
          isDefault: true,
        }];
      } else {
        payloadVariants = variantDrafts.map((variant) => ({
          sku: variant.sku.trim(),
          price: variant.price ? Number(variant.price) : Number(form.retailPrice || 0),
          cost: variant.cost ? Number(variant.cost) : (form.unitPrice ? Number(form.unitPrice) : undefined),
          stockQuantity:
            variant.stockQuantity !== "" && variant.stockQuantity !== undefined
              ? Number(variant.stockQuantity)
              : Number(form.stockQuantity || 0),
          isDefault: Boolean(variant.isDefault),
          attributeValueIds: variant.valueIds,
        }));
      }

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
          variants: payloadVariants,
        }),
      });

      const createdVariants = product.variants || [];

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
      await uploadImages(product.id);

      toast.success("Product created successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create product";
      setError(msg);
      toast.error(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
            <div className="flex items-center gap-2">
              <Link
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
                href="/admin/products"
              >
                <AdminIcon className="h-3.5 w-3.5" name="chevronRight" />
                Back
              </Link>
              <button
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                type="button"
                onClick={() => router.push("/admin/products")}
              >
                Cancel
              </button>
              <button
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                type="submit"
                form="add-product-form"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Product"}
              </button>
            </div>
          }
        />

        {error && (
          <div className="mx-auto max-w-5xl mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold text-red-900">Validation Error</p>
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-xs font-semibold text-red-600 hover:text-red-800 shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

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
                    onChange={(event) => {
                      const val = event.target.value;
                      setForm((current) => ({ ...current, baseUnitId: val, unitId: val }));
                    }}
                    value={form.baseUnitId}
                  >
                    <option value="">Select unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.abbreviation})
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
                        {unit.name} ({unit.abbreviation})
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

            <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">Product Media</h2>
                <p className="text-xs text-slate-500">Upload high-resolution images for your product listing</p>
              </div>

              <div className="space-y-4">
                {/* Drag and Drop Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      updateImages(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => imageInputRef.current?.click()}
                  className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 md:p-10 text-center transition-all cursor-pointer select-none ${
                    isDragging
                      ? "border-slate-500 bg-slate-100 scale-[1.005] shadow-xs"
                      : "border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-100/70"
                  }`}
                >
                  <input
                    ref={imageInputRef}
                    accept="image/*"
                    className="hidden"
                    multiple
                    onChange={(event) => updateImages(event.target.files)}
                    type="file"
                  />

                  <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900 transition-all shadow-xs">
                    <AdminIcon name="upload" className="h-5 w-5" />
                  </div>

                  <p className="text-sm font-bold text-slate-800">
                    Drag & drop single or multiple product images here, or{" "}
                    <span className="text-slate-900 underline font-extrabold hover:text-black">browse files</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">
                    Supports PNG, JPG, JPEG, WEBP files (Upload single or multiple files)
                  </p>
                </div>

                {/* Selected Image Previews Grid with Drag & Drop Reordering */}
                {imagePreviewUrls.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {imagePreviewUrls.length} image{imagePreviewUrls.length !== 1 ? "s" : ""} selected
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Drag and drop cards to change image order
                        </p>
                      </div>
                      <button
                        className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                        onClick={() => {
                          if (imageInputRef.current) imageInputRef.current.value = "";
                          setForm((current) => ({ ...current, images: [] }));
                        }}
                        type="button"
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {imagePreviewUrls.map((url, index) => {
                        const isMain = index === 0;
                        const isBeingDragged = draggedImageIndex === index;

                        return (
                          <div
                            key={`${url}-${index}`}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", String(index));
                              setDraggedImageIndex(index);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const fromIndex = Number(e.dataTransfer.getData("text/plain"));
                              if (!isNaN(fromIndex)) {
                                reorderImages(fromIndex, index);
                              }
                              setDraggedImageIndex(null);
                            }}
                            onDragEnd={() => setDraggedImageIndex(null)}
                            className={`group relative overflow-hidden rounded-2xl border bg-white shadow-xs transition-all cursor-grab active:cursor-grabbing ${
                              isBeingDragged
                                ? "opacity-40 border-dashed border-blue-500 scale-95"
                                : "border-slate-200/90 hover:border-slate-300 hover:shadow-md"
                            }`}
                          >
                            {/* Image container */}
                            <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img alt="" className="h-full w-full object-cover" src={url} />

                              {/* Main Image Badge */}
                              {isMain && (
                                <span className="absolute left-2.5 top-2.5 rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                  Main Image
                                </span>
                              )}

                              {/* Clean Delete Button (No dark mask overlay) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-slate-500 hover:bg-red-600 hover:text-white border border-slate-200/80 shadow-sm transition-colors cursor-pointer"
                                title="Remove image"
                              >
                                <AdminIcon name="trash" className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Footer name & grip */}
                            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 bg-white">
                              <p className="truncate text-[11px] font-medium text-slate-600 max-w-[85%]">
                                {form.images[index]?.name || `Image ${index + 1}`}
                              </p>
                              <AdminIcon name="grip" className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>


            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-slate-900">Inventory & SKU</h2>
                <p className="text-xs text-slate-500">Choose product type and inventory tracking</p>
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
                    if (variantSelections.length > 0 && variantSelections.some((s) => s.optionId)) {
                      savedSelectionsRef.current = variantSelections;
                    }
                    if (variantDrafts.length > 0) {
                      savedDraftsRef.current = variantDrafts;
                    }
                    setForm((current) => ({ ...current, productType: "simple" }));
                  }}
                >
                  <div className="mr-4">
                    <p className="text-sm font-semibold text-slate-900">Single / Non-variant product</p>
                    <p className="mt-1 text-xs text-slate-500">
                      This product is a single item with one SKU and price
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
                  onClick={() => {
                    setForm((current) => ({ ...current, productType: "variant" }));
                    if (
                      savedSelectionsRef.current.length > 0 &&
                      (variantSelections.length === 0 || (variantSelections.length === 1 && !variantSelections[0].optionId))
                    ) {
                      setVariantSelections(savedSelectionsRef.current);
                    }
                    if (savedDraftsRef.current.length > 0 && variantDrafts.length === 0) {
                      setVariantDrafts(savedDraftsRef.current);
                    }
                  }}
                >
                  <div className="mr-4">
                    <p className="text-sm font-semibold text-slate-900">Variant Product</p>
                    <p className="mt-1 text-xs text-slate-500">
                      This product has multiple variants (e.g. Size, Color)
                    </p>
                  </div>
                  <div className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    form.productType === "variant" ? "border-blue-500" : "border-slate-300"
                  }`}>
                    {form.productType === "variant" && <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
                  </div>
                </button>
              </div>

              <div className="mt-6">
                {form.productType === "simple" ? (
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[13px] font-semibold text-slate-700">
                            SKU <AdminIcon name="info" className="h-3.5 w-3.5 text-blue-500" />
                          </span>
                        </div>
                        <div className="flex rounded-lg shadow-sm">
                          <div className="relative z-10">
                            <select 
                              className="h-11 appearance-none rounded-l-lg border border-slate-300 bg-slate-50/50 pl-4 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-colors"
                              onChange={(e) => {
                                if (e.target.value === "Auto-generate") {
                                  generateSku();
                                }
                              }}
                              defaultValue="Manual"
                            >
                              <option value="Auto-generate">Auto-generate</option>
                              <option value="Manual">Manual</option>
                            </select>
                            <AdminIcon name="chevron-down" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            className="relative -ml-px h-11 w-full rounded-r-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-colors hover:border-slate-400 focus:z-20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            onChange={(event) =>
                              setForm((current) => ({ ...current, sku: event.target.value }))
                            }
                            placeholder="PRODUCT-SKU"
                            value={form.sku}
                          />
                        </div>
                        <button
                          type="button"
                          className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700"
                          onClick={generateSku}
                        >
                          <AdminIcon className="h-3.5 w-3.5" name="plus" />
                          Add Another Code
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block col-span-2 sm:col-span-1">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-slate-700">Supplier Name</span>
                          </div>
                          <div className="relative">
                            <select
                              className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white pl-4 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
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
                            <AdminIcon name="chevron-down" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          </div>
                        </label>
                        <label className="block col-span-2 sm:col-span-1">
                          <span className="mb-2 block text-[13px] font-semibold text-slate-700">Supplier Price</span>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-slate-600">৳</span>
                            <input
                              className="h-11 w-full rounded-lg border border-slate-300 pl-8 pr-4 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 text-right"
                              type="number"
                              step="0.01"
                              value={form.supplierPrice}
                              onChange={(event) =>
                                setForm((current) => ({ ...current, supplierPrice: event.target.value }))
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </label>
                        <label className="block col-span-2 sm:col-span-1">
                          <span className="mb-2 block text-[13px] font-semibold text-slate-700">Current Inventory</span>
                          <input
                            className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 text-right"
                            min="0"
                            type="number"
                            step="1"
                            value={form.stockQuantity}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, stockQuantity: event.target.value }))
                            }
                            placeholder="0"
                          />
                        </label>
                        <label className="block col-span-2 sm:col-span-1">
                          <span className="mb-2 block text-[13px] font-semibold text-slate-700">Purchase Date</span>
                          <div className="relative">
                            <input
                              className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 appearance-none bg-white"
                              type="date"
                              value={form.purchaseDate}
                              onChange={(event) =>
                                setForm((current) => ({ ...current, purchaseDate: event.target.value }))
                              }
                            />
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 mt-7">
                        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm">
                          <AdminIcon name="user" className="h-6 w-6" />
                        </div>
                        <p className="text-[13px] leading-relaxed text-slate-600">
                          The first SKU code will be shown to staff and customers to help identify this product. When you have multiple codes all the barcodes will be scannable.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block col-span-2 sm:col-span-1">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-slate-700">Supplier Name</span>
                          </div>
                          <div className="relative">
                            <select
                              className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white pl-4 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
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
                            <AdminIcon name="chevron-down" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          </div>
                        </label>
                        <label className="block col-span-2 sm:col-span-1">
                          <span className="mb-2 block text-[13px] font-semibold text-slate-700">Supplier Price</span>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-slate-600">৳</span>
                            <input
                              className="h-11 w-full rounded-lg border border-slate-300 pl-8 pr-4 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 text-right"
                              type="number"
                              step="0.01"
                              value={form.supplierPrice}
                              onChange={(event) =>
                                setForm((current) => ({ ...current, supplierPrice: event.target.value }))
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </label>
                        <label className="block col-span-2 sm:col-span-1">
                          <span className="mb-2 block text-[13px] font-semibold text-slate-700">Purchase Date</span>
                          <div className="relative">
                            <input
                              className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 appearance-none bg-white"
                              type="date"
                              value={form.purchaseDate}
                              onChange={(event) =>
                                setForm((current) => ({ ...current, purchaseDate: event.target.value }))
                              }
                            />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 leading-normal">Price</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {form.productType === "simple"
                      ? "Set selling price details"
                      : "Set base price details (applied to new variants)"}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 rounded-xl bg-slate-50/70 p-3.5 border border-slate-200/70">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Unit</label>
                  <div className="h-9 w-full inline-flex items-center justify-center text-xs font-bold text-slate-700 bg-white rounded-lg border border-slate-300 shadow-2xs">
                    {units.find((u) => u.id === form.unitId)?.abbreviation ||
                     (units.find((u) => u.id === form.unitId)?.name?.toLowerCase() === "pices" ? "Piece" : units.find((u) => u.id === form.unitId)?.name) ||
                     "Piece"}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Factor</label>
                  <input
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-blue-500"
                    type="number"
                    step="0.01"
                    placeholder="1.00"
                    value={form.factor}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, factor: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
                    <span>Unit Price (Cost)</span>
                    <span className="group relative inline-block cursor-pointer text-slate-400 hover:text-slate-600">
                      <AdminIcon className="h-3 w-3" name="info" />
                      <div className="absolute bottom-full left-1/2 z-10 mb-1.5 w-48 -translate-x-1/2 rounded bg-slate-800 p-2 text-center text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none shadow-md">
                        Purchase cost per unit before markup
                      </div>
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">৳</span>
                    <input
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-7 pr-3 text-xs outline-none focus:border-blue-500"
                      type="number"
                      step="0.01"
                      value={form.unitPrice}
                      onChange={(event) => {
                        const val = event.target.value;
                        const u = parseFloat(val);
                        const r = parseFloat(form.retailPrice);
                        const m = parseFloat(form.markup);
                        let newMarkup = form.markup;
                        let newRetail = form.retailPrice;

                        if (!isNaN(u) && u > 0) {
                          if (!isNaN(r) && r >= u) {
                            newMarkup = (((r - u) / u) * 100).toFixed(2);
                          } else if (!isNaN(m) && m > 0) {
                            newRetail = (u + (u * m) / 100).toFixed(2);
                          }
                        }

                        setForm((current) => ({
                          ...current,
                          unitPrice: val,
                          retailPrice: newRetail,
                          markup: newMarkup,
                        }));
                      }}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
                    <span>
                      {form.productType === "simple" ? "Retail Price" : "Base Retail Price"} <span className="text-red-500">*</span>
                    </span>
                    <span className="group relative inline-block cursor-pointer text-slate-400 hover:text-slate-600">
                      <AdminIcon className="h-3 w-3" name="info" />
                      <div className="absolute bottom-full left-1/2 z-10 mb-1.5 w-48 -translate-x-1/2 rounded bg-slate-800 p-2 text-center text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none shadow-md">
                        {form.productType === "simple"
                          ? "Selling price to retail customers"
                          : "Default selling price applied to new variants"}
                      </div>
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">৳</span>
                    <input
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-7 pr-3 text-xs outline-none focus:border-blue-500"
                      type="number"
                      step="0.01"
                      value={form.retailPrice}
                      onChange={(event) => {
                        const val = event.target.value;
                        const r = parseFloat(val);
                        const u = parseFloat(form.unitPrice);
                        let newMarkup = form.markup;

                        if (!isNaN(r) && !isNaN(u) && u > 0) {
                          newMarkup = (((r - u) / u) * 100).toFixed(2);
                        }

                        setForm((current) => ({
                          ...current,
                          retailPrice: val,
                          markup: newMarkup,
                        }));
                      }}
                      placeholder="0.00"
                      required={form.productType === "simple"}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
                    <span>Markup (%)</span>
                    <span className="group relative inline-block cursor-pointer text-slate-400 hover:text-slate-600">
                      <AdminIcon className="h-3 w-3" name="info" />
                      <div className="absolute bottom-full left-1/2 z-10 mb-1.5 w-48 -translate-x-1/2 rounded bg-slate-800 p-2 text-center text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none shadow-md">
                        Profit percentage margin over unit cost
                      </div>
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">%</span>
                    <input
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-3 pr-7 text-xs outline-none focus:border-blue-500"
                      type="number"
                      step="0.01"
                      value={form.markup}
                      onChange={(event) => {
                        const val = event.target.value;
                        const m = parseFloat(val);
                        const u = parseFloat(form.unitPrice);
                        let newRetail = form.retailPrice;

                        if (!isNaN(m) && !isNaN(u) && u > 0) {
                          newRetail = (u + (u * m) / 100).toFixed(2);
                        }

                        setForm((current) => ({
                          ...current,
                          markup: val,
                          retailPrice: newRetail,
                        }));
                      }}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </section>

          {form.productType === "variant" && (
            <section className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-slate-950">Variant Options</h3>
                  <p className="text-xs text-slate-500">
                    Choose options and option values to generate unique variants.
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
                      className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 font-semibold text-slate-700 disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
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
                      <div className="rounded-lg bg-slate-50 p-4 space-y-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">Variants configuration list</p>
                            <p className="text-xs text-slate-500">
                              Configure price, costs, stock alert indicators per product variant.
                            </p>
                          </div>
                          <button
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
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
                  <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    No variant options found. Go to Attribute page to configure them.
                  </p>
                )}
            </section>
          )}
          </div>
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
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
      <div className="flex h-9 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-400">
        Select an option to choose values
      </div>
    );
  } else {
    optionValuesContent = (
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 p-1.5 min-h-[36px] items-center">
        {option.values && option.values.length > 0 ? (
          option.values.map((val) => {
            const isSelected = selection.valueIds.includes(val.id);
            return (
              <button
                key={val.id}
                type="button"
                data-val={val.id}
                onClick={handleToggleValue}
                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer select-none ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-2xs"
                    : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {val.value}
                {isSelected ? (
                  <svg className="h-3 w-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 leading-normal py-0.5">
          Variant Option {index + 1}
        </h4>
        <button
          className="inline-flex h-7 items-center gap-1 rounded-lg bg-red-50 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
          onClick={handleRemoveClick}
          type="button"
        >
          <AdminIcon className="h-3.5 w-3.5" name="x" />
          Remove
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="w-full md:w-56 shrink-0">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Variant option
          </label>
          <div className="relative">
            <select
              className="h-9 w-full appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-8 text-xs font-medium outline-none focus:border-blue-500 cursor-pointer"
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
            <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Option values
          </label>
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
    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-3 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900">{v.label}</span>
          <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {v.sku}
          </span>
        </div>
        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer hover:text-slate-900">
          <input
            checked={v.isDefault}
            data-key={v.key}
            onChange={handleVariantDefaultChange}
            type="radio"
            name="default-variant"
            className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          Default Variant
        </label>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            SKU <span className="text-red-500">*</span>
          </span>
          <input
            className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs font-mono font-semibold uppercase outline-none focus:border-blue-500"
            value={v.sku}
            data-key={v.key}
            onChange={handleVariantSkuChange}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Cost</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">৳</span>
            <input
              className="h-9 w-full rounded-lg border border-slate-300 pl-7 pr-3 text-xs outline-none focus:border-blue-500"
              min="0"
              step="0.01"
              type="number"
              value={v.cost}
              data-key={v.key}
              onChange={handleVariantCostChange}
              placeholder="0.00"
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Price <span className="text-red-500">*</span>
          </span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">৳</span>
            <input
              className="h-9 w-full rounded-lg border border-slate-300 pl-7 pr-3 text-xs outline-none focus:border-blue-500"
              min="0"
              step="0.01"
              type="number"
              value={v.price}
              data-key={v.key}
              onChange={handleVariantPriceChange}
              placeholder="0.00"
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Stock</span>
          <input
            className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-blue-500"
            min="0"
            step="1"
            type="number"
            value={v.stockQuantity}
            data-key={v.key}
            onChange={handleVariantStockChange}
            placeholder="0"
          />
        </label>
      </div>

      <div className="pt-1">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Variant images</p>
          {v.images.length > 0 && (
            <span className="text-xs font-medium text-slate-500">{v.images.length} selected</span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {(v.imagePreviews ?? []).map((url, idx) => (
            <div
              className="group relative h-14 w-14 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
              key={`${v.key}-preview-${idx}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="h-full w-full object-cover" src={url} />
            </div>
          ))}
          <label className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 text-slate-400 hover:bg-slate-100 hover:border-slate-400 transition-all">
            <AdminIcon className="h-3.5 w-3.5" name="upload" />
            <span className="mt-0.5 text-[10px] font-semibold">Add</span>
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
