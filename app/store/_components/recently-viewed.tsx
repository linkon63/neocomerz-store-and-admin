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
    <section className="mt-16 border-t border-[#ded7ce] pt-12">
      <h2 className="text-2xl font-black tracking-tight mb-8">Recently Viewed</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const variant = getDefaultVariant(product);
          return (
            <Link
              key={product.id}
              href={`/store/products/${product.slug}`}
              className="group block rounded-2xl bg-white p-3 shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[#f0ece6] mb-3">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-[#171412] line-clamp-1">{product.name}</p>
                <p className="mt-1 text-sm font-black text-[#171412]">
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
