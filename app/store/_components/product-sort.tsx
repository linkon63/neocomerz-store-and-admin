"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "popular";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
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
      <label htmlFor="sort" className="text-sm font-semibold text-[var(--store-text-muted)]">
        Sort by:
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={(e) => handleSort(e.target.value as SortOption)}
        className="rounded-lg border border-[var(--store-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--store-text)] focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)] transition"
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
