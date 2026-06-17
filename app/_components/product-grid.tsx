"use client";

import Link from "@/components/LocaleLink";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { useCart } from "./cart-context";
import { useWishlist } from "./wishlist-context";
import { resolveImageUrl, type ShopProduct } from "@/app/_components/products";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatCurrency } from "@/lib/i18n/format";
import { fetcher, useSWRImmutable } from "@/lib/swr";

interface ProductMedia {
  isFeatured: boolean;
  media?: { url: string };
}

interface ProductVariant {
  id: string;
  price: number;
  isDefault: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  media?: ProductMedia[];
  variants?: ProductVariant[];
}

export default function ProductGrid() {
  const { items, addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t, locale } = useI18n();

  // Locale-independent; cached by URL so locale switches reuse it (no refetch).
  const { data, isLoading, error } = useSWRImmutable<{ data: Product[] }>(
    "/api/v1/products?limit=20&page=1",
    fetcher,
  );
  const products = data?.data ?? [];

  if (isLoading) {
    return (
      <section className="w-full my-16 md:my-24 lg:my-32">
        <div className="container">
          <h1 className="font-bembo text-2xl font-bold sm:text-3xl">
            {t("product.storiesHeading")}
          </h1>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <article key={i} className="group animate-pulse">
                <div className="relative aspect-[4/5] bg-neutral-100" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-neutral-100" />
                  <div className="h-3 w-1/2 rounded bg-neutral-100" />
                  <div className="h-4 w-1/3 rounded bg-neutral-100" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return (
      <section className="w-full my-16 md:my-24 lg:my-32">
        <div className="container">
          <h1 className="font-bembo text-2xl font-bold sm:text-3xl">
            {t("product.storiesHeading")}
          </h1>
          <p className="mt-10 text-sm text-neutral-500">
            {error
              ? t("product.loadError")
              : t("product.none")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full my-16 md:my-24 lg:my-32">
      <div className=" container ">
        <h1 className="font-bembo text-2xl font-bold sm:text-3xl">
          {t("product.storiesHeading")}
        </h1>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => {
            const defaultVariant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
            const price = defaultVariant?.price;
            const discountedPrice = defaultVariant && (defaultVariant as any).discountedPrice != null
              ? Number((defaultVariant as any).discountedPrice)
              : undefined;
            const variantId = defaultVariant?.id;
            const featured = product.media?.find((m) => m.isFeatured);
            const rawUrl = featured?.media?.url ?? product.media?.[0]?.media?.url;
            const imageUrl = resolveImageUrl(rawUrl);

            const inCart = items.some((i) => i.slug === product.slug);
            const wishlistProduct: ShopProduct = {
              id: product.id,
              slug: product.slug,
              name: product.name,
              category: "",
              team: "",
              price: Number(price ?? 0),
              color: "",
              size: "",
              image: imageUrl ?? "",
              variantId,
            };
            const inWishlist = isInWishlist(product.id);

            return (
              <article key={product.id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-50">
                  <Link href={`/shop/${product.slug}`}>
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-neutral-100">
                        <svg
                          className="h-12 w-12 text-neutral-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addItem({
                        slug: product.slug,
                        name: product.name,
                        price: Number(discountedPrice ?? price ?? 0),
                        image: imageUrl ?? "",
                        color: "",
                        size: "",
                        variantId,
                        quantity: 1,
                      });
                    }}
                    className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 ${inCart
                      ? "translate-y-0 bg-amber-400 text-white opacity-100"
                      : "translate-y-2 bg-white text-black opacity-0"
                      }`}
                    aria-label={inCart ? t("product.added") : t("product.addToCart")}
                  >
                    <FiShoppingBag className="text-sm" />
                  </button>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold uppercase leading-4 tracking-[0.08em]">
                      {product.name}
                    </p>
                    <p className="mt-2 text-xs font-semibold">
                      {discountedPrice != null && discountedPrice < Number(price) ? (
                        <>
                          <span className="text-red-650">{formatCurrency(Number(discountedPrice), locale)}</span>{" "}
                          <span className="text-neutral-400 line-through">{formatCurrency(Number(price), locale)}</span>
                        </>
                      ) : (
                        price != null ? formatCurrency(Number(price), locale) : ""
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void toggleWishlist(wishlistProduct);
                    }}
                    className="mt-0.5 shrink-0 text-sm transition-colors hover:text-red-500"
                    aria-label={inWishlist ? t("wishlist.remove") : t("wishlist.add")}
                  >
                    <FiHeart className={inWishlist ? "fill-red-500 text-red-500" : "text-neutral-600"} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>



    </section>
  );
}
