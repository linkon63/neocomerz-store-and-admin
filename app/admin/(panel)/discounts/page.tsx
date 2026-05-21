"use client";

import { useEffect, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { apiRequest } from "../../../../lib/admin-api";

type Discount = {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  startDate?: string;
  endDate?: string;
  status: "active" | "inactive";
  products?: Array<{
    id: string;
    name: string;
  }>;
};

type Product = {
  id: string;
  name: string;
};

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal & Form State
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const discountsData = await apiRequest<Discount[]>("/product-discounts");
      setDiscounts(discountsData);

      const productsData = await apiRequest<{ data: Product[] }>("/products?limit=100");
      setProducts(productsData.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load discount records from server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setName("");
    setType("percentage");
    setValue("");
    setStartDate("");
    setEndDate("");
    setStatus("active");
    setSelectedProductIds([]);
    setIsOpen(true);
  };

  const openEdit = (disc: Discount) => {
    setEditingId(disc.id);
    setName(disc.name);
    setType(disc.type);
    setValue(disc.value.toString());
    setStartDate(disc.startDate ? new Date(disc.startDate).toISOString().split("T")[0] : "");
    setEndDate(disc.endDate ? new Date(disc.endDate).toISOString().split("T")[0] : "");
    setStatus(disc.status);
    setSelectedProductIds(disc.products?.map((p) => p.id) ?? []);
    setIsOpen(true);
  };

  async function handleToggleStatus(disc: Discount) {
    try {
      const newStatus = disc.status === "active" ? "inactive" : "active";
      await apiRequest(`/product-discounts/${disc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await loadData();
    } catch (err) {
      alert("Failed to toggle status.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this discount?")) return;
    try {
      await apiRequest(`/product-discounts/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      alert("Failed to delete discount.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !value) return;

    setIsSaving(true);
    try {
      const payload = {
        name,
        type,
        value: Number(value),
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        status,
        productIds: selectedProductIds,
      };

      if (editingId) {
        await apiRequest(`/product-discounts/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/product-discounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setIsOpen(false);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save discount.");
    } finally {
      setIsSaving(false);
    }
  }

  const toggleProductSelect = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading product discounts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Discounts"
        description="Configure product discounts, percentage sales, and fixed markdowns."
        action={
          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="h-12 w-12 rounded-lg border border-slate-300 bg-white grid place-items-center hover:bg-slate-50 transition-colors"
            >
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button
              onClick={openAdd}
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-6 font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10"
            >
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Discount
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl font-medium">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Name", "Type & Value", "Linked Products", "Schedule", "Status", "Actions"].map((heading) => (
                  <th className="px-5 py-4 font-semibold text-slate-600 text-sm" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-medium">
                    No discounts created yet.
                  </td>
                </tr>
              ) : (
                discounts.map((row) => (
                  <tr className="hover:bg-slate-50/50 transition-colors" key={row.id}>
                    <td className="px-5 py-4 font-black text-slate-800">{row.name}</td>
                    <td className="px-5 py-4 font-bold text-slate-600">
                      {row.type === "percentage" ? `${row.value}% OFF` : `৳${row.value} OFF`}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-500 max-w-xs truncate">
                      {row.products && row.products.length > 0
                        ? row.products.map((p) => p.name).join(", ")
                        : "All Products"}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-500 text-xs">
                      {row.startDate ? new Date(row.startDate).toLocaleDateString() : "Always"} -{" "}
                      {row.endDate ? new Date(row.endDate).toLocaleDateString() : "Always"}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(row)}
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black border transition-all ${
                          row.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-slate-100 text-slate-600 border-slate-300"
                        }`}
                      >
                        {row.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(row)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          <AdminIcon className="h-4 w-4" name="edit" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
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
      </section>

      {/* Add/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Discount" : "Add Discount"}</h3>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Discount Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eid Mega Sale"
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat Rate (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium bg-white outline-none focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Apply to Products</label>
                <div className="border border-slate-300 rounded-lg p-3 max-h-44 overflow-y-auto space-y-2 bg-slate-50/50">
                  {products.map((prod) => (
                    <label key={prod.id} className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(prod.id)}
                        onChange={() => toggleProductSelect(prod.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4.5 w-4.5"
                      />
                      <span>{prod.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-11 px-5 rounded-lg border border-slate-300 font-bold hover:bg-slate-50 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 px-5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {isSaving ? "Saving..." : "Save Discount"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
