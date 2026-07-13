"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { apiRequest, formatDate } from "../../../../lib/admin-api";

type Supplier = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
};

type SupplierForm = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
};

const emptyForm: SupplierForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  isActive: true,
};

const PAGE_SIZE = 10;

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) =>
      `${s.name} ${s.phone ?? ""} ${s.email ?? ""} ${s.address ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [search, suppliers]);

  // Reset visibleCount when search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  const paginatedSuppliers = useMemo(() => {
    return filteredSuppliers.slice(0, visibleCount);
  }, [filteredSuppliers, visibleCount]);

  function handleLoadMore() {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setIsLoadingMore(false);
    }, 300);
  }

  useEffect(() => {
    if (isLoadingMore || paginatedSuppliers.length >= filteredSuppliers.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [isLoadingMore, paginatedSuppliers.length, filteredSuppliers.length]);

  async function loadSuppliers() {
    setError("");
    setIsLoading(true);
    try {
      const data = await apiRequest<Supplier[]>("/suppliers");
      setSuppliers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load suppliers"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSuppliers();
  }, []);

  function handleEdit(supplier: Supplier) {
    setForm({
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone ?? "",
      email: supplier.email ?? "",
      address: supplier.address ?? "",
      isActive: supplier.isActive,
    });
    setIsModalOpen(true);
  }

  function handleAddNew() {
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return;

    setIsSaving(true);
    try {
      const url = form.id ? `/suppliers/${form.id}` : "/suppliers";
      const method = form.id ? "PATCH" : "POST";
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        isActive: form.isActive,
      };

      await apiRequest<Supplier>(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setIsModalOpen(false);
      await loadSuppliers();
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save supplier");
    } finally {
      setIsSaving(false);
    }
  }

  function handleDeleteClick(supplier: Supplier) {
    setSupplierToDelete(supplier);
    setDeleteModalOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!supplierToDelete) return;
    setError("");
    try {
      await apiRequest(`/suppliers/${supplierToDelete.id}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setSupplierToDelete(null);
      await loadSuppliers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete supplier"
      );
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <PageHeader
        title="Suppliers"
        description="Manage procurement suppliers and vendors."
        action={
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-500 px-4 text-xs font-semibold text-white shadow-xs hover:bg-blue-600 cursor-pointer"
            onClick={handleAddNew}
          >
            <AdminIcon className="h-3.5 w-3.5" name="plus" />
            Add Supplier
          </button>
        }
      />

      <div className="flex-grow p-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">
                {filteredSuppliers.length}
              </span>
              <span className="text-sm text-slate-500">
                {filteredSuppliers.length === 1 ? "supplier" : "suppliers"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {showSearchInput || search ? (
                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search suppliers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-64 rounded-lg border border-slate-200 pl-8 pr-4 text-xs outline-none focus:border-blue-500"
                  />
                  <AdminIcon
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"
                    name="search"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <AdminIcon className="h-4 w-4" name="x" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  onClick={() => setShowSearchInput(true)}
                  title="Search suppliers"
                >
                  <AdminIcon className="h-4 w-4" name="search" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <span className="text-sm font-medium text-slate-400">
                  Loading suppliers...
                </span>
              </div>
            ) : suppliers.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2">
                <span className="text-sm font-semibold text-slate-800">
                  No suppliers found
                </span>
                <span className="text-xs text-slate-400">
                  Get started by adding a new supplier.
                </span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-3">Company Name</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Address</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Products</th>
                    <th className="px-6 py-3">Created At</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {paginatedSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {supplier.name}
                      </td>
                      <td className="px-6 py-4 space-y-0.5">
                        {supplier.phone && (
                          <div className="text-slate-800">{supplier.phone}</div>
                        )}
                        {supplier.email && (
                          <div className="text-slate-400 font-normal">
                            {supplier.email}
                          </div>
                        )}
                        {!supplier.phone && !supplier.email && (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">
                        {supplier.address ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                            supplier.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-50 text-slate-500"
                          }`}
                        >
                          {supplier.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {supplier._count?.products ?? 0}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-normal">
                        {formatDate(supplier.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                            onClick={() => handleEdit(supplier)}
                            title="Edit supplier"
                          >
                            <AdminIcon className="h-3.5 w-3.5" name="edit" />
                          </button>
                          <button
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                            onClick={() => handleDeleteClick(supplier)}
                            title="Delete supplier"
                          >
                            <AdminIcon className="h-3.5 w-3.5" name="trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {filteredSuppliers.length > visibleCount && (
              <div ref={observerTarget} className="flex justify-center py-6">
                <span className="text-xs text-slate-400">
                  {isLoadingMore ? "Loading more..." : "Scroll to load more"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {form.id ? "Edit Supplier" : "Add Supplier"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Provide company details below.
                </p>
              </div>
              <button
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600"
                disabled={isSaving}
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                <AdminIcon className="h-4 w-4" name="x" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">
                  Company Name *
                </span>
                <input
                  required
                  autoFocus
                  type="text"
                  placeholder="e.g. Acme Corporation"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">
                  Business Phone No.
                </span>
                <input
                  type="text"
                  placeholder="e.g. +88017XXXXXXXX"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">
                  Email Address
                </span>
                <input
                  type="email"
                  placeholder="e.g. contact@acme.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">
                  Address
                </span>
                <input
                  type="text"
                  placeholder="e.g. 456 Industrial Way, Dhaka"
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                />
                Active Status
              </label>
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                disabled={isSaving}
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-500 px-5 text-sm font-semibold text-white hover:bg-blue-600 disabled:bg-slate-400"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? "Saving..." : form.id ? "Save Changes" : "Add Supplier"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteModalOpen && supplierToDelete && (
        <ConfirmModal
          isOpen={deleteModalOpen}
          title="Delete Supplier"
          message={`Are you sure you want to delete supplier "${supplierToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          onClose={() => {
            setDeleteModalOpen(false);
            setSupplierToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
