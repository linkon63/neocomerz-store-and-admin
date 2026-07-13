"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminIcon, PageHeader } from "../../../../_components/admin-shell";
import { ConfirmModal } from "../../../../_components/confirm-modal";
import { useDeleteProductMedia } from "../../../../_hooks/use-delete-product-media";
import { useUpdateProductMedia } from "../../../../_hooks/use-update-product-media";
import {
  apiRequest,
  slugify,
  resolveImageUrl,
  type Attribute,
  type Brand,
  type Category,
  type Product,
  type ProductMedia,
  type ProductVariant,
  type Tag,
  type Unit,
} from "../../../../../../lib/admin-api";
import { EditProductSkeleton } from "./EditProductSkeleton";

type CategoryOption = Category & { depth: number };

type VariantSelection = {
  key: string;
  optionId: string;
  pendingValueId: string;
  valueIds: string[];
};

type VariantDraft = {
  key: string;
  id?: string;
  sku: string;
  valueIds: string[];
  label: string;
  price: string;
  cost: string;
  stockQuantity: string;
  images: File[];
  imagePreviews: string[];
  existingMedia: import("../../../../../../lib/admin-api").VariantMedia[];
  isDefault: boolean;
};

type ImageItem =
  | { id: string; type: "existing"; url: string; key: string; mediaObj: ProductMedia }
  | { type: "new"; file: File; url: string; key: string };

