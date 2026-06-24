"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiGrid, FiHeart, FiList, FiSearch, FiLoader } from "react-icons/fi";
import { productSlug, shopProducts } from "./products";
import { useCurrency } from "../../lib/currency-context";


const colorOptions = [
  { label: "Orange", value: "#f58a4b" },
  { label: "Sky Blue", value: "#2ac6d4" },
  { label: "Beige", value: "#d8bd97" },
  { label: "White", value: "#f5f5f5" },
  { label: "Blue", value: "#00569c" },
  { label: "Yellow", value: "#f4dc45" },
  { label: "Gray", value: "#c7c7c7" },
  { label: "Lilac", value: "#a77adf" },
  { label: "Brown", value: "#9a4c26" },
  { label: "Black", value: "#050505" },
  { label: "Pink", value: "#e7b1f5" },
  { label: "Red", value: "#ed0d0d" },
  { label: "Green", value: "#179400" },
  { label: "Purple", value: "#5d00a5" },
];

const sizeOptions = ["S", "M", "L", "XL", "XXL"];
const categoryOptions = Array.from(new Set(shopProducts.map((product) => product.category)));
const showOptions = [8, 12, 20];

type SortOption = "featured" | "price-low" | "price-high" | "name";
type ViewMode = "grid" | "list";

