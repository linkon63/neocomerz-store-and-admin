"use client";

import { AdminIcon } from "../../../_components/admin-shell";
import { type InventoryLogResponse } from "../../../../../lib/admin-api";

export function AdjustmentLogsModal({
  logs,
  onClose,
}: {
  logs: InventoryLogResponse[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black">Today&apos;s Adjustments</h2>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-500">
              {logs.length}
            </span>
          </div>
          <button
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
            type="button"
          >
            <AdminIcon className="h-5 w-5" name="x" />
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-10 font-medium text-slate-400">
            No adjustments today.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div className="py-3" key={log.id}>
                  <div className="flex items-center gap-4">
                    <span className="w-14 shrink-0 font-bold text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString("en", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {log.change > 0 ? (
                      <span className="w-20 shrink-0 font-black text-emerald-600">
                        +{log.change}
                      </span>
                    ) : (
                      <span className="w-20 shrink-0 font-black text-rose-600">
                        {log.change}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-800">
                        {log.variant.product.name}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {log.variant.sku}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="inline-block rounded-md border border-slate-200 px-2 py-0.5 text-xs font-bold capitalize text-slate-500">
                        {log.reason}
                      </span>
                      {log.note && (
                        <p className="mt-1 text-xs italic text-slate-400">
                          {log.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
