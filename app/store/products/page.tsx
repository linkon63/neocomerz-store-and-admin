"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { productsApi, categoriesApi, brandsApi, type Product, type Category, type Brand } from "@/lib/store-api";
import { ProductCard } from "../_components/product-card";

const LIMIT = 12;

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-8 bg-[var(--store-border)] rounded w-1/4 mb-8 animate-pulse" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white shadow-sm">
            <div className="aspect-[4/5] bg-[var(--store-border)] rounded-t-2xl" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-[var(--store-border)] rounded w-1/3" />
              <div className="h-4 bg-[var(--store-border)] rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const categoryId = searchParams.get("categoryId") ?? "";
  const brandId = searchParams.get("brandId") ?? "";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productsApi
      .list({ page, limit: LIMIT, categoryId: categoryId || undefined, brandId: brandId || undefined, search: search || undefined, status: status || undefined })
      .then((res) => {
        setProducts(res.data);
        setTotal(res.meta.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, categoryId, brandId, search, status]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    Promise.all([categoriesApi.list(), brandsApi.list()])
      .then(([c, b]) => {
        setCategories(c);
        setBrands(b);
      })
      .catch(() => {
        setCategories([]);
        setBrands([]);
      });
  }, []);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/store/products?${params.toString()}`);
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/store/products?${params.toString()}`);
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-[var(--store-text-muted)]">{total} items</p>
        </div>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-[var(--store-border)] px-4 py-2 text-sm font-bold hover:border-[var(--store-primary)] hover:text-[var(--store-primary)] transition lg:hidden"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block w-56 shrink-0`}>
          <div className="sticky top-20 space-y-6">
            {/* Search */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--store-text-muted)] mb-3">Search</h3>
              <input
                type="text"
                defaultValue={search}
                placeholder="Search products..."
                className="w-full rounded-xl border border-[var(--store-border)] px-3 py-2 text-sm focus:border-[var(--store-primary)] focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") setParam("search", (e.target as HTMLInputElement).value);
                }}
              />
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--store-text-muted)] mb-3">Category</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setParam("categoryId", "")}
                    className={`block w-full text-left rounded-lg px-3 py-2 text-sm font-semibold transition ${!categoryId ? "bg-[var(--store-primary)] text-white" : "hover:bg-[var(--store-surface-2)]"}`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setParam("categoryId", c.id)}
                      className={`block w-full text-left rounded-lg px-3 py-2 text-sm font-semibold transition ${categoryId === c.id ? "bg-[var(--store-primary)] text-white" : "hover:bg-[var(--store-surface-2)]"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Brands */}
            {brands.length > 0 && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--store-text-muted)] mb-3">Brand</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setParam("brandId", "")}
                    className={`block w-full text-left rounded-lg px-3 py-2 text-sm font-semibold transition ${!brandId ? "bg-[var(--store-primary)] text-white" : "hover:bg-[var(--store-surface-2)]"}`}
                  >
                    All Brands
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setParam("brandId", b.id)}
                      className={`block w-full text-left rounded-lg px-3 py-2 text-sm font-semibold transition ${brandId === b.id ? "bg-[var(--store-primary)] text-white" : "hover:bg-[var(--store-surface-2)]"}`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear filters */}
            {(categoryId || brandId || search || status) && (
              <button
                onClick={() => router.push("/store/products")}
                className="w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white shadow-sm animate-pulse">
                  <div className="aspect-[4/5] bg-[var(--store-border)] rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-[var(--store-border)] rounded w-1/3" />
                    <div className="h-4 bg-[var(--store-border)] rounded w-3/4" />
                    <div className="h-4 bg-[var(--store-border)] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-lg font-bold">No products found</p>
              <p className="mt-2 text-sm text-[var(--store-text-muted)]">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="rounded-full border border-[var(--store-border)] px-4 py-2 text-sm font-bold disabled:opacity-40 hover:border-[var(--store-primary)] hover:text-[var(--store-primary)] transition"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2)
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`rounded-full w-10 h-10 text-sm font-bold transition ${p === page ? "bg-[var(--store-primary)] text-white" : "border border-[var(--store-border)] hover:border-[var(--store-primary)] hover:text-[var(--store-primary)]"}`}
                      >
                        {p}
                      </button>
                    ))}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded-full border border-[var(--store-border)] px-4 py-2 text-sm font-bold disabled:opacity-40 hover:border-[var(--store-primary)] hover:text-[var(--store-primary)] transition"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
