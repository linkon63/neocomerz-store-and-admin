"use client";

import { AdminIcon } from "./admin-shell";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  error?: string | null;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
  error,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold" id="confirm-modal-title">
              {title}
            </h2>
            <p className="mt-1 font-medium text-slate-600">
              {message}
            </p>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-xl font-medium text-slate-600"
            onClick={onClose}
            type="button"
          >
            <AdminIcon className="h-5 w-5" name="x" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            className="h-12 rounded-lg border border-slate-300 bg-white px-5 font-medium text-slate-700"
            onClick={onClose}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className={`inline-flex h-12 items-center gap-2 rounded-lg px-5 font-medium text-white ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
