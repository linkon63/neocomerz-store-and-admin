"use client";

import { useState, useEffect, useCallback } from "react";
import { FiMapPin, FiPlus, FiTrash2, FiEdit2, FiX, FiLoader, FiChevronDown } from "react-icons/fi";
import { toast } from "sonner";
import { getCustomerToken } from "@/lib/storefront-api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

const SECTION_LABEL = "text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400";
const FIELD_LABEL   = "block text-[10px] font-bold tracking-[0.14em] uppercase text-zinc-400 mb-1.5";
const INPUT_BASE    = "w-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-sans text-zinc-800 outline-none transition focus:border-stone-400 rounded-lg placeholder:text-zinc-300";
const BTN_PRIMARY   = "inline-flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-stone-800 text-white font-sans text-[10px] font-bold tracking-[0.16em] uppercase px-8 py-3 rounded-full transition cursor-pointer shadow-sm disabled:opacity-50";
const BTN_GHOST     = "inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 border border-stone-200 text-zinc-600 font-sans text-[10px] font-bold tracking-[0.16em] uppercase px-8 py-3 rounded-full transition cursor-pointer disabled:opacity-50";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const EMPTY_FORM = {
  fullName: "", phone: "", addressLine1: "", addressLine2: "",
  city: "", state: "", postalCode: "", country: "Bangladesh", isDefault: false,
};

