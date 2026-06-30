import React from "react";

export function EditProductSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded bg-slate-200" />
          <div className="h-4 w-72 rounded bg-slate-200" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 rounded bg-slate-200" />
          <div className="h-10 w-24 rounded bg-slate-200" />
          <div className="h-10 w-32 rounded bg-slate-200" />
        </div>
      </div>

      <div className="space-y-6">
        {/* General Info Skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-4 w-12 rounded bg-slate-200" />
              <div className="h-11 rounded-lg bg-slate-100" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-12 rounded bg-slate-200" />
              <div className="h-11 rounded-lg bg-slate-100" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-28 rounded-lg bg-slate-100" />
            </div>
          </div>
        </div>

        {/* Media Skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="h-5 w-20 rounded bg-slate-200" />
          <div className="h-24 rounded-xl bg-slate-100 border border-dashed border-slate-300" />
        </div>
      </div>
    </div>
  );
}
