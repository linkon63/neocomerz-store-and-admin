import { NextResponse } from 'next/server';
import productsData from '@/data/products.json';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const product = productsData.find((p) => p.id === id);

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}
