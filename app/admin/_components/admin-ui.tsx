import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md py-3.5 mb-6 border-b border-slate-200/80 shadow-2xs -mx-2 px-3 sm:-mx-4 sm:px-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center transition-all">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight truncate">{title}</h1>
        <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500 truncate">{description}</p>
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">{action}</div>}
    </header>
  );
}

export function StatusToggle({
  checked,
  onChange,
  disabled,
}: {
  checked?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
}) {
  const isOn = checked ?? true;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      disabled={disabled}
      onClick={() => onChange?.(!isOn)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
        isOn ? "bg-emerald-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          isOn ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function ProductThumb({ color, src, alt }: { color: string; src?: string; alt?: string }) {
  return (
    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-slate-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt ?? ''}
        className="h-full w-full object-full object-center"
        src={src ?? '/images/no-image-icon-6.png'}
      />
    </div>
  );
}
