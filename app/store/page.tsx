"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { productsApi, categoriesApi, type Product, type Category } from "@/lib/store-api";
import { ProductCard } from "./_components/product-card";

// Premium Category Styling Config
const CATEGORY_STYLES: Record<string, { icon: string; desc: string }> = {
  "men": {
    icon: "👔",
    desc: "Premium shirts, suits, & curated streetwear"
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
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">

      {/* Top Main Container (Sidebar + Elegant Slider Combo) */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

          {/* Left Sidebar (Categories Menu) */}
          <aside className="hidden lg:block bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Categories
            </h2>
            <nav className="space-y-1">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-9 bg-slate-100 rounded animate-pulse w-full" />
                ))
              ) : categories.length === 0 ? (
                <p className="text-[11px] text-slate-400 font-medium">No categories found</p>
              ) : (
                categories.map((cat) => {
                  const style = getCategoryStyle(cat.name);
                  return (
                    <Link
                      key={cat.id}
                      href={`/store/products?categoryId=${cat.id}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm opacity-80">{style.icon}</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">{cat.name}</span>
                      </div>
                      <svg className="w-3.5 h-3.5 opacity-0 transition-transform group-hover:translate-x-1 group-hover:opacity-100 text-slate-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })
              )}
              <Link
                href="/store/products"
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold text-white transition-all duration-200 mt-4 hover:opacity-90"
                style={{ backgroundColor: "var(--store-primary)" }}
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
            <div 
              className="relative overflow-hidden rounded-2xl p-8 sm:p-14 text-white shadow-lg border border-slate-800 min-h-[440px] flex flex-col justify-center"
              style={{
                background: "linear-gradient(135deg, #0F172A 0%, #312E81 50%, #4F46E5 100%)"
              }}
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1.5 mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Premium Collection Campaign</p>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight mb-6">
                  Elevate Your Style.<br />
                  <span className="font-light text-slate-300 block mt-2 text-2xl sm:text-3xl">Flat 20% off all curated items.</span>
                </h1>

                <p className="text-sm leading-relaxed text-slate-300 font-normal max-w-md">
                  Experience the fastest nationwide delivery and secure cash-on-delivery options for our premium, meticulously curated collections.
                </p>
              </div>

              <div className="relative z-10 mt-10 flex flex-wrap gap-4 items-center">
                <Link
                  href="/store/products"
                  className="btn-premium rounded-xl px-8 py-3.5 text-xs font-semibold tracking-wide"
                >
                  Shop Collection
                </Link>
                <Link
                  href="/store/register"
                  className="btn-outline border-white/20 text-white hover:bg-white/10 rounded-xl px-8 py-3.5 text-xs font-semibold tracking-wide"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Trust guarantees bar */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Cash on Delivery", desc: "Pay securely at your doorstep", icon: "🤝" },
            { title: "7-Day Returns", desc: "Easy, hassle-free returns policy", icon: "🔄" },
            { title: "Premium Quality", desc: "100% authentic curated products", icon: "💎" },
            { title: "24/7 Support", desc: "Dedicated assistance always", icon: "📞" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all duration-300 group">
              <span className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lg text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{item.icon}</span>
              <div>
                <h3 className="text-xs font-bold text-slate-800 tracking-wide">{item.title}</h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- MINIMAL CATEGORIES GRID SHOWCASE --- */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="mb-8 border-b border-slate-100 pb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Explore Collections</h2>
                <p className="text-sm text-slate-400 mt-1 font-medium">Curated products sorted by aesthetic catalogs</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((cat) => {
                const style = getCategoryStyle(cat.name);
                return (
                  <Link
                    key={cat.id}
                    href={`/store/products?categoryId=${cat.id}`}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[170px]"
                  >
                    <div className="p-6 relative z-10 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <span>{style.icon}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 transition-colors">
                          Shop Now →
                        </span>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
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

      {/* Flash Sale / Limited Offers */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-2xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800 mb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full bg-indigo-500/10">Limited Time Only</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">Flash Deals</h2>
              <p className="mt-2 text-sm text-slate-400 font-light">Secure luxury items at unprecedented rates</p>
            </div>

            {/* Live Countdown Timer */}
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Ends in:</span>
              <div className="flex gap-2">
                {[
                  { value: countdown.hours, label: "HRS" },
                  { value: countdown.minutes, label: "MIN" },
                  { value: countdown.seconds, label: "SEC" },
                ].map((unit, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="bg-slate-800 text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-lg border border-slate-700">
                      {unit.value.toString().padStart(2, "0")}
                    </div>
                    <span className="text-[9px] font-semibold tracking-wider text-slate-500 mt-2">{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
            {products.slice(0, 4).map((p) => {
              const progressWidth = 40 + (parseFloat(p.id.slice(0, 1)) || 5) * 5;
              return (
                <div key={p.id} className="bg-slate-800/50 rounded-2xl border border-slate-800 overflow-hidden p-4 group flex flex-col justify-between hover:bg-slate-800 hover:border-slate-700 transition-all duration-300">
                  <Link href={`/store/products/${p.slug}`} className="block relative aspect-square bg-white rounded-xl overflow-hidden mb-4 p-4">
                    <img
                      src={p.media?.[0]?.media.url ? (p.media[0].media.url.startsWith("http") ? p.media[0].media.url : `http://localhost:5010${p.media[0].media.url}`) : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80"}
                      alt={p.name}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 rounded-lg bg-indigo-600 px-2 py-1 text-[9px] font-bold uppercase text-white">
                      -30%
                    </span>
                  </Link>
                  <div>
                    <h3 className="text-sm font-semibold text-white truncate">{p.name}</h3>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-sm font-bold text-indigo-400">{p.variants?.[0] ? `৳${p.variants[0].price}` : ""}</span>
                      <span className="text-[11px] text-slate-500 line-through">{p.variants?.[0] ? `৳${Math.round(parseFloat(p.variants[0].price.toString()) * 1.4)}` : ""}</span>
                    </div>
                    {/* Urgency Stock Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1.5">
                        <span>STOCK STATUS</span>
                        <span className="text-indigo-400">{progressWidth}% SOLD</span>
                      </div>
                      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
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

          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[300px] p-8 flex flex-col justify-end group cursor-pointer border border-slate-800">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-60 group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            <div className="relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-2 block">Premium Curation</span>
              <h3 className="text-2xl font-light text-white mb-2">Modern Minimalist Styling</h3>
              <p className="text-[11px] text-slate-300 font-light max-w-xs mb-4">Clean lines, tailored silhouettes, and pristine textures designed for high sophistication.</p>
              <Link href="/store/products" className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors">Discover Curation →</Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[300px] p-8 flex flex-col justify-end group cursor-pointer border border-slate-800">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-60 group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            <div className="relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-2 block">New Arrivals</span>
              <h3 className="text-2xl font-light text-white mb-2">Luxury Urban Elegance</h3>
              <p className="text-[11px] text-slate-300 font-light max-w-xs mb-4">Exquisite designer collections built to redefine contemporary fashion aesthetics globally.</p>
              <Link href="/store/products" className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors">Discover Curation →</Link>
            </div>
          </div>

        </div>
      </section>

      {/* Brand Carousel showcase */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 border-y border-slate-200 my-8">
        <div className="flex flex-col items-center">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-5">FEATURED PREMIUM BRANDS</p>
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20 opacity-30 select-none py-2">
            {["HERMES", "VOGUE", "ELYSIUM", "APEX", "COCONUT", "SERENE"].map((brand, idx) => (
              <span key={idx} className="font-serif text-xl tracking-[0.2em] font-bold text-slate-800">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Main Products Grid Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {/* Section title */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-100 pb-6 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">Just In</span>
              <h2 className="mt-4 text-3xl font-black text-slate-900 tracking-tight">New Arrivals</h2>
            </div>
            <Link
              href="/store/products"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors"
            >
              View All Collection →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border border-slate-200 animate-pulse">
                  <div className="aspect-[4/5] bg-slate-100 rounded-t-2xl" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-4xl mb-4">📦</p>
              <p className="text-2xl font-bold text-slate-800">No Products Found</p>
              <p className="text-sm text-slate-400 mt-2">Add some products in the admin panel.</p>
              <Link
                href="/admin/products/new"
                className="mt-6 inline-flex btn-premium rounded-xl px-6 py-3 text-xs font-semibold tracking-wide"
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
