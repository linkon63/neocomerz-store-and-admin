"use client";

import { useEffect, useRef, useState } from "react";

export function RichDropdown<T extends string>({
  value,
  options,
  onChange,
  getTone,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  getTone: (val: T) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-28 items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 hover:border-slate-400 cursor-pointer shadow-xs"
      >
        <span className={`inline-flex rounded border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getTone(value)}`}>
          {selectedOption.label}
        </span>
        <svg
          className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-md ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer text-left ${
                    isSelected ? "bg-slate-50 text-slate-900" : "text-slate-600 hover:bg-slate-50/70 hover:text-slate-900"
                  }`}
                >
                  <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold capitalize ${getTone(opt.value)}`}>
                    {opt.label}
                  </span>
                  {isSelected && (
                    <svg className="h-3.5 w-3.5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
