"use client";

import { useEffect, useState } from "react";

export interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  media?: Array<{
    isFeatured: boolean;
    media?: { url: string };
  }>;
  variants?: Array<{
    price: number;
    isDefault: boolean;
  }>;
}

export function useProductSearch(query: string) {
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.length < 2) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/v1/search/products?search=${encodeURIComponent(query)}&limit=5`,
        );
        if (!res.ok) throw new Error("Search request failed");
        const json = await res.json();
        setResults(json.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, isSearching };
}
