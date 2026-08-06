'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { IoThermometerOutline, IoTimeOutline, IoChevronBackOutline } from 'react-icons/io5';
import ProductGallery from './ui/product-gallery';
import ProductInfo from './ui/product-info';
import ProductTabs from './ui/product-tabs';
import RelatedCarousel from './ui/related-carousel';
import { fetchShopProductById } from '@/lib/shop-api';
import { resolveImageUrl } from '@/lib/admin-api';
import type { Product } from '@/lib/admin-api';
import localProducts from '@/data/products.json';

// Brewing tips display content
const BREWING_TIPS = [
  {
    label: 'Temperature',
    value: '95 °C',
    icon: <IoThermometerOutline className="w-5 h-5 text-stone-600" />,
  },
  {
    label: 'Infusion time',
    value: '5–7 min',
    icon: <IoTimeOutline className="w-5 h-5 text-stone-600" />,
  },
];

export interface ParsedVariant {
  id: string;
  sku: string;
  priceNum: number;
  priceFormatted: string;
  originalPriceFormatted?: string;
  stockQuantity: number;
  isDefault: boolean;
  attributes: Record<string, string>;
  image?: string;
}

// Mapped shape consumed by the child components
export interface MappedProduct {
  id: string;
  name: string;
  slug: string;
  priceFormatted: string;
  originalPriceFormatted: string;
  priceNum: number;
  image: string;
  galleryImages: string[];
  category: string;
  brand: string;
  subtitle: string;
  description: string;
  variantId: string;
  variants: ParsedVariant[];
  teas: { name: string; description: string }[];
  ingredients: string[];
}

// Helpers
function fmt(n: number): string {
  return `৳${n.toLocaleString('en-BD')}`;
}

function mapProduct(raw: Product): MappedProduct {
  const parsedVariants: ParsedVariant[] = (raw.variants ?? []).map((v) => {
    const priceNum = Number(v.price ?? 0);
    const costNum = v.cost ? Number(v.cost) : 0;
    const variantDiscounted = (v as any).discountedPrice;
    const productDiscounted = raw.discountPrice;
    const discountNum = Number(variantDiscounted ?? productDiscounted ?? 0);
    const showOriginal = discountNum > 0 && discountNum < priceNum;
    const activePrice = showOriginal ? discountNum : priceNum;

    // Parse attributes array into key-value map
    const attributesMap: Record<string, string> = {};
    (v as any).attributes?.forEach((attr: any) => {
      const attrName = attr.attributeValue?.attribute?.name;
      const attrVal = attr.attributeValue?.value;
      if (attrName && attrVal) {
        attributesMap[attrName] = attrVal;
      }
    });

    const variantImages = (v as any).media
      ? ((v as any).media as any[])
          .slice()
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((m) => resolveImageUrl(m.media?.url))
          .filter(Boolean) as string[]
      : [];
    const variantImage = variantImages[0] ?? undefined;

    return {
      id: v.id,
      sku: v.sku,
      priceNum: activePrice,
      priceFormatted: fmt(activePrice),
      originalPriceFormatted: showOriginal ? fmt(priceNum) : (costNum > priceNum ? fmt(costNum) : ''),
      stockQuantity: v.stockQuantity,
      isDefault: v.isDefault,
      attributes: attributesMap,
      image: variantImage,
    };
  });

  const defaultVariant =
    parsedVariants.find((v) => v.isDefault) ?? parsedVariants[0] ?? null;

  const priceNum = defaultVariant?.priceNum ?? 0;
  const priceFormatted = defaultVariant?.priceFormatted ?? fmt(0);
  const originalPriceFormatted = defaultVariant?.originalPriceFormatted ?? '';

  // Gallery: sort by sortOrder, resolve localhost URLs to relative paths
  const galleryImages = (raw.media ?? [])
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m) => resolveImageUrl(m.media.url))
    .filter(Boolean) as string[];

  // Subtitle: prefer shortDescription, fall back to first sentence of description
  const subtitle =
    (raw.shortDescription?.trim()) ||
    (raw.description?.split('.')[0]?.trim() ?? '');

  // Load local JSON data by name match
  const localData = (localProducts as any[]).find(
    (lp) => lp.name.toLowerCase() === raw.name.toLowerCase() || lp.slug === raw.slug
  );

  let teas = localData?.teas ?? [];
  let ingredients = localData?.ingredients ?? [];

  // Fallback for demo products like "Test" if they belong to "Assorted Collections"
  if ((!teas || teas.length === 0) && (raw.name === 'Test' || raw.category?.name === 'Assorted Collections')) {
    teas = [
      { name: "PREMIUM ENGLISH BREAKFAST", description: "A traditional robust blend of Assam and Sylhet black teas. Malty, rich, and perfect with milk." },
      { name: "PREMIUM DARJEELING", description: "A medium-bodied black tea with fruity undertones and a clean, refreshing finish." },
      { name: "PREMIUM EARL GREY", description: "Premium black tea leaves infused with double-distilled oil of Italian Bergamot, creating a bright citrus aroma." }
    ];
    ingredients = [
      "Apple",
      "Hibiscus (16%), Rosehip, Peach (7%)",
      "Natural peach flavor (3%), Natural apricot flavor (2%), Natural watermelon flavor",
      "Natural aromas (peach, apricot, watermelon)",
      "Organically grown ingredients"
    ];
  }

  return {
    id:                    raw.id,
    name:                  raw.name,
    slug:                  raw.slug,
    priceFormatted,
    originalPriceFormatted,
    priceNum,
    image:                 galleryImages[0] ?? '',
    galleryImages,
    category:              raw.category?.name ?? '',
    brand:                 raw.brand?.name ?? '',
    subtitle,
    description:           raw.description ?? '',
    variantId:             defaultVariant?.id ?? '',
    variants:              parsedVariants,
    teas,
    ingredients,
  };
}

