"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import {
  apiRequest,
  formatDate,
  slugify,
  type Category,
} from "../../../../lib/admin-api";

type CategoryForm = {
  id?: string;
  name: string;
  slug: string;
  parentId: string;
  image: File | null;
  imageUrl?: string | null;
  removeImage: boolean;
};

type CategoryRow = Category & {
  depth: number;
  parentName: string;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  parentId: "",
  image: null,
  imageUrl: null,
  removeImage: false,
};

function flattenCategories(
  categories: Category[],
  depth = 0,
  parentName = "Root",
): CategoryRow[] {
  return categories.flatMap((category) => [
    { ...category, depth, parentName },
    ...flattenCategories(category.children ?? [], depth + 1, category.name),
  ]);
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryRow | null>(
    null,
  );
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => flattenCategories(categories), [categories]);
  const filteredRows = useMemo(() => {
    return rows.filter((category) =>
      `${category.name} ${category.slug} ${category.parentName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [rows, search]);

  useEffect(() => {
    if (!form.image) {
      const timeoutId = window.setTimeout(() => {
        setImagePreviewUrl(null);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    const objectUrl = URL.createObjectURL(form.image);
    const timeoutId = window.setTimeout(() => {
      setImagePreviewUrl(objectUrl);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.image]);

  async function loadCategories() {
    setError("");
    setIsLoading(true);
    try {
      setCategories(await apiRequest<Category[]>("/category"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCategories();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function updateName(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: current.id ? current.slug : slugify(name),
    }));
  }

  function openAddModal() {
    setError("");
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(category: CategoryRow) {
    setError("");
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId ?? "",
      image: null,
      imageUrl: category.imageUrl ?? null,
      removeImage: false,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;

    setError("");
    setForm(emptyForm);
    setIsModalOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    // Validate form fields
    if (!form.name || form.name.trim() === "") {
      setError("Name should not be empty");
      setIsSaving(false);
      return;
    }

    const slugValue = form.slug || slugify(form.name);
    if (!slugValue || slugValue.trim() === "") {
      setError("Slug should not be empty");
      setIsSaving(false);
      return;
    }

    const body = new FormData();
    body.append("name", form.name.trim());
    body.append("slug", slugValue);
    if (form.image) body.append("image", form.image);
    if (form.id && form.removeImage && !form.image) body.append("imageUrl", "");
    if (form.parentId) {
      body.append("parentId", form.parentId);
    } else if (form.id) {
      body.append("parentId", "");
    }

    try {
      await apiRequest<Category>(
        form.id ? `/category/${form.id}` : "/category",
        {
          method: form.id ? "PATCH" : "POST",
          body,
        },
      );

      setForm(emptyForm);
      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCategory(category: CategoryRow) {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!categoryToDelete) return;

    setError("");
    try {
      await apiRequest(`/category/${categoryToDelete.id}`, {
        method: "DELETE",
      });
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category",
      );
    }
  }

  function removeImageFromForm() {
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    setForm((current) => ({
      ...current,
      image: null,
      imageUrl: null,
      removeImage: true,
    }));
  }

  const visibleImagePreview =
    imagePreviewUrl ?? (form.removeImage ? null : form.imageUrl);

  function cancelDelete() {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  }

  return (
    <>
      <PageHeader
        title="Category"
        description="Create, update, and remove product categories from the API."
        action={
          <div className="flex gap-3">
            <button
              className="grid h-14 w-14 place-items-center rounded-lg border border-slate-300 bg-white font-black"
              onClick={loadCategories}
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
              Add Category
            </button>
          </div>
        }
      />

      <section>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">Categories list</h2>
              <p className="font-medium text-slate-600">
                Displaying {filteredRows.length} categories
              </p>
            </div>
            <label className="flex h-12 w-full max-w-md items-center gap-3 rounded-lg border border-slate-300 px-4">
              <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent font-medium outline-none"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories"
                value={search}
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Name",
                    "Image",
                    "Slug",
                    "Parent",
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
                      colSpan={7}
                    >
                      Loading categories...
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((category) => (
                    <tr
                      className="odd:bg-white even:bg-slate-50/70"
                      key={category.id}
                    >
                      <td className="px-5 py-4 font-bold text-slate-800">
                        <span
                          style={{ paddingLeft: `${category.depth * 18}px` }}
                        >
                          {category.depth > 0 ? "↳ " : ""}
                          {category.name}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {category.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt=""
                            className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                            src={category.imageUrl}
                          />
                        ) : (
                          <div className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 bg-white text-xl">
                            <AdminIcon
                              className="h-5 w-5 text-slate-400"
                              name="category"
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {category.slug}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {category.parentName}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {category.products?.length ?? 0}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {formatDate(category.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-black"
                            onClick={() => openEditModal(category)}
                            type="button"
                          >
                            <AdminIcon className="h-4 w-4" name="edit" />
                            Edit
                          </button>
                          <button
                            className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700"
                            onClick={() => deleteCategory(category)}
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
          aria-labelledby="category-modal-title"
        >
          <form
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
            onSubmit={handleSubmit}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black" id="category-modal-title">
                  {form.id ? "Edit category" : "Add category"}
                </h2>
                <p className="mt-1 font-medium text-slate-600">
                  Build root and nested category records.
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
                  Image
                </span>
                <input
                  className="block w-full rounded-lg border border-slate-300 px-4 py-3 font-medium"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      image: event.target.files?.[0] ?? null,
                      removeImage: false,
                    }))
                  }
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Parent category
                </span>
                <select
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      parentId: event.target.value,
                    }))
                  }
                  value={form.parentId}
                >
                  <option value="">Root category</option>
                  {rows
                    .filter((category) => category.id !== form.id)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {"--".repeat(category.depth)} {category.name}
                      </option>
                    ))}
                </select>
              </label>
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                {visibleImagePreview ? (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Category image preview"
                      className="h-20 w-20 rounded-lg border border-slate-200 bg-white object-cover"
                      src={visibleImagePreview}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-slate-800">
                        {form.image?.name ?? "Current image"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Preview before saving.
                      </p>
                    </div>
                    <button
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-50 px-3 text-sm font-black text-red-700"
                      disabled={isSaving}
                      onClick={removeImageFromForm}
                      type="button"
                    >
                      <AdminIcon className="h-4 w-4" name="x" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 bg-white">
                      <AdminIcon className="h-5 w-5" name="category" />
                    </span>
                    <p className="font-medium">
                      No image selected. Upload an image to preview it here.
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
                      ? "Update Category"
                      : "Add Category"}
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
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  );
}
