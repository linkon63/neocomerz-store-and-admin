"use client";

import { useEffect, useState } from "react";
import { apiRequest, type Attribute, type AttributeValue } from "../../../../lib/admin-api";
import { AdminIcon } from "../../_components/admin-shell";

// ─── Types ──────────────────────────────────────────────────────────────────

export type VariantFull = {
  id: string;
  sku: string;
  price: string | number;
  cost?: string | number | null;
  stockQuantity: number;
  stockAlertThreshold: number;
  isDefault: boolean;
  createdAt?: string;
  attributes: {
    id: string;
    attributeValue?: {
      id: string;
      value: string;
      attribute?: { id: string; name: string };
    };
  }[];
};

type VariantFormState = {
  sku: string;
  price: string;
  cost: string;
  stockQuantity: string;
  stockAlertThreshold: string;
  isDefault: boolean;
  /** attributeValueId per attribute */
  attributeValues: Record<string, string>;
};

const EMPTY_VARIANT_FORM: VariantFormState = {
  sku: "",
  price: "",
  cost: "",
  stockQuantity: "0",
  stockAlertThreshold: "5",
  isDefault: false,
  attributeValues: {},
};

function buildPayload(form: VariantFormState) {
  const attributeValueIds = Object.values(form.attributeValues).filter(Boolean);
  return {
    sku: form.sku.trim(),
    price: form.price ? Number(form.price) : 0,
    cost: form.cost ? Number(form.cost) : undefined,
    stockQuantity: Number(form.stockQuantity || 0),
    stockAlertThreshold: Number(form.stockAlertThreshold || 5),
    isDefault: form.isDefault,
    ...(attributeValueIds.length > 0 ? { attributeValueIds } : {}),
  };
}

