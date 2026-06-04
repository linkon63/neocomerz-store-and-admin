"use client";

import { useEffect, useState } from "react";
import { AdminIcon } from "../admin-shell";
import { Button, Input } from "../enterprise-ui";
import { apiRequest } from "../../../../lib/admin-api";

type Branch = { id: string; name: string; address?: string | null; createdAt?: string };

export function BranchesSection() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", address: "" });

  async function load() {
    setLoading(true);
    try {
      const data = await apiRequest<Branch[]>("/branches");
      setBranches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm({ name: "", address: "" });
    setIsOpen(true);
  }

  function openEdit(branch: Branch) {
    setEditingId(branch.id);
    setForm({ name: branch.name, address: branch.address || "" });
    setIsOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this branch?")) return;
    try {
      await apiRequest(`/branches/${id}`, { method: "DELETE" });
      await load();
    } catch {
      alert("Failed to delete branch.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
      };
      await apiRequest(editingId ? `/branches/${editingId}` : "/branches", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setIsOpen(false);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save branch.");
    } finally {
      setIsSaving(false);
    }
  }

  const filtered = branches.filter((b) => {
    const q = search.toLowerCase();
    return (
      !q ||
      b.name.toLowerCase().includes(q) ||
      (b.address && b.address.toLowerCase().includes(q))
    );
  });

  return (
    <>
      {/* Streamlined search and action toolbar */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <label className="flex h-10 items-center gap-3 rounded-lg border border-slate-300 bg-white px-3.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
            <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
            <input
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search branches by name or address..."
              value={search}
            />
          </label>
        </div>
        <div className="flex gap-2.5">
          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            onClick={load}
            type="button"
            title="Refresh List"
          >
            <AdminIcon className="h-4 w-4 text-slate-600" name="refresh" />
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
            onClick={openAdd}
            type="button"
          >
            <AdminIcon className="h-4 w-4" name="plus" />
            Add Branch
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Count Indicator */}
        <div className="border-b border-slate-200 bg-slate-50/20 px-5 py-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Store Branches ({filtered.length})
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Branch Name", "Address", "Actions"].map((h) => (
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-sm font-medium text-slate-400">
                      No branches found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((branch) => (
                    <tr className="bg-white hover:bg-slate-50/50 transition-colors" key={branch.id}>
                      <td className="px-5 py-4 text-sm font-bold text-slate-800 whitespace-nowrap">{branch.name}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">{branch.address || "—"}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openEdit(branch)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                            type="button"
                          >
                            <AdminIcon className="h-4 w-4" name="edit" />
                          </button>
                          <button
                            onClick={() => handleDelete(branch.id)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                            type="button"
                          >
                            <AdminIcon className="h-4 w-4" name="x" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-800">{editingId ? "Edit Branch" : "Add Branch"}</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <Input
                  label="Branch Name"
                  type="text"
                  required
                  placeholder="e.g. Dhaka Dhanmondi Office"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  label="Physical Address"
                  type="text"
                  placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-10 px-4 rounded-lg border border-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" size="md" variant="primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Branch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
