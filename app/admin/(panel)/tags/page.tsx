"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [form, setForm] = useState<TagForm>(emptyForm);
  const [search, setSearch] = useState("");
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
  }

  return (
    <>
      <PageHeader
        title="Tags"
        description="Create, update, and remove searchable product tags."
        action={
          <div className="flex gap-3">
            <button
              className="grid h-14 w-14 place-items-center rounded-lg border border-slate-300 bg-white"
              onClick={loadTags}
              type="button"
            >
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button
              className="inline-flex h-14 items-center gap-2 rounded-lg bg-blue-600 px-6 font-medium text-white shadow-lg shadow-blue-600/15"
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
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Tags list</h2>
              <p className="font-medium text-slate-600">
                Displaying {filteredTags.length} tags
              </p>
            </div>
            <label className="flex h-12 w-full max-w-md items-center gap-3 rounded-lg border border-slate-300 px-4">
              <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent font-medium outline-none"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tags"
                value={search}
              />
            </label>
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
                  filteredTags.map((tag) => (
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
                        {tag.isActive ? (
                          <StatusToggle />
                        ) : (
                          <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-normal text-amber-700">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(tag)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                            type="button"
                          >
                            <AdminIcon className="h-4 w-4" name="edit" />
                          </button>
                          <button
                            onClick={() => deleteTag(tag)}
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
        </div>
      </section>

      {isModalOpen && (
        <div
          aria-labelledby="tag-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
          role="dialog"
        >
          <form
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
            onSubmit={handleSubmit}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
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
              <div className="flex justify-end gap-3 pt-2">
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
      />
    </>
  );
}