// Loading skeleton
function Skeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-20 py-12 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-7 w-full space-y-4 animate-pulse">
          <div className="w-full aspect-[4/5] bg-stone-100" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-16 h-16 shrink-0 bg-stone-100" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 w-full flex flex-col gap-5 animate-pulse">
          <div className="h-3 bg-stone-100 w-1/3 rounded" />
          <div className="h-10 bg-stone-100 w-4/5 rounded" />
          <div className="h-4 bg-stone-100 w-full rounded" />
          <div className="h-4 bg-stone-100 w-5/6 rounded" />
          <div className="h-px bg-stone-100 w-full" />
          <div className="h-8 bg-stone-100 w-1/4 rounded" />
          <div className="flex gap-3 mt-4">
            <div className="h-12 w-24 bg-stone-100 rounded-full" />
            <div className="h-12 flex-1 bg-stone-100 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Component
interface ProductDetailsProps {
  productId: string;
}

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const [product, setProduct] = useState<MappedProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ParsedVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchShopProductById(productId)
      .then((raw) => {
        if (cancelled) return;
        if (!raw) { setError(true); return; }
        const mapped = mapProduct(raw);
        setProduct(mapped);
        const def = mapped.variants.find((v) => v.isDefault) ?? mapped.variants[0] ?? null;
        setSelectedVariant(def);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [productId]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [...product.galleryImages];
    product.variants.forEach((v) => {
      if (v.image && !list.includes(v.image)) {
        list.push(v.image);
      }
    });
    return list.length > 0 ? list : ['/images/no-image-icon-6.png'];
  }, [product]);

  if (loading) return <Skeleton />;

  if (error || !product) {
    return (
      <main className="flex-grow bg-white w-full">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-20 py-32 text-center">
          <p className="font-['Bembo_Std'] text-2xl text-stone-400 italic mb-6">
            Product not found.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 font-gotham text-xs uppercase tracking-widest text-[#C5A880] hover:text-stone-800 transition-colors"
          >
            <IoChevronBackOutline className="text-sm" />
            Back to all products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow bg-white w-full">

      {/* Breadcrumb */}
      <div className="w-full border-b border-stone-100 bg-white">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-20 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-gotham text-[10px] uppercase tracking-widest text-stone-400">
            <Link href="/" className="hover:text-stone-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-stone-700 transition-colors">Products</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-stone-700 transition-colors"
                >
                  {product.category}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-stone-700 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Layout */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-20 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* Gallery column */}
          <div className="lg:col-span-7 w-full lg:sticky lg:top-24">
            <ProductGallery
              images={galleryImages}
              activeImage={selectedVariant?.image}
            />
          </div>

          {/* Info column */}
          <div className="lg:col-span-5 w-full flex flex-col gap-8">
            <ProductInfo
              name={product.name}
              subtitle={product.subtitle}
              productId={product.id}
              productSlug={product.slug}
              variants={product.variants}
              teas={product.teas}
              onVariantChange={setSelectedVariant}
              productData={{
                name:        product.name,
                priceNum:    product.priceNum,
                image:       product.image,
                category:    product.category,
                description: product.description,
              }}
            />

            <ProductTabs
              description={product.description}
              collections={product.teas.map(t => ({ title: t.name, text: t.description }))}
              ingredients={product.ingredients}
              brewingTips={BREWING_TIPS}
            />
          </div>

        </div>
      </div>

      {/* Related products carousel */}
      <RelatedCarousel />
    </main>
  );
}
