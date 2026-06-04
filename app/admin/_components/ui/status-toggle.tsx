"use client";

export function StatusToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      aria-checked={checked}
      className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 border transition-all duration-300 ${
        checked
          ? "bg-emerald-600 border-emerald-600 shadow-sm shadow-emerald-500/20"
          : "bg-slate-200 border-slate-300"
      }`}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
