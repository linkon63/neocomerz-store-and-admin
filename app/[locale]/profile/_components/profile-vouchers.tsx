"use client";

export default function ProfileVouchers() {
  return (
    <div>
      <h2 className="font-bembo text-3xl font-bold">Gift Vouchers</h2>
      <p className="mt-2 text-sm text-neutral-500">Redeem and manage your gift vouchers</p>

      <div className="mt-8 space-y-4">
        <div className="border-2 border-dashed border-neutral-300 px-5 py-8 text-center">
          <p className="text-sm text-neutral-500">You don&apos;t have any gift vouchers yet.</p>
          <button
            type="button"
            className="mt-4 inline-block bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
          >
            Purchase a gift voucher
          </button>
        </div>

        <div className="mt-8 border-t border-neutral-200 pt-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.08em]">Redeem a voucher</h3>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Enter voucher code"
              className="min-w-0 flex-1 border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
            />
            <button
              type="button"
              className="bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
