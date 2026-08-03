'use client';

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/sections/ui/product-card';
import { InfiniteScroll } from '@/app/admin/_components/infinite-scroll';
import { fetchShopProducts, fetchShopCategories, fetchShopBrands, type ShopProduct, type ShopCategory, type ShopBrand } from '@/lib/shop-api';

const COLLECTION_OPTIONS = ['All', 'Tea Books', 'Classic Collections', 'Royal Collections'];
const ORIGIN_OPTIONS = ['All', 'Sylhet, Bangladesh', 'Darjeeling, India', 'London, UK'];
const PRICE_OPTIONS = ['All', 'Under ৳3,000', '৳3,000 - ৳10,000', 'Over ৳10,000'];
const SORT_OPTIONS = ['New Arrival', 'Price: Low to High', 'Price: High to Low', 'Name: A to Z'];
const PAGE_LIMIT = 20;

function withinPriceRange(price: number, range: string): boolean {
  if (range === 'All') return true;
  if (range === 'Under ৳3,000') return price < 3000;
  if (range === '৳3,000 - ৳10,000') return price >= 3000 && price <= 10000;
  if (range === 'Over ৳10,000') return price > 10000;
  return true;
}

const NO_IMAGE = '/images/no-image-icon-6.png';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const searchVal = searchParams?.get('search') || '';

  const [viewMode, setViewMode] = useState<'grid2' | 'grid3'>('grid3');
  const [selectedCollection, setSelectedCollection] = useState<string>('All');
  // const [selectedOrigin] = useState<string>('All');
  const [selectedPrice, setSelectedPrice] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<string>('New Arrival');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [dbCategories, setDbCategories] = useState<ShopCategory[]>([]);
  const [dbBrands, setDbBrands] = useState<ShopBrand[]>([]);

  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const reqIdRef = useRef(0);
  const pageRef = useRef(1);

  useEffect(() => {
    fetchShopCategories().then((res) => setDbCategories(res));
    fetchShopBrands().then((res) => setDbBrands(res));
  }, []);

  const categoryOptions = useMemo(
    () => ['All', ...dbCategories.map((c) => c.name)],
    [dbCategories],
  );

  const brandOptions = useMemo(
    () => ['All', ...dbBrands.map((b) => b.name)],
    [dbBrands],
  );

  const selectedCategoryId = useMemo(() => {
    if (selectedCategory === 'All') return undefined;
    return dbCategories.find((c) => c.name.toLowerCase() === selectedCategory.toLowerCase())?.id;
  }, [selectedCategory, dbCategories]);

  const selectedBrandId = useMemo(() => {
    if (selectedBrand === 'All') return undefined;
    return dbBrands.find((b) => b.name.toLowerCase() === selectedBrand.toLowerCase())?.id;
  }, [selectedBrand, dbBrands]);

  const fetchProducts = useCallback(
    async (append: boolean) => {
      const pageNum = append ? pageRef.current + 1 : 1;
      pageRef.current = pageNum;
      const id = ++reqIdRef.current;
      setIsLoading(true);
      try {
        const res = await fetchShopProducts({
          page: pageNum,
          limit: PAGE_LIMIT,
          search: searchVal || undefined,
          categoryId: selectedCategoryId,
          brandId: selectedBrandId,
        });
        if (id !== reqIdRef.current) return;
        setProducts((prev) => (append ? [...prev, ...res.data] : res.data));
        setHasMore(res.data.length === PAGE_LIMIT);
      } catch (err) {
        if (id !== reqIdRef.current) return;
        console.error('Failed to fetch products:', err);
      } finally {
        if (id === reqIdRef.current) setIsLoading(false);
      }
    },
    [searchVal, selectedCategoryId, selectedBrandId],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts(false);
  }, [fetchProducts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat) {
        setSelectedCategory(cat);
      }
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    if (isLoading) return;
    fetchProducts(true);
  }, [isLoading, fetchProducts]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (!withinPriceRange(p.price, selectedPrice)) return false;
      return true;
    });

    if (selectedSort === 'Price: Low to High') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'Price: High to Low') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'Name: A to Z') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedPrice, selectedSort]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (activeDropdown && !target.closest('.filter-dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">

      <main className="flex-grow w-full">
        <div className="w-full bg-white pt-16 pb-8">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <h1 className="font-bembo text-left text-3xl sm:text-4xl md:text-[44px] text-stone-855 font-normal tracking-wide">
              {searchVal ? `Search Results for "${searchVal}"` : 'Assorted Classic Collection'}
            </h1>
          </div>
        </div>

        <div className="w-full border-t border-b border-stone-200 bg-white relative z-40">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex-grow flex items-center justify-between max-w-[850px] gap-4 mr-4 flex-wrap md:flex-nowrap">
              <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
                <div className="flex items-center gap-1.5 text-stone-855 font-gotham text-sm font-semibold uppercase tracking-wider select-none">
                  <svg className="w-3.5 h-3.5 text-stone-855" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-6-6m6 6l6-6" />
                  </svg>
                  <span>Filter</span>
                </div>

                <div className="relative filter-dropdown-container">
                  <button
                    className="flex items-center gap-1 text-stone-400 font-gotham text-xs font-semibold uppercase tracking-wider cursor-not-allowed opacity-50"
                    disabled
                    aria-label="Collection filter disabled"
                  >
                    <span>Collection Type{selectedCollection !== 'All' ? `: ${selectedCollection}` : ''}</span>
                    <svg className="w-2.5 h-2.5 text-stone-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
                <div className="static md:relative filter-dropdown-container">
                  <button
                    className="flex items-center gap-1 text-stone-400 font-gotham text-xs font-semibold uppercase tracking-wider cursor-not-allowed opacity-50"
                    disabled
                    aria-label="Collection filter disabled"
                  >
                    <span>Origin{selectedOrigin !== 'All' ? `: ${selectedOrigin}` : ''}</span>
                    <svg className="w-2.5 h-2.5 text-stone-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === 'collection' && (
                    <div className="absolute left-4 right-4 md:left-0 md:right-auto md:w-56 mt-3 bg-white border border-stone-200 shadow-lg py-1.5 z-50 rounded-sm">
                      {COLLECTION_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setSelectedOrigin(opt); setActiveDropdown(null); }}
                          className={`w-full text-left px-4 py-2 font-gotham text-[11px] uppercase tracking-wider hover:bg-stone-50 transition-colors cursor-pointer ${selectedOrigin === opt ? 'text-brand-3 font-bold' : 'text-stone-700'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="static md:relative filter-dropdown-container">
                <button
                  onClick={() => toggleDropdown('price')}
                  className="flex items-center gap-1 text-stone-700 hover:text-stone-900 font-gotham text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200"
                >
                  <span>Price Range{selectedPrice !== 'All' ? `: ${selectedPrice}` : ''}</span>
                  <svg className={`w-2.5 h-2.5 text-stone-400 shrink-0 transition-transform duration-200 ${activeDropdown === 'price' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'price' && (
                  <div className="absolute left-4 right-4 md:left-0 md:right-auto md:w-56 mt-3 bg-white border border-stone-200 shadow-lg py-1.5 z-50 rounded-sm">
                    {PRICE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSelectedPrice(opt); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2 font-gotham text-[11px] uppercase tracking-wider hover:bg-stone-50 transition-colors cursor-pointer ${selectedPrice === opt ? 'text-brand-3 font-bold' : 'text-stone-700'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="static md:relative filter-dropdown-container">
                <button
                  onClick={() => toggleDropdown('category')}
                  className="flex items-center gap-1 text-stone-700 hover:text-stone-900 font-gotham text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200"
                >
                  <span>Category{selectedCategory !== 'All' ? `: ${selectedCategory}` : ''}</span>
                  <svg className={`w-2.5 h-2.5 text-stone-400 shrink-0 transition-transform duration-200 ${activeDropdown === 'category' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'category' && (
                  <div className="absolute left-4 right-4 md:right-0 md:left-auto md:w-56 mt-3 bg-white border border-stone-200 shadow-lg py-1.5 z-50 rounded-sm">
                    {categoryOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSelectedCategory(opt); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2 font-gotham text-[11px] uppercase tracking-wider hover:bg-stone-50 transition-colors cursor-pointer ${selectedCategory === opt ? 'text-brand-3 font-bold' : 'text-stone-700'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="static md:relative filter-dropdown-container">
                <button
                  onClick={() => toggleDropdown('brand')}
                  className="flex items-center gap-1 text-stone-700 hover:text-stone-900 font-gotham text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200"
                >
                  <span>Brand{selectedBrand !== 'All' ? `: ${selectedBrand}` : ''}</span>
                  <svg className={`w-2.5 h-2.5 text-stone-400 shrink-0 transition-transform duration-200 ${activeDropdown === 'brand' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'brand' && (
                  <div className="absolute left-4 right-4 md:right-0 md:left-auto md:w-56 mt-3 bg-white border border-stone-200 shadow-lg py-1.5 z-50 rounded-sm">
                    {brandOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSelectedBrand(opt); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2 font-gotham text-[11px] uppercase tracking-wider hover:bg-stone-50 transition-colors cursor-pointer ${selectedBrand === opt ? 'text-brand-3 font-bold' : 'text-stone-700'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-gotham text-xs font-semibold uppercase tracking-wider text-stone-400 select-none mr-1">
                  View as:
                </span>

                <button
                  onClick={() => setViewMode('grid2')}
                  className="p-1.5 cursor-pointer"
                  aria-label="2 Columns Grid"
                >
                  <div className={`w-[18px] h-[18px] border rounded-[2px] flex transition-colors ${
                    viewMode === 'grid2' ? 'border-stone-850' : 'border-stone-300 hover:border-stone-400'
                  }`}>
                    <div className={`w-1/2 border-r h-full transition-colors ${
                      viewMode === 'grid2' ? 'border-stone-855' : 'border-stone-300'
                    }`} />
                    <div className="w-1/2 h-full" />
                  </div>
                </button>

                <button
                  onClick={() => setViewMode('grid3')}
                  className="p-1.5 cursor-pointer"
                  aria-label="3 Columns Grid"
                >
                  <div className={`w-[18px] h-[18px] border rounded-[2px] flex transition-colors ${
                    viewMode === 'grid3' ? 'border-stone-850' : 'border-stone-300 hover:border-stone-400'
                  }`}>
                    <div className={`w-1/3 border-r h-full transition-colors ${
                      viewMode === 'grid3' ? 'border-stone-855' : 'border-stone-300'
                    }`} />
                    <div className={`w-1/3 border-r h-full transition-colors ${
                      viewMode === 'grid3' ? 'border-stone-855' : 'border-stone-300'
                    }`} />
                    <div className="w-1/3 h-full" />
                  </div>
                </button>
              </div>

              <div className="w-px h-6 bg-stone-200 hidden sm:block" />

              <div className="relative filter-dropdown-container">
                <div className="flex items-center gap-1.5">
                  <span className="font-gotham text-xs font-semibold uppercase tracking-wider text-stone-400 select-none">
                    Sort By:
                  </span>
                  <button
                    onClick={() => toggleDropdown('sort')}
                    className="flex items-center justify-between gap-1 text-stone-800 hover:text-stone-900 font-gotham text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200"
                  >
                    <span>{selectedSort}</span>
                    <svg className={`w-2.5 h-2.5 text-stone-400 shrink-0 transition-transform duration-200 ${activeDropdown === 'sort' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {activeDropdown === 'sort' && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-stone-200 shadow-lg py-1.5 z-50 rounded-sm">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSelectedSort(opt); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2 font-gotham text-[11px] uppercase tracking-wider hover:bg-stone-50 transition-colors cursor-pointer ${selectedSort === opt ? 'text-brand-3 font-bold' : 'text-stone-700'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="w-full bg-white py-12 md:py-16">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            {isLoading && products.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-full max-w-[453px] h-[453px] bg-stone-50 animate-pulse border border-stone-100 flex flex-col justify-between p-6 mx-auto rounded-none">
                    <div className="w-full h-[250px] bg-stone-200 rounded-none" />
                    <div className="h-6 bg-stone-200 w-3/4 rounded-none mt-4" />
                    <div className="flex justify-between items-center mt-4">
                      <div className="h-4 bg-stone-200 w-1/3 rounded-none" />
                      <div className="h-8 bg-stone-200 w-1/3 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className={`grid grid-cols-1 md:grid-cols-2 ${viewMode === 'grid3' ? 'lg:grid-cols-3' : ''} gap-4 md:gap-6`}>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={`৳${product.price.toLocaleString()}`}
                      originalPrice={product.originalPrice ? `৳${product.originalPrice.toLocaleString()}` : ''}
                      image={product.image || NO_IMAGE}
                    />
                  ))}
                </div>

                <div className="mt-12">
                  <InfiniteScroll
                    hasMore={hasMore}
                    isLoading={isLoading}
                    onLoadMore={handleLoadMore}
                    allLoadedLabel="All products loaded"
                    loadingLabel="Loading products..."
                    sentinelLabel="Scroll for more"
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="font-bembo text-2xl text-stone-500 mb-4">
                  No products found matching selected filters.
                </h3>
                <button
                  onClick={() => {
                    setSelectedPrice('All');
                    setSelectedCategory('All');
                    setSelectedBrand('All');
                    setSelectedSort('New Arrival');
                  }}
                  className="px-8 py-3 bg-brand-3 hover:bg-[#A38148] text-white font-gotham text-xs font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-3 mb-4"></div>
        <p className="font-gotham text-stone-500 text-sm uppercase tracking-wider">Loading products...</p>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
