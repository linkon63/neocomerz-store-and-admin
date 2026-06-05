"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { productsApi, categoriesApi, type Product, type Category } from "@/lib/store-api";
import { ProductCard } from "./_components/product-card";

// Premium Mango Category Styling Config
const CATEGORY_STYLES: Record<string, { icon: string; desc: string; gradient: string; ring: string }> = {
  "langra": {
    icon: "🥭",
    desc: "সুমিষ্ট ল্যাংড়া আম",
    gradient: "from-[#FFF8E7] to-amber-100/60",
    ring: "ring-amber-200 group-hover:ring-[#2E7D32]"
  },
  "amrapali": {
    icon: "🥭",
    desc: "মিষ্টি আম্রপালি",
    gradient: "from-[#FFF8E7] to-yellow-100/60",
    ring: "ring-yellow-200 group-hover:ring-[#2E7D32]"
  },
  "himsagar": {
    icon: "🥭",
    desc: "রসালো হিমসাগর",
    gradient: "from-[#FFF8E7] to-green-100/60",
    ring: "ring-green-200 group-hover:ring-[#2E7D32]"
  },
  "fazli": {
    icon: "🥭",
    desc: "বিশাল সাইজের ফজলি",
    gradient: "from-[#FFF8E7] to-amber-150/60",
    ring: "ring-amber-250 group-hover:ring-[#2E7D32]"
  },
  "khirshapat": {
    icon: "🥭",
    desc: "সুগন্ধি ক্ষীরশাপাত",
    gradient: "from-[#FFF8E7] to-yellow-150/60",
    ring: "ring-yellow-250 group-hover:ring-[#2E7D32]"
  },
  // Fallbacks to gracefully map fashion categories to mango styling
  "men": {
    icon: "🥭",
    desc: "ল্যাংড়া আম কালেকশন",
    gradient: "from-[#FFF8E7] to-amber-100/60",
    ring: "ring-amber-200 group-hover:ring-[#2E7D32]"
  },
  "women": {
    icon: "🥭",
    desc: "হিমসাগর আম কালেকশন",
    gradient: "from-[#FFF8E7] to-yellow-100/60",
    ring: "ring-yellow-200 group-hover:ring-[#2E7D32]"
  },
  "clothing": {
    icon: "🥭",
    desc: "আম্রপালি আম কালেকশন",
    gradient: "from-[#FFF8E7] to-green-100/60",
    ring: "ring-green-200 group-hover:ring-[#2E7D32]"
  },
  "electronics": {
    icon: "📦",
    desc: "আমের গিফট বক্স",
    gradient: "from-[#FFF8E7] to-amber-200/60",
    ring: "ring-amber-200 group-hover:ring-[#2E7D32]"
  },
  "accessories": {
    icon: "🍯",
    desc: "আমের আচার ও জুস",
    gradient: "from-[#FFF8E7] to-orange-100/60",
    ring: "ring-orange-200 group-hover:ring-[#2E7D32]"
  },
  "shoes": {
    icon: "🥭",
    desc: "অন্যান্য জাতের আম",
    gradient: "from-[#FFF8E7] to-yellow-100/60",
    ring: "ring-yellow-200 group-hover:ring-[#2E7D32]"
  },
  "footwear": {
    icon: "🥭",
    desc: "অন্যান্য জাতের আম",
    gradient: "from-[#FFF8E7] to-yellow-100/60",
    ring: "ring-yellow-200 group-hover:ring-[#2E7D32]"
  },
  "default": {
    icon: "🥭",
    desc: "বাগান তাজা আম",
    gradient: "from-[#FFF8E7] to-amber-100/60",
    ring: "ring-amber-200 group-hover:ring-[#2E7D32]"
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
    <div className="bg-[#FFF8E7]/30 text-stone-900 font-sans min-h-screen pb-16">

      {/* ── Top Announcement Banner ── */}
      <div className="bg-gradient-to-r from-[#2E7D32] via-[#1B5E20] to-[#2E7D32] text-amber-50 text-center py-2.5 px-4 text-[11px] font-bold tracking-wide shadow-xs">
        🥭&nbsp; সরাসরি নওগাঁর বাগান থেকে ফরমালিন ও কেমিক্যাল মুক্ত প্রিমিয়াম আম ডেলিভারি!&nbsp;&nbsp;·&nbsp;&nbsp;৳২,৫০০+ অর্ডারে সম্পূর্ণ ফ্রি ডেলিভারি!
      </div>

      {/* ══════════════════════════════════════
          HERO SECTION — Premium Mango Layout
          ══════════════════════════════════════ */}
      <section className="mx-auto max-w-[1800px] w-full px-5 pt-6 pb-5 sm:px-10 lg:px-14">
        <div className="relative overflow-hidden rounded-[28px] min-h-[540px] flex items-center bg-[#0F291E]"
        >
          {/* Background texture dots */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />

          {/* Glow orbs */}
          <div className="hero-glow-orb w-[420px] h-[420px] -top-24 -left-16 bg-[#2E7D32]/25" />
          <div className="hero-glow-orb w-[300px] h-[300px] bottom-0 right-1/3 bg-[#FFC72C]/10" />
          <div className="hero-glow-orb w-[200px] h-[200px] top-1/4 right-24 bg-amber-400/10" />

          {/* Content grid */}
          <div className="relative z-10 w-full grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center px-8 sm:px-14 lg:px-16 py-14 lg:py-16">

            {/* ── Left: Text & CTA ── */}
            <div className="max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#2E7D32]/20 border border-[#2E7D32]/30 backdrop-blur-md rounded-full px-4 py-1.5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC72C] animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-250 font-display">
                  শতভাগ নিরাপদ ও সরাসরি বাগান থেকে সংগ্রহ
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-[2.6rem] sm:text-[3.2rem] lg:text-[3.8rem] font-extrabold text-white mb-5 leading-[1.12] tracking-tight">
                সরাসরি নওগাঁর বাগান থেকে<br />
                <span className="font-serif italic font-normal text-[#FFC72C]">
                  বিষমুক্ত প্রিমিয়াম আম!
                </span>
              </h1>

              <p className="text-[13.5px] sm:text-sm leading-[1.85] text-stone-200/90 font-medium mb-10 max-w-lg">
                নওগাঁর বিখ্যাত ও ঐতিহ্যবাহী সুমিষ্ট ল্যাংড়া, হিমসাগর, আম্রপালি ও ক্ষীরশাপাত আম সরাসরি আমাদের নিজস্ব বাগান থেকে গাছপাকা অবস্থায় গ্রাহকদের কাছে পৌঁছে দিচ্ছি। কোনো ক্ষতিকর কেমিক্যাল বা ফরমালিন ছাড়া সম্পূর্ণ প্রাকৃতিকভাবে পাকানো আমের নিশ্চয়তা।
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  href="/store/products"
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-[#FFC72C] hover:bg-[#FFC72C]/90 text-stone-950 font-black px-8 py-4 text-[12px] tracking-wider uppercase transition-all duration-250 hover:shadow-xl hover:shadow-[#FFC72C]/20 hover:-translate-y-0.5 font-display"
                >
                  আমের কালেকশন দেখুন
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/store/register"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xs text-white font-bold px-7 py-3.5 text-[12px] tracking-wider uppercase hover:bg-white/15 hover:border-white/45 transition-all duration-250"
                >
                  একাউন্ট খুলুন
                </Link>
              </div>

              {/* Mini Trust Strips */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 mt-10 pt-8 border-t border-white/10">
                {["🚚 দ্রুত হোম ডেলিভারি", "🔄 রিটার্ন গ্যারান্টি", "🥭 ১০০% ফ্রেশ ও তাজা", "🛡️ নিরাপদ প্যাকেজিং"].map((item, i) => (
                  <span key={i} className="text-[10.5px] font-bold text-amber-250/90 tracking-wide">{item}</span>
                ))}
              </div>
            </div>

            {/* ── Right: Premium Hero Image Visual ── */}
            <div className="hidden lg:flex justify-end items-center relative h-full pr-2">
              <div className="relative w-full max-w-[420px] group">
                {/* Outer glow ring */}
                <div className="absolute -inset-[3px] rounded-[26px] bg-gradient-to-br from-[#2E7D32]/40 via-transparent to-[#FFC72C]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                <div className="relative rounded-[24px] overflow-hidden border border-white/15 shadow-2xl shadow-black/45"
                  style={{ aspectRatio: "4/3", maxHeight: "380px" }}
                >
                  <img
                    src="/mango_hero.png"
                    alt="Premium Naogaon Mangoes"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Bottom info badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-[#0F291E]/95 backdrop-blur-md border border-[#2E7D32]/35 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-extrabold text-[#FFC72C] uppercase tracking-widest font-display">আজকের স্পেশাল</p>
                      <p className="text-xs font-bold text-white mt-0.5">নওগাঁর তাজা ল্যাংড়া আম</p>
                    </div>
                    <span className="text-[11px] font-black text-white bg-[#2E7D32] border border-[#2E7D32]/40 px-3.5 py-1.5 rounded-xl shadow-xs">
                      ৳১১০ / কেজি
                    </span>
                  </div>
                </div>

                {/* Floating "Premium Quality" badge */}
                <div className="absolute -top-4 -left-8 bg-gradient-to-br from-[#FFC72C] to-amber-500 text-stone-950 rounded-2xl px-4 py-2.5 shadow-lg shadow-amber-500/20 z-20 border border-amber-300/50">
                  <p className="text-[8px] font-black uppercase tracking-widest leading-none">🔥 PREMIUM SELECT</p>
                  <p className="text-[10px] font-extrabold text-stone-900 mt-1">১০০% ফরমালিন মুক্ত</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust Guarantees Bar ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-4 sm:px-10 lg:px-14">
        <div className="bg-white rounded-2xl border border-[#E8E0D4] shadow-xs">
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E0D4]">
            {[
              { title: "ক্যাশ অন ডেলিভারি", desc: "আম হাতে পেয়ে বুঝে মূল্য দিন", icon: "🤝", color: "text-[#2E7D32] bg-[#E8F5E9]" },
              { title: "সরাসরি বাগান থেকে", desc: "নওগাঁর বিশ্বস্ত বাগান থেকে ফ্রেশ", icon: "🥭", color: "text-amber-700 bg-[#FFF8E7]" },
              { title: "নিরাপদ প্যাকেজিং", desc: "ক্যারেট বক্সে নষ্ট হবার ঝুঁকি নেই", icon: "📦", color: "text-amber-800 bg-orange-50/70" },
              { title: "২৪/৭ কাস্টমার সাপোর্ট", desc: "যেকোনো প্রয়োজনে আমরা আছি পাশে", icon: "📞", color: "text-blue-700 bg-blue-50/70" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3.5 px-6 py-5 hover:bg-[#FFF8E7]/40 transition-colors duration-200 first:rounded-l-2xl last:rounded-r-2xl">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${item.color}`}>
                  {item.icon}
                </span>
                <div>
                  <h3 className="text-[11.5px] font-extrabold text-stone-800 tracking-wide">{item.title}</h3>
                  <p className="text-[10px] font-semibold text-stone-400 mt-0.5">{item.desc}</p>
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
          <div className="bg-white rounded-[24px] border border-[#E8E0D4] shadow-xs px-8 pt-8 pb-10">

            {/* Section header */}
            <div className="flex items-end justify-between mb-10 pb-6 border-b border-[#E8E0D4]">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2E7D32] bg-[#E8F5E9] border border-[#E8F5E9] px-3.5 py-1.5 rounded-full font-display">
                  আমের জাতসমূহ
                </span>
                <h2 className="mt-4 text-2xl font-extrabold text-stone-900 tracking-tight">আপনার পছন্দের জাত বেছে নিন</h2>
                <p className="text-xs text-stone-400 font-semibold mt-1.5">সেরা জাতের আম সরাসরি ব্রাউজ করুন</p>
              </div>
              <Link
                href="/store/products"
                className="text-[11px] font-bold text-[#2E7D32] hover:text-[#1B5E20] transition-colors tracking-wide flex items-center gap-1.5 font-display"
              >
                সব আম দেখুন
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
                      <div className={`absolute -inset-[4px] rounded-full border-2 border-transparent group-hover:border-[#FFC72C] transition-all duration-350 opacity-0 group-hover:opacity-100`} />

                      {/* Middle ring */}
                      <div className={`p-[3px] rounded-full ring-2 ring-offset-2 ring-offset-white transition-all duration-350 ${style.ring}`}>
                        {/* Inner circle with image */}
                        <div className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden bg-gradient-to-br ${style.gradient} flex items-center justify-center transition-transform duration-500 group-hover:scale-105 shadow-xs`}>
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
                      <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#2E7D32] border-2 border-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm" />
                    </div>

                    {/* Label */}
                    <h3 className="text-[11.5px] font-extrabold text-stone-800 mt-3.5 group-hover:text-[#2E7D32] transition-colors duration-250 leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[9.5px] text-stone-400 font-semibold mt-0.5 leading-tight">
                      {style.desc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Why Choose Us Section ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-5 sm:px-10 lg:px-14">
        <div className="bg-white rounded-[24px] border border-[#E8E0D4] shadow-xs p-8 sm:p-10">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2E7D32] bg-[#E8F5E9] border border-[#E8F5E9] px-3.5 py-1.5 rounded-full font-display">
              কেন আমরা সেরা?
            </span>
            <h2 className="mt-4 text-2.5xl font-extrabold text-stone-900 tracking-tight">আম এক্সপ্রেস কেন আপনার প্রথম পছন্দ?</h2>
            <p className="text-xs text-stone-400 font-semibold mt-2">আমাদের আমের প্রধান কিছু বৈশিষ্ট্য যা আপনাকে দেবে ১০০% নিশ্চয়তা</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "১০০% প্রাকৃতিকভাবে পাকা", desc: "আমরা কৃত্রিম প্রকোষ্ঠ বা কার্বাইড ব্যবহার করি না। আমগুলো প্রাকৃতিকভাবে পরিপক্ক হওয়ার পর পাড়া হয়।", icon: "🌱" },
              { title: "সরাসরি বাগান থেকে কুরিয়ার", desc: "কোনো মধ্যস্বত্বভোগী নেই, বাগান থেকে আম সরাসরি আপনার দরজায় পাঠিয়ে দেওয়া হয় ২৪-৪৮ ঘণ্টায়।", icon: "🚀" },
              { title: "সুরক্ষিত ক্যারেট প্যাকেজিং", desc: "আমের কোনো ক্ষতি না হতে আমরা মজবুত কাঠের ক্যারেট বা পাঁচ স্তরের কার্টন বক্স ব্যবহার করি।", icon: "📦" },
              { title: "পরিবহন ক্ষতিপূরণ পলিসি", desc: "কুরিয়ারের পথে আম নষ্ট বা পচে গেলে আমরা দ্রুত তার সমপরিমাণ রিফান্ড বা রিপ্লেসমেন্ট প্রদান করি।", icon: "🛡️" },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#FFF8E7]/40 border border-[#E8E0D4]/60 rounded-2xl p-6 hover:bg-[#FFF8E7]/70 transition-all duration-300 flex flex-col items-center text-center">
                <span className="text-3xl mb-4">{item.icon}</span>
                <h3 className="text-xs font-extrabold text-stone-800 tracking-wide mb-2">{item.title}</h3>
                <p className="text-[11px] leading-relaxed text-stone-500 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Flash Sale / Limited Offers ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-5 sm:px-10 lg:px-14">
        <div className="relative overflow-hidden rounded-[24px] border border-[#1B5E20]/35 bg-[#0F291E]"
        >
          <div className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(46,125,50,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,199,44,0.08) 0%, transparent 50%)" }}
          />

          <div className="relative z-10 p-8 sm:p-10">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-7 mb-8 border-b border-white/8">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FFC72C] border border-[#FFC72C]/25 bg-[#FFC72C]/10 px-3.5 py-1.5 rounded-full font-display">
                  সীমিত সময়ের অফার
                </span>
                <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">আজকের হট ফ্ল্যাশ সেল</h2>
                <p className="mt-1.5 text-[11px] text-[#FFC72C]/70 font-semibold font-display">সেরা ডিসকাউন্টে সরাসরি নওগাঁর তাজা আম অর্ডার করুন</p>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-3 bg-black/35 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-stone-200 shrink-0 font-display">অফার শেষ:</span>
                <div className="flex gap-2 items-center">
                  {[
                    { value: countdown.hours, label: "ঘণ্টা" },
                    { value: countdown.minutes, label: "মিনিট" },
                    { value: countdown.seconds, label: "সেকেন্ড" },
                  ].map((unit, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="bg-black/50 border border-white/10 rounded-xl w-11 h-11 flex flex-col items-center justify-center shadow-md">
                        <span className="text-sm font-black text-white leading-none">{unit.value.toString().padStart(2, "0")}</span>
                        <span className="text-[7.5px] font-extrabold text-[#FFC72C] uppercase tracking-wider mt-0.5 leading-none font-display">{unit.label}</span>
                      </div>
                      {idx < 2 && <span className="text-amber-500/70 font-black text-base">:</span>}
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
                  <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-4 group flex flex-col hover:bg-white/10 hover:border-[#FFC72C]/40 transition-all duration-300">
                    <Link href={`/store/products/${p.slug}`} className="block relative aspect-square bg-white rounded-xl overflow-hidden mb-4 border border-white/8">
                      <img
                        src={p.media?.[0]?.media.url ?? "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=300&q=80"}
                        alt={p.name}
                        className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-2.5 left-2.5 rounded-lg bg-rose-500 text-white px-2 py-0.5 text-[9px] font-bold uppercase shadow-sm">
                        অফিসিয়াল অফার
                      </span>
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <h3 className="text-[11.5px] font-bold text-stone-200 truncate group-hover:text-[#FFC72C] transition-colors">{p.name}</h3>
                      <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-sm font-black text-[#FFC72C]">{p.variants?.[0] ? `৳${p.variants[0].price}` : ""}</span>
                        <span className="text-[10px] text-stone-400 line-through">{p.variants?.[0] ? `৳${Math.round(parseFloat(p.variants[0].price.toString()) * 1.25)}` : ""}</span>
                      </div>
                      {/* Stock bar */}
                      <div className="mt-3.5">
                        <div className="flex justify-between text-[9px] font-bold text-stone-300 mb-1.5">
                          <span>সীমিত স্টক উপলব্ধ</span>
                          <span className="text-[#FFC72C]">{progressWidth}% অর্ডারড</span>
                        </div>
                        <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#FFC72C] to-amber-400 rounded-full transition-all duration-1000"
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

      {/* ── Farm Story Section ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-5 sm:px-10 lg:px-14">
        <div className="bg-white rounded-[24px] border border-[#E8E0D4] shadow-xs overflow-hidden grid gap-0 md:grid-cols-2 items-center">
          <div className="p-8 sm:p-12 lg:p-16 space-y-6">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2E7D32] bg-[#E8F5E9] border border-[#E8F5E9] px-3.5 py-1.5 rounded-full font-display">
              বাগান থেকে আপনার টেবিলে
            </span>
            <h2 className="text-2.5xl font-extrabold text-stone-900 tracking-tight leading-tight">আমাদের বাগান থেকে সরাসরি আপনার পরিবারে</h2>
            <p className="text-xs leading-relaxed text-stone-500 font-semibold">
              নওগাঁর উর্বর মাটি এবং বিশেষ জলবায়ু সুমিষ্ট ও রসালো আম উৎপাদনের জন্য বিশ্বখ্যাত। আমরা এই অঞ্চলের সেরা চাষীদের সাথে চুক্তিবদ্ধ হয়ে সম্পূর্ণ নিরাপদ উপায়ে আম চাষ নিশ্চিত করি।
            </p>
            <p className="text-xs leading-relaxed text-stone-500 font-semibold">
              গাছ থেকে পাকা আম সংগ্রহ করার পর অত্যন্ত যত্ন সহকারে বাছাই করে আমাদের গুণগত মান পরীক্ষা করা হয়। প্রতিটি চালানে গ্রাহক যেন নিখুঁত ও ফ্রেশ আম পান, তার জন্য আমরা ডেডিকেটেডলি কাজ করি।
            </p>
            <div className="pt-2">
              <Link
                href="/store/products"
                className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2E7D32] border-b-2 border-[#2E7D32] pb-1 hover:text-[#1B5E20] hover:border-[#1B5E20] transition-colors"
              >
                আমাদের সম্পর্কে ও আম সংগ্রহ দেখুন
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="h-[360px] md:h-full min-h-[380px] relative">
            <img
              src="/farm_story.png"
              alt="Naogaon Mango Orchard"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-stone-900/10" />
          </div>
        </div>
      </section>

      {/* ── Editorial Lookbook / Collections ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-5 sm:px-10 lg:px-14">
        <div className="grid gap-5 md:grid-cols-2">

          <div className="relative overflow-hidden rounded-[24px] bg-stone-900 text-white min-h-[300px] p-8 flex flex-col justify-end group cursor-pointer border border-[#E8E0D4]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40 group-hover:scale-[1.04] transition-transform duration-600 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
            <div className="relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FFC72C] mb-2 block font-display">বিশেষ জাত কালেকশন</span>
              <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-[#FFC72C] transition-colors leading-tight">ল্যাংড়া ও হিমসাগর</h3>
              <p className="text-[11.5px] text-stone-200/90 font-semibold max-w-xs mb-5 leading-relaxed">নওগাঁর সেরা আঁশহীন অত্যন্ত মিষ্টি ও রসালো স্বাদের ঐতিহ্যবাহী ল্যাংড়া ও হিমসাগর আম।</p>
              <Link href="/store/products" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white border-b border-white/50 pb-0.5 hover:text-[#FFC72C] hover:border-[#FFC72C] transition-colors font-display">
                কালেকশন দেখুন
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[24px] bg-stone-900 text-white min-h-[300px] p-8 flex flex-col justify-end group cursor-pointer border border-[#E8E0D4]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-35 group-hover:scale-[1.04] transition-transform duration-600 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
            <div className="relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300 mb-2 block font-display">মিষ্টির ধামাকা কালেকশন</span>
              <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-amber-300 transition-colors leading-tight">আম্রপালি ও ক্ষীরশাপাত</h3>
              <p className="text-[11.5px] text-stone-200/90 font-semibold max-w-xs mb-5 leading-relaxed">উন্নত মানের সুবাস এবং ঘন সুমিষ্ট রসের জন্য বিখ্যাত নওগাঁর ক্ষীরশাপাত ও আম্রপালি আম।</p>
              <Link href="/store/products" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white border-b border-white/50 pb-0.5 hover:text-amber-300 hover:border-amber-300 transition-colors font-display">
                কালেকশন দেখুন
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-5 sm:px-10 lg:px-14">
        <div className="bg-white rounded-[24px] border border-[#E8E0D4] shadow-xs p-8 sm:p-10">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2E7D32] bg-[#E8F5E9] border border-[#E8F5E9] px-3.5 py-1.5 rounded-full font-display">
              গ্রাহকদের মতামত
            </span>
            <h2 className="mt-4 text-2.5xl font-extrabold text-stone-900 tracking-tight">আমাদের সন্তুষ্ট গ্রাহকেরা কী বলছেন?</h2>
            <p className="text-xs text-stone-400 font-semibold mt-2">আমাদের আমের স্বাদ এবং সেবার ব্যাপারে তাদের বাস্তব মতামত</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { text: "আমগুলো অসাধারণ মিষ্টি ছিল! একদম ফ্রেশ এবং ক্যারেটের প্যাকেজিংও চমৎকার ছিল, একটা আমও নষ্ট হয়নি।", name: "তানভীর আহমেদ", loc: "ঢাকা", rating: 5 },
              { text: "আম এক্সপ্রেস থেকে আম কিনে সত্যি দারুণ অভিজ্ঞতা হলো। সময়মত ডেলিভারি পেয়েছি। ল্যাংড়া আমগুলোর স্বাদ অসাধারণ!", name: "তাসলিমা আক্তার", loc: "চট্টগ্রাম", rating: 5 },
              { text: "গত সপ্তাহে ক্ষীরশাপাত আম নিয়েছিলাম, প্রতিটি আম তাজা ছিল। কোনো কৃত্রিম কেমিক্যাল ছিল না দেখেই বোঝা গেছে। রিকমেন্ডেড!", name: "সাজিদ রহমান", loc: "সিলেট", rating: 5 },
            ].map((item, idx) => (
              <div key={idx} className="bg-stone-50 border border-stone-200/50 rounded-2xl p-6 hover:shadow-xs transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: item.rating }).map((_, r) => (
                      <svg key={r} className="w-3.5 h-3.5 fill-[#FFC72C] text-[#FFC72C]" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-stone-600 font-semibold italic">“{item.text}”</p>
                </div>
                <div className="mt-5 pt-4 border-t border-stone-200/40">
                  <p className="text-xs font-extrabold text-stone-800">{item.name}</p>
                  <p className="text-[9.5px] text-stone-400 font-bold mt-0.5">{item.loc}, বাংলাদেশ</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Logistics Partners ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-4 sm:px-10 lg:px-14">
        <div className="bg-white rounded-[20px] border border-[#E8E0D4] shadow-xs px-8 py-7 flex flex-col items-center">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#2E7D32] mb-6 font-display">আমাদের অফিসিয়াল ডেলিভারি পার্টনারস</p>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 opacity-40 select-none">
            {["PATHAO", "STEADFAST", "REDX", "PAPERFLY", "SUNDARBAN"].map((brand, idx) => (
              <span key={idx} className="font-serif text-base tracking-[0.28em] font-black text-stone-900">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Products Grid ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-5 sm:px-10 lg:px-14">
        <div className="bg-white rounded-[24px] border border-[#E8E0D4] shadow-xs p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E8E0D4] gap-4">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#2E7D32] bg-[#E8F5E9] border border-[#E8F5E9] px-3.5 py-1.5 rounded-full font-display">
                বাগান তাজা আম কালেকশন
              </span>
              <h2 className="mt-4 text-2xl font-extrabold text-stone-900 tracking-tight">আমাদের সরাসরি সংগ্রহের সেরা আমসমূহ</h2>
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
