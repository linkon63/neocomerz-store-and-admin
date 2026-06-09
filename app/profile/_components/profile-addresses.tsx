"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../../_components/auth-context";
import { FiPlus, FiEdit2, FiTrash2, FiStar } from "react-icons/fi";
import AddressModal, { type AddressForm } from "./address-modal";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api/v1";

type Address = {
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
};

const emptyForm: AddressForm = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};

export default function ProfileAddresses() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    if (token) fetchAddresses();
  }, [token]);

  async function fetchAddresses() {
    setLoading(true);
    const res = await fetch(`${BASE_URL}/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setAddresses(data);
    }
    setLoading(false);
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowModal(true);
  }

  function openEdit(addr: Address) {
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setError("");
    setShowModal(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = editingId
      ? `${BASE_URL}/addresses/${editingId}`
      : `${BASE_URL}/addresses`;
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify(form),
    });

    if (res.status === 200 || res.status === 201) {
      setShowModal(false);
      fetchAddresses();
    } else {
      const err = await res.json().catch(() => ({ message: "Failed to save address" }));
      setError((err as { message?: string }).message || "Failed to save address");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this address?")) return;
    const res = await fetch(`${BASE_URL}/addresses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      fetchAddresses();
    }
  }

  async function handleSetDefault(id: string) {
    await fetch(`${BASE_URL}/addresses/${id}/set-default`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAddresses();
  }

  function setField(field: keyof AddressForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (!token) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bembo text-3xl font-bold">Addresses</h2>
          <p className="mt-2 text-sm text-neutral-500">Manage your shipping and billing addresses</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-black px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white"
        >
          <FiPlus className="text-sm" />
          Add New
        </button>
      </div>

      {/* Address list */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {loading ? (
          <p className="col-span-full text-center text-sm text-neutral-400">Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <p className="col-span-full rounded-lg border border-dashed border-neutral-300 px-5 py-12 text-center text-sm text-neutral-500 sm:col-span-2">
            No addresses saved yet.
          </p>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="relative border border-neutral-200 px-5 py-5">
              {addr.isDefault && (
                <span className="absolute right-3 top-3 rounded bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
                  Default
                </span>
              )}
              <p className="text-xs font-bold uppercase tracking-[0.08em]">Shipping Address</p>
              <p className="mt-3 text-sm font-semibold">{addr.fullName}</p>
              <p className="mt-1 text-sm text-neutral-600">{addr.phone}</p>
              <p className="mt-1 text-sm text-neutral-600">{addr.addressLine1}</p>
              {addr.addressLine2 && (
                <p className="text-sm text-neutral-600">{addr.addressLine2}</p>
              )}
              <p className="text-sm text-neutral-600">
                {addr.city}, {addr.state} {addr.postalCode}
              </p>
              <p className="text-sm text-neutral-600">{addr.country}</p>
              <div className="mt-4 flex gap-3 border-t border-neutral-100 pt-3">
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] transition hover:text-neutral-500"
                  >
                    <FiStar className="text-xs" />
                    Set Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEdit(addr)}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] transition hover:text-neutral-500"
                >
                  <FiEdit2 className="text-xs" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-red-500 transition hover:text-red-600"
                >
                  <FiTrash2 className="text-xs" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddressModal
        open={showModal}
        editingId={editingId}
        form={form}
        saving={saving}
        error={error}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onFieldChange={setField}
      />
    </div>
  );
}
