'use client';

import { useState, useEffect } from 'react';
import TopHeader from '@/components/sections/top-header';
import Header from '@/components/sections/header';
import ProductCard from '@/components/sections/ui/product-card';
import RelatedCarousel from '@/components/sections/ui/related-carousel';
import Mainfooter from '@/components/sections/main-footer';
import Bottomfooter from '@/components/sections/bottom-footer';
import { Product, fetchAllProducts } from '@/lib/api';

const COLLECTION_OPTIONS = ['All', 'Tea Books', 'Classic Collections', 'Royal Collections'];
const PRICE_OPTIONS = ['All', 'Under ৳3,000', '৳3,000 - ৳10,000', 'Over ৳10,000'];
const CATEGORY_OPTIONS = ['All', 'Black Tea', 'Green Tea', 'Herbal Infusions'];
const ORIGIN_OPTIONS = ['All', 'Sylhet, Bangladesh', 'Darjeeling, India', 'London, UK'];
const SORT_OPTIONS = ['New Arrival', 'Price: Low to High', 'Price: High to Low', 'Name: A to Z'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid2' | 'grid3'>('grid3');
  const [selectedCollection, setSelectedCollection] = useState<string>('All');
  const [selectedPrice, setSelectedPrice] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<string>('New Arrival');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const data = await fetchAllProducts();
      setProducts(data);
      setIsLoading(false);
    }
    loadProducts();
  }, []);

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

  const filteredProducts = products.filter((product) => {
    if (selectedCollection !== 'All' && product.collection !== selectedCollection) {
      return false;
    }
    if (selectedPrice !== 'All') {
      if (selectedPrice === 'Under ৳3,000' && product.priceNum >= 3000) return false;
      if (selectedPrice === '৳3,000 - ৳10,000' && (product.priceNum < 3000 || product.priceNum > 10000)) return false;
      if (selectedPrice === 'Over ৳10,000' && product.priceNum <= 10000) return false;
    }
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }
    if (selectedOrigin !== 'All' && product.origin !== selectedOrigin) {
      return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === 'Price: Low to High') {
      return a.priceNum - b.priceNum;
    }
    if (selectedSort === 'Price: High to Low') {
      return b.priceNum - a.priceNum;
    }
    if (selectedSort === 'Name: A to Z') {
      return a.name.localeCompare(b.name);
    }
    return parseInt(a.id) - parseInt(b.id);
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TopHeader />
      <Header />

      <main className="flex-grow w-full">
        <div className="w-full bg-white pt-16 pb-8">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <h1 className="font-bembo text-left text-3xl sm:text-4xl md:text-[44px] text-stone-855 font-normal tracking-wide">
              Assorted Classic Collection
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
                    onClick={() => toggleDropdown('collection')}
                    className="flex items-center gap-1 text-stone-700 hover:text-stone-900 font-gotham text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200"
                  >
                    <span>Collection Type{selectedCollection !== 'All' ? `: ${selectedCollection}` : ''}</span>
                    <svg className={`w-2.5 h-2.5 text-stone-400 shrink-0 transition-transform duration-200 ${activeDropdown === 'collection' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === 'collection' && (
                    <div className="absolute left-0 mt-3 w-56 bg-white border border-stone-200 shadow-lg py-1.5 z-50 rounded-sm">
                      {COLLECTION_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setSelectedCollection(opt); setActiveDropdown(null); }}
                          className={`w-full text-left px-4 py-2 font-gotham text-[11px] uppercase tracking-wider hover:bg-stone-50 transition-colors cursor-pointer ${selectedCollection === opt ? 'text-brand-3 font-bold' : 'text-stone-700'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative filter-dropdown-container">
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
                  <div className="absolute left-0 mt-3 w-56 bg-white border border-stone-200 shadow-lg py-1.5 z-50 rounded-sm">
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

              <div className="relative filter-dropdown-container">
                <button
                  onClick={() => toggleDropdown('category')}
                  className="flex items-center gap-1 text-stone-700 hover:text-stone-900 font-gotham text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200"
                >
                  <span>Tea Category{selectedCategory !== 'All' ? `: ${selectedCategory}` : ''}</span>
                  <svg className={`w-2.5 h-2.5 text-stone-400 shrink-0 transition-transform duration-200 ${activeDropdown === 'category' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'category' && (
                  <div className="absolute left-0 mt-3 w-56 bg-white border border-stone-200 shadow-lg py-1.5 z-50 rounded-sm">
                    {CATEGORY_OPTIONS.map((opt) => (
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

              <div className="relative filter-dropdown-container">
                <button
                  onClick={() => toggleDropdown('origin')}
                  className="flex items-center gap-1 text-stone-700 hover:text-stone-900 font-gotham text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200"
                >
                  <span>Origin{selectedOrigin !== 'All' ? `: ${selectedOrigin}` : ''}</span>
                  <svg className={`w-2.5 h-2.5 text-stone-400 shrink-0 transition-transform duration-200 ${activeDropdown === 'origin' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'origin' && (
                  <div className="absolute left-0 mt-3 w-56 bg-white border border-stone-200 shadow-lg py-1.5 z-50 rounded-sm">
                    {ORIGIN_OPTIONS.map((opt) => (
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
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 w-full">
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
            ) : sortedProducts.length > 0 ? (
              <div className={`grid grid-cols-1 md:grid-cols-2 ${viewMode === 'grid3' ? 'lg:grid-cols-3' : ''} gap-8 md:gap-10 lg:gap-12`}>
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    image={product.image}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="font-bembo text-2xl text-stone-500 mb-4">
                  No products found matching selected filters.
                </h3>
                <button
                  onClick={() => {
                    setSelectedCollection('All');
                    setSelectedPrice('All');
                    setSelectedCategory('All');
                    setSelectedOrigin('All');
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

        <RelatedCarousel />
      </main>

      <Mainfooter />
      <Bottomfooter />
    </div>
  );
}
