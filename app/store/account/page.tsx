"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addressApi,
  type Address,
  type StoreUser,
  getStoredUser,
  getStoreToken,
  clearStoreSession,
} from "@/lib/store-api";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoreUser | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "", phone: "", addressLine1: "", addressLine2: "",
    city: "", state: "", postalCode: "", country: "US",
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<string | null>(null);

  const isLoggedIn = typeof window !== "undefined" && !!getStoreToken();

  useEffect(() => {
    if (!isLoggedIn) { router.push("/store/login"); return; }
    setUser(getStoredUser());
    addressApi.list()
      .then(setAddresses)
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  }, [isLoggedIn]);

  function startEdit(addr: Address) {
    setEditingAddress(addr);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });
    setShowAddressForm(true);
  }

  function resetForm() {
    setEditingAddress(null);
    setAddressForm({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "US" });
    setShowAddressForm(false);
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    setSavingAddress(true);
    try {
      if (editingAddress) {
        const updated = await addressApi.update(editingAddress.id, addressForm);
        setAddresses((prev) => prev.map((a) => a.id === updated.id ? updated : a));
      } else {
        const newAddr = await addressApi.create(addressForm);
        setAddresses((prev) => [...prev, newAddr]);
      }
      resetForm();
    } catch { /* ignore */ }
    finally { setSavingAddress(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    setDeletingAddress(id);
    try {
      await addressApi.delete(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch { /* ignore */ }
    finally { setDeletingAddress(null); }
  }

  async function handleSetDefault(id: string) {
    try {
      await addressApi.setDefault(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    } catch { /* ignore */ }
  }

  function handleLogout() {
    clearStoreSession();
    router.push("/store");
  }

  const FIELDS = [
    { key: "fullName", label: "Full Name", placeholder: "John Doe" },
    { key: "phone", label: "Phone", placeholder: "+1 555 0000" },
    { key: "addressLine1", label: "Address Line 1", placeholder: "123 Main St" },
    { key: "addressLine2", label: "Address Line 2 (optional)", placeholder: "Apt 4B" },
    { key: "city", label: "City", placeholder: "New York" },
    { key: "state", label: "State", placeholder: "NY" },
    { key: "postalCode", label: "Postal Code", placeholder: "10001" },
    { key: "country", label: "Country", placeholder: "US" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 min-h-[calc(100vh-280px)]">
      <div className="mb-8 flex flex-col gap-1 border-b pb-5" style={{ borderColor: "var(--store-border)" }}>
        <h1 className="text-[26px] font-black tracking-tight" style={{ color: "var(--store-text)" }}>
          My Account
        </h1>
        <p className="text-[13px]" style={{ color: "var(--store-text-muted)" }}>
          Manage your profile and saved addresses
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        
        {/* Navigation Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm border" style={{ borderColor: "var(--store-border)" }}>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b" style={{ borderColor: "var(--store-border)" }}>
              <div
                className="w-11 h-11 rounded-xl text-white flex items-center justify-center font-black text-base"
                style={{ backgroundColor: "var(--store-primary)" }}
              >
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[14px] truncate" style={{ color: "var(--store-text)" }}>
                  {user?.name}
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--store-text-muted)" }}>
                  {user?.email}
                </p>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { href: "/store/account", label: "Account", icon: "👤", active: true },
                { href: "/store/orders", label: "My Orders", icon: "📦" },
                { href: "/store/wishlist", label: "Wishlist", icon: "♡" },
                { href: "/store/cart", label: "Cart", icon: "🛒" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors"
                  style={
                    item.active
                      ? {
                          backgroundColor: "var(--store-primary-light)",
                          color: "var(--store-primary)",
                          border: "1px solid var(--store-primary-mid)",
                        }
                      : { color: "var(--store-text-muted)" }
                  }
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 transition"
              >
                <span className="text-sm">🚪</span>
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border" style={{ borderColor: "var(--store-border)" }}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: "var(--store-border)" }}>
              <span className="text-lg">👤</span>
              <h2 className="text-[14px] font-bold" style={{ color: "var(--store-text)" }}>
                Personal Information
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--store-text-muted)" }}>
                  Full Name
                </p>
                <p className="font-bold text-[14px] px-4 py-2.5 rounded-xl border" style={{ borderColor: "var(--store-border)" }}>
                  {user?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--store-text-muted)" }}>
                  Email Address
                </p>
                <p className="font-bold text-[14px] px-4 py-2.5 rounded-xl border" style={{ borderColor: "var(--store-border)" }}>
                  {user?.email ?? "—"}
                </p>
              </div>
              {user?.phone && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--store-text-muted)" }}>
                    Phone
                  </p>
                  <p className="font-bold text-[14px] px-4 py-2.5 rounded-xl border" style={{ borderColor: "var(--store-border)" }}>
                    {user.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Addresses Card */}
          <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border" style={{ borderColor: "var(--store-border)" }}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: "var(--store-border)" }}>
              <div className="flex items-center gap-3">
                <span className="text-lg">📍</span>
                <h2 className="text-[14px] font-bold" style={{ color: "var(--store-text)" }}>
                  Saved Addresses
                </h2>
              </div>
              <button
                onClick={() => { resetForm(); setShowAddressForm((o) => !o); }}
                className="text-[12px] font-bold underline decoration-2 underline-offset-2 transition"
                style={{ color: "var(--store-primary)" }}
              >
                {showAddressForm && !editingAddress ? "Cancel" : "+ Add Address"}
              </button>
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <form
                onSubmit={handleSaveAddress}
                className="mb-6 rounded-2xl border p-5 space-y-4"
                style={{ borderColor: "var(--store-border)", backgroundColor: "var(--store-bg)" }}
              >
                <p className="text-xs font-extrabold uppercase tracking-widest border-b pb-2" style={{ borderColor: "var(--store-border)", color: "var(--store-text)" }}>
                  {editingAddress ? "Update Address" : "Add New Address"}
                </p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {FIELDS.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--store-text-muted)" }}>
                        {label}
                      </label>
                      <input
                        type="text"
                        required={key !== "addressLine2"}
                        value={addressForm[key as keyof typeof addressForm]}
                        onChange={(e) => setAddressForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full rounded-xl border bg-white px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                        style={{ borderColor: "var(--store-border)", color: "var(--store-text)" }}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "var(--store-primary)" }}
                  >
                    {savingAddress ? "Saving..." : editingAddress ? "Update" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-slate-50"
                    style={{ borderColor: "var(--store-border)", color: "var(--store-text-muted)" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Address Cards List */}
            {loadingAddresses ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-slate-100 rounded-2xl border" style={{ borderColor: "var(--store-border)" }} />
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-10 rounded-2xl border border-dashed" style={{ borderColor: "var(--store-border)" }}>
                <p className="text-sm mb-1.5" style={{ color: "var(--store-text-muted)" }}>📍</p>
                <p className="text-xs font-bold" style={{ color: "var(--store-text)" }}>No addresses saved yet</p>
                <p className="text-xs mt-1" style={{ color: "var(--store-text-muted)" }}>Add an address to speed up checkout.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="rounded-2xl border p-5 flex flex-col justify-between transition-all"
                    style={{
                      borderColor: addr.isDefault ? "var(--store-primary)" : "var(--store-border)",
                      backgroundColor: addr.isDefault ? "var(--store-primary-light)" : "#fff",
                    }}
                  >
                    <div className="text-xs">
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b" style={{ borderColor: "var(--store-border)" }}>
                        <p className="font-bold tracking-wide" style={{ color: "var(--store-text)" }}>{addr.fullName}</p>
                        {addr.isDefault && (
                          <span className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: "var(--store-primary)" }}>
                            Default
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 font-medium leading-relaxed" style={{ color: "var(--store-text-muted)" }}>
                        <p>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                        <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="uppercase tracking-widest text-[10px]">{addr.country}</p>
                        <p className="font-bold mt-1.5" style={{ color: "var(--store-primary)" }}>{addr.phone}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 border-t pt-4 mt-4 text-[10px] font-bold uppercase tracking-wider justify-end" style={{ borderColor: "var(--store-border)", color: "var(--store-text-muted)" }}>
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="hover:text-slate-800 transition cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(addr)}
                        className="transition cursor-pointer"
                        style={{ color: "var(--store-primary)" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        disabled={deletingAddress === addr.id}
                        className="transition text-red-500 cursor-pointer disabled:opacity-50 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
