"use client";

import Image from "next/image";
import Link from "@/components/LocaleLink";
import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiGrid, FiHeart, FiList, FiSearch, FiShoppingBag, FiFilter, FiX } from "react-icons/fi";
import { useCart } from "@/app/_components/cart-context";
import { useWishlist } from "@/app/_components/wishlist-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatCurrency } from "@/lib/i18n/format";
import { productSlug, resolveImageUrl, type ShopProduct, type DBProduct, type ProductVariant, type ProductMedia, type VariantAttribute } from "@/app/_components/products";



const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api/v1";

const showOptions = [20, 40, 60];

type SortOption = "featured" | "price-low" | "price-high" | "name";
type ViewMode = "grid" | "list";

export default function ShopCatalog() {
  const { t, locale } = useI18n();
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
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [productsPerPage, setProductsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${BASE_URL}/products?limit=100`, {
          headers: { "Accept-Language": locale },
        });
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

          let color = "";
          let size = "";

          if (defaultVariant?.attributes) {
            for (const attr of defaultVariant.attributes) {
              const val = attr.attributeValue?.value;
              if (!val) continue;
              const name = attr.attributeValue?.attribute?.name?.toLowerCase() ?? "";
              if (name === "size") {
                size = val;
              } else if (name === "color" || name === "colour") {
                color = val;
              }
            }
          }

          const featuredMedia = p.media?.find((m: ProductMedia) => m.isFeatured) || p.media?.[0];
          const image = resolveImageUrl(featuredMedia?.media?.url);

          const productAttrMap = new Map<string, Set<string>>();
          if (p.variants) {
            for (const v of p.variants) {
              if (v.attributes) {
                for (const attr of v.attributes) {
                  const name = attr.attributeValue?.attribute?.name;
                  const val = attr.attributeValue?.value;
                  if (name && val) {
                    if (!productAttrMap.has(name)) {
                      productAttrMap.set(name, new Set());
                    }
                    productAttrMap.get(name)!.add(val);
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
            team: p.brand?.name || "—",
            price,
            discountedPrice,
            color,
            size,
            image,
            variantId: defaultVariant?.id,
            attributes: Array.from(productAttrMap.entries()).map(([name, valuesSet]) => ({
              name,
              values: Array.from(valuesSet)
            }))
          };
        });
        setProducts(mapped);
      } catch (err) {
        console.error(err);
        setError(t("shop.loadError"));
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [locale, t]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category)));
  }, [products]);

  const filterOptions = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const p of products) {
      if (p.attributes) {
        for (const attr of p.attributes) {
          if (!map.has(attr.name)) {
            map.set(attr.name, new Set());
          }
          for (const val of attr.values) {
            map.get(attr.name)!.add(val);
          }
        }
      }
    }
    const order = ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"];
    return Array.from(map.entries()).map(([name, valuesSet]) => {
      const values = Array.from(valuesSet);
      if (name.toLowerCase() === "size") {
        values.sort((a, b) => {
          const indexA = order.indexOf(a.toUpperCase());
          const indexB = order.indexOf(b.toUpperCase());
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          const numA = parseFloat(a);
          const numB = parseFloat(b);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.localeCompare(b);
        });
      } else {
        if (values.every(v => !isNaN(parseFloat(v)))) {
          values.sort((a, b) => parseFloat(a) - parseFloat(b));
        } else {
          values.sort();
        }
      }
      return { name, values };
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const categoryMatches = !selectedCategory || product.category === selectedCategory;
      if (!categoryMatches) return false;

      return Object.entries(selectedFilters).every(([attrName, selectedVal]) => {
        const productAttr = product.attributes?.find((a: any) => a.name === attrName);
        if (!productAttr) return false;
        return productAttr.values.includes(selectedVal);
      });
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return products.indexOf(a) - products.indexOf(b);
    });
  }, [products, selectedCategory, selectedFilters, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage,
  );

  const breadcrumbItems = [
    { label: t("shop.breadcrumbHome"), href: "/" },
    { label: t("shop.breadcrumbShop"), href: "/shop" },
    ...(selectedCategory ? [{ label: selectedCategory, href: "" }] : []),
    ...Object.entries(selectedFilters).map(([name, val]) => ({
      label: `${name}: ${val}`,
      href: "",
    })),
  ];

  function updateFilter(update: () => void) {
    update();
    setCurrentPage(1);
  }

  const handleToggleFilter = (attrName: string, val: string) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      if (updated[attrName] === val) {
        delete updated[attrName];
      } else {
        updated[attrName] = val;
      }
      return updated;
    });
    setCurrentPage(1);
  };

  function clearFilters() {
    setSelectedCategory("");
    setSelectedFilters({});
    setSortBy("featured");
    setCurrentPage(1);
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-[1440px] px-4 py-32 sm:px-8 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ffd02f] border-t-transparent" />
        <p className="text-sm font-black uppercase tracking-[0.08em] text-neutral-500">{t("shop.loadingCatalog")}</p>
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
          {t("shop.retry")}
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
            {selectedCategory || t("shop.allProducts")}
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
          {selectedCategory || t("shop.title")}
        </h2>

        <div className="mt-9 grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <h3 className="text-base font-black uppercase">{t("shop.categories")}</h3>

            <div className="mt-7 grid gap-3">
              <button
                type="button"
                onClick={() => updateFilter(() => setSelectedCategory(""))}
                className={`text-left text-sm font-bold ${selectedCategory === "" ? "text-black" : "text-neutral-500"
                  }`}
              >
                {t("shop.allProducts")}
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

            {filterOptions.map((filter) => (
              <div key={filter.name} className="mt-12">
                <h3 className="text-base font-black uppercase">{filter.name}</h3>
                <div className="mt-6 flex flex-wrap gap-2">
                  {filter.values.map((val) => {
                    const isSelected = selectedFilters[filter.name] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleToggleFilter(filter.name, val)}
                        className={`min-w-[40px] h-8 px-3 text-xs font-bold border rounded-none transition-all ${
                          isSelected
                            ? "border-black bg-black text-white"
                            : "border-neutral-200 text-neutral-600 hover:border-black"
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
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
                  {t("shop.filters")}
                </button>

                <span>{t("shop.sortBy")}</span>
                <select
                  value={sortBy}
                  onChange={(event) => updateFilter(() => setSortBy(event.target.value as SortOption))}
                  className="border border-neutral-200 bg-white px-3 py-2 font-medium outline-none"
                >
                  <option value="featured">{t("shop.sortFeatured")}</option>
                  <option value="price-low">{t("shop.sortPriceLow")}</option>
                  <option value="price-high">{t("shop.sortPriceHigh")}</option>
                  <option value="name">{t("shop.sortName")}</option>
                </select>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="bg-[#ffd02f] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-black transition hover:bg-black hover:text-white"
                >
                  {t("shop.clearFilters")}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-neutral-500">
                <span>
                  {t("shop.showingCount", { visible: visibleProducts.length, total: filteredProducts.length })}
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
                      {t("shop.showOption", { count: option })}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`hidden md:flex border border-neutral-200 p-2 text-lg ${viewMode === "grid" ? "bg-black text-white" : "text-black"
                    }`}
                  aria-label={t("shop.gridView")}
                >
                  <FiGrid />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`hidden md:flex border border-neutral-200 p-2 text-lg ${viewMode === "list" ? "bg-black text-white" : "text-black"
                    }`}
                  aria-label={t("shop.listView")}
                >
                  <FiList />
                </button>
              </div>
            </div>

            {visibleProducts.length === 0 ? (
              <div className="border border-neutral-200 px-6 py-12 text-center">
                <h3 className="text-xl font-bold">{t("shop.noProductsFound")}</h3>
                <p className="mt-2 text-sm text-neutral-500">{t("shop.noProductsHint")}</p>
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
                        title={t("shop.addToCart")}
                      >
                        <FiShoppingBag className="text-base" />
                      </button>
                    </div>

                    <div className={viewMode === "grid" ? "mt-4 flex items-start justify-between gap-3" : "flex items-start justify-between gap-4 py-2"}>
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-black uppercase text-neutral-400">
                          {product.category}, {product.team}, {product.color}, {t("shop.sizeLabel", { size: product.size })}
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
                              <span className="text-red-650">{formatCurrency(Number(product.discountedPrice), locale)}</span>
                              <span className="text-neutral-400 line-through text-sm font-semibold">{formatCurrency(Number(product.price), locale)}</span>
                            </>
                          ) : (
                            formatCurrency(Number(product.price), locale)
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        className="mt-1 shrink-0 text-lg hover:text-red-500 transition-colors"
                        aria-label={t("shop.addToWishlist")}
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
                {t("shop.previous")}
              </button>
              <span>
                {t("shop.pageOf", { current: currentPage, total: pageCount })}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                disabled={currentPage === pageCount}
                className="text-neutral-600 disabled:text-neutral-300"
              >
                {t("shop.next")}
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
              <FiFilter /> {t("shop.filters")}
            </h3>
            <button
              type="button"
              className="text-2xl text-black hover:text-neutral-600 focus:outline-none transition-transform duration-200 hover:rotate-90"
              onClick={() => setMobileFilterOpen(false)}
              aria-label={t("shop.closeFilters")}
            >
              <FiX />
            </button>
          </div>

          {/* Scrollable Filters Content */}
          <div className="flex-1 overflow-y-auto py-6 space-y-8 pr-1">
            {/* Categories */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.06em] text-black">{t("shop.categories")}</h4>
              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={() => updateFilter(() => setSelectedCategory(""))}
                  className={`text-left text-xs font-bold uppercase tracking-[0.04em] ${selectedCategory === "" ? "text-black border-l-2 border-black pl-2" : "text-neutral-500 pl-2"}`}
                >
                  {t("shop.allProducts")}
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

            {filterOptions.map((filter) => (
              <div key={filter.name}>
                <h4 className="text-sm font-black uppercase tracking-[0.06em] text-black">{filter.name}</h4>
                <div className="mt-4 flex flex-wrap gap-2">
                  {filter.values.map((val) => {
                    const isSelected = selectedFilters[filter.name] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleToggleFilter(filter.name, val)}
                        className={`h-9 px-3 border text-xs font-bold uppercase flex items-center justify-center transition ${
                          isSelected
                            ? "bg-black border-black text-white"
                            : "border-neutral-200 text-neutral-600 hover:border-black"
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sticky footer buttons in Drawer */}
          <div className="border-t border-neutral-100 pt-4 mt-auto space-y-2">
            <div className="text-xs text-neutral-500 font-bold text-center mb-2">
              {t("shop.foundItems", { count: filteredProducts.length })}
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
                {t("shop.clearAll")}
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-black py-3 text-center text-xs font-black uppercase tracking-[0.1em] text-white hover:bg-neutral-800 transition"
              >
                {t("shop.apply")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
