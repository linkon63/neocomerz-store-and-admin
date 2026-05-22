"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchApi, productsApi, type Product } from "@/lib/store-api";
import { ProductCard } from "../_components/product-card";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-6 w-40 rounded-lg bg-gray-100" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(q);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    productsApi.list({ search: q, limit: 20 })
      .then((res) => { setProducts(res.data); setTotal(res.meta.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q]);

  function handleInputChange(val: string) {
    setQuery(val);
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (val.length < 2) { setSuggestions([]); return; }
    suggestTimer.current = setTimeout(async () => {
      try {
        const s = await searchApi.suggestions(val);
        setSuggestions(s.slice(0, 6));
        setShowSuggestions(true);
      } catch { /* ignore */ }
    }, 300);
  }

  function handleSearch(val?: string) {
    const term = val ?? query;
    if (!term.trim()) return;
    setShowSuggestions(false);
    router.push(`/store/search?q=${encodeURIComponent(term.trim())}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-1 border-b pb-5" style={{ borderColor: "var(--store-border)" }}>
        <h1 className="text-[26px] font-black tracking-tight" style={{ color: "var(--store-text)" }}>
          Search Products
        </h1>
        <p className="text-[13px]" style={{ color: "var(--store-text-muted)" }}>
          Find products, categories, or brands quickly
        </p>
      </div>

      {/* Search input */}
      <div className="relative mb-10">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Type product, brand, or category..."
              className="w-full rounded-xl border px-4 py-3 text-[14px] font-medium outline-none transition-all pr-12"
              style={{
                borderColor: "var(--store-border)",
                backgroundColor: "var(--store-white)",
                color: "var(--store-text)",
              }}
              autoFocus
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: "var(--store-text-muted)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-xl border bg-white shadow-xl py-2 z-50"
                style={{ borderColor: "var(--store-border)" }}
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => handleSearch(s)}
                    className="block w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors hover:bg-slate-50"
                    style={{ color: "var(--store-text-muted)" }}
                  >
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => handleSearch()}
            className="rounded-xl px-6 py-3 text-[13px] font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--store-primary)" }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      {q && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-6">
            {loading
              ? "Searching..."
              : `${total} result${total !== 1 ? "s" : ""} found for "${q}"`}
          </p>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-white border animate-pulse" style={{ borderColor: "var(--store-border)" }}>
                  <div className="aspect-[3/4] bg-gray-100 rounded-t-2xl" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-white border p-12 text-center" style={{ borderColor: "var(--store-border)" }}>
              <p className="text-2xl mb-3">🔍</p>
              <p className="text-[16px] font-bold" style={{ color: "var(--store-text)" }}>
                No products found
              </p>
              <p className="mt-2 text-[13px]" style={{ color: "var(--store-text-muted)" }}>
                Please try again with a different keyword.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {!q && (
        <div className="rounded-2xl bg-white border p-12 text-center" style={{ borderColor: "var(--store-border)" }}>
          <p className="text-2xl mb-3">✨</p>
          <p className="text-[16px] font-bold" style={{ color: "var(--store-text)" }}>
            Find Your Favorite Products
          </p>
          <p className="mt-2 text-[13px]" style={{ color: "var(--store-text-muted)" }}>
            Start searching by typing in the search box above.
          </p>
        </div>
      )}
    </div>
  );
}
