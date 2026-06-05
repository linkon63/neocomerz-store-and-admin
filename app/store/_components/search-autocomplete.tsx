"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchApi, type Product, getProductImage, formatPrice, getDefaultVariant } from "@/lib/store-api";

export function SearchAutocomplete() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [sugRes, prodRes] = await Promise.all([
          searchApi.suggestions(query),
          searchApi.products(query)
        ]);
        setSuggestions(sugRes.slice(0, 5));
        setProducts(prodRes.data.slice(0, 4));
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/store/products?search=${encodeURIComponent(query)}`);
  }

  return (
    <div className="relative" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="আম খুঁজুন (Search mangoes)..."
          className="w-48 md:w-64 rounded-full border border-[var(--store-border)] bg-[var(--store-surface-2)] px-4 py-2 pl-10 text-sm focus:border-[var(--store-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--store-primary-mid)] transition-all"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--store-text-muted)]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </form>
 
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute right-0 top-full mt-2 w-[320px] md:w-[400px] rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden z-50 border border-stone-200/60">
          {loading ? (
            <div className="p-4 text-center text-sm text-[var(--store-text-muted)] font-semibold">অনুসন্ধান করা হচ্ছে...</div>
          ) : (
            <>
              {suggestions.length > 0 && (
                <div className="border-b border-[var(--store-border)] p-2">
                  <p className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--store-text-light)]">পরামর্শ (Suggestions)</p>
                  {suggestions.map((s, i) => (
                    <Link
                      key={i}
                      href={`/store/products?search=${encodeURIComponent(s)}`}
                      className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[var(--store-surface-2)] text-[#2E7D32] hover:text-[#1B5E20] transition"
                      onClick={() => setIsOpen(false)}
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              )}
 
              {products.length > 0 ? (
                <div className="p-2">
                  <p className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--store-text-light)]">আমসমূহ (Products)</p>
                  {products.map((p) => {
                    const variant = getDefaultVariant(p);
                    return (
                      <Link
                        key={p.id}
                        href={`/store/products/${p.slug}`}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[var(--store-surface-2)] transition"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-[var(--store-border)]">
                          <img src={getProductImage(p)} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[var(--store-text)]">{p.name}</p>
                          <p className="text-xs font-black text-[#2E7D32]">
                            {variant ? formatPrice(variant.price) : "—"}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                  <Link
                    href={`/store/products?search=${encodeURIComponent(query)}`}
                    className="mt-2 block rounded-lg bg-[#FFF8E7] px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-wider text-[#2E7D32] hover:bg-[#FFC72C] hover:text-stone-900 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    সকল ফলাফল দেখুন (All Results)
                  </Link>
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-[var(--store-text-muted)] font-semibold">
                  "{query}" এর জন্য কোনো আম পাওয়া যায়নি
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
