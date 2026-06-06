"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchApi, productsApi, type Product } from "@/lib/store-api";
import { ProductCard } from "../_components/product-card";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1800px] w-full px-6 py-12 sm:px-12 lg:px-16 animate-pulse">
          <div className="h-6 w-40 bg-stone-200" />
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
    <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16 font-sans bg-stone-50/50 min-h-[calc(100vh-280px)]">
      <div className="mb-8 flex flex-col gap-1 border-b border-stone-200 pb-5">
        <h1 className="text-2xl font-bold font-serif uppercase text-stone-850">
          আম খুঁজুন (Search)
        </h1>
        <p className="text-xs text-stone-500 font-semibold tracking-wide">
          আমের নাম বা ক্যাটাগরি দিয়ে দ্রুত খুঁজে নিন
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
              placeholder="আমের নাম বা ধরণ লিখুন (যেমন: ল্যাংড়া, ফজলি, আম্রপালি)..."
              className="w-full border border-stone-250 bg-white px-4 py-3 text-xs font-semibold outline-none transition-all pr-12 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/10 text-stone-800 placeholder-stone-400"
              autoFocus
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 border border-stone-200 bg-white shadow-lg py-2.5 z-50 animate-scale-in"
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => handleSearch(s)}
                    className="block w-full text-left px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-slate-50 hover:text-[#15803d] transition-colors cursor-pointer"
                  >
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => handleSearch()}
            className="px-7 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all bg-[#15803d] hover:bg-[#166534] shadow-xs cursor-pointer btn-premium"
          >
            খুঁজুন (Search)
          </button>
        </div>
      </div>

      {/* Results */}
      {q && (
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-[#15803d] mb-6 font-display">
            {loading
              ? "খোঁজা হচ্ছে..."
              : `"${q}" এর জন্য ${total} টি ফলাফল পাওয়া গেছে`}
          </p>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-stone-200 animate-pulse">
                  <div className="aspect-[4/3] bg-stone-100 border-b border-stone-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-stone-100 w-3/4" />
                    <div className="h-3.5 bg-stone-100 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-stone-200/60 p-16 text-center shadow-xs">
              <p className="text-3xl mb-4">🔍</p>
              <p className="text-sm font-bold uppercase tracking-wider text-stone-850">
                কোনো আম পাওয়া যায়নি
              </p>
              <p className="mt-2 text-xs text-stone-500 font-semibold">
                অন্য কোনো আমের নাম লিখে আবার চেষ্টা করুন (যেমন: ফজলি বা ল্যাংড়া)।
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
        <div className="bg-white border border-stone-200/60 p-16 text-center shadow-xs">
          <p className="text-3xl mb-4">✨</p>
          <p className="text-sm font-bold uppercase tracking-wider text-stone-850">
            আপনার পছন্দের আম খুঁজুন
          </p>
          <p className="mt-2 text-xs text-stone-500 font-semibold">
            উপরের সার্চ বক্সে আমের নাম (যেমন: ফজলি, ল্যাংড়া, আম্রপালি) লিখে খোঁজা শুরু করুন।
          </p>
        </div>
      )}
    </div>
  );
}
