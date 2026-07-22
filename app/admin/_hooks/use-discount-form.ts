"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiRequest, type Product } from "../../../lib/admin-api";
import { type DiscountForm, type ProductDiscount } from "../../../lib/type";

const emptyForm: DiscountForm = {
  name: "",
  type: "percentage",
  value: "",
  productIds: [],
  startDate: "",
  endDate: "",
  status: "active",
};

export function useDiscountForm({
  isOpen,
  discountId,
  onSaved,
  onClose,
}: {
  isOpen: boolean;
  discountId: string | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<DiscountForm>(emptyForm);
  const [productSearch, setProductSearch] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()),
    );
  }, [products, productSearch]);

  const canSubmit = useMemo(() => {
    return form.name.trim() !== "" && Number(form.value) > 0 && form.productIds.length > 0;
  }, [form.name, form.value, form.productIds]);

  async function loadProducts() {
    setIsLoadingProducts(true);
    try {
      const res = await apiRequest<{ data: Product[] } | Product[]>("/products?limit=200");
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setProducts(list);
    } catch {
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }

  async function loadDiscountForEdit(id: string) {
    try {
      const full = await apiRequest<ProductDiscount>(`/product-discounts/${id}`);
      setForm({
        id: full.id,
        name: full.name,
        type: full.type,
        value: String(Number(full.value)),
        productIds: (full.products ?? []).map((p) => p.product.id),
        startDate: full.startDate ? full.startDate.split("T")[0] : "",
        endDate: full.endDate ? full.endDate.split("T")[0] : "",
        status: full.status as "active" | "inactive",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load discount");
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setProductSearch("");
    setForm(emptyForm);
    loadProducts();
    if (discountId) loadDiscountForEdit(discountId);
  }, [isOpen, discountId]);

  function close() {
    if (isSaving) return;
    setError("");
    setForm(emptyForm);
    onClose();
  }

  function toggleProduct(productId: string) {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.includes(productId)
        ? current.productIds.filter((id) => id !== productId)
        : [...current.productIds, productId],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Discount name is required.");
      return;
    }
    if (!form.value || Number(form.value) <= 0) {
      setError("Discount value must be greater than 0.");
      return;
    }
    if (form.productIds.length === 0) {
      setError("Please select at least one product to apply this discount.");
      return;
    }

    setIsSaving(true);

    try {
      const body: Record<string, unknown> = {
        name: form.name,
        type: form.type,
        value: Number(form.value),
        productIds: form.productIds,
        status: form.status,
      };
      if (form.startDate) body.startDate = new Date(form.startDate).toISOString();
      if (form.endDate) body.endDate = new Date(form.endDate).toISOString();

      const result = await apiRequest<
        ProductDiscount
        | { success: false; message: string; invalidProducts: Array<{ productId: string; lowestPrice: number }> }
      >(form.id ? `/product-discounts/${form.id}` : "/product-discounts", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if ("success" in result && !result.success) {
        setError(result.message);
        setIsSaving(false);
        return;
      }

      setForm(emptyForm);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save discount");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    products,
    filteredProducts,
    form,
    setForm,
    productSearch: productSearch,
    setProductSearch,
    error,
    isSaving,
    isLoadingProducts,
    canSubmit,
    handleSubmit,
    toggleProduct,
    close,
  };
}
