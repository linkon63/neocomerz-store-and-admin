"use client";

import { useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { InfiniteScroll } from "../../_components/infinite-scroll";
import { type ProductDiscount } from "../../../../lib/type";
import { useDiscounts } from "../../_hooks/use-discounts";
import { DiscountModal } from "./discount-modal";
import { DiscountRow } from "./discount-row";

export default function DiscountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<ProductDiscount | null>(null);
  const [error, setError] = useState("");
  const { discounts, isLoading, loadDiscounts, refreshDiscounts, deleteDiscount, toggleStatus, search, setSearch, page, setPage, total, hasMore } = useDiscounts();

  function openAddModal() {
    setEditingDiscountId(null);
    setIsModalOpen(true);
  }

  function openEditModal(discount: ProductDiscount) {
    setEditingDiscountId(discount.id);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingDiscountId(null);
    setIsModalOpen(false);
  }

  function requestDelete(discount: ProductDiscount) {
    setDiscountToDelete(discount);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!discountToDelete) return;
    try {
      await deleteDiscount(discountToDelete.id);
      setDeleteModalOpen(false);
      setDiscountToDelete(null);
      await loadDiscounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete discount");
    }
  }

  function cancelDelete() {
    setDeleteModalOpen(false);
    setDiscountToDelete(null);
    setError("");
  }

  async function handleToggleStatus(discount: ProductDiscount) {
    try {
      await toggleStatus(discount.id, discount.status);
      await loadDiscounts();
    } catch {
    }
  }

  return (
    <>
      <PageHeader
        title="Discount"
        description="Create and manage product discounts."
        action={
          <div className="flex gap-3">
            <button
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 shrink-0"
              onClick={openAddModal}
              type="button"
            >
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Discount
            </button>
          </div>
        }
      />

      <section>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {total} {total === 1 ? "discount" : "discounts"}
              </p>
            </div>
            <label className="flex h-11 w-full max-w-md items-center gap-3 rounded-lg border-2 border-slate-200 bg-white px-4 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 text-slate-800"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search discounts"
                value={search}
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-250 text-left">
              <thead className="bg-slate-50">
                <tr>
                  {["Name", "Type", "Value", "Products", "Date Range", "Status", "Actions"].map(
                    (heading) => (
                      <th className="px-5 py-4 text-sm font-semibold text-slate-700" key={heading}>
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && discounts.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-sm text-slate-500" colSpan={7}>
                      Loading discounts...
                    </td>
                  </tr>
                ) : discounts.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-sm font-medium text-slate-400" colSpan={7}>
                      No discounts found.
                    </td>
                  </tr>
                ) : (
                  discounts.map((discount) => (
                    <DiscountRow
                      key={discount.id}
                      discount={discount}
                      onToggleStatus={handleToggleStatus}
                      onEdit={openEditModal}
                      onDelete={requestDelete}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {discounts.length > 0 && (
            <InfiniteScroll
              hasMore={hasMore}
              isLoading={isLoading}
              onLoadMore={() => setPage((p) => p + 1)}
              total={total}
              loaded={discounts.length}
              itemLabel="discounts"
              loadingLabel="Loading more..."
              allLoadedLabel="All discounts loaded"
            />
          )}
        </div>
      </section>

      <DiscountModal
        isOpen={isModalOpen}
        discountId={editingDiscountId}
        onClose={closeModal}
        onSaved={refreshDiscounts}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Discount"
        message={`Are you sure you want to delete "${discountToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes"
        cancelText="No"
        isDestructive={true}
        error={error}
      />
    </>
  );
}
