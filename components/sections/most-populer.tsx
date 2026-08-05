'use client';

import { useState, useEffect } from 'react';
import DiscoverMoreButton from "./ui/button";
import ProductCard from "./ui/product-card";
import { fetchShopProducts, ShopProduct } from "@/lib/shop-api";

export default function MostPopuler() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetchShopProducts({ limit: 12 });
        // Reverse elements to show different products in Popular section
        const reversed = [...res.data].reverse().slice(0, 6);
        setProducts(reversed);
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
      <section className="w-full bg-[#F9F9FB] py-16 md:py-24 border-t border-stone-100">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
          <div className="flex justify-center mb-8">
            <div className="h-10 bg-stone-200 animate-pulse rounded w-64"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
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
    <section className="relative w-full py-16 md:py-24 bg-[#F9F9FB] border-t border-stone-100 overflow-hidden">
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
        {/* Header */}
        <div className="self-stretch flex flex-col justify-center items-center gap-3 overflow-hidden mb-16">
          <h2 className="inline-flex justify-center flex-wrap items-center gap-1.5">
            <span className="text-[#C6B485] text-4xl md:text-5xl lg:text-6xl font-normal font-['Bembo_Std'] leading-tight lg:leading-[56px]">Most</span>
            <span className="text-[#8E866B] text-4xl md:text-5xl lg:text-6xl font-normal font-['Snell_Roundhand_LT_Std'] leading-tight lg:leading-[56px]">Popular</span>
          </h2>
          <p className="max-w-[700px] text-center text-[#83847e] text-base lg:text-lg font-normal font-['Bembo_Std'] leading-6 mx-auto">
            Designed to make a lasting impression for corporate, seasonal, and personal gifting.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={`৳${product.price.toLocaleString()}`}
              originalPrice={product.originalPrice ? `৳${product.originalPrice.toLocaleString()}` : ''}
              image={product.image}
              slug={product.slug}
            />
          ))}
        </div>

        <div className="pt-12 text-center">
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
