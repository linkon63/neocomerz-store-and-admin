"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AdminIcon,
  PageHeader,
  StatusToggle,
} from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import {
  apiRequest,
  formatDate,
  slugify,
  type Tag,
} from "../../../../lib/admin-api";

type TagForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
};

const emptyForm: TagForm = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
};

const PAGE_SIZE = 10;

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [form, setForm] = useState<TagForm>(emptyForm);
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
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const filteredTags = useMemo(() => {
    return tags.filter((tag) =>
      `${tag.name} ${tag.slug} ${tag.description ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [tags, search]);

  // Reset visibleCount when search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  const paginatedTags = useMemo(() => {
    return filteredTags.slice(0, visibleCount);
  }, [filteredTags, visibleCount]);

  function handleLoadMore() {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setIsLoadingMore(false);
    }, 300);
  }

  useEffect(() => {
    if (isLoadingMore || paginatedTags.length >= filteredTags.length) return;

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
  }, [isLoadingMore, paginatedTags.length, filteredTags.length]);

  async function loadTags() {
    setError("");
    setIsLoading(true);
    try {
      setTags(await apiRequest<Tag[]>("/tags"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tags");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTags();
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

  function openEditModal(tag: Tag) {
    setError("");
    setForm({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description ?? "",
      isActive: tag.isActive,
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

    try {
      await apiRequest<Tag>(form.id ? `/tags/${form.id}` : "/tags", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || slugify(form.name),
          description: form.description || undefined,
          isActive: form.isActive,
        }),
      });

      setForm(emptyForm);
      setIsModalOpen(false);
      await loadTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tag");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleTagStatus(tag: Tag) {
    try {
      await apiRequest<Tag>(`/tags/${tag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !tag.isActive }),
      });
      setTags((prev) => prev.map((t) => t.id === tag.id ? { ...t, isActive: !t.isActive } : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tag status");
    }
  }

  async function deleteTag(tag: Tag) {
    setTagToDelete(tag);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!tagToDelete) return;

    setError("");
    try {
      await apiRequest(`/tags/${tagToDelete.id}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setTagToDelete(null);
      await loadTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tag");
    }
  }

  function cancelDelete() {
    setDeleteModalOpen(false);
    setTagToDelete(null);
    setError("");
  }

  return (
    <>
      <PageHeader
        title="Tags"
        description="Create, update, and remove searchable product tags."
        action={
          <div className="flex gap-3 items-center">
            {showSearchInput ? (
              <div className="relative flex h-11 w-64 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
                <input
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 text-slate-800"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tags..."
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
                title="Search tags"
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
              Add Tag
            </button>
          </div>
        }
      />

      <section>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <p className="text-sm font-medium text-slate-500">
              {filteredTags.length} {filteredTags.length === 1 ? "tag" : "tags"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Name",
                    "Slug",
                    "Description",
                    "Products",
                    "Created",
                    "Status",
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
                      Loading tags...
                    </td>
                  </tr>
                ) : (
                  paginatedTags.map((tag) => (
                    <tr
                      className="odd:bg-white even:bg-slate-50/70"
                      key={tag.id}
                    >
                      <td className="px-5 py-4 text-sm text-slate-800">
                        {tag.name}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {tag.slug}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {tag.description || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {tag._count?.products ?? 0}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(tag.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusToggle
                          checked={tag.isActive}
                          onChange={() => toggleTagStatus(tag)}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(tag)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                            type="button"
                            title="Edit tag"
                          >
                            <AdminIcon className="h-4 w-4" name="edit" />
                          </button>
                          <button
                            onClick={() => deleteTag(tag)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                            type="button"
                            title="Delete tag"
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
          {!isLoading && filteredTags.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex flex-col items-start gap-1.5">
                <p className="text-sm font-medium text-slate-500">
                  Showing <span className="font-bold text-slate-800">{paginatedTags.length}</span> of{" "}
                  <span className="font-bold text-slate-800">{filteredTags.length}</span> tags
                </p>
                <div className="h-1.5 w-48 overflow-hidden rounded bg-slate-200">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(100, (paginatedTags.length / filteredTags.length) * 100)}%` }}
                  />
                </div>
              </div>

              {paginatedTags.length < filteredTags.length ? (
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
                <span className="text-xs font-semibold text-slate-400">All tags loaded</span>
              )}
            </div>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div
          aria-labelledby="tag-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 modal-backdrop"
          role="dialog"
        >
          <form
            className="modal-panel flex w-full max-w-lg flex-col rounded-xl border border-slate-200 bg-white shadow-2xl min-h-[480px] max-h-[calc(100vh-3rem)]"
            onSubmit={handleSubmit}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-6 pb-5 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-slate-900" id="tag-modal-title">
                  {form.id ? "Edit Tag" : "Add Tag"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Manage product tag name, slug, and visibility.
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
                  Description
                </span>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  value={form.description}
                />
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                <input
                  checked={form.isActive}
                  className="h-4 w-4 accent-blue-600"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                Active tag
              </label>
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
                  {isSaving ? "Saving..." : form.id ? "Update Tag" : "Add Tag"}
                </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Tag"
        message={`Are you sure you want to delete "${tagToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes"
        cancelText="No"
        isDestructive={true}
        error={error}
      />
    </>
  );
}
