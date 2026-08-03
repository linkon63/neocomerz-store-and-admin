"use client";

import React, { useState, FormEvent } from "react";
import { toast } from "sonner";
import { apiRequest } from "../../../../../../lib/admin-api";
import { AdminIcon } from "../../../../_components/admin-shell";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (supplier: { id: string; name: string }) => void;
}

export function SupplierModal({ isOpen, onClose, onSuccess }: SupplierModalProps) {
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    isActive: true,
  });
  const [supplierError, setSupplierError] = useState("");
  const [isSavingSupplier, setIsSavingSupplier] = useState(false);

  if (!isOpen) return null;

  async function handleCreateSupplier(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSupplierError("");
    if (!newSupplier.name.trim()) {
      setSupplierError("Company Name is required");
      return;
    }

    const emailTrimmed = newSupplier.email.trim();
    if (emailTrimmed) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        setSupplierError("Invalid email address");
        return;
      }
    }

    const phoneTrimmed = newSupplier.phone.trim();
    if (phoneTrimmed) {
      const phoneRegex = /^\+?[0-9][0-9\s\-()]{6,19}$/;
      if (!phoneRegex.test(phoneTrimmed)) {
        setSupplierError("Invalid phone number format");
        return;
      }
    }

    setIsSavingSupplier(true);
    try {
      const created = await apiRequest<{ id: string; name: string }>("/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSupplier.name.trim(),
          phone: phoneTrimmed || undefined,
          email: emailTrimmed || undefined,
          address: newSupplier.address.trim() || undefined,
          isActive: newSupplier.isActive,
        }),
      });
      toast.success("Supplier added successfully!");
      onSuccess(created);
      setNewSupplier({ name: "", phone: "", email: "", address: "", isActive: true });
    } catch (err) {
      setSupplierError(err instanceof Error ? err.message : "Failed to create supplier");
      toast.error(err instanceof Error ? err.message : "Failed to create supplier");
    } finally {
      setIsSavingSupplier(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="supplier-modal-title"
    >
      <form
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4"
        onSubmit={handleCreateSupplier}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900" id="supplier-modal-title">
              Add Supplier
            </h3>
            <p className="mt-1 text-xs text-slate-500">Provide company details below.</p>
          </div>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600"
            disabled={isSavingSupplier}
            onClick={onClose}
            type="button"
          >
            <AdminIcon className="h-4 w-4" name="x" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-700">Company Name *</span>
            <input
              autoFocus
              className="h-10 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
              onChange={(e) =>
                setNewSupplier((current) => ({ ...current, name: e.target.value }))
              }
              required
              value={newSupplier.name}
              placeholder="New Supplier Company"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-700">Business Phone No.</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
              onChange={(e) =>
                setNewSupplier((current) => ({ ...current, phone: e.target.value }))
              }
              value={newSupplier.phone}
              placeholder="017XXXXXXXX"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-700">Email Address</span>
            <input
              type="email"
              className="h-10 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
              onChange={(e) =>
                setNewSupplier((current) => ({ ...current, email: e.target.value }))
              }
              value={newSupplier.email}
              placeholder="supplier@example.com"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-700">Address</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
              onChange={(e) =>
                setNewSupplier((current) => ({ ...current, address: e.target.value }))
              }
              value={newSupplier.address}
              placeholder="Street Address, City"
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={newSupplier.isActive}
              onChange={(e) =>
                setNewSupplier((current) => ({ ...current, isActive: e.target.checked }))
              }
            />
            Active Status
          </label>
        </div>

        {supplierError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {supplierError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            className="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            disabled={isSavingSupplier}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-500 px-5 text-sm font-semibold text-white disabled:bg-slate-400 hover:bg-blue-600 transition-colors"
            disabled={isSavingSupplier}
            type="submit"
          >
            {isSavingSupplier ? "Saving..." : "Add Supplier"}
          </button>
        </div>
      </form>
    </div>
  );
}