export default function AddressBookView() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading]     = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Address | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]           = useState({ ...EMPTY_FORM });

  const patch = (key: string, val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const fetchAddresses = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAddresses(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm({
      fullName: addr.fullName, phone: addr.phone,
      addressLine1: addr.addressLine1, addressLine2: addr.addressLine2 || "",
      city: addr.city, state: addr.state, postalCode: addr.postalCode,
      country: addr.country || "Bangladesh", isDefault: addr.isDefault,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCustomerToken();
    if (!token) { toast.error("Please log in first."); return; }
    setSubmitting(true);
    try {
      const url    = editing ? `${BASE_URL}/addresses/${editing.id}` : `${BASE_URL}/addresses`;
      const method = editing ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(editing ? "Address updated." : "Address saved.");
        setModalOpen(false);
        fetchAddresses();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to save address.");
      }
    } catch { toast.error("Something went wrong."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    const token = getCustomerToken();
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Address deleted.");
        fetchAddresses();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to delete address.");
      }
    } catch { toast.error("Something went wrong."); }
  };

  return (
    <div className="space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={SECTION_LABEL}>Address Book</p>
          <h2 className="font-['Bembo_Std'] text-2xl text-zinc-850 font-normal mt-1">
            Saved Addresses
          </h2>
          <p className="font-['Bembo_Std'] text-zinc-400 text-sm italic mt-0.5">
            Manage your billing and shipping locations.
          </p>
        </div>
        <button
          onClick={openNew}
          className="shrink-0 inline-flex items-center gap-2 border border-stone-200 hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-zinc-700 font-sans text-[10px] font-bold tracking-[0.16em] uppercase px-5 py-2.5 rounded-full transition cursor-pointer"
        >
          <FiPlus className="text-xs" /> Add New
        </button>
      </div>

      {/* ── List ────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <FiLoader className="w-7 h-7 text-[#C5B382] animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-stone-200 rounded-xl">
          <FiMapPin className="text-4xl text-zinc-200 mb-4" />
          <p className="font-['Bembo_Std'] text-zinc-400 text-base italic">No saved addresses yet.</p>
          <button
            onClick={openNew}
            className="mt-4 font-sans text-[10px] font-bold tracking-[0.16em] uppercase text-[#C5B382] hover:text-zinc-800 transition cursor-pointer"
          >
            + Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="relative border border-stone-200 bg-white rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-stone-300 hover:shadow-sm transition-all duration-200"
            >
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-[#C5B382]/10 border border-[#C5B382]/30 text-[#8a7440] font-sans text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full">
                  Default
                </span>
              )}
              <div className="space-y-1 pr-16">
                <p className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-800">
                  {addr.fullName}
                </p>
                <p className="font-sans text-xs text-zinc-500 leading-relaxed">
                  {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                </p>
                <p className="font-sans text-xs text-zinc-500">
                  {addr.city}, {addr.state} — {addr.postalCode}
                </p>
                <p className="font-sans text-xs text-zinc-500">{addr.country}</p>
                <p className="font-sans text-xs text-zinc-700 font-semibold pt-1">{addr.phone}</p>
              </div>
              <div className="flex items-center gap-5 pt-3 border-t border-stone-100">
                <button
                  onClick={() => openEdit(addr)}
                  className="flex items-center gap-1.5 font-sans text-[10px] font-bold tracking-wider uppercase text-zinc-400 hover:text-zinc-800 transition cursor-pointer"
                >
                  <FiEdit2 className="text-xs" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1.5 font-sans text-[10px] font-bold tracking-wider uppercase text-red-400 hover:text-red-600 transition cursor-pointer"
                >
                  <FiTrash2 className="text-xs" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="flex items-start justify-between px-7 py-5 border-b border-stone-100">
              <div>
                <p className={SECTION_LABEL}>{editing ? "Edit Address" : "New Address"}</p>
                <h3 className="font-['Bembo_Std'] text-xl text-zinc-850 mt-0.5">
                  {editing ? "Update shipping address" : "Add a new address"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
                aria-label="Close"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={FIELD_LABEL}>Full Name *</label>
                  <input type="text" value={form.fullName} onChange={(e) => patch("fullName", e.target.value)} className={INPUT_BASE} placeholder="John Doe" required />
                </div>
                <div>
                  <label className={FIELD_LABEL}>Phone *</label>
                  <input type="tel" value={form.phone} onChange={(e) => patch("phone", e.target.value)} className={INPUT_BASE} placeholder="+880 1xxx" required />
                </div>
              </div>

              <div>
                <label className={FIELD_LABEL}>Address Line 1 *</label>
                <input type="text" value={form.addressLine1} onChange={(e) => patch("addressLine1", e.target.value)} className={INPUT_BASE} placeholder="House / Road / Area" required />
              </div>

              <div>
                <label className={FIELD_LABEL}>
                  Address Line 2 <span className="normal-case font-normal text-zinc-300 tracking-normal">(optional)</span>
                </label>
                <input type="text" value={form.addressLine2} onChange={(e) => patch("addressLine2", e.target.value)} className={INPUT_BASE} placeholder="Apartment, suite, floor…" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={FIELD_LABEL}>City *</label>
                  <input type="text" value={form.city} onChange={(e) => patch("city", e.target.value)} className={INPUT_BASE} placeholder="Dhaka" required />
                </div>
                <div>
                  <label className={FIELD_LABEL}>State / District *</label>
                  <input type="text" value={form.state} onChange={(e) => patch("state", e.target.value)} className={INPUT_BASE} placeholder="Dhaka" required />
                </div>
              </div>

              <div>
                <label className={FIELD_LABEL}>Postal Code *</label>
                <input type="text" value={form.postalCode} onChange={(e) => patch("postalCode", e.target.value)} className={INPUT_BASE} placeholder="1207" required />
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-1 group select-none">
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition shrink-0 ${
                    form.isDefault ? "bg-[#1A1A1A] border-[#1A1A1A]" : "border-stone-300 group-hover:border-stone-400"
                  }`}
                >
                  {form.isDefault && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => patch("isDefault", e.target.checked)}
                  className="sr-only"
                />
                <span className="font-sans text-xs text-zinc-600">Set as default address</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className={`flex-1 ${BTN_GHOST}`}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className={`flex-1 ${BTN_PRIMARY}`}>
                  {submitting ? <FiLoader className="animate-spin w-3.5 h-3.5" /> : editing ? "Update" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
