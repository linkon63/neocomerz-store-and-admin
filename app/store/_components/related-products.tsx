"use client";

import { useEffect, useState } from "react";
import { productsApi, type Product } from "@/lib/store-api";
import { ProductCard } from "./product-card";

interface RelatedProductsProps {
  productId: string;
  categoryId?: string;
}

export function RelatedProducts({ productId, categoryId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    productsApi
      .list({ categoryId, limit: 4, status: "active" })
      .then((res) => {
        // Filter out the current product
        const filtered = res.data.filter((p) => p.id !== productId);
        setProducts(filtered.slice(0, 4));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [productId, categoryId]);

  if (loading) {
    return (
      <section className="mt-16">
        <h2 className="text-xl font-bold tracking-tight text-[#2E7D32] mb-6 font-display">সম্পর্কিত আমসমূহ (Related Products)</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-stone-200/50 shadow-xs">
              <div className="aspect-[4/3] bg-[var(--store-border)] rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-[var(--store-border)] rounded w-1/3" />
                <div className="h-4 bg-[var(--store-border)] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold tracking-tight text-[#2E7D32] mb-6 font-display">আপনার পছন্দ হতে পারে (You May Also Like)</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
