"use client";

import { FiPlus, FiTrash2 } from "react-icons/fi";

export default function ProfilePaymentMethods() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bembo text-3xl font-bold">Payment Methods</h2>
          <p className="mt-2 text-sm text-neutral-500">Manage your saved payment methods</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 bg-black px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white"
        >
          <FiPlus className="text-sm" />
          Add Card
        </button>
      </div>

      <div className="mt-8 space-y-4">
        <div className="border-2 border-dashed border-neutral-300 px-5 py-12 text-center">
          <p className="text-sm text-neutral-500">No payment methods saved.</p>
          <p className="mt-1 text-xs text-neutral-400">
            Your payment details will be stored securely for faster checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
