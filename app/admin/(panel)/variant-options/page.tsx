"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { apiRequest, type Attribute } from "../../../../lib/admin-api";

type VariantValueForm = {
  id?: string;
  value: string;
};

type VariantOptionForm = {
  id?: string;
  name: string;
  values: VariantValueForm[];
};

const emptyForm: VariantOptionForm = {
  name: "",
  values: [{ value: "" }],
};

function cleanValues(values: VariantValueForm[]) {
  return values
    .map((item) => ({ ...item, value: item.value.trim() }))
    .filter((item) => item.value.length > 0);
}

export default function VariantOptionsPage() {
  const [variantOptions, setVariantOptions] = useState<Attribute[]>([]);
  const [form, setForm] = useState<VariantOptionForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<Attribute | null>(null);

  const filteredOptions = useMemo(() => {
    const query = search.toLowerCase();

    return variantOptions.filter((option) =>
      `${option.name} ${option.values?.map((item) => item.value).join(" ") ?? ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [search, variantOptions]);

  async function loadVariantOptions() {
    setError("");
    setIsLoading(true);

    try {
      setVariantOptions(await apiRequest<Attribute[]>("/attributes"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load variant options",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadVariantOptions();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function openAddModal() {
    setError("");
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(option: Attribute) {
    setError("");
    setForm({
      id: option.id,
      name: option.name,
      values:
        option.values && option.values.length > 0
          ? option.values.map((item) => ({ id: item.id, value: item.value }))
          : [{ value: "" }],
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;

    setError("");
    setForm(emptyForm);
    setIsModalOpen(false);
  }

  function updateValue(index: number, value: string) {
    setForm((current) => ({
      ...current,
      values: current.values.map((item, itemIndex) =>
        itemIndex === index ? { ...item, value } : item,
      ),
    }));
  }

  function addValueInput() {
    setForm((current) => ({
      ...current,
      values: [...current.values, { value: "" }],
    }));
  }

  function removeValueInput(index: number) {
    setForm((current) => ({
      ...current,
      values:
        current.values.length === 1
          ? [{ value: "" }]
          : current.values.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function syncValues(attributeId: string, previous: Attribute | null) {
    const nextValues = cleanValues(form.values);
    const previousValues = previous?.values ?? [];
    const nextIds = new Set(nextValues.map((item) => item.id).filter(Boolean));

    await Promise.all(
      previousValues
        .filter((item) => !nextIds.has(item.id))
        .map((item) =>
          apiRequest(`/attribute-values/${item.id}`, { method: "DELETE" }),
        ),
    );

    await Promise.all(
      nextValues.map((item) => {
        if (item.id) {
          return apiRequest(`/attribute-values/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: item.value }),
          });
        }

        return apiRequest(`/attributes/${attributeId}/values`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: item.value }),
        });
      }),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const name = form.name.trim();
      const previousOption =
        variantOptions.find((option) => option.id === form.id) ?? null;

      const savedOption = await apiRequest<Attribute>(
        form.id ? `/attributes/${form.id}` : "/attributes",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        },
      );

      await syncValues(savedOption.id, previousOption);

      setForm(emptyForm);
      setIsModalOpen(false);
      await loadVariantOptions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save variant option",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function deleteVariantOption(option: Attribute) {
    setOptionToDelete(option);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!optionToDelete) return;

    setError("");

    try {
      await Promise.all(
        (optionToDelete.values ?? []).map((item) =>
          apiRequest(`/attribute-values/${item.id}`, { method: "DELETE" }),
        ),
      );
      await apiRequest(`/attributes/${optionToDelete.id}`, {
        method: "DELETE",
      });
      setDeleteModalOpen(false);
      setOptionToDelete(null);
      await loadVariantOptions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete variant option",
      );
    }
  }

  function cancelDelete() {
    setDeleteModalOpen(false);
    setOptionToDelete(null);
    setError("");
  }

  return (
    <>
      <PageHeader
        title="Variant Options"
        description="Create, update, and remove product variant groups like color, size, fit, and material."
        action={
          <div className="flex gap-3">
            <button
              className="grid h-14 w-14 place-items-center rounded-lg border border-slate-300 bg-white"
              onClick={loadVariantOptions}
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
              Add Option
            </button>
          </div>
        }
      />

      <section>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Variant options list</h2>
              <p className="font-medium text-slate-600">
                Displaying {filteredOptions.length} option groups
              </p>
            </div>
            <label className="flex h-12 w-full max-w-md items-center gap-3 rounded-lg border border-slate-300 px-4">
              <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent font-medium outline-none"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search variant options"
                value={search}
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  {["Name", "Values", "Count", "Actions"].map((heading) => (
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
                      colSpan={4}
                    >
                      Loading variant options...
                    </td>
                  </tr>
                ) : filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <tr
                      className="odd:bg-white even:bg-slate-50/70"
                      key={option.id}
                    >
                      <td className="px-5 py-4 text-sm text-slate-800">
                        {option.name}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex max-w-2xl flex-wrap gap-2">
                          {(option.values ?? []).length > 0 ? (
                            option.values?.map((item) => (
                              <span
                                className="rounded-md border border-slate-200/50 bg-slate-50 px-2 py-0.5 text-xs text-slate-600 font-normal"
                                key={item.id}
                              >
                                {item.value}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">
                              No values
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {option.values?.length ?? 0} values
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(option)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                            type="button"
                          >
                            <AdminIcon className="h-4 w-4" name="edit" />
                          </button>
                          <button
                            onClick={() => deleteVariantOption(option)}
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
                    <td
                      className="px-5 py-8 text-slate-500"
                      colSpan={4}
                    >
                      No variant options found.
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
          aria-labelledby="variant-option-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
          role="dialog"
        >
          <form
            className="max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
            onSubmit={handleSubmit}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3
                  className="text-base font-semibold text-slate-900"
                  id="variant-option-modal-title"
                >
                  {form.id ? "Edit Variant Option" : "Add Variant Option"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Set the option group and the values customers can select.
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
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Color"
                  required
                  value={form.name}
                />
              </label>
              <div className="rounded-lg border border-slate-200">
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-lg border-b border-slate-200 bg-white px-3 py-2">
                  <span className="block text-sm font-medium text-slate-700">
                    Values
                  </span>
                  <button
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium hover:bg-slate-100 transition-colors"
                    disabled={isSaving}
                    onClick={addValueInput}
                    type="button"
                  >
                    <AdminIcon className="h-3.5 w-3.5" name="plus" />
                    Add Value
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto p-3">
                  <div className="space-y-2">
                    {form.values.map((item, index) => (
                      <div className="flex gap-2" key={item.id ?? index}>
                        <input
                          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                          onChange={(event) =>
                            updateValue(index, event.target.value)
                          }
                          placeholder={index === 0 ? "Black" : "Value"}
                          value={item.value}
                        />
                        <button
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-red-100 bg-red-50/50 hover:bg-red-50 text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
                          disabled={isSaving || form.values.length === 1}
                          onClick={() => removeValueInput(index)}
                          type="button"
                        >
                          <AdminIcon className="h-4 w-4" name="x" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                  {isSaving
                    ? "Saving..."
                    : form.id
                      ? "Update Option"
                      : "Add Option"}
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
        message={`Are you sure you want to delete "${optionToDelete?.name}"? This action cannot be undone.`}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Variant Option"
        error={error}
      />
    </>
  );
}
