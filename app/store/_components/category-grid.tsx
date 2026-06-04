"use client";

import Link from "next/link";
import { type Category } from "@/lib/store-api";

interface CategoryGridProps {
  categories: Category[];
  loading?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  men: "👔", women: "👗", clothing: "👕", electronics: "⚡",
  accessories: "👜", shoes: "👟", footwear: "👟", default: "🛍️",
};

function getCategoryIcon(name: string) {
  const norm = name.toLowerCase();
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (norm.includes(key)) return CATEGORY_ICONS[key];
  }
  return CATEGORY_ICONS.default;
}

export function CategoryGrid({ categories, loading = false }: CategoryGridProps) {
  if (categories.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16 font-sans">
      {/* Section Header */}
      <div className="mb-8 flex flex-col gap-1 border-b pb-5 border-stroke">
        <h2 className="text-2xl font-serif font-bold uppercase text-foreground">
          ক্যাটাগরি অনুযায়ী কিনুন
        </h2>
        <p className="text-xs text-stone-500 font-medium tracking-wide">
          [ আপনার পছন্দের ক্যাটাগরি বেছে নিন ]
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-none border border-stroke overflow-hidden animate-pulse bg-white">
              <div className="aspect-[4/3] bg-stone-100 border-b border-stroke" />
              <div className="p-4 bg-white space-y-2">
                <div className="h-4 bg-stone-100 w-3/4" />
                <div className="h-3 bg-stone-100 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/store/products?categoryId=${cat.id}`}
              className="group block rounded-none overflow-hidden transition-all duration-300 border border-stroke hover:border-foreground bg-white"
            >
              {/* Background with image or fallback */}
              {cat.imageUrl ? (
                <div className="aspect-[4/3] relative overflow-hidden bg-stone-50 border-b border-stroke">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-stone-50/30 relative flex items-center justify-center border-b border-stroke text-stone-600">
                  <span className="text-4xl group-hover:scale-105 transition-transform duration-300">{getCategoryIcon(cat.name)}</span>
                </div>
              )}

              {/* Content info below image */}
              <div className="p-4 flex items-center justify-between gap-2 text-xs font-semibold">
                <h3 className="text-foreground tracking-wide">
                  {cat.name}
                </h3>
                <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-stone-500 group-hover:text-primary transition-colors">
                  <span>এখনই দেখুন</span>
                  <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <Link
          href="/store/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-none text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:opacity-90 bg-primary hover:bg-primary-hover shadow-none"
        >
          সব ক্যাটাগরি ব্রাউজ করুন
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}