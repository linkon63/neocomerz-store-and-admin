"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";
import type { PolicyEntry } from "@/lib/shop-api";

export interface PolicyModalProps {
  policy: PolicyEntry & { key: string };
  onClose: () => void;
}

export function PolicyModal({ policy, onClose }: PolicyModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler, { passive: true });
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-neutral-900 border border-[#b4a676]/30 rounded-2xl flex flex-col max-h-[calc(100vh-96px)] shadow-2xl p-6 md:p-8 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-zinc-400 hover:text-[#b4a676] transition-colors p-2 rounded-full hover:bg-white/5 cursor-pointer"
          aria-label="Close policy modal"
        >
          <LuX className="w-5 h-5" />
        </button>

        <h3
          id="policy-modal-title"
          className="font-['Cormorant_Garamond'] text-2xl md:text-3xl text-[#b4a676] font-medium tracking-wide border-b border-[#b4a676]/20 pb-4 mb-4 pr-12"
        >
          {policy.title}
        </h3>

        <div
          className="flex-1 overflow-y-auto pr-1 text-zinc-300 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: policy.content }}
        />

        <div className="mt-5 flex justify-end border-t border-white/10 pt-4 shrink-0">
          <button
            onClick={onClose}
            className="bg-[#b4a676] hover:bg-[#a39465] text-zinc-950 font-bold px-6 py-2 rounded-full transition-colors text-xs tracking-wider uppercase cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined" ? createPortal(modal, document.body) : null;
}
