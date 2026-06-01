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

function formatDateTime(dateStr?: string) {
  if (!dateStr) return "Always";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Always";
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minStr = minutes < 10 ? "0" + minutes : minutes;
  
  return `${month} ${day}, ${year}, ${hours}:${minStr} ${ampm}`;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal & Form State
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

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
    setIsViewOnly(false);
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
    setIsViewOnly(false);
    setIsOpen(true);
  };

  const openView = (disc: Discount) => {
    setEditingId(disc.id);
    setName(disc.name);
    setType(disc.type);
    setValue(disc.value.toString());
    setStartDate(disc.startDate ? new Date(disc.startDate).toISOString().split("T")[0] : "");
    setEndDate(disc.endDate ? new Date(disc.endDate).toISOString().split("T")[0] : "");
    setStatus(disc.status);
    setSelectedProductIds(disc.products?.map((p) => p.id) ?? []);
    setIsViewOnly(true);
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
                {["Discount Name", "Discount Type", "Discount Value", "Starts At", "Ends At", "Status", "Action"].map((heading) => (
                  <th className="px-5 py-4 text-sm font-semibold text-slate-700" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 font-medium">
                    No discounts created yet.
                  </td>
                </tr>
              ) : (
                discounts.map((row) => (
                  <tr className="hover:bg-slate-50/50 transition-colors" key={row.id}>
                    <td className="px-5 py-4 font-semibold text-slate-800">{row.name}</td>
                    <td className="px-5 py-4 font-medium text-slate-600">
                      {row.type === "percentage" ? "Percentage" : "Fixed Flat Rate"}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600">
                      {row.type === "percentage" ? `${row.value}%` : `৳${row.value}`}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-500 text-xs">
                      {formatDateTime(row.startDate)}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-500 text-xs">
                      {formatDateTime(row.endDate)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(row)}
                        title={row.status === "active" ? "Active — click to deactivate" : "Inactive — click to activate"}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          row.status === "active" ? "bg-blue-600" : "bg-slate-200"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                          row.status === "active" ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openView(row)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEdit(row)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
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
            <h3 className="text-lg font-semibold text-slate-800">
              {isViewOnly ? "Discount Details" : editingId ? "Edit Discount" : "Add Discount"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Discount Name</label>
                <input
                  type="text"
                  required
                  disabled={isViewOnly}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eid Mega Sale"
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Discount Type</label>
                  <select
                    value={type}
                    disabled={isViewOnly}
                    onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
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
                    disabled={isViewOnly}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    disabled={isViewOnly}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    disabled={isViewOnly}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Status</label>
                <select
                  value={status}
                  disabled={isViewOnly}
                  onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium bg-white outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
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
                        disabled={isViewOnly}
                        checked={selectedProductIds.includes(prod.id)}
                        onChange={() => toggleProductSelect(prod.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4.5 w-4.5 disabled:opacity-50"
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
                  {isViewOnly ? "Close" : "Discard"}
                </button>
                {!isViewOnly && (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="h-11 px-5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {isSaving ? "Saving..." : "Save Discount"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
