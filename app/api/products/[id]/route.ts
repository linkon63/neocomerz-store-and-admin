import { NextResponse } from 'next/server';
import { resolveImageUrl } from '@/lib/admin-api';

const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = await res.json();
    const defaultVariant = product.variants?.find((v: any) => v.isDefault) ?? product.variants?.[0];
    const featuredMedia = product.media?.find((m: any) => m.isFeatured);
    const firstMedia = product.media?.[0];
    const rawImage = featuredMedia?.media.url ?? firstMedia?.media.url ?? "";
    
    const priceNum = Number(defaultVariant?.price ?? 0);
    const originalPriceNum = defaultVariant?.cost ? Number(defaultVariant.cost) : priceNum;

    const transformedProduct = {
      id: product.id,
      name: product.name,
      price: `৳${priceNum.toLocaleString()}`,
      originalPrice: `৳${originalPriceNum.toLocaleString()}`,
      image: resolveImageUrl(rawImage),
      collection: product.brand?.name ?? product.category?.name ?? "",
      priceNum: priceNum,
      category: product.category?.name ?? "",
      origin: "Sylhet, Bangladesh",
      subtitle: product.description ? product.description.split('.')[0] + '.' : product.name,
      description: product.description ?? "",
      teas: [],
      ingredients: [],
      galleryImages: product.media?.map((m: any) => resolveImageUrl(m.media.url)) ?? [],
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error fetching single product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

