'use client';

import { useParams } from 'next/navigation';
import TopHeader from '@/components/sections/top-header';
import Header from '@/components/sections/header';
import ProductDetails from '@/components/sections/product-details';
import Mainfooter from '@/components/sections/main-footer';
import Bottomfooter from '@/components/sections/bottom-footer';

export default function DynamicProductPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '3';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TopHeader />
      <Header />
      <ProductDetails productId={id} />
      <Mainfooter />
      <Bottomfooter />
    </div>
  );
}
