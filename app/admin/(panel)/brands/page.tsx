"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { apiRequest, formatDate, slugify, type Brand } from "../../../../lib/admin-api";

type BrandForm = {
  id?: string;
  name: string;
  slug: string;
  logo: File | null;
  logoUrl?: string | null;
  removeLogo: boolean;
};

const emptyForm: BrandForm = { name: "", slug: "", logo: null, logoUrl: null, removeLogo: false };

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const filteredBrands = useMemo(
    () => brands.filter((b) => `${b.name} ${b.slug}`.toLowerCase().includes(search.toLowerCase())),
    [brands, search]
  );

  const logoPreview = form.removeLogo ? null : (form.logo ? URL.createObjectURL(form.logo) : form.logoUrl ?? null);

  async function loadBrands() {
    setError("");
    setIsLoading(true);
    try {
      setBrands(await apiRequest<Brand[]>("/brands"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load brands");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadBrands(); }, []);

  function openAddModal() {
    setError("");
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(brand: Brand) {
    setError("");
    setForm({ id: brand.id, name: brand.name, slug: brand.slug, logo: null, logoUrl: brand.logoUrl ?? null, removeLogo: false });
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setError("");
    setForm(emptyForm);
    setIsModalOpen(false);
  }

  function removeLogo() {
    if (logoInputRef.current) logoInputRef.current.value = "";
    setForm((f) => ({ ...f, logo: null, logoUrl: null, removeLogo: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const body = new FormData();
      body.append("name", form.name);
      body.append("slug", form.slug || slugify(form.name));
      if (form.logo) body.append("logo", form.logo);
      if (form.id && form.removeLogo && !form.logo) body.append("logoUrl", "");
      await apiRequest<Brand>(form.id ? `/brands/${form.id}` : "/brands", {
        method: form.id ? "PATCH" : "POST",
        body,
      });
      setForm(emptyForm);
      setIsModalOpen(false);
      await loadBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save brand");
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!brandToDelete) return;
    setError("");
    try {
      await apiRequest(`/brands/${brandToDelete.id}`, { method: "DELETE" });
      setBrandToDelete(null);
      await loadBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete brand");
    }
  }

  return (
    <>
      <PageHeader
        title="Brands"
        description="Create, update, and remove product brands."
        action={
          <div className="flex gap-3">
            <button onClick={loadBrands} type="button" className="grid h-14 w-14 place-items-center rounded-lg border border-slate-300 bg-white">
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button onClick={openAddModal} type="button" className="inline-flex h-14 items-center gap-2 rounded-lg bg-blue-600 px-6 font-medium text-white shadow-lg shadow-blue-600/15">
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Brand
            </button>
          </div>
        }
      />

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Brand list</h2>
            <p className="font-medium text-slate-600">{filteredBrands.length} brands</p>
          </div>
          <label className="flex h-12 w-full max-w-md items-center gap-3 rounded-lg border border-slate-300 px-4">
            <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
            <input
              className="w-full bg-transparent font-medium outline-none"
              placeholder="Search brands"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {["Name", "Logo", "Slug", "Products", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-sm font-semibold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-slate-500">Loading brands...</td></tr>
              ) : filteredBrands.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center font-medium text-slate-400">No brands found.</td></tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="odd:bg-white even:bg-slate-50/70">
                    <td className="px-5 py-4 font-semibold text-slate-800">{brand.name}</td>
                    <td className="px-5 py-4">
                      {brand.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={brand.logoUrl} alt="" className="h-12 w-12 rounded-lg border border-slate-200 object-cover" />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 bg-white">
                          <AdminIcon className="h-5 w-5 text-slate-400" name="brand" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{brand.slug}</td>
                    <td className="px-5 py-4 font-medium text-slate-700">{brand.products?.length ?? 0}</td>
                    <td className="px-5 py-4 font-medium text-slate-700">{formatDate(brand.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(brand)} type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium">
                          <AdminIcon className="h-4 w-4" name="edit" /> Edit
                        </button>
                        <button onClick={() => setBrandToDelete(brand)} type="button" className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                          <AdminIcon className="h-4 w-4" name="x" /> Delete
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="brand-modal-title">
          <form className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl" onSubmit={handleSubmit}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold" id="brand-modal-title">{form.id ? "Edit brand" : "Add brand"}</h2>
                <p className="mt-1 font-medium text-slate-600">Name, slug, and optional logo.</p>
              </div>
              <button type="button" disabled={isSaving} onClick={closeModal} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-slate-600">
                <AdminIcon className="h-5 w-5" name="x" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
                <input
                  autoFocus
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.id ? f.slug : slugify(e.target.value) }))}
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Slug</span>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Logo</span>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((f) => ({ ...f, logo: e.target.files?.[0] ?? null, removeLogo: false }))}
                  className="block w-full rounded-lg border border-slate-300 px-4 py-3 font-medium"
                />
              </label>
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                {logoPreview ? (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoPreview} alt="Logo preview" className="h-20 w-20 rounded-lg border border-slate-200 bg-white object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-800">{form.logo?.name ?? "Current logo"}</p>
                    </div>
                    <button type="button" disabled={isSaving} onClick={removeLogo} className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-50 px-3 text-sm font-medium text-red-700">
                      <AdminIcon className="h-4 w-4" name="x" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 bg-white">
                      <AdminIcon className="h-5 w-5" name="brand" />
                    </span>
                    <p className="font-medium">No logo selected.</p>
                  </div>
                )}
              </div>
              {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" disabled={isSaving} onClick={closeModal} className="h-12 rounded-lg border border-slate-300 bg-white px-5 font-medium text-slate-700">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-5 font-medium text-white disabled:bg-slate-400">
                  <AdminIcon className="h-5 w-5" name={form.id ? "check" : "plus"} />
                  {isSaving ? "Saving..." : form.id ? "Update Brand" : "Add Brand"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!brandToDelete}
        onClose={() => setBrandToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Brand"
        message={`Delete "${brandToDelete?.name}"? This cannot be undone.`}
        confirmText="Yes"
        cancelText="No"
        isDestructive
      />
    </>
  );
}
