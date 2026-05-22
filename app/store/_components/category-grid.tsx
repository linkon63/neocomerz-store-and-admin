"use client";

import Link from "next/link";
import { type Category } from "@/lib/store-api";

interface CategoryGridProps {
  categories: Category[];
  loading?: boolean;
}

const CATEGORY_GRADIENTS: string[] = [
  "from-indigo-500 to-indigo-600",
  "from-amber-500 to-rose-600",
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-pink-500 to-fuchsia-600",
  "from-cyan-500 to-blue-600",
  "from-amber-500 to-yellow-600",
  "from-rose-500 to-pink-600",
];

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
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4" style={{ backgroundColor: "var(--store-primary-light)" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--store-primary)" }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--store-primary)" }}>
            Browse Categories
          </span>
        </div>
        <h2 className="text-[28px] sm:text-[34px] font-black mb-2" style={{ color: "var(--store-text)" }}>
          Shop by Category
        </h2>
        <p className="text-[14px]" style={{ color: "var(--store-text-muted)" }}>
          Select your favorite category to discover amazing products
        </p>
      </div>

      {loading ? (
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-gray-100" />
              <div className="p-4 bg-white">
                <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => {
            const gradient = CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length];
            return (
              <Link
                key={cat.id}
                href={`/store/products?categoryId=${cat.id}`}
                className="group relative block rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5"
              >
                {/* Background with gradient or image */}
                {cat.imageUrl ? (
                  <div className="aspect-[4/3] relative">
                    <img
                      src={cat.imageUrl.startsWith('http') ? cat.imageUrl : `http://localhost:5010${cat.imageUrl}`}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                ) : (
                  <div className={`aspect-[4/3] bg-gradient-to-br ${gradient} relative`}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/10" />
                  </div>
                )}

                {/* Icon */}
                {!cat.imageUrl && (
                  <div className="absolute top-4 right-4 text-3xl opacity-50 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-6">
                    {getCategoryIcon(cat.name)}
                  </div>
                )}

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-[17px] font-bold text-white mb-1 drop-shadow-sm">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-medium text-white/80 transition-all duration-300 group-hover:text-white">
                      Explore Now
                    </span>
                    <svg className="w-3.5 h-3.5 text-white/60 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 translate-x-8 -translate-y-8 rotate-45 transition-all duration-500 group-hover:translate-x-4 group-hover:-translate-y-4" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
              </Link>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-10 text-center">
        <Link
          href="/store/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold transition-all duration-300 hover:gap-3 hover:shadow-lg"
          style={{ backgroundColor: "var(--store-primary)", color: "#FFFFFF" }}
        >
          Browse All Categories
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}