"use client";

import { useEffect, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { apiRequest, formatDate } from "../../../../lib/admin-api";

type Supplier = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt?: string;
};

type SupplierForm = {
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

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? "bg-blue-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierForm>(emptyForm);

  // Delete confirm
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadSuppliers() {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<Supplier[]>("/suppliers");
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => void loadSuppliers(), 0);
    return () => window.clearTimeout(id);
  }, []);

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q)
    );
  });

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setIsOpen(true);
  }

  function openEdit(s: Supplier) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      phone: s.phone ?? "",
      email: s.email ?? "",
      address: s.address ?? "",
      isActive: s.isActive,
    });
    setIsOpen(true);
  }

  async function handleToggle(s: Supplier) {
    try {
      await apiRequest(`/suppliers/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      await loadSuppliers();
    } catch {
      alert("Failed to update status.");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/suppliers/${deletingId}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setDeletingId(null);
      await loadSuppliers();
    } catch {
      setError("Failed to delete supplier.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        isActive: form.isActive,
      };
      if (editingId) {
        await apiRequest(`/suppliers/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setIsOpen(false);
      await loadSuppliers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save supplier.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Manage vendors and procurement sources for your products."
        action={
          <div className="flex gap-3">
            <button
              onClick={loadSuppliers}
              type="button"
              className="grid h-14 w-14 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
            >
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button
              onClick={openAdd}
              type="button"
              className="inline-flex h-14 items-center gap-2 rounded-lg bg-blue-600 px-6 font-medium text-white shadow-lg shadow-blue-600/15 hover:bg-blue-700"
            >
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Supplier
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Suppliers list</h2>
            <p className="text-sm font-medium text-slate-500">
              Displaying {filtered.length} supplier{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <label className="flex h-12 w-full max-w-md items-center gap-3 rounded-lg border border-slate-300 px-4">
            <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
            <input
              className="w-full bg-transparent font-medium outline-none"
              placeholder="Search suppliers by name, email, phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {["Company Name", "Phone", "Email", "Address", "Created", "Status", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-sm text-slate-500">
                    Loading suppliers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm font-medium text-slate-400">
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="odd:bg-white even:bg-slate-50/70 hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-semibold text-slate-800">{s.name}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">{s.phone || "—"}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">{s.email || "—"}</td>
                    <td className="max-w-xs px-5 py-4 text-sm font-medium text-slate-600 truncate">
                      {s.address || "—"}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-500">
                      {s.createdAt ? formatDate(s.createdAt) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <ToggleSwitch checked={s.isActive} onChange={() => handleToggle(s)} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                          <AdminIcon className="h-4 w-4" name="edit" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                        >
                          <AdminIcon className="h-4 w-4" name="x" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add / Edit Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingId ? "Edit Supplier" : "Add Supplier"}
                </h2>
                <p className="mt-0.5 text-sm font-medium text-slate-500">
                  Provide company details below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
              >
                <AdminIcon className="h-4 w-4" name="x" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. New Era Cap Company"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Business Phone No.
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="01700000000"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="supplier@company.com"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Full business address"
                  rows={2}
                  className="min-h-[72px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">Active Status</p>
                  <p className="text-xs text-slate-400">Enable to make this supplier available</p>
                </div>
                <ToggleSwitch
                  checked={form.isActive}
                  onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
                className="h-10 rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSaving ? "Saving..." : editingId ? "Update Supplier" : "Add Supplier"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingId(null);
          setError("");
        }}
        onConfirm={confirmDelete}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
        confirmText={isDeleting ? "Deleting…" : "Delete Supplier"}
        isDestructive
        error={error}
      />
    </>
  );
}
