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
    <div className="w-full px-6 py-10 sm:px-12 lg:px-16">
      <div className="h-6 bg-stone-200 w-1/4 mb-8 animate-pulse" />
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 sm:gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-stone-200/50 shadow-xs">
            <div className="aspect-square bg-stone-100 border-b border-stone-200/50" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-stone-100 w-1/3" />
              <div className="h-4 bg-stone-100 w-3/4" />
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
  const [columns, setColumns] = useState<'3' | '4' | 'list'>('4');

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
    <div className="w-full px-6 py-10 sm:px-12 lg:px-16 font-sans">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-stone-900 font-display">আমাদের আমের সংগ্রহ</h1>
          <p className="mt-1 text-sm text-stone-500 font-bold tracking-wide">{total} টি প্রোডাক্ট পাওয়া গেছে</p>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3.5 flex-wrap">
          {/* Layout Columns Control Toolbar */}
          <div className="flex items-center gap-1 bg-stone-150 p-1 rounded-sm border border-stone-200">
            <button
              onClick={() => setColumns('4')}
              className={`flex items-center gap-1 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all rounded-xs cursor-pointer ${
                columns === '4'
                  ? "bg-white text-stone-900 shadow-xs border border-stone-200/50"
                  : "text-stone-500 hover:text-stone-850"
              }`}
              title="4 Columns Grid"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              ৪ কলাম
            </button>
            <button
              onClick={() => setColumns('3')}
              className={`flex items-center gap-1 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all rounded-xs cursor-pointer ${
                columns === '3'
                  ? "bg-white text-stone-900 shadow-xs border border-stone-200/50"
                  : "text-stone-500 hover:text-stone-850"
              }`}
              title="3 Columns Grid"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <rect x="2" y="3" width="5" height="18" />
                <rect x="9" y="3" width="5" height="18" />
                <rect x="16" y="3" width="5" height="18" />
              </svg>
              ৩ কলাম
            </button>
            <button
              onClick={() => setColumns('list')}
              className={`flex items-center gap-1 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all rounded-xs cursor-pointer ${
                columns === 'list'
                  ? "bg-white text-stone-900 shadow-xs border border-stone-200/50"
                  : "text-stone-500 hover:text-stone-850"
              }`}
              title="List View"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              লিস্ট
            </button>
          </div>

          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex items-center gap-2 border border-stone-200 px-4 py-2.5 text-xs font-bold tracking-wider uppercase hover:border-[#0D623B] hover:text-[#0D623B] transition lg:hidden bg-white cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            ফিল্টারসমূহ (Filters)
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block w-60 shrink-0`}>
          <div className="sticky top-24 space-y-6 bg-white border border-stone-200 p-5 shadow-xs">
            
            {/* Search */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-wider text-stone-900 border-l-2 border-[#15803d] pl-2 mb-3">অনুসন্ধান</h3>
              <div className="relative">
                <input
                  type="text"
                  defaultValue={search}
                  placeholder="আম খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-[#0D623B] focus:outline-none focus:ring-1 focus:ring-[#0D623B] transition-all font-bold text-stone-900"
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
                  className="flex w-full items-center justify-between py-2.5 text-left hover:text-[#0D623B] transition-colors group cursor-pointer outline-none"
                >
                  <span className="filter-group-label group-hover:text-[#0D623B] transition-colors">আমের জাতসমূহ</span>
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
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-bold transition-all border ${!categoryId ? "bg-[#0D623B] border-[#0D623B] text-white" : "border-transparent text-stone-600 hover:bg-stone-100 hover:text-[#0D623B]"}`}
                    >
                      {!categoryId && <span className="w-1.5 h-1.5 bg-white" />}
                      সব জাতের আম
                    </button>
                    {categories.map((c) => {
                      const isActive = categoryId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setParam("categoryId", c.id)}
                          className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-bold transition-all border ${isActive ? "bg-[#0D623B] border-[#0D623B] text-white" : "border-transparent text-stone-600 hover:bg-stone-100 hover:text-[#0D623B]"}`}
                        >
                          {isActive && <span className="w-1.5 h-1.5 bg-white" />}
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
                  className="flex w-full items-center justify-between py-2.5 text-left hover:text-[#0D623B] transition-colors group cursor-pointer outline-none"
                >
                  <span className="filter-group-label group-hover:text-[#0D623B] transition-colors">আমের বাগান / ব্র্যান্ড</span>
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
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-bold transition-all border ${!brandId ? "bg-[#0D623B] border-[#0D623B] text-white" : "border-transparent text-stone-600 hover:bg-stone-100 hover:text-[#0D623B]"}`}
                    >
                      {!brandId && <span className="w-1.5 h-1.5 bg-white" />}
                      সব বাগান ও ব্রান্ড
                    </button>
                    {brands.map((b) => {
                      const isActive = brandId === b.id;
                      return (
                        <button
                          key={b.id}
                          onClick={() => setParam("brandId", b.id)}
                          className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-bold transition-all border ${isActive ? "bg-[#0D623B] border-[#0D623B] text-white" : "border-transparent text-stone-600 hover:bg-stone-100 hover:text-[#0D623B]"}`}
                        >
                          {isActive && <span className="w-1.5 h-1.5 bg-white" />}
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
                className="w-full border border-red-200 hover:border-red-500 px-3 py-2.5 text-[11px] font-bold text-red-650 hover:bg-red-50 transition-all tracking-wider uppercase cursor-pointer"
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
            <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-white border border-stone-200 shadow-xs animate-fade-in">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 mr-2">সক্রিয় ফিল্টারসমূহ:</span>
              
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-[11px] font-bold text-stone-700 border border-stone-200">
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-[11px] font-bold text-stone-700 border border-stone-200">
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-[11px] font-bold text-stone-700 border border-stone-200">
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-[11px] font-bold text-stone-700 border border-stone-200">
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
                className="text-[11px] font-black uppercase tracking-widest text-[#0D623B] hover:text-[#0A3C26] ml-2 cursor-pointer transition-colors font-display"
              >
                সব মুছুন (Clear All)
              </button>
            </div>
          )}

          {loading ? (
            <div className={
              columns === 'list'
                ? "flex flex-col gap-4"
                : columns === '3'
                  ? "grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-3 sm:gap-6"
                  : "grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 sm:gap-6"
            }>
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className={`bg-white border border-stone-200/50 animate-pulse ${columns === 'list' ? "flex flex-col sm:flex-row gap-4 p-4" : ""}`}>
                  <div className={`${columns === 'list' ? "w-full sm:w-48 h-48 sm:h-32 shrink-0" : "aspect-square"} bg-stone-100 border-b sm:border-b-0 border-stone-200/50`} />
                  <div className="p-4 flex-1 space-y-2">
                    <div className="h-3 bg-stone-100 w-1/3" />
                    <div className="h-4 bg-stone-100 w-3/4" />
                    <div className="h-3 bg-stone-100 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-stone-200 p-16 text-center shadow-xs">
              <p className="text-4xl mb-4">🥭</p>
              <p className="text-sm font-bold uppercase tracking-wider text-stone-750">কোনো আম পাওয়া যায়নি</p>
              <p className="mt-2 text-xs text-stone-500 font-semibold">অনুগ্রহ করে আপনার ফিল্টার বা অনুসন্ধানের শব্দ পরিবর্তন করে চেষ্টা করুন।</p>
            </div>
          ) : (
            <>
              <div className={
                columns === 'list'
                  ? "flex flex-col gap-4 animate-scale-in"
                  : columns === '3'
                    ? "grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-3 sm:gap-6 animate-scale-in"
                    : "grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 sm:gap-6 animate-scale-in"
              }>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} viewMode={columns === 'list' ? 'list' : 'grid'} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="border border-stone-200 px-4 py-2.5 text-xs font-bold tracking-wider uppercase disabled:opacity-40 hover:border-[#0D623B] hover:text-[#0D623B] bg-white transition cursor-pointer"
                  >
                    ← পূর্ববর্তী (Prev)
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2)
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 text-sm font-black transition cursor-pointer ${p === page ? "bg-[#0D623B] border border-[#0D623B] text-white" : "border border-stone-200 bg-white hover:border-[#0D623B] hover:text-[#0D623B]"}`}
                      >
                        {p}
                      </button>
                    ))}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="border border-stone-200 px-4 py-2.5 text-xs font-bold tracking-wider uppercase disabled:opacity-40 hover:border-[#0D623B] hover:text-[#0D623B] bg-white transition cursor-pointer"
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
