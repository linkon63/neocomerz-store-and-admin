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
      <section className="w-full bg-white py-16 md:py-24 border-t border-stone-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex justify-center mb-8">
            <div className="h-10 bg-stone-200 animate-pulse rounded w-64"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
    <section className="w-full py-16 md:py-24 bg-white border-t border-stone-100">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="inline-flex flex-row justify-center items-baseline gap-2 md:gap-3">
            <span className="font-['Bembo_Std'] text-[#C6B485] text-4xl sm:text-5xl md:text-6xl font-normal leading-none">Most</span>
            <span className="font-['Snell_Roundhand_LT_Std'] italic text-[#8E866B] text-4xl sm:text-5xl md:text-6xl font-normal leading-none lowercase">Popular</span>
          </h2>
          <p className="font-['Bembo_Std'] text-[#83847e] text-sm sm:text-base md:text-lg font-normal tracking-wide mt-4 font-light max-w-xl mx-auto leading-relaxed">
            Designed to make a lasting impression for corporate, seasonal, and personal gifting.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={`৳${product.price.toLocaleString()}`}
              originalPrice={product.originalPrice ? `৳${product.originalPrice.toLocaleString()}` : ''}
              image={product.image}
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
