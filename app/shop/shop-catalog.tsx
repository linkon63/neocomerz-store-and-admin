"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiGrid, FiList, FiSearch } from "react-icons/fi";
import { resolveImageUrl, type ShopProduct, type DBProduct, type ProductVariant, type ProductMedia } from "./products";
import ProductCard from "../_components/product-card";

const colorHexMap: Record<string, string> = {
  Orange: "#f58a4b",
  "Sky Blue": "#2ac6d4",
  Beige: "#d8bd97",
  White: "#f5f5f5",
  Blue: "#00569c",
  Yellow: "#f4dc45",
  Gray: "#c7c7c7",
  Lilac: "#a77adf",
  Brown: "#9a4c26",
  Black: "#050505",
  Pink: "#e7b1f5",
  Red: "#ed0d0d",
  Green: "#179400",
  Purple: "#5d00a5",
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api/v1";

const showOptions = [8, 12, 20];

type SortOption = "featured" | "price-low" | "price-high" | "name";
type ViewMode = "grid" | "list";

export default function ShopCatalog() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [productsPerPage, setProductsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${BASE_URL}/products?limit=100`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const result = await response.json();
        const dbProducts: DBProduct[] = result.data || [];
        const activeDbProducts = dbProducts.filter((p: DBProduct) => p.status === "active");
        const mapped = activeDbProducts.map((p: DBProduct) => {
          const defaultVariant = p.variants?.find((v: ProductVariant) => v.isDefault) || p.variants?.[0];
          const price = defaultVariant ? Number(defaultVariant.price) : 0;
          
          let color = "Black";
          let size = "M";
          
          if (defaultVariant?.attributes) {
            for (const attr of defaultVariant.attributes) {
              const val = attr.attributeValue?.value;
              if (!val) continue;
              const attrName = attr.attributeValue?.attribute?.name?.toLowerCase();
              if (attrName === "size" || ["S", "M", "L", "XL", "XXL"].includes(val)) {
                size = val;
              } else {
                color = val;
              }
            }
          }
          
          const featuredMedia = p.media?.find((m: ProductMedia) => m.isFeatured) || p.media?.[0];
          const image = resolveImageUrl(featuredMedia?.media?.url);
          
          const allColors = new Set<string>();
          const allSizes = new Set<string>();
          if (p.variants) {
            for (const v of p.variants) {
              if (v.attributes) {
                for (const attr of v.attributes) {
                  const val = attr.attributeValue?.value;
                  const name = attr.attributeValue?.attribute?.name?.toLowerCase();
                  if (val) {
                    if (name === "size" || ["S", "M", "L", "XL", "XXL"].includes(val)) {
                      allSizes.add(val);
                    } else {
                      allColors.add(val);
                    }
                  }
                }
              }
            }
          }

          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            category: p.category?.name || "Football Corner",
            team: p.brand?.name || "Juventus",
            price,
            color,
            size,
            image,
            variantId: defaultVariant?.id,
            colors: Array.from(allColors),
            sizes: Array.from(allSizes),
          };
        });
        setProducts(mapped);
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category)));
  }, [products]);

  const colorOptions = useMemo(() => {
    const colors = new Set<string>();
    for (const p of products) {
      if (p.colors && p.colors.length > 0) {
        p.colors.forEach((c) => colors.add(c));
      } else if (p.color) {
        colors.add(p.color);
      }
    }
    return Array.from(colors).map((c) => ({
      label: c,
      value: colorHexMap[c] || "#cccccc",
    }));
  }, [products]);

  const sizeOptions = useMemo(() => {
    const sizes = new Set<string>();
    for (const p of products) {
      if (p.sizes && p.sizes.length > 0) {
        p.sizes.forEach((s) => sizes.add(s));
      } else if (p.size) {
        sizes.add(p.size);
      }
    }
    const order = ["S", "M", "L", "XL", "XXL"];
    return Array.from(sizes).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const categoryMatches = !selectedCategory || product.category === selectedCategory;
      const colorMatches = !selectedColor || (product.colors ? product.colors.includes(selectedColor) : product.color === selectedColor);
      const sizeMatches = !selectedSize || (product.sizes ? product.sizes.includes(selectedSize) : product.size === selectedSize);

      return categoryMatches && colorMatches && sizeMatches;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return products.indexOf(a) - products.indexOf(b);
    });
  }, [products, selectedCategory, selectedColor, selectedSize, sortBy]);

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

  if (isLoading) {
    return (
      <section className="mx-auto max-w-[1400px] px-4 py-32 sm:px-8 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ffd02f] border-t-transparent" />
        <p className="text-sm font-black uppercase tracking-[0.08em] text-neutral-500">Loading Shop Catalog...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-[1400px] px-4 py-32 sm:px-8 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-bold text-red-500">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-[#ffd02f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black hover:bg-black hover:text-white transition"
        >
          Retry
        </button>
      </section>
    );
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
              const isSelected = selectedColor === color.label;

              return (
                <button
                  key={color.label}
                  className="text-left"
                  type="button"
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
                <ProductCard key={product.name} product={product} viewMode={viewMode} />
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
