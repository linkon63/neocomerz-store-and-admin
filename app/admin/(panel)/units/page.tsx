"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { apiRequest, formatDate, type Unit } from "../../../../lib/admin-api";

type UnitForm = {
  id?: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
};

const emptyForm: UnitForm = {
  name: "",
  code: "",
  description: "",
  isActive: true,
};

function codeFromName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 16);
}

const PAGE_SIZE = 10;

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [form, setForm] = useState<UnitForm>(emptyForm);
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
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  const filteredUnits = useMemo(() => {
    return units.filter((unit) =>
      `${unit.name} ${unit.code} ${unit.description ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [search, units]);

  // Reset visibleCount when search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  const paginatedUnits = useMemo(() => {
    return filteredUnits.slice(0, visibleCount);
  }, [filteredUnits, visibleCount]);

  function handleLoadMore() {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setIsLoadingMore(false);
    }, 300);
  }

  useEffect(() => {
    if (isLoadingMore || paginatedUnits.length >= filteredUnits.length) return;

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
  }, [isLoadingMore, paginatedUnits.length, filteredUnits.length]);

  async function loadUnits() {
    setError("");
    setIsLoading(true);

    try {
      setUnits(await apiRequest<Unit[]>("/units"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load units");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUnits();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function updateName(name: string) {
    setForm((current) => ({
      ...current,
      name,
      code: current.id || current.code ? current.code : codeFromName(name),
    }));
  }

  function openAddModal() {
    setError("");
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(unit: Unit) {
    setError("");
    setForm({
      id: unit.id,
      name: unit.name,
      code: unit.code,
      description: unit.description ?? "",
      isActive: unit.isActive,
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
      await apiRequest<Unit>(form.id ? `/units/${form.id}` : "/units", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim() || codeFromName(form.name),
          description: form.description.trim() || undefined,
          isActive: form.isActive,
        }),
      });

      setForm(emptyForm);
      setIsModalOpen(false);
      await loadUnits();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save unit");
    } finally {
      setIsSaving(false);
    }
  }

  function deleteUnit(unit: Unit) {
    setUnitToDelete(unit);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!unitToDelete) return;

    setError("");

    try {
      await apiRequest(`/units/${unitToDelete.id}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setUnitToDelete(null);
      await loadUnits();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete unit");
    }
  }

  function cancelDelete() {
    setDeleteModalOpen(false);
    setUnitToDelete(null);
    setError("");
  }

  return (
    <>
      <PageHeader
        title="Units of Measurement"
        description="Control product stock and sales measurement units used when creating products."
        action={
          <div className="flex gap-3 items-center">
            {showSearchInput ? (
              <div className="relative flex h-11 w-64 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
                <input
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 text-slate-800"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search units..."
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
                title="Search units"
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
              Add Unit
            </button>
          </div>
        }
      />

      <section>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <p className="text-sm font-medium text-slate-500">
              {filteredUnits.length} {filteredUnits.length === 1 ? "unit" : "units"}
            </p>
          </div>

          {error && (
            <p className="mx-5 mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  {["Name", "Code", "Description", "Products", "Created", "Status", "Actions"].map(
                    (heading) => (
                      <th className="px-5 py-4 text-sm font-semibold text-slate-700" key={heading}>
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td className="px-5 py-8 text-slate-500" colSpan={7}>
                      Loading units...
                    </td>
                  </tr>
                ) : filteredUnits.length > 0 ? (
                  paginatedUnits.map((unit) => (
                    <tr className="odd:bg-white even:bg-slate-50/70" key={unit.id}>
                      <td className="px-5 py-4 text-sm text-slate-800">
                        {unit.name}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md border border-slate-200/50 bg-slate-50 px-2 py-0.5 text-xs text-slate-600 font-normal">
                          {unit.code}
                        </span>
                      </td>
                      <td className="max-w-md px-5 py-4 text-sm text-slate-600">
                        {unit.description || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {unit._count?.products ?? 0}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(unit.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-xs font-normal ${
                            unit.isActive
                              ? "border-emerald-200 bg-emerald-50/50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-500"
                          }`}
                        >
                          {unit.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(unit)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                            type="button"
                            title="Edit unit"
                          >
                            <AdminIcon className="h-4 w-4" name="edit" />
                          </button>
                          <button
                            onClick={() => deleteUnit(unit)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                            type="button"
                            title="Delete unit"
                          >
                            <AdminIcon className="h-4 w-4" name="trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-8 text-slate-500" colSpan={7}>
                      No units found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Lazy Loading */}
          {!isLoading && filteredUnits.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex flex-col items-start gap-1.5">
                <p className="text-sm font-medium text-slate-500">
                  Showing <span className="font-bold text-slate-800">{paginatedUnits.length}</span> of{" "}
                  <span className="font-bold text-slate-800">{filteredUnits.length}</span> units
                </p>
                <div className="h-1.5 w-48 overflow-hidden rounded bg-slate-200">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(100, (paginatedUnits.length / filteredUnits.length) * 100)}%` }}
                  />
                </div>
              </div>

              {paginatedUnits.length < filteredUnits.length ? (
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
                <span className="text-xs font-semibold text-slate-400">All units loaded</span>
              )}
            </div>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div
          aria-labelledby="unit-modal-title"
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
                <h3 className="text-base font-semibold text-slate-900" id="unit-modal-title">
                  {form.id ? "Edit Unit" : "Add Unit"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Example: Pieces with code pcs, Box with code box.
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
                  Unit name
                </span>
                <input
                  autoFocus
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                  onChange={(event) => updateName(event.target.value)}
                  placeholder="Pieces"
                  required
                  value={form.name}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Unit code
                </span>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, code: event.target.value }))
                  }
                  placeholder="pcs"
                  required
                  value={form.code}
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
                  placeholder="Default sellable product unit"
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
                <span>Active unit</span>
              </label>
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
                  <AdminIcon className="h-4 w-4" name={form.id ? "check" : "plus"} />
                  {isSaving ? "Saving..." : form.id ? "Update Unit" : "Add Unit"}
                </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        cancelText="No"
        confirmText="Yes"
        isDestructive={true}
        isOpen={deleteModalOpen}
        message={`Are you sure you want to delete "${unitToDelete?.name}"? Products cannot use a deleted unit.`}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Unit"
        error={error}
      />
    </>
  );
}
