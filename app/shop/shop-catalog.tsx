"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiGrid, FiHeart, FiList, FiSearch, FiShoppingBag, FiFilter, FiX } from "react-icons/fi";
import { useCart } from "../_components/cart-context";
import { useWishlist } from "../_components/wishlist-context";
import { productSlug, resolveImageUrl, type ShopProduct, type DBProduct, type ProductVariant, type ProductMedia, type VariantAttribute } from "./products";

/** Determine if an attribute value is a size by checking name first, then value heuristics */
function isSize(attr: VariantAttribute): boolean {
  const name = attr.attributeValue?.attribute?.name?.toLowerCase() ?? "";
  if (name === "size") return true;
  const val = attr.attributeValue?.value ?? "";
  return ["xs", "s", "m", "l", "xl", "xxl", "2xl", "3xl"].includes(val.toLowerCase());
}

/** Determine if an attribute value is a color by checking name first, then value heuristics */
function isColor(attr: VariantAttribute): boolean {
  const name = attr.attributeValue?.attribute?.name?.toLowerCase() ?? "";
  if (name === "color" || name === "colour") return true;
  const val = attr.attributeValue?.value ?? "";
  // Not a size → treat as color
  return val.length > 0 && !["xs", "s", "m", "l", "xl", "xxl", "2xl", "3xl"].includes(val.toLowerCase());
}

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

function formatPrice(price: number) {
  return `€${price.toFixed(2)}`;
}

