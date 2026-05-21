"use client";

import { useEffect, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { apiRequest } from "../../../../lib/admin-api";

type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  maxUsage: number;
  usedCount: number;
  expiresAt?: string;
};

export default function GiftVouchersPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal & Form State
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [maxUsage, setMaxUsage] = useState("100");
  const [expiresAt, setExpiresAt] = useState("");

  async function loadCoupons() {
    try {
      setLoading(true);
      setError("");
      const couponsData = await apiRequest<Coupon[]>("/coupons");
      setCoupons(couponsData);
    } catch (err) {
      console.error(err);
      setError("Failed to load coupon vouchers from server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCoupons();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setCode("");
    setType("percentage");
    setValue("");
    setMaxUsage("100");
    setExpiresAt("");
    setIsOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value.toString());
    setMaxUsage(coupon.maxUsage.toString());
    setExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "");
    setIsOpen(true);
  };

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await apiRequest(`/coupons/${id}`, { method: "DELETE" });
      await loadCoupons();
    } catch (err) {
      alert("Failed to delete coupon.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code || !value || !maxUsage) return;

    setIsSaving(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        maxUsage: Number(maxUsage),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      };

      if (editingId) {
        await apiRequest(`/coupons/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setIsOpen(false);
      await loadCoupons();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save coupon.");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading coupons & gift vouchers...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Gift Vouchers & Coupons"
        description="Issue and track check-out discount coupon codes and vouchers."
        action={
          <div className="flex gap-3">
            <button
              onClick={loadCoupons}
              className="h-12 w-12 rounded-lg border border-slate-300 bg-white grid place-items-center hover:bg-slate-50 transition-colors"
            >
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button
              onClick={openAdd}
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-6 font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10"
            >
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Coupon
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
                {["Coupon Code", "Discount Value", "Usage Stats", "Expiration", "Actions"].map((heading) => (
                  <th className="px-5 py-4 text-sm font-semibold text-slate-700" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-medium">
                    No coupons issued yet.
                  </td>
                </tr>
              ) : (
                coupons.map((row) => (
                  <tr className="hover:bg-slate-50/50 transition-colors" key={row.id}>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-blue-50 border border-blue-200 px-3 py-1 font-semibold text-blue-700 uppercase tracking-wide">
                        {row.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {row.type === "percentage" ? `${row.value}% Discount` : `৳${row.value} Fixed Discount`}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">
                      Used: <span className="font-medium">{row.usedCount || 0}</span> / {row.maxUsage} times
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-500">
                      {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : "Never Expires"}
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
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Coupon" : "Add Coupon"}</h3>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. WELCOME10"
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Max Usage Limit</label>
                  <input
                    type="number"
                    required
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(e.target.value)}
                    placeholder="100"
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
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
                  {isSaving ? "Saving..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
