"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { apiRequest, formatDate, slugify, resolveImageUrl, type Brand } from "../../../../lib/admin-api";

type BrandForm = {
  id?: string;
  name: string;
  slug: string;
  logo: File | null;
  logoUrl?: string | null;
  removeLogo: boolean;
};

const emptyForm: BrandForm = { name: "", slug: "", logo: null, logoUrl: null, removeLogo: false };
const PAGE_SIZE = 10;

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!form.logo) {
      setLogoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(form.logo);
    setLogoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.logo]);

  const filteredBrands = useMemo(
    () => brands.filter((b) => `${b.name} ${b.slug}`.toLowerCase().includes(search.toLowerCase())),
    [brands, search]
  );

  // Reset visibleCount when search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  const paginatedBrands = useMemo(() => {
    return filteredBrands.slice(0, visibleCount);
  }, [filteredBrands, visibleCount]);

  function handleLoadMore() {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setIsLoadingMore(false);
    }, 300);
  }

  useEffect(() => {
    if (isLoadingMore || paginatedBrands.length >= filteredBrands.length) return;

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
  }, [isLoadingMore, paginatedBrands.length, filteredBrands.length]);

  const visibleLogoPreview = logoPreviewUrl ?? (form.removeLogo ? null : (form.logoUrl ? resolveImageUrl(form.logoUrl) : null));

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
          <div className="flex gap-3 items-center">
            {showSearchInput ? (
              <div className="relative flex h-11 w-64 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
                <input
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 text-slate-800"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search brands..."
                  value={search}
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearch("");
                    setShowSearchInput(false);
                  }}
                  className="grid h-6 w-6 place-items-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                  title="Close search"
                  type="button"
                >
                  <AdminIcon className="h-4 w-4" name="x" />
                </button>
              </div>
            ) : (
              <button
                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
                onClick={() => setShowSearchInput(true)}
                type="button"
                title="Search brands"
              >
                <AdminIcon className="h-5 w-5 text-slate-600" name="search" />
              </button>
            )}
            <button onClick={openAddModal} type="button" className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-[14px] font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 shrink-0 whitespace-nowrap">
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Brand
            </button>
          </div>
        }
      />

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-500">
            {filteredBrands.length} {filteredBrands.length === 1 ? "brand" : "brands"}
          </p>
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
                paginatedBrands.map((brand) => (
                  <tr key={brand.id} className="odd:bg-white even:bg-slate-50/70">
                    <td className="px-5 py-4 text-sm text-slate-800">{brand.name}</td>
                    <td className="px-5 py-4">
                      {brand.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={resolveImageUrl(brand.logoUrl)} alt="" className="h-12 w-12 rounded-lg border border-slate-200 object-cover" />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 bg-white">
                          <AdminIcon className="h-5 w-5 text-slate-400" name="brand" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{brand.slug}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{(brand as any)._count?.products ?? brand.products?.length ?? 0}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(brand.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(brand)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                          type="button"
                          title="Edit brand"
                        >
                          <AdminIcon className="h-4 w-4" name="edit" />
                        </button>
                        <button
                          onClick={() => setBrandToDelete(brand)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                          type="button"
                          title="Delete brand"
                        >
                          <AdminIcon className="h-4 w-4" name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Lazy Loading */}
        {!isLoading && filteredBrands.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex flex-col items-start gap-1.5">
              <p className="text-sm font-medium text-slate-500">
                Showing <span className="font-bold text-slate-800">{paginatedBrands.length}</span> of{" "}
                <span className="font-bold text-slate-800">{filteredBrands.length}</span> brands
              </p>
              <div className="h-1.5 w-48 overflow-hidden rounded bg-slate-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, (paginatedBrands.length / filteredBrands.length) * 100)}%` }}
                />
              </div>
            </div>

            {paginatedBrands.length < filteredBrands.length ? (
              <div
                ref={observerTarget}
                className="flex items-center gap-2 py-2 text-xs font-semibold text-slate-500"
              >
                <svg className="animate-spin h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading more on scroll...</span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-slate-400">All brands loaded</span>
            )}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="brand-modal-title">
          <form className="modal-panel flex w-full max-w-lg flex-col rounded-xl border border-slate-200 bg-white shadow-2xl min-h-[480px] max-h-[calc(100vh-3rem)]" onSubmit={handleSubmit}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-6 pb-5 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-slate-900" id="brand-modal-title">{form.id ? "Edit Brand" : "Add Brand"}</h3>
                <p className="mt-1 text-xs text-slate-500">Name, slug, and optional logo.</p>
              </div>
              <button type="button" disabled={isSaving} onClick={closeModal} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600">
                <AdminIcon className="h-4 w-4" name="x" />
              </button>
            </div>
            <div className="flex-1 modal-body px-6 py-5">
              <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
                <input
                  autoFocus
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.id ? f.slug : slugify(e.target.value) }))}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Slug</span>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Logo</span>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((f) => ({ ...f, logo: e.target.files?.[0] ?? null, removeLogo: false }))}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-300"
                />
              </label>
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                {visibleLogoPreview ? (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={visibleLogoPreview} alt="Logo preview" className="h-20 w-20 rounded-lg border border-slate-200 bg-white object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-800">{form.logo?.name ?? "Current logo"}</p>
                    </div>
                    <button type="button" disabled={isSaving} onClick={removeLogo} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">
                      <AdminIcon className="h-3.5 w-3.5" name="x" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 bg-white">
                      <AdminIcon className="h-5 w-5" name="brand" />
                    </span>
                    <p className="text-sm font-medium">No logo selected.</p>
                  </div>
                )}
              </div>
              {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 shrink-0">
                <button type="button" disabled={isSaving} onClick={closeModal} className="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white disabled:bg-slate-400 hover:bg-blue-700 transition-colors">
                  <AdminIcon className="h-4 w-4" name={form.id ? "check" : "plus"} />
                  {isSaving ? "Saving..." : form.id ? "Update Brand" : "Add Brand"}
                </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!brandToDelete}
        onClose={() => {
          setBrandToDelete(null);
          setError("");
        }}
        onConfirm={confirmDelete}
        title="Delete Brand"
        message={`Delete "${brandToDelete?.name}"? This cannot be undone.`}
        confirmText="Yes"
        cancelText="No"
        isDestructive
        error={error}
      />
    </>
  );
}