export default function ShopCatalog() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  function handleAddToCart(product: ShopProduct) {
    void addItem({
      slug: productSlug(product),
      name: product.name,
      price: product.discountedPrice != null && product.discountedPrice < product.price ? product.discountedPrice : product.price,
      image: product.image,
      color: product.color,
      size: product.size,
      variantId: product.variantId,
    });
  }
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [productsPerPage, setProductsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
          const discountedPrice = defaultVariant && (defaultVariant as any).discountedPrice != null
            ? Number((defaultVariant as any).discountedPrice)
            : undefined;

          let color = "Black";
          let size = "M";

          if (defaultVariant?.attributes) {
            for (const attr of defaultVariant.attributes) {
              const val = attr.attributeValue?.value;
              if (!val) continue;
              if (isSize(attr)) {
                size = val;
              } else if (isColor(attr)) {
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
                  if (val) {
                    if (isSize(attr)) {
                      allSizes.add(val);
                    } else if (isColor(attr)) {
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
            description: p.description,
            category: p.category?.name || "Football Corner",
            team: p.brand?.name || "Juventus",
            price,
            discountedPrice,
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
      <section className="mx-auto max-w-[1440px] px-4 py-32 sm:px-8 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ffd02f] border-t-transparent" />
        <p className="text-sm font-black uppercase tracking-[0.08em] text-neutral-500">Loading Shop Catalog...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-[1440px] px-4 py-32 sm:px-8 flex flex-col items-center justify-center gap-4 text-center">
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
    <section className="mx-auto py-8 mb-16 md:mb-20 lg:mb-24">
      <div className="container">
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
                className={`text-left text-sm font-bold ${selectedCategory === "" ? "text-black" : "text-neutral-500"
                  }`}
              >
                All Products
              </button>
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => updateFilter(() => setSelectedCategory(category))}
                  className={`flex items-center justify-between text-left text-sm font-bold ${selectedCategory === category ? "text-black" : "text-neutral-500"
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
                      className={`block h-8 w-8 rounded-full border ${isSelected ? "border-black ring-2 ring-black ring-offset-2" : "border-neutral-200"
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
              <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-neutral-500">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex items-center gap-2 border border-black bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-neutral-800 transition lg:hidden"
                >
                  <FiFilter className="text-sm" />
                  Filters
                </button>

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
                  className={`hidden md:flex border border-neutral-200 p-2 text-lg ${viewMode === "grid" ? "bg-black text-white" : "text-black"
                    }`}
                  aria-label="Grid view"
                >
                  <FiGrid />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`hidden md:flex border border-neutral-200 p-2 text-lg ${viewMode === "list" ? "bg-black text-white" : "text-black"
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
                    <div className="relative group/image overflow-hidden border border-neutral-100 bg-white">
                      <Link href={`/shop/${productSlug(product)}`} className="block">
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg border border-neutral-200 transition-all duration-300 opacity-0 scale-90 group-hover/image:opacity-100 group-hover/image:scale-100 hover:bg-black hover:text-white"
                        title="Add to Cart"
                      >
                        <FiShoppingBag className="text-base" />
                      </button>
                    </div>

                    <div className={viewMode === "grid" ? "mt-4 flex items-start justify-between gap-3" : "flex items-start justify-between gap-4 py-2"}>
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-black uppercase text-neutral-400">
                          {product.category}, {product.team}, {product.color}, Size {product.size}
                        </p>
                        <h3 className="mt-1 truncate text-sm font-black uppercase text-neutral-800">
                          {product.name}
                        </h3>
                        {viewMode === "list" && (product as ShopProduct & { description?: string }).description && (
                          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 line-clamp-3">
                            {(product as ShopProduct & { description?: string }).description}
                          </p>
                        )}
                        <p className="mt-2 text-base font-black flex items-center gap-2">
                          {product.discountedPrice != null && product.discountedPrice < product.price ? (
                            <>
                              <span className="text-red-650">{formatPrice(product.discountedPrice)}</span>
                              <span className="text-neutral-400 line-through text-sm font-semibold">{formatPrice(product.price)}</span>
                            </>
                          ) : (
                            formatPrice(product.price)
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        className="mt-1 shrink-0 text-lg hover:text-red-500 transition-colors"
                        aria-label="Add to wishlist"
                      >
                        <FiHeart className={product.id && isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-neutral-600"} />
                      </button>
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
      </div>

      {/* Mobile Filter Drawer (visible only on mobile when opened) */}
      <div className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${mobileFilterOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Overlay background */}
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${mobileFilterOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileFilterOpen(false)}
        />

        {/* Drawer content */}
        <div className={`fixed inset-y-0 right-0 flex w-full max-w-[320px] flex-col bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out transform ${mobileFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <h3 className="text-base font-black uppercase tracking-[0.08em] text-black flex items-center gap-2">
              <FiFilter /> Filters
            </h3>
            <button
              type="button"
              className="text-2xl text-black hover:text-neutral-600 focus:outline-none transition-transform duration-200 hover:rotate-90"
              onClick={() => setMobileFilterOpen(false)}
              aria-label="Close filters"
            >
              <FiX />
            </button>
          </div>

          {/* Scrollable Filters Content */}
          <div className="flex-1 overflow-y-auto py-6 space-y-8 pr-1">
            {/* Categories */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.06em] text-black">Categories</h4>
              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={() => updateFilter(() => setSelectedCategory(""))}
                  className={`text-left text-xs font-bold uppercase tracking-[0.04em] ${selectedCategory === "" ? "text-black border-l-2 border-black pl-2" : "text-neutral-500 pl-2"}`}
                >
                  All Products
                </button>
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => updateFilter(() => setSelectedCategory(category))}
                    className={`flex items-center justify-between text-left text-xs font-bold uppercase tracking-[0.04em] ${selectedCategory === category ? "text-black border-l-2 border-black pl-2" : "text-neutral-500 pl-2"}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.06em] text-black">Color</h4>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {colorOptions.map((color) => {
                  const isSelected = selectedColor === color.label;
                  return (
                    <button
                      key={color.label}
                      className="flex flex-col items-center text-center focus:outline-none"
                      type="button"
                      onClick={() =>
                        updateFilter(() => setSelectedColor(isSelected ? "" : color.label))
                      }
                    >
                      <span
                        className={`block h-7 w-7 rounded-full border transition-all duration-200 ${isSelected ? "border-black ring-2 ring-black ring-offset-2 scale-110" : "border-neutral-200"}`}
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="mt-1.5 block text-[10px] font-bold text-neutral-500 truncate w-full">
                        {color.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.06em] text-black">Size</h4>
              <div className="mt-4 flex flex-wrap gap-2">
                {sizeOptions.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateFilter(() => setSelectedSize(isSelected ? "" : size))}
                      className={`h-9 w-9 border text-xs font-bold uppercase flex items-center justify-center transition ${isSelected ? "bg-black border-black text-white" : "border-neutral-200 text-neutral-600 hover:border-black"}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky footer buttons in Drawer */}
          <div className="border-t border-neutral-100 pt-4 mt-auto space-y-2">
            <div className="text-xs text-neutral-500 font-bold text-center mb-2">
              Found {filteredProducts.length} items
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  clearFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full border border-black bg-white py-3 text-center text-xs font-black uppercase tracking-[0.1em] text-black hover:bg-neutral-50 transition"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-black py-3 text-center text-xs font-black uppercase tracking-[0.1em] text-white hover:bg-neutral-800 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
