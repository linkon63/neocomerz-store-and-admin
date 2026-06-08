"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FiChevronDown, FiGrid, FiHeart, FiList, FiSearch } from "react-icons/fi";
import { productSlug, shopProducts } from "./products";

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

function formatPrice(price: number) {
  return `€${price.toFixed(2)}`;
}

export default function ShopCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("Football Corner");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [productsPerPage, setProductsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage,
  );

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(selectedCategory ? [{ label: selectedCategory, href: "" }] : []),
    ...(selectedColor ? [{ label: selectedColor, href: "" }] : []),
    ...(selectedSize ? [{ label: `Size ${selectedSize}`, href: "" }] : []),
  ];

  function updateFilter(update: () => void) {
    update();
    setCurrentPage(1);
  }

  function clearFilters() {
    setSelectedCategory("");
    setSelectedColor("");
    setSelectedSize("");
    setSortBy("featured");
    setCurrentPage(1);
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
              <span>
                Showing {visibleProducts.length} of {filteredProducts.length}
              </span>
              <select
                value={productsPerPage}
                onChange={(event) => {
                  setProductsPerPage(Number(event.target.value));
                  setCurrentPage(1);
                }}
                className="border border-neutral-200 bg-white px-3 py-2 font-medium outline-none"
              >
                {showOptions.map((option) => (
                  <option key={option} value={option}>
                    Show {option}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`border border-neutral-200 p-2 text-lg ${
                  viewMode === "grid" ? "bg-black text-white" : "text-black"
                }`}
                aria-label="Grid view"
              >
                <FiGrid />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`border border-neutral-200 p-2 text-lg ${
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
                  className={viewMode === "grid" ? "group" : "group grid gap-5 sm:grid-cols-[220px_1fr]"}
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
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <FiHeart className="mt-1 shrink-0 text-lg text-neutral-600" aria-label="Add to wishlist" />
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-12 flex items-center justify-between border-t border-neutral-200 pt-6 text-sm font-bold">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="text-neutral-600 disabled:text-neutral-300"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
              disabled={currentPage === pageCount}
              className="text-neutral-600 disabled:text-neutral-300"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
