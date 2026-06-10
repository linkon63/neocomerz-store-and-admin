"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import {
  apiRequest,
  formatDate,
  resolveImageUrl,
  slugify,
  type Brand,
} from "../../../../lib/admin-api";

type BrandForm = {
  id?: string;
  name: string;
  slug: string;
  logo: File | null;
  logoUrl?: string | null;
  removeLogo: boolean;
};

const emptyForm: BrandForm = {
  name: "",
  slug: "",
  logo: null,
  logoUrl: null,
  removeLogo: false,
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const filteredBrands = useMemo(() => {
    return brands.filter((brand) =>
      `${brand.name} ${brand.slug}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [brands, search]);

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

  useEffect(() => {
    loadBrands();
  }, []);

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

  function updateName(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: current.id ? current.slug : slugify(name),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  async function deleteBrand(brand: Brand) {
    setBrandToDelete(brand);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!brandToDelete) return;

    setError("");
    try {
      await apiRequest(`/brands/${brandToDelete.id}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setBrandToDelete(null);
      await loadBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete brand");
    }
  }

  function cancelDelete() {
    setDeleteModalOpen(false);
    setBrandToDelete(null);
  }

  function openAddModal() {
    setError("");
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(brand: Brand) {
    setError("");
    setForm({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: null,
      logoUrl: brand.logoUrl ?? null,
      removeLogo: false,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;

    setError("");
    setForm(emptyForm);
    setIsModalOpen(false);
  }

  function removeLogoFromForm() {
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }

    setForm((current) => ({
      ...current,
      logo: null,
      logoUrl: null,
      removeLogo: true,
    }));
  }

  const visibleLogoPreview =
    logoPreviewUrl ?? (form.removeLogo ? null : resolveImageUrl(form.logoUrl));

  return (
    <>
      <PageHeader
        title="Brand"
        description="Create, update, and remove product brands from the API."
        action={
          <div className="flex gap-3">
            <button
              className="grid h-14 w-14 place-items-center rounded-lg border border-slate-300 bg-white font-black"
              onClick={loadBrands}
              type="button"
            >
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button
              className="inline-flex h-14 items-center gap-2 rounded-lg bg-blue-600 px-6 font-black text-white shadow-lg shadow-blue-600/15"
              onClick={openAddModal}
              type="button"
            >
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Brand
            </button>
          </div>
        }
      />

      <section>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">Brand list</h2>
              <p className="font-medium text-slate-600">
                Displaying {filteredBrands.length} brands
              </p>
            </div>
            <label className="flex h-12 w-full max-w-md items-center gap-3 rounded-lg border border-slate-300 px-4">
              <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent font-medium outline-none"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search brands"
                value={search}
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Name",
                    "Logo",
                    "Slug",
                    "Products",
                    "Created",
                    "Actions",
                  ].map((heading) => (
                    <th className="px-5 py-4 font-black" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td
                      className="px-5 py-8 font-bold text-slate-500"
                      colSpan={6}
                    >
                      Loading brands...
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((brand) => (
                    <tr
                      className="odd:bg-white even:bg-slate-50/70"
                      key={brand.id}
                    >
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {brand.name}
                      </td>
                      <td className="px-5 py-4">
                        {brand.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt=""
                            className="h-12 w-12 rounded-lg border border-slate-200 object-cover bg-white"
                            src={resolveImageUrl(brand.logoUrl)}
                          />
                        ) : (
                          <div className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 bg-white text-xl">
                            <AdminIcon
                              className="h-5 w-5 text-slate-400"
                              name="brand"
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {brand.slug}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {brand.products?.length ?? 0}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {formatDate(brand.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-black"
                            onClick={() => openEditModal(brand)}
                            type="button"
                          >
                            <AdminIcon className="h-4 w-4" name="edit" />
                            Edit
                          </button>
                          <button
                            className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700"
                            onClick={() => deleteBrand(brand)}
                            type="button"
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
        </div>
      </section>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="brand-modal-title"
        >
          <form
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
            onSubmit={handleSubmit}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black" id="brand-modal-title">
                  {form.id ? "Edit brand" : "Add brand"}
                </h2>
                <p className="mt-1 font-medium text-slate-600">
                  Name, slug, and optional logo upload.
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
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Name
                </span>
                <input
                  autoFocus
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) => updateName(event.target.value)}
                  required
                  value={form.name}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Slug
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                  required
                  value={form.slug}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Logo
                </span>
                <input
                  className="block w-full rounded-lg border border-slate-300 px-4 py-3 font-medium"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      logo: event.target.files?.[0] ?? null,
                      removeLogo: false,
                    }))
                  }
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                />
              </label>
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                {visibleLogoPreview ? (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Brand logo preview"
                      className="h-20 w-20 rounded-lg border border-slate-200 bg-white object-cover"
                      src={visibleLogoPreview}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-slate-800">
                        {form.logo?.name ?? "Current logo"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Preview before saving.
                      </p>
                    </div>
                    <button
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-50 px-3 text-sm font-black text-red-700"
                      disabled={isSaving}
                      onClick={removeLogoFromForm}
                      type="button"
                    >
                      <AdminIcon className="h-4 w-4" name="x" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 bg-white">
                      <AdminIcon className="h-5 w-5" name="brand" />
                    </span>
                    <p className="font-medium">
                      No logo selected. Upload an image to preview it here.
                    </p>
                  </div>
                )}
              </div>
              {error && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-3 pt-2">
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
                  <AdminIcon
                    className="h-5 w-5"
                    name={form.id ? "check" : "plus"}
                  />
                  {isSaving
                    ? "Saving..."
                    : form.id
                      ? "Update Brand"
                      : "Add Brand"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Brand"
        message={`Are you sure you want to delete "${brandToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes"
        cancelText="No"
        isDestructive={true}
      />
    </>
  );
}
