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
    <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16 min-h-[calc(100vh-280px)]">
      <div className="mb-8 flex flex-col gap-1 border-b pb-5 border-stroke">
        <h1 className="text-2xl font-bold font-serif uppercase text-foreground">
          আমার অ্যাকাউন্ট
        </h1>
        <p className="text-xs text-stone-500 font-medium tracking-wide">
          [ প্রোফাইল এবং ঠিকানা ব্যবস্থাপনা ]
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        
        {/* Navigation Sidebar */}
        <div className="space-y-4">
          <div className="rounded-none bg-white p-5 shadow-none border border-stroke">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-stroke">
              <div className="w-10 h-10 rounded-none text-white flex items-center justify-center font-bold text-sm bg-primary">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs truncate text-foreground">
                  {user?.name}
                </p>
                <p className="text-[10px] text-stone-500 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
            </div>

            <nav className="space-y-1 text-xs">
              {[
                { href: "/store/account", label: "অ্যাকাউন্ট", icon: "👤", active: true },
                { href: "/store/orders", label: "অর্ডারসমূহ", icon: "📦" },
                { href: "/store/wishlist", label: "উইশলিস্ট", icon: "♡" },
                { href: "/store/cart", label: "কার্ট", icon: "🛒" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-none px-3 py-2 font-semibold transition-colors border"
                  style={
                    item.active
                      ? {
                          backgroundColor: "var(--store-primary)",
                          color: "#ffffff",
                          borderColor: "var(--store-primary)",
                        }
                      : {
                          color: "var(--store-text-muted)",
                          borderColor: "transparent",
                        }
                  }
                >
                  <span className="text-xs">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-none px-3 py-2 font-semibold text-red-655 hover:bg-red-50 transition border border-transparent"
              >
                <span className="text-xs">🚪</span>
                <span>লগআউট</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <div className="rounded-none bg-white p-6 shadow-none border border-stroke">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stroke">
              <span className="text-xs">👤</span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
                [ ব্যক্তিগত তথ্য ]
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 text-xs">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                  নাম
                </p>
                <p className="font-bold text-xs px-4 py-2.5 rounded-none border border-stroke text-foreground bg-stone-50/30">
                  {user?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                  ইমেইল
                </p>
                <p className="font-bold text-xs px-4 py-2.5 rounded-none border border-stroke text-foreground bg-stone-50/30">
                  {user?.email ?? "—"}
                </p>
              </div>
              {user?.phone && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                    ফোন
                  </p>
                  <p className="font-bold text-xs px-4 py-2.5 rounded-none border border-stroke text-foreground bg-stone-50/30">
                    {user.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Addresses Card */}
          <div className="rounded-none bg-white p-6 sm:p-8 shadow-none border border-stroke">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stroke">
              <div className="flex items-center gap-3">
                <span className="text-xs">📍</span>
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
                  [ ঠিকানা ]
                </h2>
              </div>
              <button
                onClick={() => { resetForm(); setShowAddressForm((o) => !o); }}
                className="text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
              >
                {showAddressForm && !editingAddress ? "বাতিল" : "+ নতুন ঠিকানা"}
              </button>
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <form
                onSubmit={handleSaveAddress}
                className="mb-6 rounded-none border p-5 space-y-4 border-stroke bg-stone-50/50"
              >
                <p className="text-xs font-extrabold uppercase tracking-widest border-b pb-2 border-stroke text-foreground">
                  {editingAddress ? "ঠিকানা আপডেট" : "নতুন ঠিকানা যোগ করুন"}
                </p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {FIELDS.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                        {label}
                      </label>
                      <input
                        type="text"
                        required={key !== "addressLine2"}
                        value={addressForm[key as keyof typeof addressForm]}
                        onChange={(e) => setAddressForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full rounded-none border bg-white px-4 py-2.5 text-xs font-semibold outline-none transition-all border-stroke text-foreground"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="rounded-none px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors disabled:opacity-50 btn-premium"
                  >
                    {savingAddress ? "সেভ হচ্ছে..." : editingAddress ? "আপডেট" : "সেভ"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-none border bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-stroke text-stone-500 hover:border-foreground"
                  >
                    বাতিল
                  </button>
                </div>
              </form>
            )}

            {/* Address Cards List */}
            {loadingAddresses ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-stone-100 rounded-none border border-stroke" />
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8 rounded-none border border-dashed border-stroke">
                <p className="text-xs font-semibold text-stone-500">
                  এখনো কোনো ঠিকানা যোগ করা হয়নি। উপরে থেকে নতুন ঠিকানা যোগ করুন।
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="rounded-none border p-5 flex flex-col justify-between transition-all"
                    style={{
                      borderColor: addr.isDefault ? "var(--store-primary)" : "var(--store-border)",
                      backgroundColor: addr.isDefault ? "var(--store-primary-light)" : "#fff",
                    }}
                  >
                    <div className="text-xs text-foreground">
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-stroke">
                        <p className="font-bold tracking-wide text-foreground">{addr.fullName}</p>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white bg-primary">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 font-semibold leading-relaxed text-stone-605">
                        <p>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                        <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="uppercase tracking-widest text-[9px] text-stone-400">{addr.country}</p>
                        <p className="font-bold mt-1.5 text-primary">{addr.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 border-t pt-4 mt-4 text-[9px] font-bold uppercase tracking-widest justify-end border-stroke text-stone-500">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="transition cursor-pointer hover:text-foreground"
                        >
                          ডিফল্ট করুন
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(addr)}
                        className="transition cursor-pointer hover:text-foreground text-primary"
                      >
                        এডিট
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        disabled={deletingAddress === addr.id}
                        className="transition text-red-500 cursor-pointer disabled:opacity-50 hover:text-red-700"
                      >
                        ডিলিট
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
