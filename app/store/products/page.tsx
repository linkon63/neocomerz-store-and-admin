"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { productsApi, categoriesApi, brandsApi, type Product, type Category, type Brand } from "@/lib/store-api";
import { ProductCard } from "../_components/product-card";
import { ProductSort } from "../_components/product-sort";
import { Breadcrumb } from "../_components/breadcrumb";

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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-5 bg-gray-100 rounded w-48 mb-5 animate-pulse" />
      <div className="h-8 bg-gray-100 rounded w-72 mb-6 animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white border p-4 space-y-3" style={{ borderColor: "var(--store-border)" }}>
            <div className="aspect-square bg-gray-100 rounded-xl" />
            <div className="h-3.5 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
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

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const categoryId = searchParams.get("categoryId") ?? "";
  const brandId = searchParams.get("brandId") ?? "";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "active";
  const sort = searchParams.get("sort") ?? "newest";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  useEffect(() => { setMinPriceInput(minPrice); setMaxPriceInput(maxPrice); }, [minPrice, maxPrice]);

  const isValidUUID = (id: string) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

  const isValidStatus = (s: string): s is "active" | "inactive" | "draft" =>
    ["active", "inactive", "draft"].includes(s);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productsApi.list({
      page, limit: LIMIT,
      categoryId: isValidUUID(categoryId) ? categoryId : undefined,
      brandId: isValidUUID(brandId) ? brandId : undefined,
      search: search || undefined,
      status: isValidStatus(status) ? status : "active",
      sort: sort || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    }).then((res) => { setProducts(res.data); setTotal(res.meta.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, categoryId, brandId, search, status, sort, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    Promise.all([categoriesApi.list(), brandsApi.list()])
      .then(([c, b]) => { setCategories(c); setBrands(b); })
      .catch(() => { setCategories([]); setBrands([]); });
  }, []);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.push(`/store/products?${params.toString()}`);
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/store/products?${params.toString()}`);
  }

  function clearSingleFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    if (key === "minPrice" || key === "maxPrice") {
      params.delete("minPrice"); params.delete("maxPrice");
      setMinPriceInput(""); setMaxPriceInput("");
    }
    router.push(`/store/products?${params.toString()}`);
  }

  const totalPages = Math.ceil(total / LIMIT);
  const activeCategory = categories.find(c => c.id === categoryId);
  const activeBrand = brands.find(b => b.id === brandId);
  const hasFilters = !!(categoryId || brandId || search || minPrice || maxPrice);

  const inputCls = "w-full rounded-lg px-3 py-2.5 text-[13px] outline-none transition-all";
  const inputStyle = { border: "1.5px solid var(--store-border)", backgroundColor: "#fff", color: "var(--store-text)" };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen" style={{ color: "var(--store-text)" }}>

      {/* Breadcrumb */}
      <div className="mb-5"><Breadcrumb /></div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5" style={{ borderBottom: "2px solid var(--store-border)" }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1 h-5 rounded-full" style={{ backgroundColor: "var(--store-primary)" }} />
            <h1 className="text-[24px] font-black" style={{ color: "var(--store-text)" }}>সব পণ্য</h1>
          </div>
          <p className="text-[13px]" style={{ color: "var(--store-text-muted)" }}>{total} টি পণ্য পাওয়া গেছে</p>
        </div>
        <ProductSort />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-5 mb-6" style={{ border: "1px solid var(--store-border)" }}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">

          {/* Search */}
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--store-text-muted)" }}>পণ্য খুঁজুন</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: "var(--store-text-muted)" }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                defaultValue={search}
                placeholder="পণ্যের নাম লিখুন..."
                className={inputCls + " pl-9"}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--store-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--store-border)")}
                onKeyDown={(e) => { if (e.key === "Enter") setParam("search", (e.target as HTMLInputElement).value); }}
              />
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--store-text-muted)" }}>ক্যাটাগরি</label>
              <select
                value={categoryId}
                onChange={(e) => setParam("categoryId", e.target.value)}
                className={inputCls + " cursor-pointer"}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--store-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--store-border)")}
              >
                <option value="">সব ক্যাটাগরি</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {/* Brand */}
          {brands.length > 0 && (
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--store-text-muted)" }}>ব্র্যান্ড</label>
              <select
                value={brandId}
                onChange={(e) => setParam("brandId", e.target.value)}
                className={inputCls + " cursor-pointer"}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--store-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--store-border)")}
              >
                <option value="">সব ব্র্যান্ড</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          {/* Price Range */}
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--store-text-muted)" }}>মূল্য পরিসীমা</label>
            <div className="flex gap-2 items-center">
              <input type="number" placeholder="সর্বনিম্ন" value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none transition-all" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--store-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--store-border)")} />
              <span className="text-gray-300 font-light flex-shrink-0">—</span>
              <input type="number" placeholder="সর্বোচ্চ" value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none transition-all" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--store-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--store-border)")} />
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (minPriceInput) params.set("minPrice", minPriceInput); else params.delete("minPrice");
                  if (maxPriceInput) params.set("maxPrice", maxPriceInput); else params.delete("maxPrice");
                  params.delete("page");
                  router.push(`?${params.toString()}`);
                }}
                className="flex-shrink-0 rounded-lg px-3 py-2.5 text-[12px] font-bold text-white transition-all cursor-pointer"
                style={{ backgroundColor: "var(--store-primary)" }}
              >OK</button>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="mt-4 pt-4 flex flex-wrap gap-2 items-center justify-between" style={{ borderTop: "1px solid var(--store-border)" }}>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--store-text-muted)" }}>ফিল্টার:</span>
              {search && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium rounded-full px-3 py-1" style={{ backgroundColor: "var(--store-primary-light)", color: "var(--store-primary)" }}>
                  &quot;{search}&quot;
                  <button onClick={() => clearSingleFilter("search")} className="hover:opacity-70 font-bold">✕</button>
                </span>
              )}
              {categoryId && activeCategory && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium rounded-full px-3 py-1" style={{ backgroundColor: "var(--store-primary-light)", color: "var(--store-primary)" }}>
                  {activeCategory.name}
                  <button onClick={() => clearSingleFilter("categoryId")} className="hover:opacity-70 font-bold">✕</button>
                </span>
              )}
              {brandId && activeBrand && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium rounded-full px-3 py-1" style={{ backgroundColor: "var(--store-primary-light)", color: "var(--store-primary)" }}>
                  {activeBrand.name}
                  <button onClick={() => clearSingleFilter("brandId")} className="hover:opacity-70 font-bold">✕</button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium rounded-full px-3 py-1" style={{ backgroundColor: "var(--store-primary-light)", color: "var(--store-primary)" }}>
                  ৳{minPrice || "0"} – ৳{maxPrice || "∞"}
                  <button onClick={() => clearSingleFilter("minPrice")} className="hover:opacity-70 font-bold">✕</button>
                </span>
              )}
            </div>
            <button
              onClick={() => { setMinPriceInput(""); setMaxPriceInput(""); router.push("/store/products"); }}
              className="text-[12px] font-semibold hover:underline"
              style={{ color: "var(--store-text-muted)" }}
            >সব ফিল্টার মুছুন</button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white border animate-pulse" style={{ borderColor: "var(--store-border)" }}>
              <div className="aspect-square bg-gray-100 rounded-t-xl" />
              <div className="p-4 space-y-2.5">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center" style={{ border: "1px solid var(--store-border)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--store-primary-light)" }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "var(--store-primary)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
            </svg>
          </div>
          <h2 className="text-[20px] font-bold mb-2" style={{ color: "var(--store-text)" }}>কোনো পণ্য পাওয়া যায়নি</h2>
          <p className="text-[14px] mb-6 max-w-sm mx-auto" style={{ color: "var(--store-text-muted)" }}>
            আপনার ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
          </p>
          <button
            onClick={() => { setMinPriceInput(""); setMaxPriceInput(""); router.push("/store/products"); }}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[14px] font-bold text-white"
            style={{ backgroundColor: "var(--store-primary)" }}
          >সব ফিল্টার মুছুন</button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2 pt-8" style={{ borderTop: "1px solid var(--store-border)" }}>
              <button
                onClick={() => setPage(page - 1)} disabled={page <= 1}
                className="flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--store-border)", color: "var(--store-text)", backgroundColor: "#fff" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                আগের
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <button
                    key={p} onClick={() => setPage(p)}
                    className="w-10 h-10 rounded-lg text-[13px] font-bold transition-all"
                    style={p === page
                      ? { backgroundColor: "var(--store-primary)", color: "#fff", border: "none" }
                      : { backgroundColor: "#fff", color: "var(--store-text)", border: "1.5px solid var(--store-border)" }}
                  >{p}</button>
                ))}
              <button
                onClick={() => setPage(page + 1)} disabled={page >= totalPages}
                className="flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--store-border)", color: "var(--store-text)", backgroundColor: "#fff" }}
              >
                পরের
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
