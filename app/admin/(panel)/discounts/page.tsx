"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import {
  apiRequest,
} from "../../../../lib/admin-api";
import {ProductDiscount} from "../../../../lib/type";
import { DiscountModal } from "./discount-modal";
import { DiscountRow } from "./discount-row";

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<ProductDiscount[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<ProductDiscount | null>(null);
  const [error, setError] = useState("");

  const filteredDiscounts = useMemo(() => {
    return discounts.filter((d) =>
      `${d.name} ${d.type} ${d.status}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [discounts, search]);

  async function loadDiscounts() {
    setIsLoading(true);
    try {
      setDiscounts(await apiRequest<ProductDiscount[]>("/product-discounts"));
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDiscounts();
  }, []);

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

  async function deleteDiscount(discount: ProductDiscount) {
    setDiscountToDelete(discount);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!discountToDelete) return;
    try {
      await apiRequest(`/product-discounts/${discountToDelete.id}`, { method: "DELETE" });
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

  async function toggleStatus(discount: ProductDiscount) {
    try {
      await apiRequest(`/product-discounts/${discount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: discount.status === "active" ? "inactive" : "active",
        }),
      });
      await loadDiscounts();
    } catch {
      // silently fail
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
              className="grid h-14 w-14 place-items-center cursor-pointer rounded-lg border border-slate-300 bg-white font-black"
              onClick={loadDiscounts}
              type="button"
            >
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button
              className="inline-flex h-14 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-6 font-black text-white shadow-lg shadow-blue-600/15"
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
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">Discount list</h2>
              <p className="font-medium text-slate-600">
                Displaying {filteredDiscounts.length} discounts
              </p>
            </div>
            <label className="flex h-12 w-full max-w-md items-center gap-3 rounded-lg border border-slate-300 px-4">
              <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent font-medium outline-none"
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
                      <th className="px-5 py-4 font-black" key={heading}>
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td className="px-5 py-8 font-bold text-slate-500" colSpan={7}>
                      Loading discounts...
                    </td>
                  </tr>
                ) : filteredDiscounts.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 font-bold text-slate-500" colSpan={7}>
                      No discounts found.
                    </td>
                  </tr>
                ) : (
                  filteredDiscounts.map((discount) => (
                    <DiscountRow
                      key={discount.id}
                      discount={discount}
                      onToggleStatus={toggleStatus}
                      onEdit={openEditModal}
                      onDelete={deleteDiscount}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <DiscountModal
        isOpen={isModalOpen}
        discountId={editingDiscountId}
        onClose={closeModal}
        onSaved={loadDiscounts}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Discount"
        message={
          error
            ? error
            : `Are you sure you want to delete "${discountToDelete?.name}"? This action cannot be undone.`
        }
        confirmText="Yes"
        cancelText="No"
        isDestructive={true}
      />
    </>
  );
}
