"use client";

import Image from "next/image";
import Link from "@/components/LocaleLink";
import { useEffect, useState } from "react";
import { FiHeart, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatCurrency } from "@/lib/i18n/format";
import { useWishlist } from "../_components/wishlist-context";
import { useCart } from "../_components/cart-context";
import { productSlug } from "../shop/products";

export default function WishlistPage() {
  const { t, locale } = useI18n();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-white px-4 py-16 text-[#151515] sm:px-8 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-16 text-[#151515] sm:px-8">
      <section className="mx-auto max-w-[1400px]">
        <div className="border-b border-neutral-100 pb-8">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400">{t("wishlistPage.label")}</p>
          <h1 className="mt-4 font-bembo text-4xl font-bold sm:text-5xl uppercase tracking-tight">{t("wishlistPage.title")}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-500">
            {t("wishlistPage.subtitle")}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="mt-16 text-center border border-neutral-200 py-16 px-6 max-w-2xl mx-auto">
            <FiHeart className="mx-auto text-4xl text-neutral-300" />
            <h2 className="mt-4 text-lg font-black uppercase">{t("wishlistPage.emptyTitle")}</h2>
            <p className="mt-2 text-sm text-neutral-500 leading-6">
              {t("wishlistPage.emptyDescription")}
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-block bg-black text-white text-xs font-bold uppercase tracking-[0.12em] px-8 py-4 hover:bg-neutral-800 transition"
            >
              {t("wishlistPage.startExploring")}
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {wishlistItems.map((product) => (
              <article key={product.name} className="group flex flex-col justify-between">
                <div>
                  <div className="relative group/image overflow-hidden border border-neutral-100 bg-white">
                    <Link href={`/shop/${productSlug(product)}`} className="block">
                      <div className="relative aspect-square">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className="object-cover object-center p-6 transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-600 hover:text-red-500 shadow-md border border-neutral-100 transition-all"
                      title={t("wishlistPage.removeFromWishlist")}
                      aria-label={t("wishlistPage.removeFromWishlist")}
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.04em]">
                      {product.category} · {product.team}
                    </p>
                    <h3 className="mt-1 text-sm font-black uppercase text-neutral-800 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-base font-black text-neutral-800">
                      {formatCurrency(product.price, locale)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      addItem({
                        slug: productSlug(product),
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        color: product.color,
                        size: product.size,
                        variantId: product.variantId,
                      });
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white text-xs font-black uppercase tracking-[0.08em] py-3 hover:bg-black transition"
                  >
                    <FiShoppingBag className="text-sm" />
                    {t("wishlistPage.addToCart")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
