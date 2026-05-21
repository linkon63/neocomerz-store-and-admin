"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { productsApi, categoriesApi, type Product, type Category } from "@/lib/store-api";
import { ProductCard } from "./_components/product-card";

// Premium Category Styling Config
const CATEGORY_STYLES: Record<string, { icon: string; desc: string }> = {
  "men": {
    icon: "👔",
    desc: "Premium shirts, suits, & curated streetwears"
  },
  "women": {
    icon: "👗",
    desc: "Exquisite designer sarees & premium outfits"
  },
  "clothing": {
    icon: "👕",
    desc: "Exclusive fabrics & everyday premium fits"
  },
  "electronics": {
    icon: "⚡",
    desc: "State-of-the-art gadgets & digital accessories"
  },
  "accessories": {
    icon: "👜",
    desc: "Exquisite leather bags, wallets & luxuries"
  },
  "shoes": {
    icon: "👟",
    desc: "Boutique footwear & modern sneakers"
  },
  "footwear": {
    icon: "👟",
    desc: "Boutique footwear & modern sneakers"
  },
  "default": {
    icon: "⚜️",
    desc: "Curated premium studio selections"
  }
};

function getCategoryStyle(name: string) {
  const norm = name.toLowerCase();
  for (const key of Object.keys(CATEGORY_STYLES)) {
    if (norm.includes(key)) return CATEGORY_STYLES[key];
  }
  return CATEGORY_STYLES.default;
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic countdown timer for premium Flash Sale
  const [countdown, setCountdown] = useState({ hours: 6, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        // Reset when countdown ends
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([
      productsApi.list({ limit: 8, status: "active" }),
      categoriesApi.list(),
    ])
      .then(([p, c]) => {
        setProducts(p.data);
        setCategories(c.slice(0, 8));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-background text-red font-sans min-h-screen">

      {/* Top Main Container (Sidebar + Elegant Slider Combo) */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

          {/* Left Sidebar (Categories Menu) */}
          <aside className="hidden lg:block bg-white rounded-2xl border border-stroke p-6 shadow-sm h-fit">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-red/50 mb-5 pb-3 border-b border-stroke flex items-center gap-2.5">
              <svg className="w-4 h-4 text-red/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Categories
            </h2>
            <nav className="space-y-1">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-9 bg-surface-muted rounded animate-pulse w-full" />
                ))
              ) : categories.length === 0 ? (
                <p className="text-[11px] text-red/50 font-medium">No categories found</p>
              ) : (
                categories.map((cat) => {
                  const style = getCategoryStyle(cat.name);
                  return (
                    <Link
                      key={cat.id}
                      href={`/store/products?categoryId=${cat.id}`}
                      className="flex items-center justify-between rounded px-3 py-2.5 text-sm font-medium text-red/70 hover:bg-surface-muted hover:text-red transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm opacity-80">{style.icon}</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">{cat.name}</span>
                      </div>
                      <svg className="w-3.5 h-3.5 opacity-0 transition-transform group-hover:translate-x-1 group-hover:opacity-100 text-red" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })
              )}
              <Link
                href="/store/products"
                className="flex items-center justify-between rounded px-3 py-2.5 text-sm font-semibold text-red bg-surface-muted hover:bg-stroke transition-all duration-200 mt-4"
              >
                <span>View All Collections</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
                </svg>
              </Link>
            </nav>
          </aside>

          {/* Right Main Hero Promotion Banner */}
          <div className="flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-2xl bg-surface p-8 sm:p-14 text-red shadow-sm border border-stroke min-h-[440px] flex flex-col justify-center">
              {/* Premium Subtle Background Image Element */}
              <div className="absolute inset-0 bg-surface-muted/30" />

              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded border border-stroke bg-white px-3 py-1 mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-30"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground"></span>
                  </span>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-red">Premium Collection Campaign</p>
                </div>

                <h1 className="heading-premium text-4xl sm:text-6xl text-red mb-6">
                  Elevate Your Style.<br />
                  <span className="font-sans font-medium text-red/70 block mt-2 text-2xl sm:text-3xl">Flat 20% off all curated items.</span>
                </h1>

                <p className="text-sm leading-relaxed text-red/60 font-medium max-w-md">
                  Experience the fastest nationwide delivery and secure cash-on-delivery options for our premium, meticulously curated collections.
                </p>
              </div>

              <div className="relative z-10 mt-10 flex flex-wrap gap-4 items-center">
                <Link
                  href="/store/products"
                  className="btn-premium rounded px-8 py-3.5 text-xs font-semibold tracking-wide"
                >
                  Shop Collection
                </Link>
                <Link
                  href="/store/register"
                  className="btn-outline rounded px-8 py-3.5 text-xs font-semibold tracking-wide"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Trust guarantees bar (Clean highly legible layout) */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Cash on Delivery", desc: "Pay securely at your doorstep", icon: "🤝" },
            { title: "7-Day Returns", desc: "Easy, hassle-free returns policy", icon: "🔄" },
            { title: "Premium Quality", desc: "100% authentic curated products", icon: "💎" },
            { title: "24/7 Support", desc: "Dedicated assistance always", icon: "📞" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-white rounded-xl border border-stroke p-5 shadow-sm hover:border-foreground/20 transition-all duration-300 group">
              <span className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-lg text-red group-hover:bg-foreground group-hover:text-red transition-colors">{item.icon}</span>
              <div>
                <h3 className="text-xs font-semibold text-red tracking-wide">{item.title}</h3>
                <p className="text-[11px] font-medium text-red/50 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- MINIMAL CATEGORIES GRID SHOWCASE --- */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-stroke p-8 shadow-sm">
            <div className="mb-8 border-b border-stroke pb-6 flex items-end justify-between">
              <div>
                <h2 className="heading-premium text-2xl sm:text-3xl text-red">Explore Collections</h2>
                <p className="text-sm text-red/50 mt-1 font-medium">Curated products sorted by aesthetic catalogs</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((cat) => {
                const style = getCategoryStyle(cat.name);
                return (
                  <Link
                    key={cat.id}
                    href={`/store/products?categoryId=${cat.id}`}
                    className="group relative overflow-hidden rounded-xl border border-stroke bg-surface hover:border-foreground transition-all duration-300 flex flex-col justify-between min-h-[170px]"
                  >
                    <div className="p-6 relative z-10 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-muted text-lg group-hover:bg-foreground group-hover:text-red transition-colors">
                          <span>{style.icon}</span>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-red/40 group-hover:text-red transition-colors">
                          Shop Now →
                        </span>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-red group-hover:text-red transition-colors leading-tight">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-red/50 font-medium mt-1 leading-relaxed">
                          {style.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Flash Sale / Limited Offers (Minimal Editorial Style) */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-foreground rounded-2xl p-8 sm:p-12 text-red shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10 mb-8">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red/50 border border-white/20 px-2 py-1 rounded">Limited Time</span>
              <h2 className="mt-4 heading-premium text-3xl sm:text-4xl text-red">Flash Deals</h2>
              <p className="mt-2 text-sm text-red/60 font-light">Secure luxury items at unprecedented rates</p>
            </div>

            {/* Live Countdown Timer */}
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-red/50">Ends in:</span>
              <div className="flex gap-2">
                {[
                  { value: countdown.hours, label: "HRS" },
                  { value: countdown.minutes, label: "MIN" },
                  { value: countdown.seconds, label: "SEC" },
                ].map((unit, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="bg-white/10 text-red rounded w-12 h-12 flex items-center justify-center font-medium text-lg border border-white/20">
                      {unit.value.toString().padStart(2, "0")}
                    </div>
                    <span className="text-[9px] font-semibold tracking-wider text-red/50 mt-2">{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
            {products.slice(0, 4).map((p) => {
              const progressWidth = 40 + (parseFloat(p.id.slice(0, 1)) || 5) * 5;
              return (
                <div key={p.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden p-4 group flex flex-col justify-between hover:bg-white/10 transition-all duration-300">
                  <Link href={`/store/products/${p.slug}`} className="block relative aspect-square bg-white rounded-lg overflow-hidden mb-4 p-4">
                    <img
                      src={p.media?.[0]?.media.url ? (p.media[0].media.url.startsWith("http") ? p.media[0].media.url : `http://localhost:5010${p.media[0].media.url}`) : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80"}
                      alt={p.name}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 rounded bg-black px-2 py-1 text-[9px] font-semibold uppercase text-red">
                      -30%
                    </span>
                  </Link>
                  <div>
                    <h3 className="text-sm font-medium text-red truncate">{p.name}</h3>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-red">{p.variants?.[0] ? `৳${p.variants[0].price}` : ""}</span>
                      <span className="text-[11px] text-red/40 line-through">{p.variants?.[0] ? `৳${Math.round(parseFloat(p.variants[0].price.toString()) * 1.4)}` : ""}</span>
                    </div>
                    {/* Urgency Stock Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[9px] font-medium text-red/50 mb-1.5">
                        <span>STOCK STATUS</span>
                        <span className="text-red">{progressWidth}% SOLD</span>
                      </div>
                      <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-1000"
                          style={{ width: `${progressWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Editorial Lookbook/Collections Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">

          <div className="relative overflow-hidden rounded-3xl bg-[#111111] text-red min-h-[300px] p-8 flex flex-col justify-end group cursor-pointer border border-white/5">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-60 group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-80" />
            <div className="relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gold mb-2 block">Premium Curation</span>
              <h3 className="font-serif text-2xl font-light text-red mb-2">Modern Minimalist Styling</h3>
              <p className="text-[11px] text-[#A0A09A] font-light max-w-xs mb-4">Clean lines, tailored silhouettes, and pristine textures designed for high sophistication.</p>
              <Link href="/store/products" className="text-xs font-bold uppercase tracking-widest text-red border-b border-white pb-0.5 hover:text-gold hover:border-gold transition-colors">Discover Curation →</Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-[#111111] text-red min-h-[300px] p-8 flex flex-col justify-end group cursor-pointer border border-white/5">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-60 group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-80" />
            <div className="relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gold mb-2 block">New Arrivals</span>
              <h3 className="font-serif text-2xl font-light text-red mb-2">Luxury Urban Elegance</h3>
              <p className="text-[11px] text-[#A0A09A] font-light max-w-xs mb-4">Exquisite designer collections built to redefine contemporary fashion aesthetics globally.</p>
              <Link href="/store/products" className="text-xs font-bold uppercase tracking-widest text-red border-b border-white pb-0.5 hover:text-gold hover:border-gold transition-colors">Discover Curation →</Link>
            </div>
          </div>

        </div>
      </section>

      {/* Brand Carousel showcase (For premium brand feeling) */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 border-y border-stroke my-8">
        <div className="flex flex-col items-center">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-red/45 mb-5">FEATURED PREMIUM BRANDS</p>
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20 opacity-35 select-none py-2">
            {["HERMES", "VOGUE", "ELYSIUM", "APEX", "COCONUT", "SERENE"].map((brand, idx) => (
              <span key={idx} className="font-serif text-xl tracking-[0.2em] font-bold text-red">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Main Products Grid Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-stroke p-8 shadow-sm">
          {/* Section title */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between border-b border-stroke pb-6 gap-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red/50 border border-stroke px-2 py-1 rounded">Just In</span>
              <h2 className="mt-4 heading-premium text-3xl text-red">New Arrivals</h2>
            </div>
            <Link
              href="/store/products"
              className="text-xs font-semibold uppercase tracking-wider text-red/70 hover:text-red transition-colors"
            >
              View All Collection →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-white border border-stroke animate-pulse">
                  <div className="aspect-[4/5] bg-surface-muted rounded-t-xl" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-surface-muted rounded w-1/4" />
                    <div className="h-4 bg-surface-muted rounded w-3/4" />
                    <div className="h-4 bg-surface-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-4xl mb-4 text-red/30">📦</p>
              <p className="heading-premium text-2xl text-red">No Products Found</p>
              <p className="text-sm text-red/50 mt-2">Add some products in the admin panel.</p>
              <Link
                href="/admin/products/new"
                className="mt-6 inline-flex btn-premium rounded px-6 py-3 text-xs font-semibold tracking-wide"
              >
                Add Product
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-scale-in">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
