"use client";

import { useState } from "react";
import { apiRequest } from "../../../lib/admin-api";

type AdjustProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
};

type AdjustVariant = {
  id: string;
  sku: string;
  stockQuantity: number;
};

export function useAdjustInventory({
  product,
  variant,
  onSuccess,
}: {
  product: AdjustProduct;
  variant: AdjustVariant;
  onSuccess: () => void;
}) {
  const [adjustmentType, setAdjustmentType] = useState("");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const rawChange = Number(quantity) || 0;
  const change =
    adjustmentType === "add" || adjustmentType === "return"
      ? rawChange
      : -Math.abs(rawChange);
  const projectedStock = variant.stockQuantity + (adjustmentType ? change : 0);
  const isFormValid = adjustmentType && quantity && rawChange >= 1 && projectedStock >= 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!adjustmentType) {
      setError("Select an adjustment type");
      return;
    }
    if (!quantity || rawChange < 1) {
      setError("Quantity must be a positive whole number");
      return;
    }
    if (projectedStock < 0) {
      setError(`Stock cannot go negative. Current stock: ${variant.stockQuantity}`);
      return;
    }

    const reason =
      adjustmentType === "add"
        ? "restock"
        : adjustmentType === "return"
          ? "return"
          : adjustmentType === "damage"
            ? "correction"
            : "manual";

    setSaving(true);
    try {
      await apiRequest("/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: variant.id,
          change,
          reason,
          note: note.trim() || `Admin inventory adjustment (${adjustmentType})`,
        }),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to adjust inventory");
    } finally {
      setSaving(false);
    }
  }

  return {
    adjustmentType,
    setAdjustmentType,
    note,
    setNote,
    quantity,
    setQuantity,
    saving,
    error,
    projectedStock,
    isFormValid,
    submit,
  };
}
