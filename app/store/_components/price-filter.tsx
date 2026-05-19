"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function PriceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") ?? "");
    setMaxPrice(searchParams.get("maxPrice") ?? "");
  }, [searchParams]);

  function handleApply() {
    const params = new URLSearchParams(searchParams.toString());
    
    if (minPrice) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }
    
    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }
    
    params.delete("page"); // Reset to page 1
    router.push(`?${params.toString()}`);
  }

  function handleClear() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");
    setMinPrice("");
    setMaxPrice("");
    router.push(`?${params.toString()}`);
  }

  const hasFilter = minPrice || maxPrice;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
        Price Range
      </h3>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-full rounded-xl border border-stroke bg-background px-4 py-2.5 text-xs font-semibold placeholder-[#A0A09A] focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all text-foreground"
        />
        <span className="text-[#A0A09A] font-light">—</span>
        <input
          type="number"
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full rounded-xl border border-stroke bg-background px-4 py-2.5 text-xs font-semibold placeholder-[#A0A09A] focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all text-foreground"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="flex-1 rounded-xl bg-gold px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-black hover:bg-gold-dark transition-colors shadow-sm"
        >
          Apply Price
        </button>
        {hasFilter && (
          <button
            onClick={handleClear}
            className="rounded-xl border border-stroke bg-surface px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-foreground/75 hover:bg-surface-muted transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
