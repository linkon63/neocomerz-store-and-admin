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
      <div className="h-6 bg-stone-200 rounded-xl w-1/4 mb-8 animate-pulse" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-stone-200/50 shadow-xs">
            <div className="aspect-square bg-stone-100 rounded-t-2xl border-b border-stone-200/50" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-stone-100 rounded-lg w-1/3" />
              <div className="h-4 bg-stone-100 rounded-lg w-3/4" />
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
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900 font-display">আমাদের আমের সংগ্রহ</h1>
          <p className="mt-1 text-xs text-stone-500 font-bold tracking-wide">[ {total} টি প্রোডাক্ট পাওয়া গেছে ]</p>
        </div>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold tracking-wider uppercase hover:border-[#2E7D32] hover:text-[#2E7D32] transition lg:hidden bg-white cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          ফিল্টারসমূহ (Filters)
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block w-60 shrink-0`}>
          <div className="sticky top-24 space-y-6 bg-white border border-stone-200 p-5 rounded-2xl shadow-xs">
            
            {/* Search */}
            <div>
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-[#2E7D32] mb-3 font-display">[ অনুসন্ধান ]</h3>
              <div className="relative">
                <input
                  type="text"
                  defaultValue={search}
                  placeholder="আম খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-[#2E7D32] focus:outline-none focus:ring-1 focus:ring-[#2E7D32] transition-all rounded-xl font-bold text-stone-900"
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
              <div className="border-b border-stone-100 pb-4">
                <button
                  type="button"
                  onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                  className="flex w-full items-center justify-between py-2 text-left hover:text-[#2E7D32] transition-colors group cursor-pointer"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-850 group-hover:text-[#2E7D32] font-display">[ আমের জাতসমূহ ]</span>
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
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-bold transition-all rounded-xl border ${!categoryId ? "bg-[#2E7D32] border-[#2E7D32] text-white" : "border-transparent text-stone-600 hover:bg-[#FFF8E7] hover:text-[#2E7D32]"}`}
                    >
                      {!categoryId && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      সব জাতের আম
                    </button>
                    {categories.map((c) => {
                      const isActive = categoryId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setParam("categoryId", c.id)}
                          className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-bold transition-all rounded-xl border ${isActive ? "bg-[#2E7D32] border-[#2E7D32] text-white" : "border-transparent text-stone-600 hover:bg-[#FFF8E7] hover:text-[#2E7D32]"}`}
                        >
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
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
              <div className="border-b border-stone-100 pb-4">
                <button
                  type="button"
                  onClick={() => setBrandsExpanded(!brandsExpanded)}
                  className="flex w-full items-center justify-between py-2 text-left hover:text-[#2E7D32] transition-colors group cursor-pointer"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-850 group-hover:text-[#2E7D32] font-display">[ আমের বাগান / ব্রান্ড ]</span>
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
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-bold transition-all rounded-xl border ${!brandId ? "bg-[#2E7D32] border-[#2E7D32] text-white" : "border-transparent text-stone-600 hover:bg-[#FFF8E7] hover:text-[#2E7D32]"}`}
                    >
                      {!brandId && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      সব বাগান ও ব্রান্ড
                    </button>
                    {brands.map((b) => {
                      const isActive = brandId === b.id;
                      return (
                        <button
                          key={b.id}
                          onClick={() => setParam("brandId", b.id)}
                          className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-bold transition-all rounded-xl border ${isActive ? "bg-[#2E7D32] border-[#2E7D32] text-white" : "border-transparent text-stone-600 hover:bg-[#FFF8E7] hover:text-[#2E7D32]"}`}
                        >
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
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
                className="w-full border border-red-200 hover:border-red-500 px-3 py-2.5 text-[10px] font-bold text-red-650 hover:bg-red-50 transition-all rounded-xl tracking-wider uppercase cursor-pointer"
              >
                ফিল্টার পরিষ্কার করুন (Clear Filters)
              </button>
            )}
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {/* Active Filters Summary */}
          {(search || categoryId || brandId || status || discountId) && (
            <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-white border border-stone-200 shadow-xs animate-fade-in rounded-2xl">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 mr-2 font-display">সক্রিয় ফিল্টারসমূহ:</span>
              
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-[10px] font-bold text-stone-700 border border-stone-200 rounded-lg">
                  <span>অনুসন্ধান: "{search}"</span>
                  <button
                    onClick={() => setParam("search", "")}
                    className="text-stone-500 hover:text-red-650 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {categoryId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-[10px] font-bold text-stone-700 border border-stone-200 rounded-lg">
                  <span>জাত: {categories.find((c) => c.id === categoryId)?.name || "Selected"}</span>
                  <button
                    onClick={() => setParam("categoryId", "")}
                    className="text-stone-500 hover:text-red-650 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {brandId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-[10px] font-bold text-stone-700 border border-stone-200 rounded-lg">
                  <span>বাগান: {brands.find((b) => b.id === brandId)?.name || "Selected"}</span>
                  <button
                    onClick={() => setParam("brandId", "")}
                    className="text-stone-500 hover:text-red-650 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {discountId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-[10px] font-bold text-stone-700 border border-stone-200 rounded-lg">
                  <span>বিশেষ অফার সক্রিয়</span>
                  <button
                    onClick={() => setParam("discountId", "")}
                    className="text-stone-500 hover:text-red-650 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              <button
                onClick={() => router.push("/store/products")}
                className="text-[10px] font-black uppercase tracking-widest text-[#2E7D32] hover:text-[#1B5E20] ml-2 cursor-pointer transition-colors font-display"
              >
                সব মুছুন (Clear All)
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border border-stone-200/50 animate-pulse">
                  <div className="aspect-square bg-stone-100 rounded-t-2xl border-b border-stone-200/50" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-stone-100 rounded-lg w-1/3" />
                    <div className="h-4 bg-stone-100 rounded-lg w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-white border border-stone-200 p-16 text-center shadow-xs">
              <p className="text-4xl mb-4">🥭</p>
              <p className="text-sm font-bold uppercase tracking-wider text-stone-750">কোনো আম পাওয়া যায়নি</p>
              <p className="mt-2 text-xs text-stone-500 font-semibold">অনুগ্রহ করে আপনার ফিল্টার বা অনুসন্ধানের শব্দ পরিবর্তন করে চেষ্টা করুন।</p>
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
                    className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-bold tracking-wider uppercase disabled:opacity-40 hover:border-[#2E7D32] hover:text-[#2E7D32] bg-white transition cursor-pointer"
                  >
                    ← পূর্ববর্তী (Prev)
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2)
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`rounded-xl w-10 h-10 text-xs font-black transition cursor-pointer ${p === page ? "bg-[#2E7D32] border border-[#2E7D32] text-white" : "border border-stone-200 bg-white hover:border-[#2E7D32] hover:text-[#2E7D32]"}`}
                      >
                        {p}
                      </button>
                    ))}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-bold tracking-wider uppercase disabled:opacity-40 hover:border-[#2E7D32] hover:text-[#2E7D32] bg-white transition cursor-pointer"
                  >
                    পরবর্তী (Next) →
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
