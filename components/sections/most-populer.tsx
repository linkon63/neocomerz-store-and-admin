'use client';

import { useState, useEffect } from 'react';
import DiscoverMoreButton from "./ui/button";
import ProductCarousel from "./ui/productcarousel";
import { fetchShopProducts, ShopProduct } from "@/lib/shop-api";

export default function MostPopuler() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetchShopProducts({ limit: 12 });
        // Reverse elements to show different products in Popular section
        setProducts([...res.data].reverse());
      } catch (error) {
        console.error("Failed to fetch most popular products", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="w-full bg-[#F9F9FB] py-12 md:py-20 lg:py-32 relative overflow-hidden">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="flex justify-center mb-8">
            <div className="h-10 bg-stone-200 animate-pulse rounded w-64"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 bg-stone-200 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#F9F9FB] py-12 md:py-20 lg:py-32 relative overflow-hidden">
      <div className="w-full mx-auto px-4 sm:px-6">
        <ProductCarousel products={products} title="MOST POPULER" />
        <div className="pt-6 md:pt-12">
          <DiscoverMoreButton
            href="/products"
            label="DISCOVER MORE"
            variant="primary"
          />
        </div>
      </div>
    </section>
  );
}

