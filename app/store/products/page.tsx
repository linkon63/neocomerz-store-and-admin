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
    <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16">
      <div className="h-6 bg-stone-200 rounded-none w-1/4 mb-8 animate-pulse" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-none bg-white border border-stroke shadow-none">
            <div className="aspect-square bg-stone-100 rounded-none border-b border-stroke" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-stone-100 rounded-none w-1/3" />
              <div className="h-4 bg-stone-100 rounded-none w-3/4" />
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
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [brandsExpanded, setBrandsExpanded] = useState(true);

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const categoryId = searchParams.get("categoryId") ?? "";
  const brandId = searchParams.get("brandId") ?? "";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const discountId = searchParams.get("discountId") ?? "";

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productsApi
      .list({
        page,
        limit: LIMIT,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        search: search || undefined,
        status: status || undefined,
        discountId: discountId || undefined,
      })
      .then((res) => {
        setProducts(res.data);
        setTotal(res.meta.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, categoryId, brandId, search, status, discountId]);

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
    <div className="mx-auto max-w-[1800px] w-full px-6 py-10 sm:px-12 lg:px-16 font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-stroke pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-wider font-serif uppercase">Store Catalog</h1>
          <p className="mt-1 text-xs text-stone-500 font-medium tracking-wider">[ {total} items listed ]</p>
        </div>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="flex items-center gap-2 rounded-none border border-stroke px-4 py-2 text-xs font-bold tracking-wider uppercase hover:border-primary hover:text-primary transition lg:hidden"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          Filters
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block w-60 shrink-0`}>
          <div className="sticky top-24 space-y-6 bg-white border border-stroke p-5 rounded-none">
            
            {/* Search */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground mb-3">[ Search ]</h3>
              <div className="relative">
                <input
                  type="text"
                  defaultValue={search}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-stroke focus:border-primary focus:outline-none transition-all rounded-none font-semibold text-foreground"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setParam("search", (e.target as HTMLInputElement).value);
                  }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Categories Accordion */}
            {categories.length > 0 && (
              <div className="border-b border-stroke pb-4">
                <button
                  type="button"
                  onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                  className="flex w-full items-center justify-between py-2 text-left hover:text-primary transition-colors group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground group-hover:text-primary">[ Category ]</span>
                  <svg
                    className={`w-3.5 h-3.5 text-stone-450 transition-transform duration-350 ${categoriesExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {categoriesExpanded && (
                  <div className="mt-3 space-y-1 max-h-[220px] overflow-y-auto pr-1 scrollbar-hide animate-scale-in">
                    <button
                      onClick={() => setParam("categoryId", "")}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-semibold transition-all rounded-none border ${!categoryId ? "bg-primary border-primary text-white" : "border-transparent text-stone-600 hover:bg-stone-50"}`}
                    >
                      {!categoryId && <span className="w-1 h-1 bg-white" />}
                      All Categories
                    </button>
                    {categories.map((c) => {
                      const isActive = categoryId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setParam("categoryId", c.id)}
                          className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-semibold transition-all rounded-none border ${isActive ? "bg-primary border-primary text-white" : "border-transparent text-stone-600 hover:bg-stone-50"}`}
                        >
                          {isActive && <span className="w-1 h-1 bg-white" />}
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Brands Accordion */}
            {brands.length > 0 && (
              <div className="border-b border-stroke pb-4">
                <button
                  type="button"
                  onClick={() => setBrandsExpanded(!brandsExpanded)}
                  className="flex w-full items-center justify-between py-2 text-left hover:text-primary transition-colors group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground group-hover:text-primary">[ Brand ]</span>
                  <svg
                    className={`w-3.5 h-3.5 text-stone-450 transition-transform duration-350 ${brandsExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {brandsExpanded && (
                  <div className="mt-3 space-y-1 max-h-[220px] overflow-y-auto pr-1 scrollbar-hide animate-scale-in">
                    <button
                      onClick={() => setParam("brandId", "")}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-semibold transition-all rounded-none border ${!brandId ? "bg-primary border-primary text-white" : "border-transparent text-stone-600 hover:bg-stone-50"}`}
                    >
                      {!brandId && <span className="w-1 h-1 bg-white" />}
                      All Brands
                    </button>
                    {brands.map((b) => {
                      const isActive = brandId === b.id;
                      return (
                        <button
                          key={b.id}
                          onClick={() => setParam("brandId", b.id)}
                          className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-semibold transition-all rounded-none border ${isActive ? "bg-primary border-primary text-white" : "border-transparent text-stone-600 hover:bg-stone-50"}`}
                        >
                          {isActive && <span className="w-1 h-1 bg-white" />}
                          {b.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Clear filters button */}
            {(categoryId || brandId || search || status || discountId) && (
              <button
                onClick={() => router.push("/store/products")}
                className="w-full border border-red-200 hover:border-red-500 px-3 py-2.5 text-[10px] font-bold text-red-600 hover:bg-red-50 transition-all rounded-none tracking-wider uppercase cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {/* Active Filters Summary */}
          {(search || categoryId || brandId || status || discountId) && (
            <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-white border border-stroke shadow-none animate-fade-in rounded-none">
              <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mr-2">Active Filters:</span>
              
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-[10px] font-semibold text-foreground border border-stroke rounded-none">
                  <span>Search: "{search}"</span>
                  <button
                    onClick={() => setParam("search", "")}
                    className="text-stone-550 hover:text-red-650 transition-colors cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {categoryId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-[10px] font-semibold text-foreground border border-stroke rounded-none">
                  <span>Category: {categories.find((c) => c.id === categoryId)?.name || "Selected"}</span>
                  <button
                    onClick={() => setParam("categoryId", "")}
                    className="text-stone-550 hover:text-red-650 transition-colors cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {brandId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-[10px] font-semibold text-foreground border border-stroke rounded-none">
                  <span>Brand: {brands.find((b) => b.id === brandId)?.name || "Selected"}</span>
                  <button
                    onClick={() => setParam("brandId", "")}
                    className="text-stone-550 hover:text-red-650 transition-colors cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {discountId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-[10px] font-semibold text-foreground border border-stroke rounded-none">
                  <span>Campaign Offer Active</span>
                  <button
                    onClick={() => setParam("discountId", "")}
                    className="text-stone-550 hover:text-red-650 transition-colors cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              <button
                onClick={() => router.push("/store/products")}
                className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline ml-2 cursor-pointer transition-colors"
              >
                Clear All
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className="rounded-none bg-white border border-stroke animate-pulse">
                  <div className="aspect-square bg-stone-100 rounded-none border-b border-stroke" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-stone-100 rounded w-1/3" />
                    <div className="h-4 bg-stone-100 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-none bg-white border border-stroke p-16 text-center shadow-none">
              <p className="text-3xl mb-4">🔍</p>
              <p className="text-sm font-bold uppercase tracking-wider text-stone-700">No products found</p>
              <p className="mt-2 text-xs text-stone-500 font-medium">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 animate-scale-in">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="rounded-none border border-stroke px-4 py-2 text-xs font-semibold tracking-wider uppercase disabled:opacity-40 hover:border-primary hover:text-primary transition"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2)
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`rounded-none w-10 h-10 text-xs font-bold transition ${p === page ? "bg-primary border border-primary text-white" : "border border-stroke hover:border-primary hover:text-primary"}`}
                      >
                        {p}
                      </button>
                    ))}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded-none border border-stroke px-4 py-2 text-xs font-semibold tracking-wider uppercase disabled:opacity-40 hover:border-primary hover:text-primary transition"
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
