"use client";

import { type FormEvent } from "react";
import { FiX } from "react-icons/fi";

export type AddressForm = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type Props = {
  open: boolean;
  editingId: string | null;
  form: AddressForm;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: (e: FormEvent) => void;
  onFieldChange: (field: keyof AddressForm, value: string | boolean) => void;
};

export default function AddressModal({
  open,
  editingId,
  form,
  saving,
  error,
  onClose,
  onSave,
  onFieldChange,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white px-8 py-8 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bembo text-xl font-bold">
            {editingId ? "Edit Address" : "Add Address"}
          </h3>
          <button type="button" onClick={onClose}>
            <FiX className="text-lg" />
          </button>
        </div>
        <form onSubmit={onSave} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                Full name
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => onFieldChange("fullName", e.target.value)}
                className="mt-1 w-full border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                Phone
              </label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => onFieldChange("phone", e.target.value)}
                className="mt-1 w-full border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
              Address line 1
            </label>
            <input
              type="text"
              required
              value={form.addressLine1}
              onChange={(e) => onFieldChange("addressLine1", e.target.value)}
              className="mt-1 w-full border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
              Address line 2 (optional)
            </label>
            <input
              type="text"
              value={form.addressLine2}
              onChange={(e) => onFieldChange("addressLine2", e.target.value)}
              className="mt-1 w-full border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                City
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => onFieldChange("city", e.target.value)}
                className="mt-1 w-full border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                State
              </label>
              <input
                type="text"
                required
                value={form.state}
                onChange={(e) => onFieldChange("state", e.target.value)}
                className="mt-1 w-full border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                Postal code
              </label>
              <input
                type="text"
                required
                value={form.postalCode}
                onChange={(e) => onFieldChange("postalCode", e.target.value)}
                className="mt-1 w-full border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                Country
              </label>
              <input
                type="text"
                required
                value={form.country}
                onChange={(e) => onFieldChange("country", e.target.value)}
                className="mt-1 w-full border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => onFieldChange("isDefault", e.target.checked)}
              className="h-4 w-4 accent-black"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
              Set as default
            </span>
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
