import { NextResponse } from 'next/server';
import { resolveImageUrl } from '@/lib/admin-api';

const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/products?limit=100`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch from backend: ${res.status}`);
    }
    const paginated = await res.json();
    const products = paginated.data.map((product: any) => {
      const defaultVariant = product.variants?.find((v: any) => v.isDefault) ?? product.variants?.[0];
      const featuredMedia = product.media?.find((m: any) => m.isFeatured);
      const firstMedia = product.media?.[0];
      const rawImage = featuredMedia?.media.url ?? firstMedia?.media.url ?? "";
      
      const priceNum = Number(defaultVariant?.price ?? 0);
      const costNum = defaultVariant?.cost ? Number(defaultVariant.cost) : 0;
      const discountPrice = product.discountPrice ? Number(product.discountPrice) : 0;
      const showOriginal = discountPrice > 0 && discountPrice < priceNum;

      const activePrice = showOriginal ? discountPrice : priceNum;
      const originalPrice = showOriginal ? priceNum : (costNum > priceNum ? costNum : 0);

      return {
        id: product.id,
        name: product.name,
        price: `৳${activePrice.toLocaleString()}`,
        originalPrice: originalPrice > 0 ? `৳${originalPrice.toLocaleString()}` : "",
        image: resolveImageUrl(rawImage),
        collection: product.brand?.name ?? product.category?.name ?? "",
        priceNum: activePrice,
        category: product.category?.name ?? "",
        origin: "Sylhet, Bangladesh",
        subtitle: product.description ? product.description.split('.')[0] + '.' : product.name,
        description: product.description ?? "",
        teas: [],
        ingredients: [],
        galleryImages: product.media?.map((m: any) => resolveImageUrl(m.media.url)) ?? [],
      };
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error proxying products:', error);
    return NextResponse.json([]);
  }
}

