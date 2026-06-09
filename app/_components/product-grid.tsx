"use client";

import { useEffect, useState } from "react";
import { resolveImageUrl, type ShopProduct, type DBProduct, type ProductVariant, type ProductMedia } from "../shop/products";
import ProductCard from "./product-card";

export default function ProductGrid() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/v1/products?limit=20&page=1", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch products");
        const json = await res.json();
        const dbProducts: DBProduct[] = json.data ?? [];
        const mapped = dbProducts.map((p: DBProduct) => {
          const defaultVariant = p.variants?.find((v: ProductVariant) => v.isDefault) || p.variants?.[0];
          const price = defaultVariant ? Number(defaultVariant.price) : 0;

          let color = "Black";
          let size = "M";

          if (defaultVariant?.attributes) {
            for (const attr of defaultVariant.attributes) {
              const val = attr.attributeValue?.value;
              if (!val) continue;
              const attrName = attr.attributeValue?.attribute?.name?.toLowerCase();
              if (attrName === "size" || ["S", "M", "L", "XL", "XXL"].includes(val)) {
                size = val;
              } else {
                color = val;
              }
            }
          }

          const featuredMedia = p.media?.find((m: ProductMedia) => m.isFeatured) || p.media?.[0];
          const image = resolveImageUrl(featuredMedia?.media?.url);

          const allColors = new Set<string>();
          const allSizes = new Set<string>();
          if (p.variants) {
            for (const v of p.variants) {
              if (v.attributes) {
                for (const attr of v.attributes) {
                  const val = attr.attributeValue?.value;
                  const name = attr.attributeValue?.attribute?.name?.toLowerCase();
                  if (val) {
                    if (name === "size" || ["S", "M", "L", "XL", "XXL"].includes(val)) {
                      allSizes.add(val);
                    } else {
                      allColors.add(val);
                    }
                  }
                }
              }
            }
          }

          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            category: p.category?.name || "Football Corner",
            team: p.brand?.name || "Juventus",
            price,
            color,
            size,
            image,
            variantId: defaultVariant?.id,
            colors: Array.from(allColors),
            sizes: Array.from(allSizes),
          };
        });
        setProducts(mapped);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  if (isLoading) {
    return (
      <section className="w-full py-12">
        <h1 className="font-bembo text-2xl font-bold sm:text-3xl">
          Thousands of different stories
        </h1>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <article key={i} className="group animate-pulse">
              <div className="relative aspect-[4/5] bg-neutral-100" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-3/4 rounded bg-neutral-100" />
                <div className="h-3 w-1/2 rounded bg-neutral-100" />
                <div className="h-4 w-1/3 rounded bg-neutral-100" />
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return (
      <section className="w-full py-12">
        <h1 className="font-bembo text-2xl font-bold sm:text-3xl">
          Thousands of different stories
        </h1>
        <p className="mt-10 text-sm text-neutral-500">
          {error ? "Failed to load products. Please try again later." : "No products available."}
        </p>
      </section>
    );
  }

  return (
    <section className="w-full py-12">
      <h1 className="font-bembo text-2xl font-bold sm:text-3xl">
        Thousands of different stories
      </h1>

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
