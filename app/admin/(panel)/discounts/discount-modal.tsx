"use client";

import { resolveImageUrl, type Product } from "../../../../lib/admin-api";
import { AdminIcon } from "../../_components/admin-shell";
import { useDiscountForm } from "../../_hooks/use-discount-form";

interface DiscountModalProps {
  isOpen: boolean;
  discountId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function DiscountModal({ isOpen, discountId, onClose, onSaved }: DiscountModalProps) {
  const {
    products,
    filteredProducts,
    form,
    setForm,
    productSearch,
    setProductSearch,
    error,
    isSaving,
    isLoadingProducts,
    canSubmit,
    handleSubmit,
    toggleProduct,
    close,
  } = useDiscountForm({ isOpen, discountId, onSaved, onClose });

  function productThumb(product: Product) {
    const url = product.media?.[0]?.media?.url;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={product.name}
        className="h-8 w-8 shrink-0 rounded border border-slate-200 object-cover"
        src={url ? resolveImageUrl(url) : '/images/no-image-icon-6.png'}
      />
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discount-modal-title"
    >
      <form
        className="modal-panel flex w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl min-h-[480px]"
        onSubmit={handleSubmit}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-6 pb-5 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900" id="discount-modal-title">
              {form.id ? "Edit discount" : "Add discount"}
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {form.id
                ? "Update discount details and linked products."
                : "Create a new product discount."}
            </p>
          </div>
          <button
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 ${isSaving ? "cursor-not-allowed" : "cursor-pointer"}`}
            disabled={isSaving}
            onClick={close}
            type="button"
          >
            <AdminIcon className="h-4 w-4" name="x" />
          </button>
        </div>

        <div className="flex-1 modal-body p-6">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Name <span className="text-red-500">*</span>
              </span>
              <input
                autoFocus
                required
                value={form.name}
                onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Type</span>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                  onChange={(e) =>
                    setForm((c) => ({ ...c, type: e.target.value as "percentage" | "fixed" }))
                  }
                  value={form.type}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Value {form.type === "percentage" ? "(%)" : "(৳)"} <span className="text-red-500">*</span>
                </span>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                  min={0}
                  onChange={(e) => setForm((c) => ({ ...c, value: e.target.value }))}
                  required
                  step={form.type === "percentage" ? "1" : "0.01"}
                  type="number"
                  value={form.value}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Start Date</span>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                  onChange={(e) => setForm((c) => ({ ...c, startDate: e.target.value }))}
                  type="date"
                  value={form.startDate}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">End Date</span>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                  onChange={(e) => setForm((c) => ({ ...c, endDate: e.target.value }))}
                  type="date"
                  value={form.endDate}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Status</span>
              <select
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                onChange={(e) =>
                  setForm((c) => ({ ...c, status: e.target.value as "active" | "inactive" }))
                }
                value={form.status}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <div className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Linked Products <span className="text-red-500">*</span> ({form.productIds.length} selected)
              </span>
              <div className="rounded-lg border border-slate-300">
                <div className="flex items-center gap-3 border-b border-slate-200 p-3">
                  <AdminIcon className="h-5 w-5 shrink-0 text-slate-400" name="search" />
                  <input
                    className="w-full bg-transparent font-medium outline-none"
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    value={productSearch}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {isLoadingProducts ? (
                    <div className="p-4 text-center font-medium text-slate-500">
                      Loading products...
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-4 text-center font-medium text-slate-500">
                      {products.length === 0
                        ? "No products found."
                        : "No products match your search."}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      <div className="flex gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                        <button
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                        onClick={() =>
                            setForm((c) => ({
                              ...c,
                              productIds: filteredProducts.map((p) => p.id),
                            }))
                          }
                          type="button"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                        className="text-sm font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                        onClick={() =>
                            setForm((c) => ({
                              ...c,
                              productIds: c.productIds.filter(
                                (id) => !filteredProducts.some((p) => p.id === id),
                              ),
                            }))
                          }
                          type="button"
                        >
                          Clear
                        </button>
                      </div>
                      {filteredProducts.map((product) => (
                        <label
                          className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-slate-50 ${
                            form.productIds.includes(product.id) ? "bg-blue-50" : ""
                          }`}
                          key={product.id}
                        >
                          <input
                            checked={form.productIds.includes(product.id)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                            onChange={() => toggleProduct(product.id)}
                            type="checkbox"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-slate-800">
                              {product.name}
                            </p>
                          </div>
                          {productThumb(product)}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 shrink-0">
          <button
            className={`h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors ${isSaving ? "cursor-not-allowed" : "cursor-pointer"}`}
            disabled={isSaving}
            onClick={close}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white disabled:bg-slate-400 hover:bg-blue-700 transition-colors ${isSaving ? "cursor-not-allowed" : "cursor-pointer"}`}
            disabled={isSaving}
            type="submit"
          >
            <AdminIcon className="h-4 w-4" name={form.id ? "check" : "plus"} />
            {isSaving ? "Saving..." : form.id ? "Update Discount" : "Add Discount"}
          </button>
        </div>
      </form>
    </div>
  );
}
