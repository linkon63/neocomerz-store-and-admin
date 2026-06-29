"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import {
  createNews,
  deleteNews,
  formatDate,
  getAllNews,
  resolveImageUrl,
  slugify,
  updateNews,
  type News,
} from "../../../../lib/admin-api";

type NewsForm = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  isPublished: boolean;
  image: File | null;
  coverImageUrl?: string | null;
  removeImage: boolean;
};

const emptyForm: NewsForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "",
  isPublished: false,
  image: null,
  coverImageUrl: null,
  removeImage: false,
};

export default function NewsAdminPage() {
  const [items, setItems] = useState<News[]>([]);
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<News | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return items.filter((n) =>
      `${n.title} ${n.slug} ${n.author ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [items, search]);

  useEffect(() => {
    if (!form.image) {
      setImagePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(form.image);
    setImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.image]);

  async function loadNews() {
    setError("");
    setIsLoading(true);
    try {
      setItems(await getAllNews());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load news");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  function updateTitle(title: string) {
    setForm((current) => ({
      ...current,
      title,
      slug: current.id ? current.slug : slugify(title),
    }));
  }

  function openAddModal() {
    setError("");
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(news: News) {
    setError("");
    setForm({
      id: news.id,
      title: news.title,
      slug: news.slug,
      excerpt: news.excerpt ?? "",
      content: news.content,
      author: news.author ?? "",
      isPublished: news.isPublished,
      image: null,
      coverImageUrl: news.coverImageUrl ?? null,
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

    const title = form.title.trim();
    if (!title) {
      setError("Title should not be empty");
      return;
    }
    const slugValue = form.slug.trim() || slugify(title);
    if (!slugValue) {
      setError("Slug should not be empty");
      return;
    }
    if (!form.content.trim()) {
      setError("Content should not be empty");
      return;
    }

    setIsSaving(true);

    const body = new FormData();
    body.append("title", title);
    body.append("slug", slugValue);
    body.append("excerpt", form.excerpt.trim());
    body.append("content", form.content);
    body.append("author", form.author.trim());
    body.append("isPublished", String(form.isPublished));
    if (form.image) body.append("image", form.image);
    if (form.id && form.removeImage && !form.image) body.append("coverImageUrl", "");

    try {
      if (form.id) {
        await updateNews(form.id, body);
      } else {
        await createNews(body);
      }
      setForm(emptyForm);
      setIsModalOpen(false);
      await loadNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save article");
    } finally {
      setIsSaving(false);
    }
  }

  function askDelete(news: News) {
    setToDelete(news);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setIsSaving(true);
    try {
      await deleteNews(toDelete.id);
      setDeleteModalOpen(false);
      setToDelete(null);
      await loadNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete article");
    } finally {
      setIsSaving(false);
    }
  }

  function removeImageFromForm() {
    if (imageInputRef.current) imageInputRef.current.value = "";
    setForm((current) => ({
      ...current,
      image: null,
      coverImageUrl: null,
      removeImage: true,
    }));
  }

  const visibleImagePreview =
    imagePreviewUrl ?? (form.removeImage ? null : resolveImageUrl(form.coverImageUrl));

  return (
    <>
      <PageHeader
        title="News & Blog"
        description="Publish news and blog posts that appear on the storefront."
        action={
          <div className="flex gap-3">
            <button
              className="grid h-14 w-14 place-items-center rounded-lg border border-slate-300 bg-white font-black"
              onClick={loadNews}
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
              Add Article
            </button>
          </div>
        }
      />

      {error && !isModalOpen && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
          {error}
        </div>
      )}

      <section>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">Articles</h2>
              <p className="font-medium text-slate-600">
                Displaying {filtered.length} articles
              </p>
            </div>
            <label className="flex h-12 w-full max-w-md items-center gap-3 rounded-lg border border-slate-300 px-4">
              <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent font-medium outline-none"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search articles"
                value={search}
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                <tr>
                  {["Cover", "Title", "Slug", "Status", "Published", "Actions"].map(
                    (heading) => (
                      <th className="px-5 py-4" key={heading}>
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td className="px-5 py-8 font-bold text-slate-500" colSpan={6}>
                      Loading articles...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 font-bold text-slate-500" colSpan={6}>
                      No articles yet. Click “Add Article” to create one.
                    </td>
                  </tr>
                ) : (
                  filtered.map((news) => (
                    <tr
                      className="odd:bg-white even:bg-slate-50/70 hover:bg-slate-100/60 transition-colors"
                      key={news.id}
                    >
                      <td className="px-5 py-4">
                        {news.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt=""
                            className="h-12 w-16 rounded-lg border border-slate-200 object-cover bg-white"
                            src={resolveImageUrl(news.coverImageUrl)}
                          />
                        ) : (
                          <div className="grid h-12 w-16 place-items-center rounded-lg border border-slate-200 bg-white">
                            <AdminIcon className="h-5 w-5 text-slate-400" name="report" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800 max-w-xs truncate">
                        {news.title}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {news.slug}
                      </td>
                      <td className="px-5 py-4">
                        {news.isPublished ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {news.publishedAt ? formatDate(news.publishedAt) : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-black hover:bg-slate-50 cursor-pointer"
                            onClick={() => openEditModal(news)}
                            type="button"
                          >
                            <AdminIcon className="h-4 w-4" name="edit" />
                            Edit
                          </button>
                          <button
                            className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700 hover:bg-red-100 cursor-pointer"
                            onClick={() => askDelete(news)}
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
          aria-labelledby="news-modal-title"
        >
          <form
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white px-6 pt-6 shadow-2xl"
            onSubmit={handleSubmit}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black" id="news-modal-title">
                  {form.id ? "Edit article" : "Add article"}
                </h2>
                <p className="mt-1 font-medium text-slate-600">
                  News & blog posts shown on the storefront.
                </p>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-slate-600"
                disabled={isSaving}
                onClick={closeModal}
                type="button"
              >
                <AdminIcon className="h-5 w-5" name="x" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">Title</span>
                <input
                  autoFocus
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) => updateTitle(event.target.value)}
                  required
                  value={form.title}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">Slug</span>
                <input
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, slug: event.target.value }))
                  }
                  required
                  value={form.slug}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Author <span className="font-medium text-slate-400">(optional)</span>
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-slate-300 px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, author: event.target.value }))
                  }
                  value={form.author}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Excerpt <span className="font-medium text-slate-400">(short summary)</span>
                </span>
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, excerpt: event.target.value }))
                  }
                  rows={2}
                  value={form.excerpt}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">Content</span>
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, content: event.target.value }))
                  }
                  required
                  rows={6}
                  value={form.content}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">Cover image</span>
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

              {visibleImagePreview && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Cover preview"
                      className="h-20 w-28 rounded-lg border border-slate-200 bg-white object-cover"
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
                </div>
              )}

              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isPublished: event.target.checked }))
                  }
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-black text-slate-700">
                  Published (visible on storefront)
                </span>
              </label>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
                  {error}
                </div>
              )}

              <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
                <button
                  className="h-12 rounded-lg border border-slate-300 bg-white px-5 font-black text-slate-700 hover:bg-slate-50 transition"
                  disabled={isSaving}
                  onClick={closeModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-5 font-black text-white hover:bg-blue-700 transition disabled:opacity-60"
                  disabled={isSaving}
                  type="submit"
                >
                  <AdminIcon className="h-5 w-5" name={form.id ? "check" : "plus"} />
                  {isSaving ? "Saving..." : form.id ? "Update Article" : "Add Article"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        cancelText="No"
        confirmText="Yes, Delete"
        isDestructive
        isOpen={deleteModalOpen}
        message={`Are you sure you want to delete "${toDelete?.title}"? This action cannot be undone.`}
        onClose={() => {
          setDeleteModalOpen(false);
          setToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Article"
      />
    </>
  );
}
