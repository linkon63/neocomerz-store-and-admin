"use client";

import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

const placeholderAddresses = [
  {
    label: "Shipping Address",
    name: "Alex Johnson",
    street: "Via Roma 42",
    city: "Milan",
    province: "MI",
    postcode: "20121",
    country: "Italy",
    isDefault: true,
  },
];

export default function ProfileAddresses() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bembo text-3xl font-bold">Addresses</h2>
          <p className="mt-2 text-sm text-neutral-500">Manage your shipping and billing addresses</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 bg-black px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white"
        >
          <FiPlus className="text-sm" />
          Add New
        </button>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {placeholderAddresses.length === 0 ? (
          <p className="col-span-full rounded-lg border border-dashed border-neutral-300 px-5 py-12 text-center text-sm text-neutral-500 sm:col-span-2">
            No addresses saved yet.
          </p>
        ) : (
          placeholderAddresses.map((addr, i) => (
            <div key={i} className="relative border border-neutral-200 px-5 py-5">
              {addr.isDefault && (
                <span className="absolute right-3 top-3 rounded bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
                  Default
                </span>
              )}
              <p className="text-xs font-bold uppercase tracking-[0.08em]">{addr.label}</p>
              <p className="mt-3 text-sm font-semibold">{addr.name}</p>
              <p className="mt-1 text-sm text-neutral-600">
                {addr.street}
              </p>
              <p className="text-sm text-neutral-600">
                {addr.city}, {addr.province} {addr.postcode}
              </p>
              <p className="text-sm text-neutral-600">{addr.country}</p>
              <div className="mt-4 flex gap-3 border-t border-neutral-100 pt-3">
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] transition hover:text-neutral-500"
                >
                  <FiEdit2 className="text-xs" />
                  Edit
                </button>
                <button
                  type="button"
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
    </div>
  );
}
