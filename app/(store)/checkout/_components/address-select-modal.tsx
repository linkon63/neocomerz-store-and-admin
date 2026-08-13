"use client";

import { LuX, LuMapPin, LuCheck, LuLoader } from "react-icons/lu";
import type { SavedAddress } from "@/lib/storefront-api";

interface AddressSelectModalProps {
  open: boolean;
  onClose: () => void;
  addresses: SavedAddress[];
  selectedAddressId: string | "new";
  onSelect: (addr: SavedAddress) => void;
  loading?: boolean;
}

export default function AddressSelectModal({
  open,
  onClose,
  addresses,
  selectedAddressId,
  onSelect,
  loading = false,
}: AddressSelectModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 shrink-0">
          <div>
            <h3 className="font-bembo text-xl text-[#4A4A4A]">Saved Addresses</h3>
            <p className="font-gotham text-xs text-stone-500 mt-1">Select an address from your profile to pre-fill the checkout form.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <LuX className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-500 font-gotham text-sm gap-2">
              <LuLoader className="w-6 h-6 animate-spin text-[#A3926B]" />
              <span>Loading addresses...</span>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12">
              <LuMapPin className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="font-gotham text-sm text-[#4A4A4A] font-medium">No saved addresses found</p>
              <p className="font-gotham text-xs text-[#999999] mt-1">Add a new address during checkout to save it to your profile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => {
                      onSelect(addr);
                      onClose();
                    }}
                    className={`border p-4 rounded-lg cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-stone-400 ${
                      isSelected
                        ? "border-[#A3926B] bg-[#FDFBF7] shadow-sm"
                        : "border-zinc-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <LuMapPin className={`w-5 h-5 mt-0.5 shrink-0 ${isSelected ? "text-[#A3926B]" : "text-stone-400"}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-gotham text-sm font-semibold text-[#222222]">
                            {addr.fullName}
                          </span>
                          {addr.isDefault && (
                            <span className="bg-stone-100 text-stone-600 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded font-gotham">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="font-gotham text-xs text-[#555555] mb-1">{addr.phone}</p>
                        <p className="font-gotham text-xs text-[#777777] leading-relaxed">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                          {`, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 self-end sm:self-center">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? "border-[#A3926B] bg-[#A3926B]" : "border-zinc-300"
                        }`}
                      >
                        {isSelected && <LuCheck className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 flex justify-end shrink-0 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-zinc-300 text-stone-700 font-gotham text-xs uppercase tracking-wider rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
