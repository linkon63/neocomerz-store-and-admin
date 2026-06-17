"use client";

import { FiDownload } from "react-icons/fi";

const placeholderDownloads = [
  { name: "Style Guide 2024", date: "12 Mar 2024", fileSize: "2.4 MB" },
  { name: "Lookbook Spring/Summer", date: "05 Jan 2024", fileSize: "8.1 MB" },
];

export default function ProfileDownloads() {
  return (
    <div>
      <h2 className="font-bembo text-3xl font-bold">Downloads</h2>
      <p className="mt-2 text-sm text-neutral-500">Access your purchased digital files</p>

      <div className="mt-8 space-y-4">
        {placeholderDownloads.length === 0 ? (
          <p className="rounded-lg border border-neutral-200 px-5 py-12 text-center text-sm text-neutral-500">
            No downloads available.
          </p>
        ) : (
          placeholderDownloads.map((dl, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center justify-between gap-4 border border-neutral-200 px-5 py-4"
            >
              <div>
                <p className="text-sm font-semibold">{dl.name}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {dl.date} · {dl.fileSize}
                </p>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 bg-black px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white"
              >
                <FiDownload className="text-sm" />
                Download
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
