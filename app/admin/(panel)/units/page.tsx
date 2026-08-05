"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { apiRequest, type Unit } from "../../../../lib/admin-api";

type UOMFormState = {
  id?: string;
  name: string;
  abbreviation: string;
  parentId: string; // "" means Base Unit (-)
  factor: string;   // string for input, parsed to number on submit
  isActive: boolean;
};

const defaultForm: UOMFormState = {
  name: "",
  abbreviation: "",
  parentId: "",
  factor: "1",
  isActive: true,
};

export default function UOMPage() {
  const [view, setView] = useState<"list" | "form">("list");
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Form State
  const [form, setForm] = useState<UOMFormState>(defaultForm);
  const [formErrors, setFormErrors] = useState<{ name?: string; abbreviation?: string; factor?: string }>({});

  // Parent Dropdown State
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Active Tab for Guidelines Section
  const [activeTab, setActiveTab] = useState<"examples" | "guidelines">("examples");

  // Load Units
  const fetchUnits = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await apiRequest<Unit[]>("/units");
      setUnits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load units");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUnits();
  }, [fetchUnits]);

  // Click outside to close parent dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsParentDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered units for List view search
  const filteredUnits = useMemo(() => {
    if (!searchQuery.trim()) return units;
    const q = searchQuery.toLowerCase();
    return units.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.abbreviation.toLowerCase().includes(q) ||
        (u.parent?.name && u.parent.name.toLowerCase().includes(q)),
    );
  }, [units, searchQuery]);

  // Options for Parent Unit dropdown (exclude current unit being edited)
  const parentUnitOptions = useMemo(() => {
    return units.filter((u) => u.id !== form.id);
  }, [units, form.id]);

  const filteredParentOptions = useMemo(() => {
    if (!parentSearch.trim()) return parentUnitOptions;
    const q = parentSearch.toLowerCase();
    return parentUnitOptions.filter(
      (u) => u.name.toLowerCase().includes(q) || u.abbreviation.toLowerCase().includes(q),
    );
  }, [parentUnitOptions, parentSearch]);

  // Selected parent unit object
  const selectedParentUnit = useMemo(() => {
    return units.find((u) => u.id === form.parentId);
  }, [units, form.parentId]);

  // Actions
  function handleOpenCreate() {
    setForm(defaultForm);
    setFormErrors({});
    setError("");
    setView("form");
  }

  function handleOpenEdit(unit: Unit) {
    setForm({
      id: unit.id,
      name: unit.name,
      abbreviation: unit.abbreviation,
      parentId: unit.parentId ?? "",
      factor: String(unit.factor ?? 1),
      isActive: unit.isActive,
    });
    setFormErrors({});
    setError("");
    setView("form");
  }

  function handleCancelForm() {
    setView("list");
    setForm(defaultForm);
    setFormErrors({});
    setError("");
  }

  // Toggle status directly from table
  async function handleToggleStatus(unit: Unit) {
    const newStatus = !unit.isActive;

    // Optimistic UI update
    setUnits((prev) =>
      prev.map((u) => (u.id === unit.id ? { ...u, isActive: newStatus } : u)),
    );

    try {
      await apiRequest(`/units/${unit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
    } catch (err) {
      // Rollback on failure
      setUnits((prev) =>
        prev.map((u) => (u.id === unit.id ? { ...u, isActive: unit.isActive } : u)),
      );
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  // Validate form
  function validateForm(): boolean {
    const errors: { name?: string; abbreviation?: string; factor?: string } = {};

    if (!form.name.trim()) {
      errors.name = "Name is required";
    }

    if (!form.abbreviation.trim()) {
      errors.abbreviation = "Abbreviation is required";
    }

    const numFactor = parseFloat(form.factor);
    if (!form.factor.trim() || isNaN(numFactor) || numFactor <= 0) {
      errors.factor = "Enter a valid positive number for factor";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Save form
  async function handleSubmitForm(e: FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      abbreviation: form.abbreviation.trim(),
      parentId: form.parentId || null,
      factor: parseFloat(form.factor) || 1,
      isActive: form.isActive,
    };

    try {
      if (form.id) {
        await apiRequest(`/units/${form.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/units", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      await fetchUnits();
      setView("list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save unit");
    } finally {
      setIsSaving(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER FORM VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <div className="space-y-6">
        {/* Top Header Section — matching standard PageHeader spacing & border */}
        <header className="pt-6 mb-8 flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-start">
          <div>
            <button
              type="button"
              onClick={handleCancelForm}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors mb-3"
            >
              <AdminIcon name="arrow-left" className="w-3.5 h-3.5" />
              Back to unit of measurement list
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {form.id ? "Edit Units of Measurement" : "Add Units of Measurement"}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {form.id ? "Edit units of measurement here" : "Add units of measurement here"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelForm}
              disabled={isSaving}
              className="h-10 px-5 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitForm}
              disabled={isSaving}
              className="h-10 px-6 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isSaving && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmitForm} className="rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
            {/* Left Title Info */}
            <div className="lg:col-span-3">
              <h2 className="text-base font-bold text-slate-900">Units of Measurement Info</h2>
              <p className="mt-1 text-xs text-slate-500">Add Units information</p>
            </div>

            {/* Right Fields (2x2 Grid) */}
            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    if (formErrors.name) setFormErrors((err) => ({ ...err, name: undefined }));
                  }}
                  className={`w-full h-11 px-4 rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-100 ${
                    formErrors.name ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.name}</p>
                )}
              </div>

              {/* Abbreviation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Abbreviation<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter abbreviation"
                  value={form.abbreviation}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, abbreviation: e.target.value }));
                    if (formErrors.abbreviation) setFormErrors((err) => ({ ...err, abbreviation: undefined }));
                  }}
                  className={`w-full h-11 px-4 rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-100 ${
                    formErrors.abbreviation ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {formErrors.abbreviation && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.abbreviation}</p>
                )}
              </div>

              {/* Parent Unit (Searchable Dropdown) */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Parent Unit
                </label>
                <button
                  type="button"
                  onClick={() => setIsParentDropdownOpen((prev) => !prev)}
                  className="w-full h-11 px-4 rounded-lg border border-slate-300 bg-white text-sm text-left flex items-center justify-between text-slate-800 outline-none hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <span className={selectedParentUnit ? "text-slate-900 font-medium" : "text-slate-400"}>
                    {selectedParentUnit ? selectedParentUnit.name : "Select parent unit"}
                  </span>
                  <AdminIcon
                    name={isParentDropdownOpen ? "chevron-up" : "chevron-down"}
                    className="w-4 h-4 text-slate-400"
                  />
                </button>

                {/* Popover menu */}
                {isParentDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-xl z-30 p-2 space-y-2 animate-fadeIn">
                    {/* Inline Search Input */}
                    <div className="relative">
                      <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search"
                        value={parentSearch}
                        onChange={(e) => setParentSearch(e.target.value)}
                        autoFocus
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Options list */}
                    <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, parentId: "" }));
                          setIsParentDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-xs text-left rounded-lg transition-colors ${
                          !form.parentId ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        — None (Base Unit) —
                      </button>

                      {filteredParentOptions.length > 0 ? (
                        filteredParentOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setForm((f) => ({ ...f, parentId: opt.id }));
                              setIsParentDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-xs text-left rounded-lg transition-colors flex items-center justify-between ${
                              form.parentId === opt.id
                                ? "bg-blue-50 text-blue-700 font-bold"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{opt.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">({opt.abbreviation})</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-xs text-slate-400">No units found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Factor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Factor<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.000001"
                  placeholder="Enter factor"
                  value={form.factor}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, factor: e.target.value }));
                    if (formErrors.factor) setFormErrors((err) => ({ ...err, factor: undefined }));
                  }}
                  className={`w-full h-11 px-4 rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-100 ${
                    formErrors.factor ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {formErrors.factor && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.factor}</p>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Guidelines & Examples Tabbed Section */}
        <div className="space-y-4">
          {/* Tab Header Bar */}
          <div className="flex rounded-xl bg-slate-100/80 p-1 border border-slate-200/60 max-w-md">
            <button
              type="button"
              onClick={() => setActiveTab("examples")}
              className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-all ${
                activeTab === "examples"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Unit Type Examples
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("guidelines")}
              className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-all ${
                activeTab === "guidelines"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Unit Guidelines
            </button>
          </div>

          {/* Tab 1: Unit Type Examples */}
          {activeTab === "examples" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-slate-900">Unit Type Examples</h3>
                <p className="text-xs text-slate-500">Common unit types and their conversion relationships</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Count Units */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Count Units</h4>
                    <p className="text-xs text-slate-500">Units for counting items</p>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p><span className="font-semibold text-slate-800">Base:</span> Piece (pcs)</p>
                    <ul className="space-y-1 pl-3 list-disc text-slate-500">
                      <li>1 Pair = 2 Pieces</li>
                      <li>1 Dozen = 12 Pieces</li>
                    </ul>
                  </div>
                </div>

                {/* Weight Units */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Weight Units</h4>
                    <p className="text-xs text-slate-500">Units for measuring weight</p>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p><span className="font-semibold text-slate-800">Base:</span> Gram (g)</p>
                    <ul className="space-y-1 pl-3 list-disc text-slate-500">
                      <li>1 Kilogram(kg) = 1000 g</li>
                    </ul>
                  </div>
                </div>

                {/* Length Units */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Length Units</h4>
                    <p className="text-xs text-slate-500">Units for measuring length</p>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p><span className="font-semibold text-slate-800">Base:</span> Centimeter (cm)</p>
                    <ul className="space-y-1 pl-3 list-disc text-slate-500">
                      <li>1 Meter(m) = 100 cm</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Unit Guidelines */}
          {activeTab === "guidelines" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-slate-900">Base Unit System</h3>
                <p className="text-xs text-slate-500">Understanding the foundation of unit measurement</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                {/* Base Units */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">Base Units</h4>
                  <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
                    <li>Each unit type must have exactly one base unit</li>
                    <li>Base units have a conversion factor of 1.0</li>
                    <li>All inventory tracking is done in base units</li>
                    <li>Base units cannot be deleted</li>
                  </ul>
                </div>

                {/* Conversion Factors */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">Conversion Factors</h4>
                  <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
                    <li>Factor represents how many base units = 1 of this unit</li>
                    <li>Example: 1 pair = 2 pieces, so factor is 2</li>
                    <li>Bigger units have factors greater than 1</li>
                    <li>Always use decimal values for precision</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER LIST VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title="Units of Measurement"
        description="Create, update, and remove product units of measurement."
        action={
          <div className="flex gap-3 items-center">
            {showSearchInput ? (
              <div className="relative flex h-11 w-64 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
                <input
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 text-slate-800"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search units..."
                  value={searchQuery}
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearchQuery("");
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
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-[14px] font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 shrink-0 whitespace-nowrap cursor-pointer"
              onClick={handleOpenCreate}
              type="button"
            >
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Unit
            </button>
          </div>
        }
      />

      {/* Main List Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {/* Section Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Units of Measurement list</h2>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              Displaying {filteredUnits.length} {filteredUnits.length === 1 ? "unit" : "units"} of measurement
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchUnits}
              disabled={isLoading}
              title="Refresh list"
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
            >
              <AdminIcon name="refresh" className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-5 md:p-6 pb-2">
          <div className="relative max-w-sm">
            <AdminIcon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by unit name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-700 font-bold bg-slate-50/50">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Abbreviation</th>
                <th className="py-4 px-6">Parent</th>
                <th className="py-4 px-6">Factor</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Loading units...
                  </td>
                </tr>
              ) : filteredUnits.length > 0 ? (
                filteredUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name */}
                    <td className="py-4 px-6 font-semibold text-slate-900 text-sm">
                      {unit.name}
                    </td>

                    {/* Abbreviation */}
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {unit.abbreviation}
                    </td>

                    {/* Parent */}
                    <td className="py-4 px-6 text-slate-600">
                      {unit.parent ? unit.parent.name : "-"}
                    </td>

                    {/* Factor */}
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {unit.factor ?? 1}
                    </td>

                    {/* Status (Toggle Switch) */}
                    <td className="py-4 px-6">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={unit.isActive}
                          onChange={() => void handleToggleStatus(unit)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(unit)}
                        title="Edit UOM"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all inline-flex items-center justify-center"
                      >
                        <AdminIcon name="edit" className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No units found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
