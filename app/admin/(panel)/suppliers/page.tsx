"use client";

import { useEffect, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
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
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierForm>(emptyForm);

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
      s.phone?.toLowerCase().includes(q) ||
      s.address?.toLowerCase().includes(q)
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

  function openView(s: Supplier) {
    setViewSupplier(s);
    setIsViewOpen(true);
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
    if (!confirm("Delete this supplier?")) return;
    try {
      await apiRequest(`/suppliers/${id}`, { method: "DELETE" });
      await loadSuppliers();
    } catch {
      alert("Failed to delete supplier.");
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
        description="A list of all suppliers"
        action={
          <div className="flex gap-3">
            <button
              onClick={loadSuppliers}
              type="button"
              className="grid h-12 w-12 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
              title="Refresh suppliers"
            >
              <AdminIcon className="h-5 w-5 text-slate-600" name="refresh" />
            </button>
            <button
              onClick={openAdd}
              type="button"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-6 text-[14px] font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
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

      <section className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Supplier list</h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Displaying {filtered.length} supplier{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <label className="flex h-12 w-full max-w-md items-center gap-3 rounded-lg border-2 border-slate-200 bg-white px-4 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 shadow-sm">
            <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
            <input
              className="w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-slate-400 text-slate-700"
              placeholder="Search suppliers by name, phone etc"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-slate-50/75 border-b border-slate-200">
              <tr>
                {["Company Name", "Business Phone No.", "Address", "Status", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-sm text-slate-500">
                    Loading suppliers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm font-medium text-slate-400">
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4.5 font-semibold text-slate-800 text-sm">{s.name}</td>
                    <td className="px-6 py-4.5 text-sm font-medium text-slate-600">{s.phone || "—"}</td>
                    <td className="max-w-xs px-6 py-4.5 text-sm font-medium text-slate-600 truncate">
                      {s.address || "—"}
                    </td>
                    <td className="px-6 py-4.5">
                      <ToggleSwitch checked={s.isActive} onChange={() => handleToggle(s)} />
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openView(s)}
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                          title="View Details"
                        >
                          <AdminIcon className="h-4.5 w-4.5" name="eye" />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                          title="Edit Supplier"
                        >
                          <AdminIcon className="h-4 w-4" name="edit" />
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
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150"
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
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <AdminIcon className="h-4 w-4" name="x" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. New Era Cap Company"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Business Phone No.
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="01700000000"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="supplier@company.com"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Full business address"
                  rows={2}
                  className="min-h-[72px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-800"
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
                className="h-10 rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {isSaving ? "Saving..." : editingId ? "Update Supplier" : "Add Supplier"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Supplier Modal */}
      {isViewOpen && viewSupplier && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Supplier Details</h2>
                <p className="mt-0.5 text-sm font-medium text-slate-500">
                  Full profile details of the vendor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <AdminIcon className="h-4 w-4" name="x" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Company Name</span>
                <p className="mt-1 font-semibold text-slate-800 text-base">{viewSupplier.name}</p>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Business Phone No.</span>
                <p className="mt-1 font-medium text-slate-800">{viewSupplier.phone || "—"}</p>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</span>
                <p className="mt-1 font-medium text-slate-800">{viewSupplier.email || "—"}</p>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Address</span>
                <p className="mt-1 font-medium text-slate-800 whitespace-pre-wrap">{viewSupplier.address || "—"}</p>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Status</span>
                  <p className="mt-0.5 text-xs text-slate-400">Current availability status</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    viewSupplier.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-slate-50 text-slate-700 border border-slate-150"
                  }`}
                >
                  {viewSupplier.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Created At</span>
                <p className="mt-1 font-medium text-slate-800">
                  {viewSupplier.createdAt ? formatDate(viewSupplier.createdAt) : "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this supplier?")) {
                    handleDelete(viewSupplier.id);
                    setIsViewOpen(false);
                  }
                }}
                className="h-10 rounded-lg bg-red-50 px-4 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors mr-auto"
              >
                Delete Supplier
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsViewOpen(false);
                  openEdit(viewSupplier);
                }}
                className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
