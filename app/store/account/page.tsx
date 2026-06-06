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
    city: "", state: "", postalCode: "", country: "BD",
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
    setAddressForm({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "BD" });
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
    setConfirmDeleteId(id);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    setDeletingAddress(confirmDeleteId);
    setConfirmDeleteId(null);
    try {
      await addressApi.delete(confirmDeleteId);
      setAddresses((prev) => prev.filter((a) => a.id !== confirmDeleteId));
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
    { key: "fullName", label: "পূর্ণ নাম (Full Name)", placeholder: "যেমন: মোঃ আব্দুল্লাহ" },
    { key: "phone", label: "মোবাইল নম্বর (Phone)", placeholder: "যেমন: ০১৭০৭৮১৯৬৭৬" },
    { key: "addressLine1", label: "ঠিকানা লাইন ১ (Address Line 1)", placeholder: "যেমন: চকমুক্তার, নওগাঁ সদর" },
    { key: "addressLine2", label: "ঠিকানা লাইন ২ - ঐচ্ছিক (Address Line 2)", placeholder: "যেমন: ফ্ল্যাট নম্বর/চিহ্ন" },
    { key: "city", label: "শহর (City)", placeholder: "যেমন: নওগাঁ" },
    { key: "state", label: "বিভাগ (State)", placeholder: "যেমন: রাজশাহী" },
    { key: "postalCode", label: "পোস্ট কোড (Postal Code)", placeholder: "যেমন: ৬৫০০" },
    { key: "country", label: "দেশ (Country)", placeholder: "Bangladesh" },
  ];

  return (
    <div className="w-full px-6 py-10 sm:px-12 lg:px-16 min-h-[calc(100vh-280px)] font-sans">
      <div className="mb-8 flex flex-col gap-1 border-b pb-5 border-stone-200">
        <h1 className="text-2xl font-bold font-serif uppercase text-stone-850">
          আমার অ্যাকাউন্ট
        </h1>
        <p className="text-xs text-stone-500 font-semibold tracking-wide">
          প্রোফাইল এবং ঠিকানা ব্যবস্থাপনা (Profile & Addresses)
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        
        {/* Navigation Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-5 shadow-xs border border-stone-200">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 text-white flex items-center justify-center font-bold text-sm bg-[#15803d] shadow-xs">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs truncate text-stone-850">
                  {user?.name}
                </p>
                <p className="text-[10px] text-stone-500 truncate mt-0.5 font-medium">
                  {user?.email}
                </p>
              </div>
            </div>

            <nav className="space-y-1 text-xs">
              {[
                { href: "/store/account", label: "অ্যাকাউন্ট (Profile)", icon: "👤", active: true },
                { href: "/store/orders", label: "অর্ডারসমূহ (Orders)", icon: "📦" },
                { href: "/store/wishlist", label: "পছন্দের তালিকা (Wishlist)", icon: "♡" },
                { href: "/store/cart", label: "শপিং কার্ট (Cart)", icon: "🛒" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 font-semibold transition-all border duration-200"
                  style={
                    item.active
                      ? {
                          backgroundColor: "#15803d",
                          color: "#ffffff",
                          borderColor: "#15803d",
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
                className="flex w-full items-center gap-3 px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50 transition border border-transparent cursor-pointer"
              >
                <span className="text-xs">🚪</span>
                <span>লগআউট (Logout)</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white p-6 shadow-xs border border-stone-200">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
              <span className="text-[#15803d]">👤</span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#15803d] font-display">
                ব্যক্তিগত তথ্য (Personal Info)
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 text-xs">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5 font-display">
                  নাম
                </p>
                <p className="font-bold text-xs px-4 py-3 border border-stone-200 text-stone-800 bg-stone-50/50">
                  {user?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5 font-display">
                  ইমেইল
                </p>
                <p className="font-bold text-xs px-4 py-3 border border-stone-200 text-stone-800 bg-stone-50/50">
                  {user?.email ?? "—"}
                </p>
              </div>
              {user?.phone && (
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5 font-display">
                    ফোন
                  </p>
                  <p className="font-bold text-xs px-4 py-3 border border-stone-200 text-stone-800 bg-stone-50/50">
                    {user.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Addresses Card */}
          <div className="bg-white p-6 sm:p-8 shadow-xs border border-stone-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <span className="text-[#15803d]">📍</span>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#15803d] font-display">
                  ঠিকানা তালিকা (Addresses)
                </h2>
              </div>
              <button
                onClick={() => { resetForm(); setShowAddressForm((o) => !o); }}
                className="text-xs font-bold uppercase tracking-wider text-[#15803d] hover:text-[#166534] hover:underline cursor-pointer transition"
              >
                {showAddressForm && !editingAddress ? "বাতিল" : "+ নতুন ঠিকানা যোগ করুন"}
              </button>
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <form
                onSubmit={handleSaveAddress}
                className="mb-6 border p-6 space-y-4 border-stone-200 bg-stone-50 shadow-xs"
              >
                <p className="text-xs font-black uppercase tracking-widest border-b pb-2 border-stone-200 text-stone-800 font-display">
                  {editingAddress ? "ঠিকানা পরিবর্তন করুন" : "নতুন ঠিকানা যোগ করুন"}
                </p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {FIELDS.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[9px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5 font-display">
                        {label}
                      </label>
                      <input
                        type="text"
                        required={key !== "addressLine2"}
                        value={addressForm[key as keyof typeof addressForm]}
                        onChange={(e) => setAddressForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full border bg-white px-4 py-2.5 text-xs font-semibold outline-none transition-all border-stone-250 text-stone-850 focus:border-[#15803d] focus:ring-1 focus:ring-[#15803d]"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all disabled:opacity-50 btn-premium cursor-pointer"
                  >
                    {savingAddress ? "সেভ হচ্ছে..." : editingAddress ? "আপডেট করুন" : "সেভ করুন"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="border bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-stone-250 text-stone-500 hover:border-stone-400 hover:bg-stone-50 cursor-pointer"
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
                  <div key={i} className="h-24 bg-stone-100 border border-stone-200" />
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-stone-300 bg-stone-50/20">
                <p className="text-xs font-bold text-stone-500">
                  এখনো কোনো ঠিকানা যোগ করা হয়নি। উপরে থেকে নতুন ঠিকানা যোগ করুন।
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="border p-5 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-sm"
                    style={{
                      borderColor: addr.isDefault ? "#15803d" : "var(--store-border)",
                      backgroundColor: addr.isDefault ? "#f0fdf4" : "#fff",
                    }}
                  >
                    <div className="text-xs text-stone-855">
                      <div className="flex items-center justify-between mb-2.5 pb-2.5 border-b border-stone-200/60">
                        <p className="font-bold tracking-wide text-stone-855">{addr.fullName}</p>
                        {addr.isDefault && (
                          <span className="px-2.5 py-0.5 text-[8px] font-extrabold uppercase tracking-widest text-white bg-[#15803d] shadow-xs">
                            ডিফল্ট (Default)
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 font-semibold leading-relaxed text-stone-600">
                        <p>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                        <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="uppercase tracking-widest text-[9px] text-stone-400 font-extrabold">{addr.country}</p>
                        <p className="font-bold mt-1.5 text-[#15803d]">{addr.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 border-t pt-4 mt-4 text-[9px] font-bold uppercase tracking-widest justify-end border-stone-200/60 text-stone-500">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="transition cursor-pointer hover:text-[#15803d]"
                        >
                          ডিফল্ট করুন
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(addr)}
                        className="transition cursor-pointer hover:text-[#15803d] text-[#15803d]"
                      >
                        এডিট
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        disabled={deletingAddress === addr.id}
                        className="transition text-rose-600 cursor-pointer disabled:opacity-50 hover:text-rose-800"
                      >
                        {deletingAddress === addr.id ? "মুছছে..." : "ডিলিট"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline delete confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white border border-stone-200 p-6 shadow-lg max-w-sm w-full" style={{ borderRadius: "6px" }}>
            <h3 className="font-bold text-sm text-stone-900 mb-2">ঠিকানা মুছবেন?</h3>
            <p className="text-xs text-stone-500 font-semibold mb-5">এই ঠিকানাটি স্থায়ীভাবে মুছে ফেলা হবে।</p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wide py-2.5 cursor-pointer transition"
                style={{ borderRadius: "4px" }}
              >
                হ্যাঁ, মুছুন
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 border border-stone-200 hover:border-stone-400 text-stone-600 text-xs font-bold uppercase tracking-wide py-2.5 cursor-pointer transition"
                style={{ borderRadius: "4px" }}
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
