"use client";

import { useState, useEffect, useCallback } from "react";
import { FiMapPin, FiPlus, FiTrash2, FiEdit2, FiX, FiLoader } from "react-icons/fi";
import { toast } from "sonner";
import { getCustomerToken } from "@/lib/storefront-api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

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

export default function AddressBookView() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [submittingAddress, setSubmittingAddress] = useState(false);
  
  const [addressFormData, setAddressFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Bangladesh",
    isDefault: false
  });

  const fetchAddresses = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) return;

    setAddressesLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/profile/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAddressForm = (addr?: Address) => {
    if (addr) {
      setEditingAddress(addr);
      setAddressFormData({
        fullName: addr.fullName,
        phone: addr.phone,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || "",
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        isDefault: addr.isDefault
      });
    } else {
      setEditingAddress(null);
      setAddressFormData({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Bangladesh",
        isDefault: false
      });
    }
    setAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCustomerToken();
    if (!token) {
      toast.error("Please login to save address.");
      return;
    }

    setSubmittingAddress(true);
    try {
      const url = editingAddress
        ? `${BASE_URL}/profile/addresses/${editingAddress.id}`
        : `${BASE_URL}/profile/addresses`;
      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(addressFormData)
      });

      if (res.ok) {
        toast.success(editingAddress ? "Address updated!" : "Address saved!");
        setAddressModalOpen(false);
        fetchAddresses();
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to save address.");
      }
    } catch (err) {
      toast.error("Failed to save address details.");
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    const token = getCustomerToken();
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/profile/addresses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        toast.success("Address deleted.");
        fetchAddresses();
      } else {
        toast.error("Failed to delete address.");
      }
    } catch (err) {
      toast.error("An error occurred while deleting address.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.16em] uppercase text-zinc-400 mb-1">
            Address Book
          </h2>
          <p className="font-['Bembo_Std'] text-zinc-650 text-base italic">
            Manage your billing and shipping address locations.
          </p>
        </div>
        <button
          onClick={() => openAddressForm()}
          className="flex items-center gap-2 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-5 py-2.5 rounded-full text-zinc-800 font-sans text-[10px] tracking-wider uppercase transition cursor-pointer"
        >
          <FiPlus className="text-xs" />
          ADD NEW
        </button>
      </div>

      {addressesLoading ? (
        <div className="flex justify-center py-16">
          <FiLoader className="w-8 h-8 text-[#C5B382] animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-200">
          <FiMapPin className="mx-auto text-4xl text-zinc-300 mb-4" />
          <p className="font-sans text-sm text-zinc-500">
            No saved addresses found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr.id} className="relative border border-stone-250 p-5 rounded-md flex flex-col justify-between h-48 bg-stone-50">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-sans font-bold text-xs uppercase text-zinc-800 tracking-wider">
                    {addr.fullName}
                  </h4>
                  {addr.isDefault && (
                    <span className="bg-[#C5B382]/20 border border-[#C5B382] text-zinc-800 text-[9px] px-2 py-0.5 rounded font-sans font-bold tracking-wider uppercase">
                      Default
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-zinc-500 line-clamp-2">
                  {addr.addressLine1} {addr.addressLine2 && `, ${addr.addressLine2}`}
                </p>
                <p className="font-sans text-xs text-zinc-500">
                  {addr.city}, {addr.state} - {addr.postalCode}
                </p>
                <p className="font-sans text-xs text-zinc-500">
                  {addr.country}
                </p>
                <p className="font-sans text-xs text-zinc-650 font-semibold pt-1">
                  Ph: {addr.phone}
                </p>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-stone-200/80">
                <button
                  onClick={() => openAddressForm(addr)}
                  className="flex items-center gap-1.5 text-zinc-500 hover:text-black font-sans text-[10px] tracking-wider uppercase transition cursor-pointer"
                >
                  <FiEdit2 className="text-xs" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="flex items-center gap-1.5 text-red-500 hover:text-red-700 font-sans text-[10px] tracking-wider uppercase transition cursor-pointer"
                >
                  <FiTrash2 className="text-xs" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADDRESS MODAL COMPONENT (Slide/Popup) */}
      {addressModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-250 max-w-lg w-full rounded shadow-xl overflow-hidden relative animate-fadeIn">
            <button
              onClick={() => setAddressModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
              aria-label="Close form modal"
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h3 className="font-['Bembo_Std'] text-2xl text-neutral-850">
                  {editingAddress ? "Edit Shipping Address" : "Add New Address"}
                </h3>
              </div>

              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={addressFormData.fullName}
                      onChange={(e) => setAddressFormData({ ...addressFormData, fullName: e.target.value })}
                      className="w-full border border-stone-200 px-4 py-2.5 rounded text-sm focus:border-stone-400 outline-none font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={addressFormData.phone}
                      onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                      className="w-full border border-stone-200 px-4 py-2.5 rounded text-sm focus:border-stone-400 outline-none font-sans"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={addressFormData.addressLine1}
                    onChange={(e) => setAddressFormData({ ...addressFormData, addressLine1: e.target.value })}
                    className="w-full border border-stone-200 px-4 py-2.5 rounded text-sm focus:border-stone-400 outline-none font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressFormData.addressLine2}
                    onChange={(e) => setAddressFormData({ ...addressFormData, addressLine2: e.target.value })}
                    className="w-full border border-stone-200 px-4 py-2.5 rounded text-sm focus:border-stone-400 outline-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={addressFormData.city}
                      onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                      className="w-full border border-stone-200 px-4 py-2.5 rounded text-sm focus:border-stone-400 outline-none font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={addressFormData.state}
                      onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                      className="w-full border border-stone-200 px-4 py-2.5 rounded text-sm focus:border-stone-400 outline-none font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      ZIP / Postal Code *
                    </label>
                    <input
                      type="text"
                      value={addressFormData.postalCode}
                      onChange={(e) => setAddressFormData({ ...addressFormData, postalCode: e.target.value })}
                      className="w-full border border-stone-200 px-4 py-2.5 rounded text-sm focus:border-stone-400 outline-none font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={addressFormData.country}
                      onChange={(e) => setAddressFormData({ ...addressFormData, country: e.target.value })}
                      className="w-full border border-stone-200 px-4 py-2.5 rounded text-sm focus:border-stone-400 outline-none font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="addressDefaultCheck"
                    checked={addressFormData.isDefault}
                    onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-black border-stone-200 focus:ring-[#C5B382] rounded"
                  />
                  <label htmlFor="addressDefaultCheck" className="font-sans text-xs text-zinc-650 cursor-pointer">
                    Set as default address location
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setAddressModalOpen(false)}
                    className="flex-grow bg-white hover:bg-stone-50 border border-stone-200 rounded py-3 font-sans text-xs tracking-wider uppercase transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAddress}
                    className="flex-grow bg-[#1A1A1A] hover:bg-stone-850 text-white rounded py-3 font-sans text-xs font-semibold tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    {submittingAddress ? <FiLoader className="animate-spin text-white" /> : "SAVE"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
