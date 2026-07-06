'use client';

import { useState, useEffect, useMemo } from 'react';
import ProductGallery from './ui/product-gallery';
import ProductInfo from './ui/product-info';
import ProductTabs from './ui/product-tabs';
import RelatedCarousel from './ui/related-carousel';
import { IoThermometerOutline, IoTimeOutline } from 'react-icons/io5';
import { fetchShopProductById } from '@/lib/shop-api';
import { resolveImageUrl } from '@/lib/admin-api';
import { MappedProduct } from '@/lib/shop-api';

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

type MappedProduct = {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  collection: string;
  priceNum: number;
  category: string;
  origin: string;
  subtitle: string;
  description: string;
  teas: { name: string; description: string }[];
  ingredients: string[];
  galleryImages: string[];
};

export default function ProductDetails({ productId = '3' }: ProductDetailsProps) {
  const [productData, setProductData] = useState<MappedProduct | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      const product = await fetchShopProductById(productId);
      if (!product) {
        setProductData(null);
        setIsLoading(false);
        return;
      }

      const defaultVariant = product.variants?.find((v) => v.isDefault) ?? product.variants?.[0];
      const price = Number(defaultVariant?.price ?? 0);

      const allImages = (product.media ?? [])
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((m) => resolveImageUrl(m.media.url));

      setProductData({
        id: product.id,
        name: product.name,
        price: String(price),
        originalPrice: product.discountPrice ? String(product.discountPrice) : '',
        image: allImages[0] ?? '',
        collection: '',
        priceNum: price,
        category: product.category?.name ?? '',
        origin: '',
        subtitle: product.shortDescription ?? '',
        description: product.description ?? '',
        teas: [],
        ingredients: [],
        galleryImages: allImages,
        variantId: defaultVariant?.id ?? '',
      });
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
              productId={productId}
              variantId={productData.variantId}
              productData={{
                name: productData.name,
                priceNum: productData.priceNum,
                image: productData.image,
                category: productData.category,
              }}
            />

            <ProductTabs
              description={productData.description}
              collections={[]}
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