type ProductEditForm = {
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
  sizeChartUrl: string | null;
  careGuide: File | null;
  careGuideUrl: string | null;
  productType: "simple" | "variant";
  sku: string;
  unitPrice: string;
  retailPrice: string;
  stockQuantity: string;
  defaultVariantId: string;
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

function getDefaultVariant(product: Product): ProductVariant | undefined {
  return product.variants?.find((v) => v.isDefault) ?? product.variants?.[0];
}



export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [channels, setChannels] = useState<Array<{ id: string; name: string }>>([]);
  const [vats, setVats] = useState<Array<{ id: string; name: string; rate: number }>>([]);
  const [variantOptions, setVariantOptions] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [imagesList, setImagesList] = useState<ImageItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState(false);

  const { deleteMedia } = useDeleteProductMedia();
  const { updateMedia } = useUpdateProductMedia();

  const [variantSelections, setVariantSelections] = useState<VariantSelection[]>([
    emptyVariantSelection,
  ]);
  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>([]);
  const [existingVariants, setExistingVariants] = useState<ProductVariant[]>([]);

  const [form, setForm] = useState<ProductEditForm>({
    name: "", categoryId: "", slug: "", description: "",
    brandId: "", unitId: "", baseUnitId: "", status: "draft", tagIds: [], supplierId: "",
    supplierPrice: "", branchId: "", channelIds: [], vatId: "", factor: "1",
    markup: "", purchaseDate: "", purchaseOrderReturnable: false, includeStock: true,
    sizeChart: null, sizeChartUrl: null, careGuide: null, careGuideUrl: null,
    productType: "simple", sku: "", unitPrice: "", retailPrice: "", stockQuantity: "0",
    defaultVariantId: "",
  });

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);
  const selectedUnit = units.find((u) => u.id === form.unitId);

  const selectedVariantGroups = useMemo(() => {
    return variantSelections
      .map((selection) => {
        const option = variantOptions.find((item) => item.id === selection.optionId);
        if (!option) return null;
        return {
          ...option,
          values: (option.values ?? []).filter((v) => selection.valueIds.includes(v.id)),
        };
      })
      .filter(
        (option): option is Attribute & { values: NonNullable<Attribute["values"]> } =>
          Boolean(option && option.values.length > 0),
      );
  }, [variantOptions, variantSelections]);

  const variantPreview = useMemo(() => {
    const groups = selectedVariantGroups.map((option) => option.values);
    let result: Array<{ key: string; label: string; valueIds: string[]; sku: string }> = [];
    if (groups.length > 0) {
      result = cartesianProduct(groups).map((values) => ({
        key: values.map((v) => v.id).join("|") || "variant",
        label: values.map((v) => v.value).join(" / "),
        valueIds: values.map((v) => v.id),
        sku: `${form.sku || makeSkuSeed(form.name, selectedUnit?.code)}-${values
          .map((v) => slugify(v.value).replace(/-/g, "").toUpperCase())
          .join("-")}`,
      }));
      result.sort((a, b) => a.sku.localeCompare(b.sku));
    }
    return result;
  }, [form.name, form.sku, selectedUnit?.code, selectedVariantGroups]);

  // Prevent accidental navigation when form has unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      imagesList.forEach((item) => {
        if (item.type === "new") {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [imagesList]);

  // Keep variant drafts in sync with selected option values
  useEffect(() => {
    if (form.productType !== "variant") {
      setVariantDrafts([]);
      return;
    }
    setVariantDrafts((current) => {
      const next: VariantDraft[] = variantPreview.map((v, idx) => {
        const existing = current.find((d) => d.key === v.key);
        return {
          key: v.key,
          sku: existing?.sku ?? v.sku,
          valueIds: v.valueIds,
          label: v.label,
          price: existing?.price ?? form.retailPrice,
          cost: existing?.cost ?? form.unitPrice,
          stockQuantity: existing?.stockQuantity ?? form.stockQuantity,
          images: existing?.images ?? [],
          imagePreviews: existing?.imagePreviews ?? [],
          existingMedia: existing?.existingMedia ?? [],
          isDefault: existing?.isDefault ?? idx === 0,
        };
      });
      const hasDefault = next.some((d) => d.isDefault);
      if (!hasDefault && next.length > 0) next[0] = { ...next[0], isDefault: true };
      const firstDefaultIndex = next.findIndex((d) => d.isDefault);
      return next.map((d, i) =>
        i !== firstDefaultIndex && d.isDefault ? { ...d, isDefault: false } : d,
      );
    });
  }, [form.productType, form.retailPrice, form.unitPrice, form.stockQuantity, variantPreview]);

  // Load product data + all lookup lists on mount
  useEffect(() => {
    async function loadData() {
      async function safeFetch<T>(path: string): Promise<T[]> {
        try { return await apiRequest<T[]>(path); } catch { return []; }
      }

      try {
        const [brandList, categoryList, unitList, tagList, attributeList, product] =
          await Promise.all([
            apiRequest<Brand[]>("/brands"),
            apiRequest<Category[]>("/category"),
            apiRequest<Unit[]>("/units"),
            apiRequest<Tag[]>("/tags"),
            apiRequest<Attribute[]>("/attributes"),
            apiRequest<Product>(`/products/${id}`),
          ]);

        const [supplierList, branchList, channelList, vatList] = await Promise.all([
          safeFetch<{ id: string; name: string }>("/suppliers"),
          safeFetch<{ id: string; name: string }>("/branches"),
          safeFetch<{ id: string; name: string }>("/channels"),
          safeFetch<{ id: string; name: string; rate: number }>("/vat"),
        ]);

        const activeUnits = unitList.filter((u) => u.isActive);
        const activeTags = tagList.filter((t) => t.isActive);

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
          current.map((sel, i) =>
            i === 0 && !sel.optionId
              ? { ...sel, optionId: attributeList[0]?.id || "" }
              : sel,
          ),
        );

        const defaultVariant = getDefaultVariant(product);
        const isVariantProduct =
          product.variants?.some((v) => (v.optionValues?.length ?? 0) > 0) ?? false;

        setExistingVariants(product.variants ?? []);

        setForm({
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          status: product.status,
          brandId: product.brand?.id ?? product.brandId ?? "",
          categoryId: product.category?.id ?? product.categoryId ?? "",
          unitId: product.unit?.id ?? product.unitId ?? "",
          baseUnitId: "",
          tagIds: product.tags?.map((t) => t.id) ?? [],
          supplierId: (product as any).supplierId ?? "",
          supplierPrice: (product as any).supplierPrice ? String((product as any).supplierPrice) : "",
          branchId: (product as any).branchId ?? "",
          channelIds: [],
          vatId: "",
          factor: "1",
          markup: "",
          purchaseDate: "",
          purchaseOrderReturnable: false,
          includeStock: true,
          sizeChart: null,
          sizeChartUrl: (product as any).sizeChartUrl ?? null,
          careGuide: null,
          careGuideUrl: (product as any).careGuideUrl ?? null,
          productType: isVariantProduct ? "variant" : "simple",
          sku: defaultVariant?.sku ?? "",
          unitPrice: defaultVariant?.cost ? String(defaultVariant.cost) : "",
          retailPrice: defaultVariant?.price ? String(defaultVariant.price) : "",
          stockQuantity: defaultVariant?.stockQuantity !== undefined
            ? String(defaultVariant.stockQuantity) : "0",
          defaultVariantId: defaultVariant?.id ?? "",
        });

        // Initialize images list
        const initialImages: ImageItem[] = (product.media ?? [])
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((m) => ({
            id: m.id,
            type: "existing",
            url: resolveImageUrl(m.media.url),
            key: m.id,
            mediaObj: m,
          }));
        setImagesList(initialImages);

        // Restore variant selections and drafts for variant products
        if (isVariantProduct && product.variants && attributeList.length > 0) {
          const selectionsMap: Record<string, { optionId: string; valueIds: Set<string> }> = {};
          
          const sortedVariantsList = [...product.variants].sort((a, b) =>
            a.sku.localeCompare(b.sku)
          );
          setExistingVariants(sortedVariantsList);

          sortedVariantsList.forEach((v) => {
            if (v.optionValues) {
              v.optionValues.forEach((ov) => {
                const attr = attributeList.find(
                  (a) => a.name.toLowerCase() === ov.attribute.name.toLowerCase()
                );
                if (attr) {
                  const val = attr.values?.find(
                    (av) => av.value.toLowerCase() === ov.value.toLowerCase()
                  );
                  if (val) {
                    if (!selectionsMap[attr.id]) {
                      selectionsMap[attr.id] = {
                        optionId: attr.id,
                        valueIds: new Set<string>(),
                      };
                    }
                    selectionsMap[attr.id].valueIds.add(val.id);
                  }
                }
              });
            }
          });

          const selections = Object.keys(selectionsMap).map((attrId, idx) => ({
            key: `variant-option-${idx + 1}`,
            optionId: attrId,
            pendingValueId: "",
            valueIds: Array.from(selectionsMap[attrId].valueIds),
          }));

          const drafts: VariantDraft[] = [];
          sortedVariantsList.forEach((v) => {
            const variantValueIds: string[] = [];
            const variantLabels: string[] = [];

            selections.forEach((sel) => {
              const attr = attributeList.find((a) => a.id === sel.optionId);
              if (attr && v.optionValues) {
                const ov = v.optionValues.find(
                  (o) => o.attribute.name.toLowerCase() === attr.name.toLowerCase()
                );
                if (ov) {
                  const val = attr.values?.find(
                    (av) => av.value.toLowerCase() === ov.value.toLowerCase()
                  );
                  if (val) {
                    variantValueIds.push(val.id);
                    variantLabels.push(val.value);
                  }
                }
              }
            });

            const key = variantValueIds.join("|");
            drafts.push({
              key,
              id: v.id,
              sku: v.sku,
              valueIds: variantValueIds,
              label: variantLabels.join(" / "),
              price: String(v.price),
              cost: v.cost ? String(v.cost) : "",
              stockQuantity: String(v.stockQuantity ?? 0),
              images: [],
              imagePreviews: [],
              existingMedia: v.media ?? [],
              isDefault: v.isDefault,
            });
          });

          if (selections.length > 0) {
            setVariantSelections(selections);
            setVariantDrafts(drafts);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    }

    const timeoutId = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [id]);

  const handleApplyBaseValues = () => {
    setIsDirty(true);
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
    setIsDirty(true);
    const key = e.currentTarget.getAttribute("data-key") || "";
    setVariantDrafts((current) =>
      current.map((d) => ({
        ...d,
        isDefault: d.key === key,
      })),
    );
  };

  const handleVariantSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDirty(true);
    const key = e.currentTarget.getAttribute("data-key") || "";
    const nextSku = e.target.value;
    setVariantDrafts((current) =>
      current.map((d) => (d.key === key ? { ...d, sku: nextSku } : d)),
    );
  };

  const handleVariantCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDirty(true);
    const key = e.currentTarget.getAttribute("data-key") || "";
    const nextCost = e.target.value;
    setVariantDrafts((current) =>
      current.map((d) => (d.key === key ? { ...d, cost: nextCost } : d)),
    );
  };

  const handleVariantPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDirty(true);
    const key = e.currentTarget.getAttribute("data-key") || "";
    const nextPrice = e.target.value;
    setVariantDrafts((current) =>
      current.map((d) => (d.key === key ? { ...d, price: nextPrice } : d)),
    );
  };

  const handleVariantStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDirty(true);
    const key = e.currentTarget.getAttribute("data-key") || "";
    const nextStock = e.target.value;
    setVariantDrafts((current) =>
      current.map((d) => (d.key === key ? { ...d, stockQuantity: nextStock } : d)),
    );
  };
  const handleRemoveExistingVariantMedia = async (key: string, mediaId: string) => {
    setIsDirty(true);
    try {
      setIsSaving(true);
      await apiRequest(`/variant-media/${mediaId}`, { method: "DELETE" });
      setVariantDrafts((current) =>
        current.map((draft) => {
          if (draft.key !== key) return draft;
          return {
            ...draft,
            existingMedia: draft.existingMedia.filter((m) => m.id !== mediaId),
          };
        })
      );
      toast.success("Variant image removed successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove variant image");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveNewVariantMedia = (key: string, idx: number) => {
    setIsDirty(true);
    setVariantDrafts((current) =>
      current.map((draft) => {
        if (draft.key !== key) return draft;
        URL.revokeObjectURL(draft.imagePreviews[idx]);
        const newImages = draft.images.filter((_, i) => i !== idx);
        const newPreviews = draft.imagePreviews.filter((_, i) => i !== idx);
        return { ...draft, images: newImages, imagePreviews: newPreviews };
      })
    );
  };

  const handleVariantImagesEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDirty(true);
    const key = e.currentTarget.getAttribute("data-key") || "";
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const list = Array.from(files);
    const previews = list.map((file) => URL.createObjectURL(file));
    setVariantDrafts((current) =>
      current.map((draft) => {
        if (draft.key !== key) return draft;
        return {
          ...draft,
          images: [...draft.images, ...list],
          imagePreviews: [...draft.imagePreviews, ...previews],
        };
      })
    );
    // Clear input so same file can be selected again
    e.target.value = "";
  };

  function updateName(name: string) {
    setIsDirty(true);
    setForm((current) => ({
      ...current,
      name,
      slug: slugManuallyEdited ? current.slug : slugify(name),
    }));
  }

  function generateSku() {
    setIsDirty(true);
    setForm((current) => ({
      ...current,
      sku: makeSkuSeed(current.name, selectedUnit?.code),
    }));
  }

  function toggleTag(tagId: string) {
    setIsDirty(true);
    setForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((id) => id !== tagId)
        : [...current.tagIds, tagId],
    }));
  }

  function toggleChannel(channelId: string) {
    setIsDirty(true);
    setForm((current) => ({
      ...current,
      channelIds: current.channelIds.includes(channelId)
        ? current.channelIds.filter((id) => id !== channelId)
        : [...current.channelIds, channelId],
    }));
  }

  function addVariantSelection() {
    setIsDirty(true);
    setVariantSelections((current) => [
      ...current,
      {
        ...emptyVariantSelection,
        key: `variant-option-${Date.now()}`,
        optionId:
          variantOptions.find(
            (option) => !current.some((sel) => sel.optionId === option.id),
          )?.id ?? "",
      },
    ]);
  }

  function updateVariantSelection(key: string, patch: Partial<Omit<VariantSelection, "key">>) {
    setIsDirty(true);
    setVariantSelections((current) =>
      current.map((sel) => (sel.key === key ? { ...sel, ...patch } : sel)),
    );
  }

  function removeVariantSelection(key: string) {
    setIsDirty(true);
    setVariantSelections((current) =>
      current.length === 1
        ? [{ ...emptyVariantSelection }]
        : current.filter((sel) => sel.key !== key),
    );
  }

  function removeVariantValue(key: string, valueId: string) {
    setIsDirty(true);
    setVariantSelections((current) =>
      current.map((sel) =>
        sel.key === key
          ? { ...sel, valueIds: sel.valueIds.filter((id) => id !== valueId) }
          : sel,
      ),
    );
  }

  function getAttributeValueLabel(optionId: string, valueId: string) {
    const option = variantOptions.find((item) => item.id === optionId);
    return option?.values?.find((item) => item.id === valueId)?.value ?? valueId;
  }

  function handleUploadImages(files: FileList | null) {
    if (!files) return;
    setIsDirty(true);
    const newItems: ImageItem[] = Array.from(files).map((file, idx) => ({
      type: "new",
      file,
      url: URL.createObjectURL(file),
      key: `new-${file.name}-${Date.now()}-${idx}`,
    }));
    setImagesList((prev) => [...prev, ...newItems]);
  }

  const handleRemoveImage = async (item: ImageItem, idx: number) => {
    setIsDirty(true);
    if (item.type === "existing") {
      try {
        setIsSaving(true);
        await deleteMedia(item.id);
        setImagesList((prev) => prev.filter((_, i) => i !== idx));
        toast.success("Image removed successfully");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to remove image");
      } finally {
        setIsSaving(false);
      }
    } else {
      URL.revokeObjectURL(item.url);
      setImagesList((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleMoveImage = (idx: number, direction: "left" | "right") => {
    const nextIdx = direction === "left" ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= imagesList.length) return;
    setIsDirty(true);
    const newList = [...imagesList];
    const [removed] = newList.splice(idx, 1);
    newList.splice(nextIdx, 0, removed);
    setImagesList(newList);
  };

  async function saveImages(productId: string) {
    // 1. Reorder remaining existing media
    const existingItems = imagesList.filter((item): item is ImageItem & { type: "existing" } => item.type === "existing");
    await Promise.all(
      existingItems.map((item) => {
        const indexInUnifiedList = imagesList.findIndex((img) => img.key === item.key);
        return updateMedia(item.id, {
          sortOrder: indexInUnifiedList,
          isFeatured: indexInUnifiedList === 0,
        });
      })
    );

    // 2. Upload new images with correct sort order
    const newItems = imagesList.filter((item): item is ImageItem & { type: "new" } => item.type === "new");
    await Promise.all(
      newItems.map((item) => {
        const indexInUnifiedList = imagesList.findIndex((img) => img.key === item.key);
        const body = new FormData();
        body.append("file", item.file);
        body.append("type", "image");
        body.append("sortOrder", String(indexInUnifiedList));
        if (indexInUnifiedList === 0) body.append("isFeatured", "true");
        return apiRequest(`/products/${productId}/media`, { method: "POST", body });
      })
    );
  }

  async function saveVariants(productId: string): Promise<ProductVariant[]> {
    let result: ProductVariant[] = [];

    if (form.productType === "simple") {
      if (form.sku.trim() && form.retailPrice) {
        const body = {
          sku: form.sku.trim(),
          price: Number(form.retailPrice),
          cost: form.unitPrice ? Number(form.unitPrice) : undefined,
          stockQuantity: Number(form.stockQuantity || 0),
          isDefault: true,
        };
        if (form.defaultVariantId) {
          const updated = await apiRequest<ProductVariant>(`/variants/${form.defaultVariantId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          result = [updated];
        } else {
          const created = await apiRequest<ProductVariant>(`/products/${productId}/variants`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          result = [created];
        }
      }
    } else {
      if (variantDrafts.some((v) => !v.sku.trim() || !v.price)) {
        throw new Error("Every variant needs a SKU and price.");
      } else {
        result = await Promise.all(
          variantDrafts.map((v) => {
            const body = {
              sku: v.sku.trim(),
              price: Number(v.price),
              cost: v.cost ? Number(v.cost) : undefined,
              stockQuantity: v.stockQuantity !== "" ? Number(v.stockQuantity) : 0,
              isDefault: Boolean(v.isDefault),
              attributeValueIds: v.valueIds,
            };
            const requestPromise = v.id
              ? apiRequest<ProductVariant>(`/variants/${v.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                })
              : apiRequest<ProductVariant>(`/products/${productId}/variants`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
            return requestPromise;
          })
        );
      }
    }

    return result;
  }

  async function uploadVariantImages(variantId: string, files: File[]) {
    await Promise.all(
      files.map((image, index) => {
        const body = new FormData();
        body.append("file", image);
        body.append("type", "image");
        body.append("sortOrder", String(index));
        if (index === 0) body.append("isFeatured", "true");
        return apiRequest(`/variants/${variantId}/media`, { method: "POST", body });
      }),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.productType === "variant" && variantPreview.length === 0) {
      setError("Select at least one variant option value.");
      toast.error("Select at least one variant option value.");
      return;
    }

    setIsSaving(true);
    try {
      const savedProduct = await apiRequest<Product>(`/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || slugify(form.name),
          description: form.description.trim() || undefined,
          status: form.status,
          brandId: form.brandId || undefined,
          categoryId: form.categoryId || undefined,
          unitId: form.unitId || undefined,
          tagIds: form.tagIds,
          supplierId: form.supplierId || undefined,
          supplierPrice: form.supplierPrice ? Number(form.supplierPrice) : undefined,
        }),
      });

      const savedVariants = await saveVariants(savedProduct.id);

      if (form.productType === "variant" && savedVariants.length) {
        await Promise.all(
          variantDrafts.map((draft) => {
            if (!draft.images.length) return Promise.resolve();
            const match = savedVariants.find((sv) => sv.sku === draft.sku);
            if (!match) return Promise.resolve();
            return uploadVariantImages(match.id, draft.images);
          }),
        );
      }

      if (form.sizeChart) {
        const body = new FormData();
        body.append("file", form.sizeChart);
        body.append("type", "image");
        await apiRequest(`/products/${savedProduct.id}/size-chart`, { method: "POST", body });
      }
      if (form.careGuide) {
        const body = new FormData();
        body.append("file", form.careGuide);
        body.append("type", "image");
        await apiRequest(`/products/${savedProduct.id}/care-guide`, { method: "POST", body });
      }

      await saveImages(savedProduct.id);

      toast.success("Product updated successfully!");
      setIsDirty(false);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  }

  const handleBackLinkClick = (e: React.MouseEvent) => {
    if (isDirty) {
      e.preventDefault();
      setIsConfirmLeaveOpen(true);
    }
  };

  if (isLoading) {
    return <EditProductSkeleton />;
  }

  return (
    <>
      <PageHeader
        title="Edit Product"
        description="Update product details, pricing, inventory and media."
        action={
          <div className="flex items-center gap-3">
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium text-slate-600 hover:text-slate-900"
              href="/admin/products"
              onClick={handleBackLinkClick}
            >
              <AdminIcon className="h-4 w-4" name="chevronRight" />
              Back to product list
            </Link>
            <button
              className="inline-flex h-11 items-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700"
              type="button"
              onClick={() => {
                if (isDirty) {
                  setIsConfirmLeaveOpen(true);
                } else {
                  router.push("/admin/products");
                }
              }}
            >
              Cancel
            </button>
            <button
              className="inline-flex h-11 items-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white disabled:opacity-60 hover:bg-blue-700"
              disabled={isSaving}
              form="edit-product-form"
              type="submit"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        }
      />

      <form
        id="edit-product-form"
        className="mx-auto max-w-5xl space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm pb-12"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-6">
          {/* Section 1: General Info */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-900">General Info</h2>
              <p className="text-xs text-slate-500">Update general information for this product</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold text-slate-700">Name</span>
                <input
                  autoFocus
                  className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => updateName(e.target.value)}
                  placeholder="Enter a product name"
                  required
                  value={form.name}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">Slug</span>
                <input
                  className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => {
                    setIsDirty(true);
                    setSlugManuallyEdited(true);
                    setForm((current) => ({ ...current, slug: e.target.value }));
                  }}
                  placeholder="product-slug"
                  required
                  value={form.slug}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">Status</span>
                <select
                  className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm capitalize bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => {
                    setIsDirty(true);
                    setForm((current) => ({
                      ...current,
                      status: e.target.value as ProductEditForm["status"],
                    }));
                  }}
                  value={form.status}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">Brand</span>
                <select
                  className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => {
                    setIsDirty(true);
                    setForm((current) => ({ ...current, brandId: e.target.value }));
                  }}
                  value={form.brandId}
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">Category</span>
                <select
                  className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => {
                    setIsDirty(true);
                    setForm((current) => ({ ...current, categoryId: e.target.value }));
                  }}
                  value={form.categoryId}
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {"- ".repeat(cat.depth)}{cat.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const selected = form.tagIds.includes(tag.id);
                    return (
                      <button
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                          selected
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
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
                <span className="mb-2 block text-xs font-semibold text-slate-700">Base unit</span>
                <select
                  className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => {
                    setIsDirty(true);
                    setForm((current) => ({ ...current, baseUnitId: e.target.value }));
                  }}
                  value={form.baseUnitId}
                >
                  <option value="">Select unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>{unit.name} ({unit.code})</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">Unit</span>
                <select
                  className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => {
                    setIsDirty(true);
                    setForm((current) => ({ ...current, unitId: e.target.value }));
                  }}
                  value={form.unitId}
                >
                  <option value="">Select unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>{unit.name} ({unit.code})</option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-6 py-2 md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.purchaseOrderReturnable}
                    onChange={(e) => {
                      setIsDirty(true);
                      setForm((current) => ({
                        ...current,
                        purchaseOrderReturnable: e.target.checked,
                      }));
                    }}
                  />
                  Purchase order returnable
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.includeStock}
                    onChange={(e) => {
                      setIsDirty(true);
                      setForm((current) => ({ ...current, includeStock: e.target.checked }));
                    }}
                  />
                  Include stock
                </label>
              </div>
              <div className="md:col-span-2">
                <span className="mb-2 block text-xs font-semibold text-slate-700">Description</span>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => {
                    setIsDirty(true);
                    setForm((current) => ({ ...current, description: e.target.value }));
                  }}
                  placeholder="Enter description"
                  value={form.description}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Media */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Media</h2>
              <p className="text-xs text-slate-500">Upload and reorder product images</p>
            </div>
            <div className="space-y-4">
              {/* Unified Image List */}
              {imagesList.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Images (Hover to reorder &amp; remove)</p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                    {imagesList.map((item, index) => {
                      const isFeatured = index === 0;
                      return (
                        <div
                          key={item.key}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all hover:shadow-md"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt="" className="h-full w-full object-cover" src={item.url} />
                          {isFeatured && (
                            <span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                              Featured
                            </span>
                          )}
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-1.5 z-10">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(index, "left")}
                                className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-700 hover:text-blue-600 transition-colors shadow-xs"
                                title="Move Left"
                              >
                                  <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                  </svg>
                              </button>
                            )}
                            {index < imagesList.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(index, "right")}
                                className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-700 hover:text-blue-600 transition-colors shadow-xs"
                                title="Move Right"
                              >
                                  <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                  </svg>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(item, index)}
                              className="grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
                              title="Remove image"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Upload New Images</p>
                    <p className="text-xs text-slate-500">Supports JPG, PNG, WEBP formats</p>
                  </div>
                  <label className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
                    Upload Files
                    <input
                      accept="image/*"
                      className="hidden"
                      multiple
                      onChange={(e) => handleUploadImages(e.target.files)}
                      ref={imageInputRef}
                      type="file"
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
                  <p className="text-xs font-semibold text-slate-700">Upload Size Chart</p>
                  <p className="text-xs text-slate-500">Add size matrix image</p>
                  <label className="mt-3 inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
                    Select File
                    <input
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        setIsDirty(true);
                        setForm((current) => ({
                          ...current,
                          sizeChart: e.target.files?.[0] ?? null,
                        }));
                      }}
                      type="file"
                    />
                  </label>
                  {form.sizeChart && (
                    <p className="mt-2 text-[11px] text-slate-600 font-semibold truncate">{form.sizeChart.name}</p>
                  )}
                  {!form.sizeChart && form.sizeChartUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" className="h-8 w-8 rounded object-cover" src={resolveImageUrl(form.sizeChartUrl)} />
                      <span className="text-[10px] text-slate-500">Current size chart</span>
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
                  <p className="text-xs font-semibold text-slate-700">Upload Care Guide</p>
                  <p className="text-xs text-slate-500">Add care guidelines image</p>
                  <label className="mt-3 inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
                    Select File
                    <input
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        setIsDirty(true);
                        setForm((current) => ({
                          ...current,
                          careGuide: e.target.files?.[0] ?? null,
                        }));
                      }}
                      type="file"
                    />
                  </label>
                  {form.careGuide && (
                    <p className="mt-2 text-[11px] text-slate-600 font-semibold truncate">{form.careGuide.name}</p>
                  )}
                  {!form.careGuide && form.careGuideUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" className="h-8 w-8 rounded object-cover" src={resolveImageUrl(form.careGuideUrl)} />
                      <span className="text-[10px] text-slate-500">Current care guide</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Channel & Branch */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Channel &amp; Branch</h2>
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
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                          selected
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
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
                  className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm bg-white outline-none focus:border-blue-500"
                  onChange={(e) => {
                    setIsDirty(true);
                    setForm((current) => ({ ...current, branchId: e.target.value }));
                  }}
                  value={form.branchId}
                >
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {/* Section 4: Inventory */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Inventory</h2>
              <p className="text-xs text-slate-500">Choose the product type and inventory details</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all cursor-pointer ${
                  form.productType === "simple"
                    ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => {
                  setIsDirty(true);
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
                  {form.productType === "simple" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  )}
                </div>
              </button>
              <button
                type="button"
                className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all cursor-pointer ${
                  form.productType === "variant"
                    ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => {
                  setIsDirty(true);
                  setForm((current) => ({ ...current, productType: "variant" }));
                }}
              >
                <div className="mr-4">
                  <p className="text-sm font-semibold text-slate-950">Variant Product</p>
                  <p className="mt-1 text-xs text-slate-500">
                    This product has multiple variants like size or color
                  </p>
                </div>
                <div className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                  form.productType === "variant" ? "border-blue-500" : "border-slate-300"
                }`}>
                  {form.productType === "variant" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  )}
                </div>
              </button>
            </div>

            {form.productType === "simple" && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="block text-xs font-semibold text-slate-700">SKU</span>
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
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    onChange={(e) => {
                      setIsDirty(true);
                      setForm((current) => ({ ...current, sku: e.target.value }));
                    }}
                    placeholder="PRODUCT-SKU"
                    value={form.sku}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Stock Quantity</span>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    min="0"
                    onChange={(e) => {
                      setIsDirty(true);
                      setForm((current) => ({ ...current, stockQuantity: e.target.value }));
                    }}
                    placeholder="0"
                    step="1"
                    type="number"
                    value={form.stockQuantity}
                  />
                </label>
              </div>
            )}

            <div className="mt-6 border-t border-slate-100 pt-6">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Supplier &amp; Purchasing
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2">
                    <span className="block text-xs font-semibold text-slate-700">Supplier Name</span>
                  </div>
                  <select
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    onChange={(e) => {
                      setIsDirty(true);
                      setForm((current) => ({ ...current, supplierId: e.target.value }));
                    }}
                    value={form.supplierId}
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Supplier Price</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">৳</span>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 pl-8 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      type="number"
                      step="0.01"
                      value={form.supplierPrice}
                      onChange={(e) => {
                        setIsDirty(true);
                        setForm((current) => ({ ...current, supplierPrice: e.target.value }));
                      }}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Purchase Date</span>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => {
                      setIsDirty(true);
                      setForm((current) => ({ ...current, purchaseDate: e.target.value }));
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: VAT */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-900">VAT</h2>
              <p className="text-xs text-slate-500">Set the VAT configuration for this product</p>
            </div>
            <div>
              <span className="mb-2 block text-xs font-semibold text-slate-700">VAT</span>
              <select
                className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm bg-white outline-none focus:border-blue-500"
                value={form.vatId}
                onChange={(e) => {
                  setIsDirty(true);
                  setForm((current) => ({ ...current, vatId: e.target.value }));
                }}
              >
                <option value="">Select VAT</option>
                {vats.map((vat) => (
                  <option key={vat.id} value={vat.id}>
                    {vat.name} ({vat.rate}%)
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Section 6: Price */}
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
                    onChange={(e) => {
                      setIsDirty(true);
                      setForm((current) => ({ ...current, factor: e.target.value }));
                    }}
                  />
                </div>
                <div>
                  <span className="mb-2 block text-xs font-semibold text-slate-700 flex items-center">
                    Unit Price
                    <span className="group relative ml-1.5 inline-block cursor-pointer text-slate-400 hover:text-slate-600">
                      <AdminIcon className="h-3.5 w-3.5" name="info" />
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded bg-slate-800 p-2 text-center text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
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
                      onChange={(e) => {
                        setIsDirty(true);
                        setForm((current) => ({ ...current, unitPrice: e.target.value }));
                      }}
                    />
                  </div>
                </div>
                <div>
                  <span className="mb-2 block text-xs font-semibold text-slate-700 flex items-center">
                    Retail Price
                    <span className="group relative ml-1.5 inline-block cursor-pointer text-slate-400 hover:text-slate-600">
                      <AdminIcon className="h-3.5 w-3.5" name="info" />
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded bg-slate-800 p-2 text-center text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
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
                      onChange={(e) => {
                        setIsDirty(true);
                        setForm((current) => ({ ...current, retailPrice: e.target.value }));
                      }}
                    />
                  </div>
                </div>
                <div>
                  <span className="mb-2 block text-xs font-semibold text-slate-700 flex items-center">
                    Markup
                    <span className="group relative ml-1.5 inline-block cursor-pointer text-slate-400 hover:text-slate-600">
                      <AdminIcon className="h-3.5 w-3.5" name="info" />
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded bg-slate-800 p-2 text-center text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
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
                      onChange={(e) => {
                        setIsDirty(true);
                        setForm((current) => ({ ...current, markup: e.target.value }));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Variant Options */}
          {form.productType === "variant" && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-950">Variant Options</h3>
                <p className="text-xs text-slate-500">
                  Choose options and option values to generate unique variants.
                </p>
              </div>
              {variantOptions.length > 0 ? (
                <div className="space-y-4">
                  {variantSelections.map((selection, index) => {
                    const option = variantOptions.find((item) => item.id === selection.optionId);
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
                    disabled={variantSelections.length >= variantOptions.length}
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
                            handleRemoveExistingVariantMedia={handleRemoveExistingVariantMedia}
                            handleRemoveNewVariantMedia={handleRemoveNewVariantMedia}
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



      {/* Confirm Leave Modal */}
      <ConfirmModal
        isOpen={isConfirmLeaveOpen}
        onClose={() => setIsConfirmLeaveOpen(false)}
        onConfirm={() => {
          setIsConfirmLeaveOpen(false);
          router.push("/admin/products");
        }}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave?"
        confirmText="Yes, leave"
        cancelText="No, stay"
        isDestructive={true}
      />
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

  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-800">Variant option {index + 1}</p>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
          onClick={handleRemoveClick}
          type="button"
        >
          <AdminIcon className="h-4 w-4" name="x" />
          Remove
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-700">
            Variant option
          </span>
          <select
            className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
  handleRemoveExistingVariantMedia: (key: string, mediaId: string) => void;
  handleRemoveNewVariantMedia: (key: string, idx: number) => void;
};

function VariantDraftCard({
  v,
  handleVariantDefaultChange,
  handleVariantSkuChange,
  handleVariantCostChange,
  handleVariantPriceChange,
  handleVariantStockChange,
  handleVariantImagesEvent,
  handleRemoveExistingVariantMedia,
  handleRemoveNewVariantMedia,
}: VariantDraftCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{v.label}</p>
          <p className="text-xs text-slate-500">{v.sku}</p>
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
          <input
            checked={v.isDefault}
            data-key={v.key}
            onChange={handleVariantDefaultChange}
            type="radio"
            name="default-variant"
          />
          Default Variant
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1.3fr_repeat(3,0.7fr)]">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">SKU</span>
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold uppercase outline-none focus:border-blue-500"
            value={v.sku}
            data-key={v.key}
            onChange={handleVariantSkuChange}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Cost</span>
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500"
            min="0"
            step="0.01"
            type="number"
            value={v.cost}
            data-key={v.key}
            onChange={handleVariantCostChange}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Price</span>
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500"
            min="0"
            step="0.01"
            type="number"
            value={v.price}
            data-key={v.key}
            onChange={handleVariantPriceChange}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Stock</span>
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500"
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
          <p className="text-xs font-semibold text-slate-600">Variant images</p>
          {v.images.length > 0 && (
            <span className="text-xs font-semibold text-slate-500">{v.images.length} selected</span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(v.existingMedia ?? []).map((m, idx) => (
            <div
              className="group relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200"
              key={m.id}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="h-full w-full object-cover" src={resolveImageUrl(m.media.url)} />
              <button
                type="button"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-red-500 opacity-0 shadow hover:bg-white group-hover:opacity-100"
                onClick={() => handleRemoveExistingVariantMedia(v.key, m.id)}
              >
                <AdminIcon className="h-3 w-3" name="trash" />
              </button>
            </div>
          ))}
          {(v.imagePreviews ?? []).map((url, idx) => (
            <div
              className="group relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200"
              key={`${v.key}-preview-${idx}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="h-full w-full object-cover" src={url} />
              <button
                type="button"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-red-500 opacity-0 shadow hover:bg-white group-hover:opacity-100"
                onClick={() => handleRemoveNewVariantMedia(v.key, idx)}
              >
                <AdminIcon className="h-3 w-3" name="trash" />
              </button>
            </div>
          ))}
          <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-500 hover:bg-slate-50">
            <AdminIcon className="h-4 w-4" name="upload" />
            <span className="mt-1 text-[10px] font-semibold">Add</span>
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
