"use client";

import { useState } from "react";
import { apiRequest } from "../../../lib/admin-api";

type Action = "add" | "remove";
type Reason = "restock" | "correction" | "return" | "manual";

export function useAdjustStockSubmit({
  selectedVariantId,
  selectedVariant,
  isProductMode,
  productId,
  quantity,
  action,
  reason,
  note,
  onSuccess,
}: {
  selectedVariantId: string;
  selectedVariant?: { stockQuantity: number } | null;
  isProductMode: boolean;
  productId?: string;
  quantity: string;
  action: Action;
  reason: Reason;
  note: string;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedVariantId) {
      setError("Select a variant or product");
      return;
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      setError("Quantity must be a positive whole number");
      return;
    }

    const change = action === "add" ? qty : -qty;

    if (selectedVariant && action === "remove" && selectedVariant.stockQuantity - qty < 0) {
      setError(`Stock cannot go negative. Current stock: ${selectedVariant.stockQuantity}`);
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        change,
        reason,
        note: note || undefined,
      };
      if (isProductMode) {
        payload.productId = productId;
      } else {
        payload.variantId = selectedVariantId;
      }
      await apiRequest("/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to adjust stock");
    } finally {
      setSaving(false);
    }
  }

  return { handleSubmit, saving, setError, error };
}
