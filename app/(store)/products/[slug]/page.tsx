import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetails from "@/components/sections/product-details";
import { fetchShopProductBySlug } from "@/lib/shop-api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Metadata ────────────────────────────────────────────────────────────────
// Runs on the server at request time so every product page gets its own
// <title> and <meta description> for SEO and social sharing.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchShopProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | London Tea Exchange",
    };
  }

  return {
    title: `${product.metaTitle ?? product.name} | London Tea Exchange`,
    description:
      product.metaDescription ??
      product.shortDescription ??
      product.description ??
      "Premium tea collections from London Tea Exchange.",
    keywords: product.metaKeywords ?? undefined,
    openGraph: {
      title: product.metaTitle ?? product.name,
      description:
        product.metaDescription ??
        product.shortDescription ??
        product.description ??
        undefined,
      images: product.media?.[0]?.media.url
        ? [{ url: product.media[0].media.url }]
        : undefined,
    },
  };
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-20 py-12 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Gallery skeleton */}
        <div className="lg:col-span-7 w-full animate-pulse space-y-4">
          <div className="w-full aspect-square bg-stone-100" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-16 h-16 bg-stone-100" />
            ))}
          </div>
        </div>
        {/* Info skeleton */}
        <div className="lg:col-span-5 w-full flex flex-col gap-5 animate-pulse">
          <div className="h-3 bg-stone-100 w-1/3 rounded" />
          <div className="h-10 bg-stone-100 w-4/5 rounded" />
          <div className="h-4 bg-stone-100 w-full rounded" />
          <div className="h-4 bg-stone-100 w-5/6 rounded" />
          <div className="h-px bg-stone-100 w-full" />
          <div className="h-8 bg-stone-100 w-1/4 rounded" />
          <div className="h-12 bg-stone-100 w-2/3 rounded-full mt-4" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
// Server Component — no "use client" needed here. The interactive sub-components
// (ProductInfo, ProductGallery) are themselves client components.
export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await fetchShopProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Suspense fallback={<ProductSkeleton />}>
        {/* ProductDetails is a client component — Suspense boundary lets Next.js
            stream the skeleton instantly while the client hydrates */}
        <ProductDetails productId={product.id} />
      </Suspense>
    </div>
  );
}
