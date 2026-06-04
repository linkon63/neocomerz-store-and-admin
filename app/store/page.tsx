"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { productsApi, categoriesApi, type Product, type Category } from "@/lib/store-api";
import { ProductCard } from "./_components/product-card";

// Premium Category Styling Config
const CATEGORY_STYLES: Record<string, { icon: string; desc: string; gradient: string; ring: string }> = {
  "men": {
    icon: "👔",
    desc: "পাঞ্জাবি, শার্ট, ক্যাজুয়াল",
    gradient: "from-teal-50 to-teal-100/60",
    ring: "ring-teal-200 group-hover:ring-teal-400"
  },
  "women": {
    icon: "👗",
    desc: "শাড়ি, কুর্তি, সালোয়ার",
    gradient: "from-rose-50 to-rose-100/60",
    ring: "ring-rose-200 group-hover:ring-rose-400"
  },
  "clothing": {
    icon: "👕",
    desc: "ক্যাজুয়াল, স্পোর্টস",
    gradient: "from-emerald-50 to-emerald-100/60",
    ring: "ring-emerald-200 group-hover:ring-emerald-400"
  },
  "electronics": {
    icon: "⚡",
    desc: "গ্যাজেট, হেডফোন",
    gradient: "from-blue-50 to-blue-100/60",
    ring: "ring-blue-200 group-hover:ring-blue-400"
  },
  "accessories": {
    icon: "👜",
    desc: "ব্যাগ, ওয়ালেট",
    gradient: "from-purple-50 to-purple-100/60",
    ring: "ring-purple-200 group-hover:ring-purple-400"
  },
  "shoes": {
    icon: "👟",
    desc: "স্নিকার্স, স্যান্ডেল",
    gradient: "from-amber-50 to-amber-100/60",
    ring: "ring-amber-200 group-hover:ring-amber-400"
  },
  "footwear": {
    icon: "👟",
    desc: "স্নিকার্স, স্যান্ডেল",
    gradient: "from-amber-50 to-amber-100/60",
    ring: "ring-amber-200 group-hover:ring-amber-400"
  },
  "default": {
    icon: "✨",
    desc: "সেরা প্রডাক্টস",
    gradient: "from-slate-50 to-slate-100/60",
    ring: "ring-slate-200 group-hover:ring-teal-400"
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

  // Dynamic countdown timer
  const [countdown, setCountdown] = useState({ hours: 6, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-background text-foreground font-sans min-h-screen pb-16">

      {/* ── Top Announcement Banner ── */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 text-teal-50 text-center py-2.5 px-4 text-[11px] font-semibold tracking-wide">
        🚚&nbsp; দেশজুড়ে দ্রুত ক্যাশ অন ডেলিভারি!&nbsp;&nbsp;·&nbsp;&nbsp;৳১,৯৯৯+ অর্ডারে সম্পূর্ণ ফ্রি ডেলিভারি!
      </div>

      {/* ══════════════════════════════════════
          HERO SECTION — Premium Collage Layout
          ══════════════════════════════════════ */}
      <section className="mx-auto max-w-[1800px] w-full px-5 pt-6 pb-5 sm:px-10 lg:px-14">
        <div className="relative overflow-hidden rounded-[28px] min-h-[520px] flex items-center"
          style={{
            background: "linear-gradient(135deg, #042f2e 0%, #0d4a45 40%, #134e3a 70%, #0a3d34 100%)"
          }}
        >
          {/* Background texture dots */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />

          {/* Glow orbs */}
          <div className="hero-glow-orb w-[420px] h-[420px] -top-24 -left-16 bg-teal-400/20" />
          <div className="hero-glow-orb w-[300px] h-[300px] bottom-0 right-1/3 bg-emerald-300/10" />
          <div className="hero-glow-orb w-[200px] h-[200px] top-1/4 right-24 bg-amber-400/10" />

          {/* Content grid */}
          <div className="relative z-10 w-full grid gap-10 lg:grid-cols-[1.15fr_1fr] items-center px-8 sm:px-14 lg:px-16 py-14 lg:py-16">

            {/* ── Left: Text & CTA ── */}
            <div className="max-w-lg">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-200">
                  নতুন সামার কালেকশন ২০২৬
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-[2.6rem] sm:text-[3.2rem] lg:text-[3.6rem] font-extrabold text-white mb-5 leading-[1.12] tracking-tight">
                নতুন ফ্যাশন,<br />
                <span className="font-serif italic font-normal text-amber-300">
                  প্রিমিয়াম কোয়ালিটি!
                </span>
              </h1>

              <p className="text-[13px] sm:text-sm leading-[1.85] text-teal-100/80 font-medium mb-10 max-w-md">
                দেশীয় ঐতিহ্য ও আধুনিক ডিজাইনের মেলবন্ধনে আমাদের নতুন আকর্ষণীয় কালেকশন।
                দ্রুত হোম ডেলিভারি ও সহজ রিটার্ন সুবিধায় কেনাকাটা করুন নিশ্চিন্তে।
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 items-center">
                <Link
                  href="/store/products"
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-7 py-3.5 text-[12px] tracking-wider uppercase transition-all duration-250 hover:shadow-xl hover:shadow-amber-500/25 hover:-translate-y-0.5"
                >
                  কালেকশন দেখুন
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/store/register"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm text-white font-bold px-7 py-3.5 text-[12px] tracking-wider uppercase hover:bg-white/20 hover:border-white/50 transition-all duration-250"
                >
                  একাউন্ট খুলুন
                </Link>
              </div>

              {/* Mini Trust Strips */}
              <div className="flex items-center gap-5 mt-10 pt-8 border-t border-white/10">
                {["🚚 ফ্রি ডেলিভারি", "🔄 ৭ দিন রিটার্ন", "💎 অরিজিনাল পণ্য"].map((item, i) => (
                  <span key={i} className="text-[10px] font-semibold text-teal-200/80 tracking-wide">{item}</span>
                ))}
              </div>
            </div>

            {/* ── Right: Premium Collage Visual ── */}
            <div className="hidden lg:flex justify-end items-center relative h-full pr-2">
              {/* Main Image Card */}
              <div className="relative w-full max-w-[360px] group">
                {/* Outer glow ring */}
                <div className="absolute -inset-[3px] rounded-[26px] bg-gradient-to-br from-teal-400/30 via-transparent to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                <div className="relative rounded-[24px] overflow-hidden border border-white/15 shadow-2xl shadow-black/40"
                  style={{ aspectRatio: "3/4", maxHeight: "420px" }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=85"
                    alt="Premium Fashion"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                  {/* Bottom product info */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-teal-300 uppercase tracking-widest">ফিচার্ড আইটেম</p>
                      <p className="text-xs font-bold text-white mt-0.5">প্রিমিয়াম সামার কালেকশন</p>
                    </div>
                    <span className="text-[11px] font-extrabold text-amber-300 bg-teal-950/70 border border-teal-700/50 px-3 py-1 rounded-xl">
                      ৳৪,৫০০
                    </span>
                  </div>
                </div>

                {/* Floating Overlay Product Badge (top-left) */}
                <div className="absolute -top-5 -left-12 w-[148px] bg-white rounded-2xl shadow-2xl shadow-black/20 border border-slate-100 p-3 animate-float z-20">
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mb-2.5 border border-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80"
                      alt="Accessories"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-700 leading-tight line-clamp-2">প্রিমিয়াম লেদার ব্যাগ</p>
                  <p className="text-[11px] font-extrabold text-teal-600 mt-1">৳২,৯০০</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className="w-2 h-2 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Floating "Best Seller" badge (top-right) */}
                <div className="absolute -top-3 -right-8 bg-gradient-to-br from-amber-400 to-orange-400 text-slate-900 rounded-2xl px-3 py-2 shadow-lg shadow-amber-500/25 z-20 border border-amber-300/50">
                  <p className="text-[8px] font-black uppercase tracking-widest leading-none">🔥 Best Seller</p>
                  <p className="text-[8px] font-bold text-slate-800/70 mt-0.5">সেরা আকর্ষণ</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust Guarantees Bar ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-4 sm:px-10 lg:px-14">
        <div className="bg-white rounded-2xl border border-[#e8edf4] shadow-sm">
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e8edf4]">
            {[
              { title: "ক্যাশ অন ডেলিভারি", desc: "পণ্য পেয়ে মূল্য দিন", icon: "🤝", color: "text-teal-600 bg-teal-50" },
              { title: "৭ দিনের রিটার্ন", desc: "পছন্দ না হলে ফেরত", icon: "🔄", color: "text-blue-600 bg-blue-50" },
              { title: "১০০% অরিজিনাল", desc: "আসল পণ্যের নিশ্চয়তা", icon: "💎", color: "text-purple-600 bg-purple-50" },
              { title: "২৪/৭ সাপোর্ট", desc: "সবসময় আমরা পাশে", icon: "📞", color: "text-amber-600 bg-amber-50" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3.5 px-6 py-4 hover:bg-slate-50/70 transition-colors duration-200 first:rounded-l-2xl last:rounded-r-2xl">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${item.color}`}>
                  {item.icon}
                </span>
                <div>
                  <h3 className="text-[11px] font-bold text-slate-800 tracking-wide">{item.title}</h3>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CATEGORY SECTION — Double-Ring Circles
          ════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-[1800px] w-full px-5 py-5 sm:px-10 lg:px-14">
          <div className="bg-white rounded-[24px] border border-[#e8edf4] shadow-sm px-8 pt-8 pb-10">

            {/* Section header */}
            <div className="flex items-end justify-between mb-10 pb-6 border-b border-[#e8edf4]">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
                  ক্যাটাগরি
                </span>
                <h2 className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">আপনার পছন্দের ক্যাটাগরি</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1.5">পছন্দের ক্যাটাগরি বেছে নিয়ে ব্রাউজ করুন</p>
              </div>
              <Link
                href="/store/products"
                className="text-[11px] font-bold text-teal-600 hover:text-teal-800 transition-colors tracking-wide flex items-center gap-1.5"
              >
                সব দেখুন
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Category Circle Grid */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-6 justify-items-center">
              {categories.map((cat) => {
                const style = getCategoryStyle(cat.name);
                return (
                  <Link
                    key={cat.id}
                    href={`/store/products?categoryId=${cat.id}`}
                    className="group flex flex-col items-center text-center cursor-pointer w-full max-w-[100px]"
                  >
                    {/* Double-ring wrapper */}
                    <div className="relative">
                      {/* Outer ring — shows on hover */}
                      <div className={`absolute -inset-[4px] rounded-full border-2 border-transparent group-hover:border-teal-400 transition-all duration-350 opacity-0 group-hover:opacity-100`} />

                      {/* Middle ring */}
                      <div className={`p-[3px] rounded-full ring-2 ring-offset-2 ring-offset-white transition-all duration-350 ${style.ring}`}>
                        {/* Inner circle with image */}
                        <div className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden bg-gradient-to-br ${style.gradient} flex items-center justify-center transition-transform duration-500 group-hover:scale-105 shadow-sm`}>
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
                            />
                          ) : (
                            <span className="text-2xl">{style.icon}</span>
                          )}
                        </div>
                      </div>

                      {/* Active indicator dot */}
                      <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-teal-500 border-2 border-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm" />
                    </div>

                    {/* Label */}
                    <h3 className="text-[11px] font-extrabold text-slate-700 mt-3.5 group-hover:text-teal-600 transition-colors duration-250 leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5 leading-tight">
                      {style.desc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Flash Sale / Limited Offers ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-5 sm:px-10 lg:px-14">
        <div className="relative overflow-hidden rounded-[24px] border border-slate-800/60"
          style={{ background: "linear-gradient(145deg, #0a0f1e 0%, #0d1a2e 50%, #061a18 100%)" }}
        >
          <div className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(13,148,136,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245,158,11,0.06) 0%, transparent 50%)" }}
          />

          <div className="relative z-10 p-8 sm:p-10">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-7 mb-8 border-b border-white/8">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400 border border-amber-500/25 bg-amber-500/10 px-3 py-1 rounded-full">
                  সীমিত সময়ের অফার
                </span>
                <h2 className="mt-3 text-2xl font-extrabold text-white tracking-tight">স্পেশাল ধামাকা অফার</h2>
                <p className="mt-1.5 text-[11px] text-teal-200/60 font-semibold">সেরা ডিসকাউন্টে আপনার পছন্দের পণ্য কিনুন</p>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-teal-300 shrink-0">অফার শেষ:</span>
                <div className="flex gap-2 items-center">
                  {[
                    { value: countdown.hours, label: "ঘণ্টা" },
                    { value: countdown.minutes, label: "মিনিট" },
                    { value: countdown.seconds, label: "সেকেন্ড" },
                  ].map((unit, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="bg-slate-950 border border-slate-700/60 rounded-xl w-11 h-11 flex flex-col items-center justify-center shadow-md">
                        <span className="text-sm font-black text-white leading-none">{unit.value.toString().padStart(2, "0")}</span>
                        <span className="text-[7px] font-bold text-teal-400 uppercase tracking-wider mt-0.5 leading-none">{unit.label}</span>
                      </div>
                      {idx < 2 && <span className="text-teal-500/70 font-black text-base">:</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 4).map((p) => {
                const progressWidth = 40 + (parseFloat(p.id.slice(0, 1)) || 5) * 5;
                return (
                  <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-4 group flex flex-col hover:bg-white/8 hover:border-teal-700/40 transition-all duration-300">
                    <Link href={`/store/products/${p.slug}`} className="block relative aspect-square bg-white/8 rounded-xl overflow-hidden mb-4 border border-white/8">
                      <img
                        src={p.media?.[0]?.media.url ?? "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80"}
                        alt={p.name}
                        className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-2.5 left-2.5 rounded-lg bg-rose-500 text-white px-2 py-0.5 text-[9px] font-bold uppercase shadow-sm">
                        -৩০%
                      </span>
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <h3 className="text-[11px] font-bold text-slate-200 truncate group-hover:text-teal-300 transition-colors">{p.name}</h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm font-extrabold text-amber-300">{p.variants?.[0] ? `৳${p.variants[0].price}` : ""}</span>
                        <span className="text-[10px] text-slate-500 line-through">{p.variants?.[0] ? `৳${Math.round(parseFloat(p.variants[0].price.toString()) * 1.4)}` : ""}</span>
                      </div>
                      {/* Stock bar */}
                      <div className="mt-3.5">
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1.5">
                          <span>স্টক আপডেট</span>
                          <span className="text-amber-400">{progressWidth}% বিক্রি</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000"
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
        </div>
      </section>

      {/* ── Editorial Lookbook / Collections ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-5 sm:px-10 lg:px-14">
        <div className="grid gap-5 md:grid-cols-2">

          <div className="relative overflow-hidden rounded-[24px] bg-slate-950 text-white min-h-[300px] p-8 flex flex-col justify-end group cursor-pointer border border-slate-800/60">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-45 group-hover:scale-[1.04] transition-transform duration-600 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            <div className="relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-teal-300 mb-2 block">নতুন কালেকশন ০১</span>
              <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-teal-300 transition-colors leading-tight">আধুনিক ক্যাজুয়াল ফ্যাশন</h3>
              <p className="text-[11px] text-slate-300 font-medium max-w-xs mb-5 leading-relaxed">স্টাইলিশ ডিজাইনের আরামদায়ক পোশাকগুলো দিয়ে নিজেকে সাজান নতুন করে।</p>
              <Link href="/store/products" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white border-b border-white/50 pb-0.5 hover:text-teal-300 hover:border-teal-300 transition-colors">
                বিস্তারিত দেখুন
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[24px] bg-slate-950 text-white min-h-[300px] p-8 flex flex-col justify-end group cursor-pointer border border-slate-800/60">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-45 group-hover:scale-[1.04] transition-transform duration-600 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            <div className="relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300 mb-2 block">নতুন কালেকশন ০২</span>
              <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-amber-300 transition-colors leading-tight">এক্সক্লুসিভ লাক্সারি ডিজাইন</h3>
              <p className="text-[11px] text-slate-300 font-medium max-w-xs mb-5 leading-relaxed">উন্নত মানের ফেব্রিক্স ও আকর্ষণীয় ডিজাইনের গর্জিয়াস কালেকশন সমূহ।</p>
              <Link href="/store/products" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white border-b border-white/50 pb-0.5 hover:text-amber-300 hover:border-amber-300 transition-colors">
                বিস্তারিত দেখুন
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── Brand Partners ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-4 sm:px-10 lg:px-14">
        <div className="bg-white rounded-[20px] border border-[#e8edf4] shadow-sm px-8 py-7 flex flex-col items-center">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-slate-400 mb-6">আমাদের পার্টনার ব্র্যান্ডস</p>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 opacity-30 select-none">
            {["HERMES", "VOGUE", "ELYSIUM", "APEX", "COCONUT", "SERENE"].map((brand, idx) => (
              <span key={idx} className="font-serif text-base tracking-[0.28em] font-extrabold text-slate-900">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Products Grid ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-5 sm:px-10 lg:px-14">
        <div className="bg-white rounded-[24px] border border-[#e8edf4] shadow-sm p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#e8edf4] gap-4">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
                নতুন কালেকশন
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">আমাদের সেরা পণ্যসমূহ</h2>
            </div>
            <Link
              href="/store/products"
              className="text-[11px] font-bold text-teal-600 hover:text-teal-800 transition-colors flex items-center gap-1.5"
            >
              সব প্রোডাক্ট দেখুন
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-[#e8edf4]">
                  <div className="aspect-square skeleton-shimmer" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-2.5 skeleton-shimmer rounded w-1/4" />
                    <div className="h-3.5 skeleton-shimmer rounded w-3/4" />
                    <div className="h-3 skeleton-shimmer rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-4xl mb-4">📦</p>
              <p className="text-lg font-bold text-slate-700">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400 mt-2">স্টোরে নতুন প্রোডাক্ট যুক্ত করুন।</p>
              <Link href="/admin/products/new" className="mt-6 inline-flex btn-premium text-sm">
                প্রোডাক্ট যুক্ত করুন
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-scale-in">
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
