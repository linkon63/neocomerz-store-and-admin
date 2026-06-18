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

const PAGE_SIZE = 8;

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
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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
    const result = rows.filter((category) =>
      `${category.name} ${category.slug} ${category.parentName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
    return result;
  }, [rows, search]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

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
    setError("");
  }

  return (
    <>
      <PageHeader
        title="Category"
        description="Create, update, and remove product categories from the API."
        action={
          <div className="flex gap-3 items-center">
            {showSearchInput ? (
              <div className="relative flex h-11 w-64 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
                <input
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 text-slate-800"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search categories..."
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
                title="Search categories"
              >
                <AdminIcon className="h-5 w-5 text-slate-600" name="search" />
              </button>
            )}
            <button
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-[14px] font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 shrink-0 whitespace-nowrap"
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
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <p className="text-sm font-medium text-slate-500">
              {filteredRows.length} {filteredRows.length === 1 ? "category" : "categories"}
            </p>
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
                    <th className="px-5 py-4 text-sm font-semibold text-slate-700" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td
                      className="px-5 py-8 text-slate-500"
                      colSpan={7}
                    >
                      Loading categories...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-8 text-slate-500"
                      colSpan={7}
                    >
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((category) => (
                    <tr
                      className="odd:bg-white even:bg-slate-50/70"
                      key={category.id}
                    >
                      <td className="px-5 py-4 text-sm text-slate-800">
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
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {category.slug}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {category.parentName}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {category.products?.length ?? 0}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(category.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(category)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                            type="button"
                            title="Edit category"
                          >
                            <AdminIcon className="h-4 w-4" name="edit" />
                          </button>
                          <button
                            onClick={() => deleteCategory(category)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                            type="button"
                            title="Delete category"
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

          {/* Pagination */}
          {!isLoading && filteredRows.length > PAGE_SIZE && (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredRows.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-800">
                  {filteredRows.length}
                </span>{" "}
                categories
              </p>
              <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  type="button"
                  aria-label="Previous page"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, current, and neighbours
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                    if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="grid h-9 w-9 place-items-center text-sm font-medium text-slate-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-medium transition-colors ${currentPage === item
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        onClick={() => setCurrentPage(item as number)}
                        type="button"
                        aria-label={`Page ${item}`}
                        aria-current={currentPage === item ? "page" : undefined}
                      >
                        {item}
                      </button>
                    ),
                  )}

                {/* Next */}
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  type="button"
                  aria-label="Next page"
                >
                  <AdminIcon className="h-4 w-4" name="chevronRight" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
        >
          <form
            className="modal-panel flex w-full max-w-lg flex-col rounded-xl border border-slate-200 bg-white shadow-2xl min-h-[480px] max-h-[calc(100vh-3rem)]"
            onSubmit={handleSubmit}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-6 pb-5 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-slate-900" id="category-modal-title">
                  {form.id ? "Edit Category" : "Add Category"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Build root and nested category records.
                </p>
              </div>
              <button
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600"
                disabled={isSaving}
                onClick={closeModal}
                type="button"
              >
                <AdminIcon className="h-4 w-4" name="x" />
              </button>
            </div>
            <div className="flex-1 modal-body px-6 py-5">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Name
                </span>
                <input
                  autoFocus
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                  onChange={(event) => updateName(event.target.value)}
                  required
                  value={form.name}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Slug
                </span>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
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
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Image
                </span>
                <input
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-300"
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
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Parent category
                </span>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
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
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                {visibleImagePreview ? (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Category image preview"
                      className="h-20 w-20 rounded-lg border border-slate-200 bg-white object-cover"
                      src={visibleImagePreview}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-800">
                        {form.image?.name ?? "Current image"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Preview before saving.
                      </p>
                    </div>
                    <button
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                      disabled={isSaving}
                      onClick={removeImageFromForm}
                      type="button"
                    >
                      <AdminIcon className="h-3.5 w-3.5" name="x" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 bg-white">
                      <AdminIcon className="h-5 w-5" name="category" />
                    </span>
                    <p className="text-sm font-medium">
                      No image selected. Upload an image to preview it here.
                    </p>
                  </div>
                )}
              </div>
              {error && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </p>
              )}
            </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 shrink-0">
                <button
                  className="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  disabled={isSaving}
                  onClick={closeModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white disabled:bg-slate-400 hover:bg-blue-700 transition-colors"
                  disabled={isSaving}
                  type="submit"
                >
                  <AdminIcon
                    className="h-4 w-4"
                    name={form.id ? "check" : "plus"}
                  />
                  {isSaving
                    ? "Saving..."
                    : form.id
                      ? "Update Category"
                      : "Add Category"}
                </button>
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
        error={error}
      />
    </>
  );
}
