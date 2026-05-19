"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { campaignsApi, type Campaign } from "@/lib/store-api";

interface HeroSectionProps {
  categories: Array<{ id: string; name: string; slug: string }>;
}

const CATEGORY_ICONS: Record<string, string> = {
  men: "👔", women: "👗", clothing: "👕", electronics: "⚡",
  accessories: "👜", shoes: "👟", footwear: "👟", default: "🛍️",
};

function getCategoryIcon(name: string) {
  const norm = name.toLowerCase();
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (norm.includes(key)) return CATEGORY_ICONS[key];
  }
  return CATEGORY_ICONS.default;
}

export function HeroSection({ categories }: HeroSectionProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignsApi.getHero()
      .then(setCampaigns)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Use campaign data if available, otherwise fallback to default content
  const heroCampaign = campaigns[0];
  const heroImage = heroCampaign?.images?.images?.[0];

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        
        {/* Sidebar Categories */}
        <aside className="hidden lg:block bg-white rounded-xl border overflow-hidden" style={{ borderColor: "var(--store-border)" }}>
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "var(--store-border)", backgroundColor: "var(--store-primary)" }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-[13px] font-bold text-white uppercase tracking-wide">সব ক্যাটাগরি</span>
          </div>
          <nav className="py-1">
            {categories.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="mx-3 my-1 h-9 rounded-lg bg-gray-100 animate-pulse" />
                ))
              : categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/store/products?categoryId=${cat.id}`}
                    className="flex items-center justify-between px-4 py-2.5 text-[13px] font-medium transition-all hover:bg-orange-50 group"
                    style={{ color: "var(--store-text)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{getCategoryIcon(cat.name)}</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">{cat.name}</span>
                    </div>
                    <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: "var(--store-primary)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
            <div className="px-3 py-2">
              <Link
                href="/store/products"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[13px] font-bold text-white transition-all"
                style={{ backgroundColor: "var(--store-primary)" }}
              >
                সব পণ্য দেখুন →
              </Link>
            </div>
          </nav>
        </aside>

        {/* Hero Banner */}
        <div 
          className="relative overflow-hidden rounded-xl min-h-[380px] flex flex-col justify-center p-8 sm:p-12" 
          style={{ 
            background: heroImage 
              ? `linear-gradient(135deg, rgba(13,33,55,0.8) 0%, rgba(10,61,43,0.8) 60%, rgba(13,33,55,0.8) 100%), url(${heroImage.startsWith('http') ? heroImage : `http://localhost:5010${heroImage}`}) center/cover`
              : "linear-gradient(135deg, #0D2137 0%, #0A3D2B 60%, #0D2137 100%)"
          }}
        >
          {/* Decorative circles - only show if no campaign image */}
          {!heroImage && (
            <>
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,166,81,0.25), transparent)", transform: "translate(25%, -25%)" }} />
              <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,166,81,0.15), transparent)", transform: "translate(-25%, 25%)" }} />
            </>
          )}

          <div className="relative z-10 max-w-lg">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6" style={{ backgroundColor: "rgba(0,166,81,0.2)", border: "1px solid rgba(0,166,81,0.5)" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#00A651" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#00A651" }} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#6EE7A8" }}>
                {heroCampaign?.hasDiscount ? "বিশেষ ছাড়" : "নতুন কালেকশন এসেছে"}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[36px] sm:text-[52px] font-black leading-tight mb-4" style={{ color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              {heroCampaign?.title ? (
                <>
                  {heroCampaign.title.split(' ').slice(0, -1).join(' ')}<br />
                  <span style={{ color: "#4ADE80" }}>{heroCampaign.title.split(' ').slice(-1)[0]}।</span>
                </>
              ) : (
                <>
                  সেরা পণ্য,<br />
                  <span style={{ color: "#4ADE80" }}>সেরা দামে।</span>
                </>
              )}
            </h1>

            {/* Subtext */}
            <p className="text-[15px] mb-8 max-w-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              {heroCampaign?.description || "সারাদেশে ক্যাশ অন ডেলিভারি। দ্রুত শিপিং, সহজ রিটার্ন এবং ১০০% অরিজিনাল পণ্যের নিশ্চয়তা।"}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={heroCampaign?.hasDiscount && heroCampaign?.discount?.products?.length ? 
                  `/store/products?discountId=${heroCampaign.discount.id}` : 
                  "/store/products"
                }
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-[14px] font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: "#00A651", color: "#FFFFFF" }}
              >
                {heroCampaign?.hasDiscount ? "অফার দেখুন" : "এখনই কিনুন"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/store/register"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-[14px] font-bold transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#FFFFFF", border: "1.5px solid rgba(255,255,255,0.3)" }}
              >
                অ্যাকাউন্ট খুলুন
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 mt-10 flex flex-wrap gap-8">
            {[
              { value: "৫০,০০০+", label: "সন্তুষ্ট গ্রাহক" },
              { value: "১০,০০০+", label: "পণ্যের সংগ্রহ" },
              { value: "৯৮%", label: "পজিটিভ রিভিউ" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[22px] font-black" style={{ color: "#FFFFFF" }}>{stat.value}</span>
                <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}