import Image from "next/image";
import Link from "@/components/LocaleLink";
import { notFound } from "next/navigation";
import { FaFacebookF, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";
import type { Locale } from "@/lib/i18n/config";
import { getTranslator } from "@/lib/i18n/server";
import { formatCurrency } from "@/lib/i18n/format";
import {
  productSlug,
  resolveImageUrl,
  type DBProduct,
  type ProductVariant,
  type ProductMedia,
} from "@/app/_components/products";
import ProductPurchasePanel from "./product-purchase-panel";
import ProductImageGallery from "./product-image-gallery";
import WishlistButton from "./wishlist-button";
import ProductReviews from "./product-reviews";

export const metadata = {
  title: process.env.SHOP_NAME 
    ? `Shop | ${process.env.SHOP_NAME}` 
    : "Shop",
  description: process.env.SHOP_DESCRIPTION || "Discover our curated collection of unique products and treasures.",
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api/v1";

interface ReviewFromAPI {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { id: string; name: string };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslator(locale as Locale);

  // ── Fetch product ─────────────────────────────────────────────────────────
  let dbProduct: DBProduct | null = null;
  try {
    const res = await fetch(`${BASE_URL}/products/slug/${slug}`, {
      cache: "no-store",
      headers: { "Accept-Language": locale },
    });
    if (res.ok) {
      dbProduct = await res.json();
    }
  } catch (err) {
    console.error("Error fetching product by slug:", err);
  }

  if (!dbProduct || dbProduct.status !== "active") {
    notFound();
  }

  const defaultVariant =
    dbProduct.variants?.find((v: ProductVariant) => v.isDefault) || dbProduct.variants?.[0];
  const price = defaultVariant ? Number(defaultVariant.price) : 0;
  const discountedPrice = defaultVariant && (defaultVariant as any).discountedPrice != null
    ? Number((defaultVariant as any).discountedPrice)
    : undefined;

  // ── Resolve attributes from default variant ──────────────────────────────
  let color = "—";
  let size = "—";
  if (defaultVariant?.attributes) {
    for (const attr of defaultVariant.attributes) {
      const val = attr.attributeValue?.value;
      if (!val) continue;
      const name = attr.attributeValue?.attribute?.name?.toLowerCase() ?? "";
      if (name === "size" || ["xs", "s", "m", "l", "xl", "xxl", "2xl", "3xl"].includes(val.toLowerCase())) {
        size = val;
      } else if (name === "color" || name === "colour" || name === "") {
        color = val;
      }
    }
  }

  const isOutOfStock = (defaultVariant?.stockQuantity ?? 0) <= 0;

  const featuredMedia =
    dbProduct.media?.find((m: ProductMedia) => m.isFeatured) || dbProduct.media?.[0];
  const image = resolveImageUrl(featuredMedia?.media?.url);

  // ── Build product object ──────────────────────────────────────────────────
  const product = {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category?.name || "Vintage",
    categoryId: dbProduct.category?.id,
    team: dbProduct.brand?.name || "—",
    price,
    discountedPrice,
    color,
    size,
    image,
    description: dbProduct.description || "",
    variantId: defaultVariant?.id,
    tags: dbProduct.tags ?? [],
  };

  // ── Fetch related products (same category) ────────────────────────────────
  let relatedProducts: {
    name: string;
    category: string;
    team: string;
    price: number;
    discountedPrice?: number;
    image: string;
    slug: string;
  }[] = [];
  try {
    const params = new URLSearchParams({ limit: "12", lang: locale });
    if (product.categoryId) params.set("categoryId", product.categoryId);
    const res = await fetch(`${BASE_URL}/products?${params.toString()}`, {
      cache: "no-store",
      headers: { "Accept-Language": locale },
    });
    if (res.ok) {
      const result = await res.json();
      const allProducts: DBProduct[] = result.data || [];
      relatedProducts = allProducts
        .filter((p: DBProduct) => p.slug !== slug && p.status === "active")
        .slice(0, 5)
        .map((p: DBProduct) => {
          const v = p.variants?.find((vi: ProductVariant) => vi.isDefault) || p.variants?.[0];
          const pr = v ? Number(v.price) : 0;
          const dp = v && (v as any).discountedPrice != null ? Number((v as any).discountedPrice) : undefined;
          const fm = p.media?.find((mi: ProductMedia) => mi.isFeatured) || p.media?.[0];
          const img = resolveImageUrl(fm?.media?.url);
          return {
            name: p.name,
            category: p.category?.name || "Vintage",
            team: p.brand?.name || "—",
            price: pr,
            discountedPrice: dp,
            image: img,
            slug: p.slug,
          };
        });
    }
  } catch (err) {
    console.error("Error fetching related products:", err);
  }

  // ── Fetch approved reviews ────────────────────────────────────────────────
  let reviews: ReviewFromAPI[] = [];
  try {
    const res = await fetch(`${BASE_URL}/products/${dbProduct.id}/reviews`, {
      cache: "no-store",
      headers: { "Accept-Language": locale },
    });
    if (res.ok) {
      reviews = await res.json();
    }
  } catch (err) {
    console.error("Error fetching reviews:", err);
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // ── Gallery images ────────────────────────────────────────────────────────
  const images = dbProduct.media?.length
    ? dbProduct.media.map((m: ProductMedia) => resolveImageUrl(m.media?.url))
    : [image];

  // ── Build all variant attributes for Additional Information ───────────────
  const allVariantAttributes: { name: string; values: string }[] = [];
  const attrMap = new Map<string, Set<string>>();
  if (dbProduct.variants) {
    for (const v of dbProduct.variants) {
      for (const a of v.attributes ?? []) {
        const attrName = a.attributeValue?.attribute?.name ?? "Attribute";
        const val = a.attributeValue?.value;
        if (val) {
          if (!attrMap.has(attrName)) attrMap.set(attrName, new Set());
          attrMap.get(attrName)!.add(val);
        }
      }
    }
  }
  for (const [name, values] of attrMap.entries()) {
    allVariantAttributes.push({ name, values: Array.from(values).join(", ") });
  }

  return (
    <main className="min-h-screen bg-white text-[#151515]">
      <section className="mx-auto py-8 mb-16 md:mb-20 lg:mb-24">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[560px_1fr]">
            {/* Left Column: Image Gallery */}
            <ProductImageGallery images={images} name={product.name} />

            {/* Right Column: Product Details */}
            <section className="flex flex-col">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.04em] text-neutral-400">
                <Link href="/" className="hover:text-black transition">{t("shop.breadcrumbHome")}</Link>
                <span>›</span>
                <Link href="/shop" className="hover:text-black transition">{t("shop.breadcrumbShop")}</Link>
                <span>›</span>
                <Link href="/shop" className="hover:text-black transition">{product.category}</Link>
                <span>›</span>
                <span className="text-neutral-800">{product.name}</span>
              </div>

              {/* Product Title, Brand & Reviews Summary */}
              <div className="mt-3">
                <h1 className="text-3xl font-black uppercase leading-tight tracking-tight text-neutral-900">
                  {product.name}
                </h1>
                
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-black uppercase tracking-wider text-neutral-500">
                  {product.team && product.team !== "—" && (
                    <span className="text-neutral-800 font-bold">
                      {t("shop.brand")} <span className="font-extrabold text-neutral-900 underline decoration-2 decoration-[#ffd02f] underline-offset-4">{product.team}</span>
                    </span>
                  )}
                  {product.team && product.team !== "—" && reviews.length > 0 && (
                    <span className="text-neutral-300 font-light">|</span>
                  )}
                  {reviews.length > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-[#ffd02f] text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="leading-none">
                            {i < Math.round(avgRating) ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                      <span className="text-neutral-700 normal-case font-bold">
                        {avgRating.toFixed(1)} ({reviews.length === 1 ? t("shop.reviewCount", { count: reviews.length }) : t("shop.reviewCountPlural", { count: reviews.length })})
                      </span>
                    </div>
                  ) : (
                    <span className="text-neutral-400 normal-case italic font-semibold">{t("shop.noReviewsYet")}</span>
                  )}
                </div>

                <div className="mt-4">
                  {product.discountedPrice != null && product.discountedPrice < product.price ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-red-650">
                        {formatCurrency(Number(product.discountedPrice), locale as Locale)}
                      </span>
                      <span className="text-neutral-400 line-through text-lg font-semibold">
                        {formatCurrency(Number(product.price), locale as Locale)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-neutral-900">
                      {formatCurrency(Number(product.price), locale as Locale)}
                    </span>
                  )}
                </div>
              </div>

              {/* Product meta */}
              <div className="mt-6 space-y-3 text-sm leading-6 text-neutral-600">
                <p>
                  <span className="font-black text-neutral-900">{t("shop.availability")} </span>
                  {isOutOfStock ? (
                    <span className="text-red-500">{t("shop.outOfStock")}</span>
                  ) : (
                    <span className="text-green-600">{t("shop.inStock")}</span>
                  )}
                </p>
                <p>
                  <span className="font-black text-neutral-900">{t("shop.code")}</span>{" "}
                  HV-{slug.slice(0, 10).toUpperCase()}
                </p>
                {product.tags.length > 0 && (
                  <p>
                    <span className="font-black text-neutral-900">{t("shop.tags")}</span>{" "}
                    {product.tags
                      .map((t: { name: string } | string) =>
                        typeof t === "string" ? t : t.name,
                      )
                      .join(", ")}
                  </p>
                )}
                {product.description && (
                  <p className="text-neutral-600 leading-7">{product.description}</p>
                )}
              </div>

              <ProductPurchasePanel
                productName={product.name}
                productImage={product.image}
                productSlug={slug}
                variants={dbProduct.variants || []}
              />

              {/* Social sharing */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || "https://humanavintage.com"}/shop/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-xs hover:bg-neutral-100 transition"
                >
                  <FaFacebookF />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || "https://humanavintage.com"}/shop/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-xs hover:bg-neutral-100 transition"
                >
                  <FaXTwitter />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || "https://humanavintage.com"}/shop/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-xs hover:bg-neutral-100 transition"
                >
                  <FaLinkedinIn />
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-xs hover:bg-neutral-100 transition"
                >
                  <FaInstagram />
                </a>
                <WishlistButton product={product} />
              </div>
            </section>
          </div>

          {/* Additional Information — fully dynamic */}
          <section className="mt-12">
            <h2 className="inline-block border-b border-black pb-3 text-xs font-black uppercase">
              {t("shop.additionalInformation")}
            </h2>
            <div className="mt-8 border-t border-neutral-100 text-sm">
              {allVariantAttributes.length > 0 ? (
                allVariantAttributes.map((attr, idx) => (
                  <div
                    key={attr.name}
                    className={`grid grid-cols-[220px_1fr] border-b border-neutral-200 px-3 py-4 ${
                      idx % 2 === 0 ? "bg-neutral-50" : "bg-white"
                    }`}
                  >
                    <span className="font-black text-neutral-500">{attr.name}</span>
                    <span>{attr.values}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="grid grid-cols-[220px_1fr] border-b border-neutral-200 bg-neutral-50 px-3 py-4">
                    <span className="font-black text-neutral-500">{t("shop.brandLabel")}</span>
                    <span>{product.team}</span>
                  </div>
                  <div className="grid grid-cols-[220px_1fr] border-b border-neutral-200 px-3 py-4">
                    <span className="font-black text-neutral-500">{t("shop.categoryLabel")}</span>
                    <span>{product.category}</span>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-14">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <h2 className="text-sm font-black uppercase">{t("shop.relatedProducts")}</h2>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
                {relatedProducts.map((item) => (
                  <article key={item.slug} className="group">
                    <Link href={`/shop/${item.slug}`} className="block border border-neutral-100 bg-white">
                      <div className="relative aspect-square">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(min-width: 1024px) 20vw, 50vw"
                          className="object-cover object-center p-6 transition group-hover:scale-[1.03]"
                        />
                      </div>
                    </Link>
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-black uppercase text-neutral-400">
                          {item.category}, {item.team}
                        </p>
                        <h3 className="mt-1 truncate text-sm font-black uppercase text-neutral-800">
                          {item.name}
                        </h3>
                        <p className="mt-2 text-base font-black flex items-center gap-2">
                          {item.discountedPrice != null && item.discountedPrice < item.price ? (
                            <>
                              <span className="text-red-650">{formatCurrency(Number(item.discountedPrice), locale as Locale)}</span>
                              <span className="text-neutral-400 line-through text-sm font-semibold">{formatCurrency(Number(item.price), locale as Locale)}</span>
                            </>
                          ) : (
                            formatCurrency(Number(item.price), locale as Locale)
                          )}
                        </p>
                      </div>
                      <FiHeart className="mt-1 shrink-0 text-lg text-neutral-600" />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Reviews Section */}
          <ProductReviews productId={dbProduct.id} initialReviews={reviews} />
        </div>
      </section>
    </main>
  );
}
