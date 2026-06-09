"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

export default function CategoryBannerGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/v1/category", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const json = await res.json();
        setCategories((json ?? []).slice(0, 2));
      } catch {
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  if (isLoading) {
    return (
      <section className="w-full">
        <div className="grid gap-2 pt-2 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-[520px] animate-pulse bg-neutral-100" />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="w-full">
      <div className="grid gap-2 pt-2 md:grid-cols-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group relative block h-[520px] overflow-hidden"
          >
            {category.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={category.imageUrl}
                alt={category.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-neutral-100">
                <svg
                  className="h-full w-full text-neutral-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
