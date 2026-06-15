'use client';

import { useState, useEffect } from 'react';
import ProductGallery from './ui/product-gallery';
import ProductInfo from './ui/product-info';
import ProductTabs from './ui/product-tabs';
import RelatedCarousel from './ui/related-carousel';
import { IoThermometerOutline, IoTimeOutline } from 'react-icons/io5';
import { Product, fetchProductById } from '@/lib/api';

const brewingTips = [
  {
    label: 'Temperature',
    value: '95 °C',
    icon: <IoThermometerOutline className="w-6 h-6 text-stone-700" />,
  },
  {
    label: 'Infusion time',
    value: '5-7 min',
    icon: <IoTimeOutline className="w-6 h-6 text-stone-700" />,
  },
];

interface ProductDetailsProps {
  productId?: string;
}

export default function ProductDetails({ productId = '3' }: ProductDetailsProps) {
  const [productData, setProductData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      const data = await fetchProductById(productId);
      setProductData(data);
      setIsLoading(false);
    }
    loadProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <main className="flex-grow bg-white w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-7 w-full animate-pulse">
              <div className="w-full h-[500px] bg-stone-100 rounded-none" />
              <div className="grid grid-cols-4 gap-4 mt-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-stone-100 rounded-none" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 w-full flex flex-col gap-6 animate-pulse">
              <div className="h-10 bg-stone-100 w-3/4 rounded-none" />
              <div className="h-4 bg-stone-100 w-full rounded-none" />
              <div className="h-4 bg-stone-100 w-5/6 rounded-none" />
              <div className="h-8 bg-stone-100 w-1/3 rounded-none mt-4" />
              <div className="h-12 bg-stone-100 w-1/2 rounded-full mt-6" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!productData) {
    return (
      <main className="flex-grow bg-white w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h3 className="font-bembo text-2xl text-stone-500 mb-4">Product not found.</h3>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow bg-white w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-7 w-full">
            <ProductGallery images={productData.galleryImages} />
          </div>

          <div className="lg:col-span-5 w-full flex flex-col gap-8">
            <ProductInfo
              name={productData.name}
              subtitle={productData.subtitle}
              price={productData.price}
              originalPrice={productData.originalPrice}
              vatMessage="VAT Included"
              teas={productData.teas}
            />

            <ProductTabs
              description={productData.description}
              collections={productData.teas.map((t) => ({
                title: t.name,
                text: t.description,
              }))}
              ingredients={productData.ingredients}
              brewingTips={brewingTips}
            />
          </div>
        </div>
      </div>

      <RelatedCarousel />
    </main>
  );
}
