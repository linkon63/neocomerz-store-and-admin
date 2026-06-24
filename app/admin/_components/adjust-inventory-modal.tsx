"use client";

import { AdminIcon } from "./admin-icons";
import { ProductThumb } from "./admin-ui";
import { useAdjustInventory } from "../_hooks/use-adjust-inventory";

export function AdjustInventoryModal({
  product,
  variant,
  onClose,
  onSuccess,
}: {
  product: { id: string; name: string; slug: string; imageUrl?: string };
  variant: { id: string; sku: string; stockQuantity: number };
  onClose: () => void;
  onSuccess: () => void;
}) {
  const {
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
  } = useAdjustInventory({ product, variant, onSuccess });

  return (
    <div
      aria-labelledby="adjust-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
      role="dialog"
    >
      <div className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900" id="adjust-modal-title">
              Adjust Inventory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a reason and quantity to adjust
            </p>
          </div>
          <button
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
            onClick={onClose}
            type="button"
            disabled={saving}
          >
            <AdminIcon className="h-5 w-5" name="x" />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white">
            <ProductThumb
              color="bg-slate-100"
              src={product.imageUrl}
              alt={product.name}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{product.name}</p>
            <p className="mt-0.5 text-xs text-slate-400">{product.slug}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              SKU: {variant.sku}
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={submit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Branch <span className="text-red-500">*</span>
            </span>
            <select
              className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              disabled
            >
              <option>Main Branch</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Adjustment type <span className="text-red-500">*</span>
            </span>
            <select
              className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value)}
            >
              <option value="">Choose a type</option>
              <option value="add">Add Stock</option>
              <option value="remove">Remove Stock</option>
              <option value="damage">Damage</option>
              <option value="return">Return</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Note
            </span>
            <textarea
              className="min-h-28 w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Add your adjustment note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Adjustment quantity <span className="text-red-500">*</span>
              </span>
              <input
                className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="e.g. 10"
                min="1"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>

            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Inventory
              </span>
              <div className="flex h-11 items-center gap-3">
                <span className="text-sm font-semibold text-slate-900">
                  {variant.stockQuantity}
                </span>
                <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className={`text-sm font-semibold ${projectedStock < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {adjustmentType ? projectedStock : variant.stockQuantity}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              className="h-11 rounded-lg border-2 border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
              onClick={onClose}
              type="button"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving || !isFormValid}
              type="submit"
            >
              {saving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adjusting...
                </>
              ) : (
                "Adjust Inventory"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
