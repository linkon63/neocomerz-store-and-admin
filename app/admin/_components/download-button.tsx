"use client";

import { useState } from "react";
import { downloadReport } from "../../../lib/admin-api";

export function DownloadButton({
  endpoint,
  dateValue,
}: {
  endpoint: string;
  dateValue: { startDate: Date | string | null; endDate: Date | string | null };
}) {
  const [open, setOpen] = useState(false);

  function buildParams() {
    const params: Record<string, string> = {};
    if (dateValue.startDate) {
      params.startDate =
        typeof dateValue.startDate === "string"
          ? dateValue.startDate
          : dateValue.startDate.toISOString().split("T")[0];
    }
    if (dateValue.endDate) {
      params.endDate =
        typeof dateValue.endDate === "string"
          ? dateValue.endDate
          : dateValue.endDate.toISOString().split("T")[0];
    }
    return params;
  }

  async function handleDownload(format: "csv" | "pdf") {
    setOpen(false);
    await downloadReport(endpoint, format, buildParams());
  }

  return (
    <div className="relative">
      <button
        className="flex h-14 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 font-black shadow-sm transition hover:bg-slate-50"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        type="button"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        Download
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <button
            className="w-full px-4 py-2 text-left font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => handleDownload("csv")}
            type="button"
          >
            CSV
          </button>
          <button
            className="w-full px-4 py-2 text-left font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => handleDownload("pdf")}
            type="button"
          >
            PDF
          </button>
        </div>
      )}
    </div>
  );
}