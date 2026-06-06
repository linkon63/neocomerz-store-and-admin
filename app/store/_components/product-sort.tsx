"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "popular";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "নতুন আম আগে (Newest)" },
  { value: "popular", label: "জনপ্রিয় আম (Popular)" },
  { value: "price-asc", label: "দাম: কম থেকে বেশি" },
  { value: "price-desc", label: "দাম: বেশি থেকে কম" },
  { value: "name-asc", label: "নাম অনুসারে (ক - হ)" },
  { value: "name-desc", label: "নাম অনুসারে (হ - ক)" },
];

export function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = (searchParams.get("sort") as SortOption) ?? "newest";

  function handleSort(value: SortOption) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page"); // Reset to page 1 when sorting
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="sort" className="text-xs font-bold text-[var(--store-text-muted)]">
        সাজান (Sort by):
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={(e) => handleSort(e.target.value as SortOption)}
        className="border border-[var(--store-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--store-text)] focus:outline-none focus:ring-2 focus:ring-[#15803d]/10 focus:border-[#15803d] transition cursor-pointer"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
