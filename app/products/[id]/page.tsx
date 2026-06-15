'use client';

import { useParams } from 'next/navigation';
import ProductDetails from '@/components/sections/product-details';

export default function DynamicProductPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '3';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <ProductDetails productId={id} />
    </div>
  );
}
