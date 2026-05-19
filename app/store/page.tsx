"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { productsApi, categoriesApi, type Product, type Category } from "@/lib/store-api";
import { ProductCard } from "./_components/product-card";
import { HeroSection } from "./_components/hero-section";
import { CategoryGrid } from "./_components/category-grid";

const TRUST_ITEMS = [
  { icon: "🚚", title: "দ্রুত ডেলিভারি", desc: "২-৩ কর্মদিবসে সারাদেশে" },
  { icon: "💳", title: "ক্যাশ অন ডেলিভারি", desc: "পণ্য পেয়ে টাকা দিন" },
  { icon: "🔄", title: "৭ দিনের রিটার্ন", desc: "সহজ রিটার্ন পলিসি" },
  { icon: "🛡️", title: "১০০% অরিজিনাল", desc: "নিশ্চিত মানসম্পন্ন পণ্য" },
];

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ hours: 5, minutes: 30, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ backgroundColor: "var(--store-bg)", color: "var(--store-text)" }}>

      {/* ── HERO SECTION ── */}
      <HeroSection categories={categories} />

      {/* ── TRUST BAR ── */}
      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white rounded-xl p-4 transition-all hover:shadow-md"
              style={{ border: "1px solid var(--store-border)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: "var(--store-primary-light)" }}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-[13px] font-bold" style={{ color: "var(--store-text)" }}>{item.title}</h3>
                <p className="text-[11px]" style={{ color: "var(--store-text-muted)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES GRID ── */}
      <CategoryGrid categories={categories} loading={loading} />

      {/* ── FLASH SALE ── */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #007A3D 0%, #005C2E 100%)" }}>
          {/* Header */}
          <div className="px-6 py-5 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h2 className="text-[20px] font-black" style={{ color: "#FFFFFF" }}>ফ্ল্যাশ সেল</h2>
                <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.7)" }}>সীমিত সময়ের অফার — এখনই কিনুন!</p>
              </div>
            </div>
            {/* Countdown */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.7)" }}>শেষ হবে:</span>
              <div className="flex gap-1.5">
                {[
                  { v: countdown.hours, l: "ঘণ্টা" },
                  { v: countdown.minutes, l: "মিনিট" },
                  { v: countdown.seconds, l: "সেকেন্ড" },
                ].map((unit, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="bg-white/20 text-white rounded-lg w-12 h-12 flex items-center justify-center font-black text-[18px] border border-white/30">
                      {unit.v.toString().padStart(2, "0")}
                    </div>
                    <span className="text-[9px] font-semibold text-white/60 mt-1 uppercase">{unit.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="p-6 sm:p-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => {
              const sold = 40 + (parseInt(p.id.slice(0, 2), 16) % 40);
              return (
                <Link
                  key={p.id}
                  href={`/store/products/${p.slug}`}
                  className="bg-white rounded-xl overflow-hidden group transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={
                        p.media?.[0]?.media.url
                          ? p.media[0].media.url.startsWith("http")
                            ? p.media[0].media.url
                            : `http://localhost:5010${p.media[0].media.url}`
                          : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80"
                      }
                      alt={p.name}
                      className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: "#007A3D" }}>
                      -30%
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-[13px] font-semibold truncate" style={{ color: "var(--store-text)" }}>{p.name}</h3>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-[15px] font-black" style={{ color: "#00A651" }}>
                        {p.variants?.[0] ? `৳${p.variants[0].price}` : ""}
                      </span>
                      <span className="text-[11px] line-through" style={{ color: "var(--store-text-light)" }}>
                        {p.variants?.[0] ? `৳${Math.round(parseFloat(p.variants[0].price.toString()) * 1.4)}` : ""}
                      </span>
                    </div>
                    {/* Stock bar */}
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--store-text-muted)" }}>
                        <span>বিক্রি হয়েছে</span>
                        <span className="font-bold" style={{ color: "#00A651" }}>{sold}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--store-surface-3)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${sold}%`, backgroundColor: "#4ADE80" }} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNERS ── */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl min-h-[200px] flex flex-col justify-end p-6 group cursor-pointer" style={{ background: "linear-gradient(135deg, #1A1A2E, #0F3460)" }}>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--store-primary)" }}>প্রিমিয়াম কালেকশন</span>
              <h3 className="text-[20px] font-black text-white mb-2">মডার্ন মিনিমালিস্ট স্টাইল</h3>
              <Link href="/store/products" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white border-b border-white/50 pb-0.5 hover:border-white transition-colors">
                কালেকশন দেখুন →
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl min-h-[200px] flex flex-col justify-end p-6 group cursor-pointer" style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest mb-2 block text-yellow-400">নতুন আগমন</span>
              <h3 className="text-[20px] font-black text-white mb-2">লাক্সারি আরবান এলিগ্যান্স</h3>
              <Link href="/store/products" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white border-b border-white/50 pb-0.5 hover:border-white transition-colors">
                কালেকশন দেখুন →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1 h-5 rounded-full" style={{ backgroundColor: "var(--store-primary)" }} />
              <h2 className="text-[22px] font-black" style={{ color: "var(--store-text)" }}>নতুন পণ্য</h2>
            </div>
            <p className="text-[13px]" style={{ color: "var(--store-text-muted)" }}>সদ্য যোগ হওয়া পণ্যসমূহ</p>
          </div>
          <Link href="/store/products" className="text-[13px] font-semibold transition-colors hover:underline" style={{ color: "var(--store-primary)" }}>
            সব পণ্য দেখুন →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white border animate-pulse" style={{ borderColor: "var(--store-border)" }}>
                <div className="aspect-square bg-gray-100 rounded-t-xl" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border" style={{ borderColor: "var(--store-border)" }}>
            <p className="text-4xl mb-3">📦</p>
            <p className="text-[18px] font-bold" style={{ color: "var(--store-text)" }}>কোনো পণ্য পাওয়া যায়নি</p>
            <p className="text-[13px] mt-1" style={{ color: "var(--store-text-muted)" }}>অ্যাডমিন প্যানেল থেকে পণ্য যোগ করুন।</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── BRANDS STRIP ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border py-6 px-8" style={{ borderColor: "var(--store-border)" }}>
          <p className="text-center text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: "var(--store-text-muted)" }}>আমাদের ব্র্যান্ড পার্টনার</p>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
            {["HERMES", "VOGUE", "ELYSIUM", "APEX", "SERENE", "LUXE"].map((brand, i) => (
              <span key={i} className="text-[16px] font-black tracking-[0.15em] select-none" style={{ color: "var(--store-text-light)" }}>
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
