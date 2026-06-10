"use client";

import { useState } from "react";
import { AdminIcon } from "../../_components/admin-shell";
import { type Product } from "../../../../lib/admin-api";
import { useDiscountForm } from "../../_hooks/use-discount-form";

interface DiscountModalProps {
  isOpen: boolean;
  discountId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function DiscountModal({ isOpen, discountId, onClose, onSaved }: DiscountModalProps) {
  const [productSearch, setProductSearch] = useState("");

  const {
    products,
    filteredProducts,
    form,
    setForm,
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
    if (url) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="h-8 w-8 shrink-0 rounded border border-slate-200 object-cover"
          src={url}
        />
      );
    }
    return (
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded border border-slate-200 bg-white text-xs font-bold text-slate-400">
        <AdminIcon className="h-4 w-4" name="package" />
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discount-modal-title"
    >
      <form
        className="flex w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={handleSubmit}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <h2 className="text-2xl font-black" id="discount-modal-title">
              {form.id ? "Edit discount" : "Add discount"}
            </h2>
            <p className="mt-1 font-medium text-slate-600">
              {form.id
                ? "Update discount details and linked products."
                : "Create a new product discount."}
            </p>
          </div>
          <button
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-300 text-xl font-black text-slate-600 ${isSaving ? "cursor-not-allowed" : "cursor-pointer"}`}
            disabled={isSaving}
            onClick={close}
            type="button"
          >
            <AdminIcon className="h-5 w-5" name="x" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700">Name</span>
              <input
                autoFocus
                className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                required
                value={form.name}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">Type</span>
                <select
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Value {form.type === "percentage" ? "(%)" : "(৳)"}
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                <span className="mb-2 block text-sm font-black text-slate-700">Start Date</span>
                <input
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(e) => setForm((c) => ({ ...c, startDate: e.target.value }))}
                  type="date"
                  value={form.startDate}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">End Date</span>
                <input
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(e) => setForm((c) => ({ ...c, endDate: e.target.value }))}
                  type="date"
                  value={form.endDate}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700">Status</span>
              <select
                className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
              <span className="mb-2 block text-sm font-black text-slate-700">
                Linked Products ({form.productIds.length} selected)
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
                        className="text-sm font-black text-blue-600 hover:text-blue-800 cursor-pointer"
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
                        className="text-sm font-black text-slate-600 hover:text-slate-800 cursor-pointer"
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
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 p-6">
          <button
            className={`h-12 rounded-lg border border-slate-300 bg-white px-5 font-black text-slate-700 ${isSaving ? "cursor-not-allowed" : "cursor-pointer"}`}
            disabled={isSaving}
            onClick={close}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-5 font-black text-white disabled:bg-slate-400 ${!canSubmit || isSaving ? "cursor-not-allowed" : "cursor-pointer"}`}
            disabled={!canSubmit || isSaving}
            type="submit"
          >
            <AdminIcon className="h-5 w-5" name={form.id ? "check" : "plus"} />
            {isSaving ? "Saving..." : form.id ? "Update Discount" : "Add Discount"}
          </button>
        </div>
      </form>
    </div>
  );
}
