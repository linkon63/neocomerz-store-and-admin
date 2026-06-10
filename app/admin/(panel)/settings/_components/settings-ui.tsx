"use client";

import type { ReactNode } from "react";
import { AdminIcon } from "../../../_components/admin-shell";

// ─── SettingsCard ─────────────────────────────────────────────────────────────

// ─── SettingsCard ─────────────────────────────────────────────────────────────

export function SettingsCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-xs">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
        <div>
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          {description && (
            <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="px-6 py-6 sm:px-8">{children}</div>
    </section>
  );
}

// ─── FieldLabel ───────────────────────────────────────────────────────────────

export function FieldLabel({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-black text-slate-700">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  disabled,
  min,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string | number;
}) {
  return (
    <input
      className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
      disabled={disabled}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      type={type}
      value={value}
    />
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      value={value}
    />
  );
}

// ─── StatusToggle ─────────────────────────────────────────────────────────────

export function StatusToggle({
  active,
  onChange,
}: {
  active: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <button
      aria-checked={active}
      className={`inline-flex h-7 w-12 items-center rounded-full p-1 transition-colors ${
        active ? "bg-slate-900" : "bg-slate-200"
      }`}
      onClick={() => onChange?.(!active)}
      role="switch"
      type="button"
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
          active ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── SaveButton ───────────────────────────────────────────────────────────────

export function SaveButton({
  onClick,
  saving,
  children,
}: {
  onClick?: () => void;
  saving?: boolean;
  children?: ReactNode;
}) {
  return (
    <button
      className="inline-flex h-11 items-center gap-2 rounded-md bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
      disabled={saving}
      onClick={onClick}
      type={onClick ? "button" : "submit"}
    >
      <AdminIcon className="h-4 w-4" name="check" />
      {saving ? "Saving..." : (children ?? "Save Changes")}
    </button>
  );
}

// ─── ErrorBanner ─────────────────────────────────────────────────────────────

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</p>
  );
}

// ─── SuccessBanner ────────────────────────────────────────────────────────────

export function SuccessBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-md bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{message}</p>
  );
}