export default function ShopCatalog() {
  const { formatCurrency } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState("Football Corner");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [productsPerPage, setProductsPerPage] = useState(8);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  type LoadMode = "infinite" | "button" | "all";
  const [loadMode, setLoadMode] = useState<LoadMode>("infinite");
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    const filtered = shopProducts.filter((product) => {
      const categoryMatches = !selectedCategory || product.category === selectedCategory;
      const colorMatches = !selectedColor || product.color === selectedColor;
      const sizeMatches = !selectedSize || product.size === selectedSize;

      return categoryMatches && colorMatches && sizeMatches;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return shopProducts.indexOf(a) - shopProducts.indexOf(b);
    });
  }, [selectedCategory, selectedColor, selectedSize, sortBy]);

  const visibleProducts = useMemo(() => {
    if (loadMode === "all") {
      return filteredProducts;
    }
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount, loadMode]);

  useEffect(() => {
    setVisibleCount(productsPerPage);
  }, [productsPerPage, selectedCategory, selectedColor, selectedSize, sortBy]);

  const handleLoadMore = () => {
    if (isLoadingMore || visibleCount >= filteredProducts.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + productsPerPage, filteredProducts.length));
      setIsLoadingMore(false);
    }, 600);
  };

  useEffect(() => {
    if (loadMode !== "infinite") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && visibleCount < filteredProducts.length) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMode, isLoadingMore, visibleCount, filteredProducts.length, productsPerPage]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(selectedCategory ? [{ label: selectedCategory, href: "" }] : []),
    ...(selectedColor ? [{ label: selectedColor, href: "" }] : []),
    ...(selectedSize ? [{ label: `Size ${selectedSize}`, href: "" }] : []),
  ];

  function updateFilter(update: () => void) {
    update();
    setVisibleCount(productsPerPage);
  }

  function clearFilters() {
    setSelectedCategory("");
    setSelectedColor("");
    setSelectedSize("");
    setSortBy("featured");
    setVisibleCount(productsPerPage);
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8">
      <div className="flex items-center gap-4">
        <FiSearch className="text-3xl" />
        <h1 className="text-base font-black uppercase tracking-[0.02em]">
          {selectedCategory || "All Products"}
        </h1>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3 text-xs font-black uppercase">
        {breadcrumbItems.map((item, index) => (
          <span key={`${item.label}-${index}`} className="flex items-center gap-3">
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
            {index < breadcrumbItems.length - 1 && (
              <span className="text-base font-medium">›</span>
            )}
          </span>
        ))}
      </div>

      <h2 className="mt-3 text-4xl font-medium tracking-tight">
        {selectedCategory || "Shop"}
      </h2>

      <div className="mt-9 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <h3 className="text-base font-black uppercase">Categories</h3>

          <div className="mt-7 grid gap-3">
            <button
              type="button"
              onClick={() => updateFilter(() => setSelectedCategory(""))}
              className={`text-left text-sm font-bold ${
                selectedCategory === "" ? "text-black" : "text-neutral-500"
              }`}
            >
              All Products
            </button>
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => updateFilter(() => setSelectedCategory(category))}
                className={`flex items-center justify-between text-left text-sm font-bold ${
                  selectedCategory === category ? "text-black" : "text-neutral-500"
                }`}
              >
                {category}
                {selectedCategory === category && <FiChevronDown />}
              </button>
            ))}
          </div>

          <h3 className="mt-12 text-base font-black uppercase">Color</h3>
          <div className="mt-6 grid grid-cols-3 gap-x-7 gap-y-7">
            {colorOptions.map((color) => {
              const isDisabled = !shopProducts.some((product) => product.color === color.label);
              const isSelected = selectedColor === color.label;

              return (
                <button
                  key={color.label}
                  className={`text-left ${isDisabled ? "opacity-30" : ""}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() =>
                    updateFilter(() => setSelectedColor(isSelected ? "" : color.label))
                  }
                >
                  <span
                    className={`block h-8 w-8 rounded-full border ${
                      isSelected ? "border-black ring-2 ring-black ring-offset-2" : "border-neutral-200"
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="mt-2 block text-sm font-bold text-neutral-500">
                    {color.label}
                  </span>
                </button>
              );
            })}
          </div>

          <h3 className="mt-14 text-base font-black uppercase">Size</h3>
          <div className="mt-7 grid gap-4 text-base font-bold">
            {sizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateFilter(() => setSelectedSize(selectedSize === size ? "" : size))}
                className={`text-left ${selectedSize === size ? "text-black" : "text-neutral-500"}`}
              >
                {size}
              </button>
            ))}
          </div>
        </aside>

        <section>
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm font-bold text-neutral-500">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(event) => updateFilter(() => setSortBy(event.target.value as SortOption))}
                className="border border-neutral-200 bg-white px-3 py-2 font-medium outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name</option>
              </select>
              <button
                type="button"
                onClick={clearFilters}
                className="bg-[#ffd02f] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-black transition hover:bg-black hover:text-white"
              >
                Clear Filters
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-neutral-500">
              {loadMode !== "all" && (
                <>
                  <span>Limit:</span>
                  <select
                    value={productsPerPage}
                    onChange={(event) => {
                      setProductsPerPage(Number(event.target.value));
                    }}
                    className="border border-neutral-200 bg-white px-2 py-1.5 font-medium outline-none"
                  >
                    {showOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <span>Mode:</span>
              <select
                value={loadMode}
                onChange={(event) => {
                  setLoadMode(event.target.value as LoadMode);
                }}
                className="border border-neutral-200 bg-white px-2 py-1.5 font-medium outline-none"
              >
                <option value="infinite">Auto-Scroll</option>
                <option value="button">Load More</option>
                <option value="all">Show All</option>
              </select>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`border border-neutral-200 p-2 text-lg cursor-pointer ${
                  viewMode === "grid" ? "bg-black text-white" : "text-black"
                }`}
                aria-label="Grid view"
              >
                <FiGrid />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`border border-neutral-200 p-2 text-lg cursor-pointer ${
                  viewMode === "list" ? "bg-black text-white" : "text-black"
                }`}
                aria-label="List view"
              >
                <FiList />
              </button>
            </div>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="border border-neutral-200 px-6 py-12 text-center">
              <h3 className="text-xl font-bold">No products found</h3>
              <p className="mt-2 text-sm text-neutral-500">Try a different category, color, or size.</p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-x-5 gap-y-10 xl:grid-cols-4"
                  : "grid gap-5"
              }
            >
              {visibleProducts.map((product) => (
                <article
                  key={product.name}
                  className={`${
                    viewMode === "grid" ? "group" : "group grid gap-5 sm:grid-cols-[220px_1fr]"
                  } animate-fade-up`}
                >
                  <Link href={`/shop/${productSlug(product)}`} className="block border border-neutral-100 bg-white">
                    <div className={viewMode === "grid" ? "relative aspect-square" : "relative aspect-square sm:h-full"}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1280px) 22vw, (min-width: 768px) 45vw, 50vw"
                        className="object-cover object-center p-6 transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  </Link>

                  <div className={viewMode === "grid" ? "mt-4 flex items-start justify-between gap-3" : "flex items-start justify-between gap-4 py-2"}>
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-black uppercase text-neutral-400">
                        {product.category}, {product.team}, {product.color}, Size {product.size}
                      </p>
                      <h3 className="mt-1 truncate text-sm font-black uppercase text-neutral-800">
                        {product.name}
                      </h3>
                      {viewMode === "list" && (
                        <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                          A curated vintage football piece from the Humana archive, selected for condition,
                          color, and everyday styling.
                        </p>
                      )}
                      <p className="mt-2 text-base font-black text-neutral-800">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <FiHeart className="mt-1 shrink-0 text-lg text-neutral-600 cursor-pointer" aria-label="Add to wishlist" />
                  </div>
                </article>
              ))}

              {/* Skeleton items rendered inside the same grid */}
              {isLoadingMore &&
                Array.from({ length: Math.min(viewMode === "grid" ? 4 : 2, filteredProducts.length - visibleCount) }).map((_, idx) => (
                  <div
                    key={`skeleton-${idx}`}
                    className={
                      viewMode === "grid"
                        ? "animate-pulse flex flex-col gap-4"
                        : "animate-pulse grid gap-5 sm:grid-cols-[220px_1fr] py-2"
                    }
                  >
                    <div className="aspect-square w-full bg-neutral-50 border border-neutral-100 rounded flex items-center justify-center">
                      <FiLoader className="text-neutral-300 text-3xl animate-spin" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="h-3 w-1/3 bg-neutral-250 rounded" />
                      <div className="h-4 w-2/3 bg-neutral-250 rounded" />
                      {viewMode === "list" && (
                        <div className="space-y-2 mt-2">
                          <div className="h-3 w-full bg-neutral-150 rounded" />
                          <div className="h-3 w-5/6 bg-neutral-150 rounded" />
                        </div>
                      )}
                      <div className="h-4 w-1/4 bg-neutral-250 rounded mt-auto" />
                    </div>
                  </div>
                ))}
            </div>
          )}

          <div className="mt-16 flex flex-col items-center justify-center border-t border-neutral-200 pt-10">
            {/* Progress indicators */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-neutral-500 font-medium">
                Showing {visibleProducts.length} of {filteredProducts.length} Products
              </p>
              {filteredProducts.length > 0 && (
                <div className="h-[3px] w-48 overflow-hidden bg-neutral-100 rounded-full">
                  <div
                    className="h-full bg-[#ffd02f] transition-all duration-500 ease-out"
                    style={{ width: `${(visibleProducts.length / filteredProducts.length) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Load More Trigger Area */}
            {visibleCount < filteredProducts.length && loadMode !== "all" && (
              <div className="mt-6 flex flex-col items-center w-full">
                {loadMode === "button" ? (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="group relative flex items-center gap-3 bg-black px-8 py-3.5 text-xs font-black uppercase tracking-[0.1em] text-white hover:bg-neutral-800 transition active:scale-97 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoadingMore && <FiLoader className="animate-spin text-sm" />}
                    <span>{isLoadingMore ? "Loading Items..." : "Load More Products"}</span>
                  </button>
                ) : (
                  <div
                    ref={observerTarget}
                    className="flex h-16 items-center justify-center py-4 text-neutral-400"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em]">
                      <FiLoader className="animate-spin text-base text-[#151515]" />
                      <span className="text-[#151515]">Loading more on scroll...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
