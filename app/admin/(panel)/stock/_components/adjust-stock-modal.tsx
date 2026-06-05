"use client";

import { useRef, useState } from "react";
import { AdminIcon } from "../../../_components/admin-shell";
import {
  apiRequest,
  type InventoryVariant,
} from "../../../../../lib/admin-api";

type Action = "add" | "remove";
type Reason = "restock" | "correction" | "return" | "manual";

const REASONS: { value: Reason; label: string }[] = [
  { value: "restock", label: "Restock" },
  { value: "correction", label: "Correction" },
  { value: "return", label: "Return" },
  { value: "manual", label: "Manual" },
];

const PRODUCT_OPTION_ID = "__product__";

export function AdjustStockModal({
  variants,
  preselectedVariantId,
  preselectedProductId,
  preselectedProductName,
  onClose,
  onSuccess,
}: {
  variants: InventoryVariant[];
  preselectedVariantId?: string;
  preselectedProductId?: string;
  preselectedProductName?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const hasPreselect = !!preselectedVariantId || !!preselectedProductId;
  const isPreselectedProduct = !preselectedVariantId && !!preselectedProductId;

  const [selectedVariantId, setSelectedVariantId] = useState(
    isPreselectedProduct ? PRODUCT_OPTION_ID : preselectedVariantId ?? "",
  );
  const [productId, setProductId] = useState(preselectedProductId);
  const [action, setAction] = useState<Action>("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState<Reason>("manual");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const isProductMode = selectedVariantId === PRODUCT_OPTION_ID;

  const realVariants = variants.filter((v): v is InventoryVariant & { id: string; sku: string } =>
    v.id !== null && v.sku !== null,
  );

  const selectedVariant = realVariants.find((v) => v.id === selectedVariantId);

  const filtered = search.trim()
    ? realVariants.filter(
        (v) =>
          v.sku.toLowerCase().includes(search.toLowerCase()) ||
          v.product.name.toLowerCase().includes(search.toLowerCase()),
      )
    : realVariants;

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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-black">Adjust Stock</h2>
          <button
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
            type="button"
          >
            <AdminIcon className="h-5 w-5" name="x" />
          </button>
        </div>

        <form className="space-y-5 p-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {error}
            </div>
          )}

          {hasPreselect ? (
            <>
              {isPreselectedProduct ? (
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-600">Product</label>
                  <div className="flex items-center gap-3 rounded-xl border border-blue-300 bg-blue-50 px-4 py-3">
                    <span className="flex-1 font-black uppercase text-blue-800">
                      {preselectedProductName}
                    </span>
                    <span className="rounded-md border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-black text-blue-700">
                      NO VARIANT
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs font-bold text-blue-600">
                    A default variant will be created automatically on save.
                  </p>
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <span className="font-bold text-slate-700">Current stock: </span>
                    <span className="font-black text-slate-900">0 pcs</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-600">Variant</label>
                  <div className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3">
                    {(() => {
                      const v = realVariants.find((r) => r.id === preselectedVariantId);
                      return v ? (
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-800 capitalize">{v.product.name}</span>
                          <span className="font-semibold text-slate-500">{v.sku}</span>
                          <span className="ml-auto whitespace-nowrap text-right">
                            <span className="font-black text-slate-900">{v.stockQuantity} pcs</span>
                            <span className="ml-2 text-xs text-slate-400">
                              alert below {v.stockAlertThreshold}
                            </span>
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-slate-400">Variant not found</span>
                      );
                    })()}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="relative">
              <label className="mb-1.5 block text-sm font-bold text-slate-600">
                Variant or Product
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                placeholder="Search by SKU or product name..."
                ref={searchRef}
                type="text"
                value={search}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              {showDropdown && (
                <div className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                  {filtered.length === 0 && (!preselectedProductId || !preselectedProductName) ? (
                    <div className="p-4 text-sm font-medium text-slate-400">No results found</div>
                  ) : (
                    <>
                      {preselectedProductId && preselectedProductName && (
                        <button
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-slate-50 ${
                            isProductMode ? "bg-blue-50" : ""
                          }`}
                          type="button"
                          onMouseDown={() => {
                            setSelectedVariantId(PRODUCT_OPTION_ID);
                            setProductId(preselectedProductId);
                            setSearch(preselectedProductName);
                            setShowDropdown(false);
                          }}
                        >
                          <span className="flex items-center gap-2 font-bold text-blue-700">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                              <path d="M4 21V7l8-4 8 4v14" />
                              <path d="M4 7l8 4 8-4" />
                              <path d="M12 11v10" />
                            </svg>
                            {preselectedProductName}
                          </span>
                          <span className="ml-2 font-medium text-blue-500">No variant — auto-create</span>
                        </button>
                      )}
                      {filtered.slice(0, 50).map((v) => (
                        <button
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-slate-50 ${
                            v.id === selectedVariantId ? "bg-blue-50" : ""
                          }`}
                          key={v.id}
                          type="button"
                          onMouseDown={() => {
                            setSelectedVariantId(v.id);
                            setProductId(undefined);
                            setSearch(`${v.sku} — ${v.product.name}`);
                            setShowDropdown(false);
                          }}
                        >
                          <span className="font-bold text-slate-800">{v.sku}</span>
                          <span className="font-medium text-slate-500">{v.product.name}</span>
                          <span className="ml-auto whitespace-nowrap text-sm font-bold text-slate-400">
                            {v.stockQuantity} in stock
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
              {isProductMode && !preselectedProductId && (
                <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                  A default variant will be created automatically on save.
                </div>
              )}
            </div>
          )}

          {!hasPreselect && selectedVariant && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <span className="font-bold text-slate-700">Current stock: </span>
              <span className="font-black text-slate-900">{selectedVariant.stockQuantity} pcs</span>
              <span className="ml-3 text-slate-400">
                · Alert below {selectedVariant.stockAlertThreshold} pcs
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-600">Action</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none"
                value={action}
                onChange={(e) => setAction(e.target.value as Action)}
              >
                <option value="add">Add Stock</option>
                <option value="remove">Remove Stock</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-600">Quantity</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none"
                min="1"
                placeholder="e.g. 10"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-600">Reason</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none"
              value={reason}
              onChange={(e) => setReason(e.target.value as Reason)}
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-600">
              Note <span className="font-medium text-slate-400">(optional)</span>
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none"
              placeholder="Reason for adjustment..."
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className={`rounded-xl px-6 py-3 text-sm font-bold text-white ${
                saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={saving}
              type="submit"
            >
              {saving ? "Saving..." : "Save Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