function displayAttributes(variant: VariantFull): string {
  if (!variant.attributes || variant.attributes.length === 0) return "—";
  return variant.attributes
    .map((a) => {
      const name = a.attributeValue?.attribute?.name;
      const val = a.attributeValue?.value;
      if (name && val) return `${name}: ${val}`;
      return val ?? "—";
    })
    .join(", ");
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function VariantsPanel({
  productId,
  onVariantsChange,
}: {
  productId: string;
  onVariantsChange?: () => void;
}) {
  const [variants, setVariants] = useState<VariantFull[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VariantFormState>(EMPTY_VARIANT_FORM);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadVariants() {
    setIsLoading(true);
    setError("");
    try {
      const data = await apiRequest<{ variants?: VariantFull[] }>(`/products/${productId}`);
      setVariants(
        (data.variants ?? []).sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load variants");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAttributes() {
    try {
      const data = await apiRequest<Attribute[]>("/attributes");
      setAttributes(data ?? []);
    } catch {
      // Attributes are optional for variants
    }
  }

  useEffect(() => {
    if (productId) {
      loadVariants();
      loadAttributes();
    }
  }, [productId]);

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_VARIANT_FORM);
    setShowForm(true);
    setError("");
  }

  function openEditForm(variant: VariantFull) {
    setEditingId(variant.id);
    const attributeValues: Record<string, string> = {};
    for (const a of variant.attributes ?? []) {
      const attrId = a.attributeValue?.attribute?.id;
      const valId = a.attributeValue?.id;
      if (attrId && valId) attributeValues[attrId] = valId;
    }
    setForm({
      sku: variant.sku,
      price: String(variant.price),
      cost: variant.cost ? String(variant.cost) : "",
      stockQuantity: String(variant.stockQuantity),
      stockAlertThreshold: String(variant.stockAlertThreshold),
      isDefault: variant.isDefault,
      attributeValues,
    });
    setShowForm(true);
    setError("");
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_VARIANT_FORM);
    setError("");
  }

  async function handleSave() {
    if (!form.sku.trim()) {
      setError("SKU is required.");
      return;
    }
    if (!form.price || Number(form.price) < 0) {
      setError("Valid price is required.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const payload = buildPayload(form);
      if (editingId) {
        await apiRequest(`/variants/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest(`/products/${productId}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      cancelForm();
      await loadVariants();
      onVariantsChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save variant");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(variantId: string) {
    if (deletingId === variantId) {
      setIsSaving(true);
      setError("");
      try {
        await apiRequest(`/variants/${variantId}`, { method: "DELETE" });
        setDeletingId(null);
        await loadVariants();
        onVariantsChange?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete variant");
      } finally {
        setIsSaving(false);
      }
    } else {
      setDeletingId(variantId);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-base font-black text-slate-800">Product Variants</h3>
          <p className="mt-0.5 text-xs font-medium text-slate-400">
            Manage SKU, price, stock and attributes for each variant.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700 transition"
          >
            <AdminIcon className="h-4 w-4" name="plus" />
            Add Variant
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mx-5 mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="border-b border-slate-100 bg-slate-50/50 p-5">
          <h4 className="mb-4 text-sm font-black text-slate-700">
            {editingId ? "Edit Variant" : "New Variant"}
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* SKU */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-black text-slate-600">SKU *</span>
              <input
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                placeholder="e.g. TSHIRT-BLK-M"
              />
            </label>
            {/* Price */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-black text-slate-600">Retail Price *</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
              />
            </label>
            {/* Cost */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-black text-slate-600">Unit Price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={form.cost}
                onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                placeholder="0.00"
              />
            </label>
            {/* Stock */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-black text-slate-600">Stock Qty</span>
              <input
                type="number"
                min="0"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={form.stockQuantity}
                onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
              />
            </label>
            {/* Alert Threshold */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-black text-slate-600">Alert Threshold</span>
              <input
                type="number"
                min="0"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={form.stockAlertThreshold}
                onChange={(e) => setForm((f) => ({ ...f, stockAlertThreshold: e.target.value }))}
              />
            </label>
            {/* Attributes */}
            {attributes.map((attr) => (
              <label key={attr.id} className="block">
                <span className="mb-1.5 block text-xs font-black text-slate-600">{attr.name}</span>
                <select
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={form.attributeValues[attr.id] ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      attributeValues: { ...f.attributeValues, [attr.id]: e.target.value },
                    }))
                  }
                >
                  <option value="">— None —</option>
                  {(attr.values ?? []).map((val: AttributeValue) => (
                    <option key={val.id} value={val.id}>
                      {val.value}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            {/* isDefault */}
            <label className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-bold text-slate-700">Set as default variant</span>
            </label>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-black text-white hover:bg-blue-700 disabled:bg-slate-400 transition"
            >
              {isSaving ? "Saving…" : editingId ? "Update Variant" : "Save Variant"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-black text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Variants Table */}
      {isLoading ? (
        <p className="px-5 py-6 text-sm font-medium text-slate-500">Loading variants…</p>
      ) : variants.length === 0 && !showForm ? (
        <p className="px-5 py-6 text-sm font-medium text-slate-500">
          No variants found. Add a variant above.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
              <tr>
                {["SKU", "Retail Price", "Unit Price", "Stock", "Attributes", "Default", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 font-black">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.map((variant) => (
                <tr
                  key={variant.id}
                  className={`transition-colors hover:bg-slate-50/80 ${
                    variant.isDefault ? "bg-blue-50/30" : ""
                  }`}
                >
                  <td className="px-5 py-4 font-mono text-xs font-bold text-slate-700">
                    {variant.sku}
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-700">
                    €{Number(variant.price).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {variant.cost ? `€${Number(variant.cost).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`font-black ${
                        variant.stockQuantity <= 0
                          ? "text-red-600"
                          : variant.stockQuantity <= variant.stockAlertThreshold
                          ? "text-amber-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {variant.stockQuantity}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">{displayAttributes(variant)}</td>
                  <td className="px-5 py-4">
                    {variant.isDefault && (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700 ring-1 ring-inset ring-blue-600/10">
                        Default
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(variant)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-black hover:bg-slate-50 transition"
                      >
                        <AdminIcon className="h-3.5 w-3.5" name="edit" />
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleDelete(variant.id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition ${
                          deletingId === variant.id
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        <AdminIcon className="h-3.5 w-3.5" name="x" />
                        {deletingId === variant.id ? "Confirm Delete" : "Delete"}
                      </button>
                      {deletingId === variant.id && (
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-black hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
