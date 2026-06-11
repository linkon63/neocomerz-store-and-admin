"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { apiRequest, formatDate } from "../../../../lib/admin-api";

// ─── Types ──────────────────────────────────────────────────────────────────

type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: string | number;
  maxUsage: number;
  usedCount: number;
  expiresAt?: string | null;
  createdAt?: string;
};

type CouponForm = {
  id?: string;
  code: string;
  type: "percentage" | "fixed";
  value: string;
  maxUsage: string;
  expiresAt: string;
};

const EMPTY_FORM: CouponForm = {
  code: "",
  type: "percentage",
  value: "",
  maxUsage: "100",
  expiresAt: "",
};

function isExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

function formatValue(coupon: Coupon): string {
  if (coupon.type === "percentage") return `${Number(coupon.value)}%`;
  return `€${Number(coupon.value).toFixed(2)}`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);

  async function loadCoupons() {
    setIsLoading(true);
    setError("");
    try {
      const data = await apiRequest<Coupon[]>("/coupons");
      setCoupons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  function openAddModal() {
    setForm(EMPTY_FORM);
    setError("");
    setIsModalOpen(true);
  }

  function openEditModal(coupon: Coupon) {
    setForm({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      maxUsage: String(coupon.maxUsage),
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().slice(0, 10)
        : "",
    });
    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setForm(EMPTY_FORM);
    setIsModalOpen(false);
    setError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.code.trim()) {
      setError("Coupon code is required.");
      return;
    }
    if (!form.value || Number(form.value) <= 0) {
      setError("Value must be greater than 0.");
      return;
    }
    if (!form.maxUsage || Number(form.maxUsage) < 1) {
      setError("Max usage must be at least 1.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        maxUsage: Number(form.maxUsage),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      };

      if (form.id) {
        await apiRequest(`/coupons/${form.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      closeModal();
      await loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save coupon");
    } finally {
      setIsSaving(false);
    }
  }

  function promptDelete(coupon: Coupon) {
    setCouponToDelete(coupon);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!couponToDelete) return;
    setError("");
    try {
      await apiRequest(`/coupons/${couponToDelete.id}`, { method: "DELETE" });
      setCouponToDelete(null);
      setDeleteModalOpen(false);
      await loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete coupon");
      setDeleteModalOpen(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Coupons"
        description="Create and manage discount coupon codes for your storefront."
        action={
          <div className="flex gap-3">
            <button
              className="grid h-14 w-14 place-items-center rounded-lg border border-slate-300 bg-white font-black"
              onClick={loadCoupons}
              type="button"
            >
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button
              className="inline-flex h-14 items-center gap-2 rounded-lg bg-blue-600 px-6 font-black text-white shadow-sm hover:bg-blue-700 transition"
              onClick={openAddModal}
              type="button"
            >
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Coupon
            </button>
          </div>
        }
      />

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-black">Coupons</h2>
          <p className="font-medium text-slate-500">
            {coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {error && (
          <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                <tr>
                  {["Code", "Type", "Value", "Usage", "Expires", "Status", "Created", "Actions"].map(
                    (h) => (
                      <th key={h} className="px-5 py-4 font-black">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td className="px-8 py-8 font-bold text-slate-500" colSpan={8}>
                      Loading coupons…
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td className="px-8 py-8 font-bold text-slate-500" colSpan={8}>
                      No coupons found. Create your first coupon!
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => {
                    const expired = isExpired(coupon.expiresAt);
                    const exhausted = coupon.usedCount >= coupon.maxUsage;
                    const statusLabel = expired
                      ? "Expired"
                      : exhausted
                      ? "Exhausted"
                      : "Active";
                    const statusClass = expired || exhausted
                      ? "bg-rose-50 text-rose-700 ring-rose-600/10"
                      : "bg-emerald-50 text-emerald-700 ring-emerald-600/10";

                    return (
                      <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-5">
                          <span className="font-mono text-sm font-black tracking-wider text-slate-800">
                            {coupon.code}
                          </span>
                        </td>
                        <td className="px-5 py-5 font-medium capitalize text-slate-600">
                          {coupon.type}
                        </td>
                        <td className="px-5 py-5 font-black text-slate-800">
                          {formatValue(coupon)}
                        </td>
                        <td className="px-5 py-5 font-medium text-slate-600">
                          {coupon.usedCount} / {coupon.maxUsage}
                        </td>
                        <td className="px-5 py-5 font-medium text-slate-600">
                          {coupon.expiresAt
                            ? new Date(coupon.expiresAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "Never"}
                        </td>
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${statusClass}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-5 py-5 font-medium text-slate-600">
                          {formatDate(coupon.createdAt)}
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(coupon)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-black hover:bg-slate-50 cursor-pointer transition"
                            >
                              <AdminIcon className="h-4 w-4" name="edit" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => promptDelete(coupon)}
                              className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700 hover:bg-red-100 cursor-pointer transition"
                            >
                              <AdminIcon className="h-4 w-4" name="x" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="coupon-modal-title"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black" id="coupon-modal-title">
                  {form.id ? "Edit coupon" : "Add coupon"}
                </h2>
                <p className="mt-1 font-medium text-slate-600">
                  Configure discount code, type, value and usage limits.
                </p>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-xl font-black text-slate-600"
                disabled={isSaving}
                onClick={closeModal}
                type="button"
              >
                <AdminIcon className="h-5 w-5" name="x" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Code */}
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Coupon Code *
                </span>
                <input
                  autoFocus
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-mono font-medium uppercase tracking-widest outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SUMMER20"
                  required
                  value={form.code}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Type */}
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">Type *</span>
                  <select
                    className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium capitalize outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value as CouponForm["type"] }))
                    }
                    value={form.type}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (€)</option>
                  </select>
                </label>

                {/* Value */}
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    Value * {form.type === "percentage" ? "(%)" : "(€)"}
                  </span>
                  <input
                    type="number"
                    min="0.01"
                    max={form.type === "percentage" ? "100" : undefined}
                    step="0.01"
                    className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    placeholder={form.type === "percentage" ? "20" : "10.00"}
                    required
                    value={form.value}
                  />
                </label>

                {/* Max Usage */}
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    Max Usage *
                  </span>
                  <input
                    type="number"
                    min="1"
                    className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    onChange={(e) => setForm((f) => ({ ...f, maxUsage: e.target.value }))}
                    placeholder="100"
                    required
                    value={form.maxUsage}
                  />
                </label>

                {/* Expires At */}
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    Expires At (optional)
                  </span>
                  <input
                    type="date"
                    className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    value={form.expiresAt}
                  />
                </label>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="h-12 rounded-lg border border-slate-300 bg-white px-5 font-black text-slate-700"
                disabled={isSaving}
                onClick={closeModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-5 font-black text-white disabled:bg-slate-400"
                disabled={isSaving}
                type="submit"
              >
                <AdminIcon className="h-5 w-5" name={form.id ? "check" : "plus"} />
                {isSaving ? "Saving…" : form.id ? "Update Coupon" : "Create Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        cancelText="No"
        confirmText="Yes, Delete"
        isDestructive={true}
        isOpen={deleteModalOpen}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon "${couponToDelete?.code}"? This cannot be undone.`}
        onClose={() => {
          setDeleteModalOpen(false);
          setCouponToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}
