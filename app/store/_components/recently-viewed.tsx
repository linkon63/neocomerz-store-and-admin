"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productsApi, type Product, formatPrice, getDefaultVariant, getProductImage } from "@/lib/store-api";

export function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const stored = localStorage.getItem("store_recently_viewed");
        if (!stored) {
          setLoading(false);
          return;
        }

        const ids: string[] = JSON.parse(stored);
        if (ids.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch each product by ID. In a real app, there would be a bulk endpoint.
        const promises = ids.slice(0, 4).map(id => productsApi.byId(id).catch(() => null));
        const results = await Promise.all(promises);
        
        // Filter out nulls and duplicates (just in case)
        const validProducts = results.filter((p): p is Product => p !== null);
        setProducts(validProducts);
      } catch (e) {
        console.error("Failed to load recently viewed products", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-[var(--store-border)] pt-12 font-sans">
      <h2 className="text-xs font-bold uppercase tracking-widest text-[#15803d] mb-8 font-display">
        সম্প্রতি দেখা আমসমূহ (Recently Viewed)
      </h2>
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
          const variant = getDefaultVariant(product);
          return (
            <Link
              key={product.id}
              href={`/store/products/${product.slug}`}
              className="group block border border-[var(--store-border)] bg-white p-4 transition-all duration-300 hover:border-[#15803d] shadow-xs"
            >
              <div className="aspect-[4/3] overflow-hidden bg-stone-50 border border-stone-200 mb-4 flex items-center justify-center">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-800 line-clamp-2 leading-relaxed min-h-[36px] group-hover:text-[#15803d] transition-colors">{product.name}</p>
                <p className="text-sm font-extrabold text-[#15803d] mt-1 font-display">
                  {variant ? formatPrice(variant.price) : "—"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
