"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [form, setForm] = useState<UnitForm>(emptyForm);
  const [search, setSearch] = useState("");
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
  }

  return (
    <>
      <PageHeader
        title="Units of Measurement"
        description="Control product stock and sales measurement units used when creating products."
        action={
          <div className="flex gap-3">
            <button
              className="grid h-14 w-14 place-items-center rounded-lg border border-slate-300 bg-white"
              onClick={loadUnits}
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
              Add Unit
            </button>
          </div>
        }
      />

      <section>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Units list</h2>
              <p className="font-medium text-slate-600">
                Displaying {filteredUnits.length} units
              </p>
            </div>
            <label className="flex h-12 w-full max-w-md items-center gap-3 rounded-lg border border-slate-300 px-4">
              <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent font-medium outline-none"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search units by name, code, or description"
                value={search}
              />
            </label>
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
                  filteredUnits.map((unit) => (
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
                          >
                            <AdminIcon className="h-4 w-4" name="edit" />
                          </button>
                          <button
                            onClick={() => deleteUnit(unit)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                            type="button"
                          >
                            <AdminIcon className="h-4 w-4" name="x" />
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
        </div>
      </section>

      {isModalOpen && (
        <div
          aria-labelledby="unit-modal-title"
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
                  <AdminIcon className="h-4 w-4" name={form.id ? "check" : "plus"} />
                  {isSaving ? "Saving..." : form.id ? "Update Unit" : "Add Unit"}
                </button>
              </div>
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
      />
    </>
  );
}
