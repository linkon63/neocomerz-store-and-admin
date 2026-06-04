"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch campaigns
  useEffect(() => {
    campaignsApi.getHero()
      .then((data) => {
        // Filter out inactive campaigns just to be safe
        const activeCampaigns = data.filter((c) => c.status === "active");
        setCampaigns(activeCampaigns);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fallback slide data matching user specifications
  const defaultSlide = {
    id: "default",
    title: "Premium Collection Campaign",
    description: "Flat 20% off all curated items. Experience the fastest nationwide delivery and secure cash-on-delivery options for our premium, meticulously curated collections.",
    hasDiscount: false,
    discountId: null,
    discount: null,
    images: undefined as Campaign['images'] | undefined,
  };

  const slides = [defaultSlide, ...campaigns];

  // Autoplay functionality
  const startAutoplay = () => {
    stopAutoplay();
    if (slides.length <= 1) return;
    autoplayTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Change slide every 6 seconds
  };

  const stopAutoplay = () => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [slides.length]);

  const handlePrev = () => {
    stopAutoplay();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    startAutoplay();
  };

  const handleNext = () => {
    stopAutoplay();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    startAutoplay();
  };

  const handleDotClick = (index: number) => {
    stopAutoplay();
    setCurrentSlide(index);
    startAutoplay();
  };

  // Render Skeleton Loading
  if (loading) {
    return (
      <section className="mx-auto max-w-[1800px] w-full px-6 py-6 sm:px-12 lg:px-16 font-sans">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block bg-white border border-[var(--store-border)] overflow-hidden">
            <div className="px-4 py-3 bg-[var(--store-primary)] h-11" />
            <div className="py-2 space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 bg-stone-100 animate-pulse" />
              ))}
            </div>
          </aside>
          <div className="h-[450px] bg-stone-900 animate-pulse flex items-center justify-center border border-stroke">
            <div className="text-stone-500 font-medium">Loading premium deals...</div>
          </div>
        </div>
      </section>
    );
  }

  const activeCampaign = slides[currentSlide];

  // Extract images
  const rawImg = activeCampaign.images?.[0]?.images;
  let campaignImage: string | undefined;
  if (Array.isArray(rawImg) && rawImg.length > 0) {
    campaignImage = rawImg[0];
  } else if (rawImg && typeof rawImg === "object" && "images" in rawImg && Array.isArray((rawImg as any).images)) {
    campaignImage = (rawImg as any).images[0];
  }

  const finalImgUrl = campaignImage
    ? (campaignImage.startsWith("http") ? campaignImage : `/campaigns/${campaignImage.split("/campaigns/").pop()}`)
    : (activeCampaign.id === "default" ? "/premium_hero_campaign.png" : undefined);

  const targetDiscountId = activeCampaign.discountId || activeCampaign.discount?.id;
  const shopHref = (activeCampaign.hasDiscount && targetDiscountId)
    ? `/store/products?discountId=${targetDiscountId}`
    : "/store/products";

  return (
    <section className="mx-auto max-w-[1800px] w-full px-6 py-6 sm:px-12 lg:px-16 font-sans">
      <style>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress-bar {
          animation: slideProgress 6000ms linear forwards;
        }
      `}</style>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        
        {/* Sidebar Categories */}
        <aside className="hidden lg:block bg-white border overflow-hidden" style={{ borderColor: "var(--store-border)" }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: "var(--store-primary)" }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-[13px] font-bold text-white uppercase tracking-wide">সব ক্যাটাগরি</span>
          </div>
          <nav className="py-1">
            {categories.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="mx-3 my-1 h-9 bg-slate-50 animate-pulse" />
                ))
              : categories.slice(0, 8).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/store/products?categoryId=${cat.id}`}
                    className="flex items-center justify-between px-4 py-2.5 text-[13px] font-medium transition-all hover:bg-teal-50/50 group"
                    style={{ color: "var(--store-text)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{getCategoryIcon(cat.name)}</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">{cat.name}</span>
                    </div>
                    <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-[var(--store-primary)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
            <div className="px-3 py-2 border-t border-slate-100 mt-2">
              <Link
                href="/store/products"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-none text-[13px] font-bold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "var(--store-primary)" }}
              >
                সব পণ্য দেখুন →
              </Link>
            </div>
          </nav>
        </aside>

        {/* Hero Slider Container */}
        <div className="relative group overflow-hidden bg-[#0A0F1D] min-h-[440px] md:min-h-[480px] lg:min-h-[500px] flex flex-col justify-between p-8 sm:p-12 border border-slate-800">
          
          {/* Progressive Autoplay Timeline Bar */}
          {slides.length > 1 && (
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-900/60 z-20">
              <div 
                key={currentSlide} 
                className="h-full bg-emerald-500 animate-progress-bar"
              />
            </div>
          )}

          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none z-0" />
          
          {/* Slide Content wrapper with unique key to trigger keyframe animations */}
          <div 
            key={currentSlide} 
            className="w-full h-full flex-1 grid gap-8 lg:grid-cols-[1.2fr_1fr] items-center animate-fade-in relative z-10"
          >
            {/* Left Content */}
            <div className="flex flex-col justify-center items-start text-left max-w-xl">
              {/* Special Badge */}
              <div 
                className="inline-flex items-center gap-2 rounded-none px-3.5 py-1.5 mb-6 border border-emerald-500/30 bg-emerald-500/10 animate-slide-up"
                style={{ animationDelay: "0ms", animationFillMode: "both" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#10B981]" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#10B981]">
                  {activeCampaign.hasDiscount ? "Special Offer" : "New Season Collection"}
                </span>
              </div>

              {/* Subtitle */}
              <span 
                className="text-[12px] font-black tracking-widest text-emerald-400 uppercase mb-3 animate-slide-up block"
                style={{ animationDelay: "100ms", animationFillMode: "both" }}
              >
                {activeCampaign.id === "default" ? "Elevate Your Style." : "Exclusive Campaign"}
              </span>

              {/* Title */}
              <h1 
                className="text-[34px] sm:text-[44px] lg:text-[48px] font-black leading-tight text-white mb-5 tracking-tight animate-slide-up"
                style={{ animationDelay: "200ms", animationFillMode: "both" }}
              >
                {activeCampaign.title ? (
                  <>
                    {activeCampaign.title.split(" ").slice(0, -1).join(" ")}{" "}
                    <span className="text-emerald-400 font-serif italic">{activeCampaign.title.split(" ").slice(-1)[0]}</span>
                  </>
                ) : (
                  <>
                    Premium <span className="text-emerald-400 font-serif italic">Selections.</span>
                  </>
                )}
              </h1>

              {/* Subtext */}
              <p 
                className="text-slate-300 text-[14px] sm:text-[15px] mb-8 leading-relaxed max-w-md animate-slide-up"
                style={{ animationDelay: "300ms", animationFillMode: "both" }}
              >
                {activeCampaign.description || "Discover the finest deals crafted just for you. Fast shipping, secure payment and 100% original product guarantee."}
              </p>

              {/* Buttons */}
              <div 
                className="flex flex-wrap gap-4 animate-slide-up"
                style={{ animationDelay: "400ms", animationFillMode: "both" }}
              >
                <Link
                  href={shopHref}
                  className="inline-flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] tracking-wider uppercase px-6 py-3.5 shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 rounded-none cursor-pointer"
                >
                  {activeCampaign.id === "default" ? "Shop Collection" : "View Offers"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/store/register"
                  className="inline-flex items-center gap-2 border border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-900 text-white font-bold text-[13px] tracking-wider uppercase px-6 py-3.5 transition-all duration-300 rounded-none cursor-pointer"
                >
                  Create Account
                </Link>
              </div>
            </div>

            {/* Right Campaign Image Content (only shown on large screens if image exists) */}
            {finalImgUrl ? (
              <div 
                className="hidden lg:flex justify-center items-center h-full animate-slide-up relative"
                style={{ animationDelay: "200ms", animationFillMode: "both" }}
              >
                {/* Backdrop glow */}
                <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-none" />
                
                {/* Image Border Frame */}
                <div className="relative border border-slate-800 bg-slate-900/40 p-3 shadow-none backdrop-blur-sm z-10 w-full max-w-[360px] aspect-[4/3] overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-400" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-400" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-400" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-400" />
                  
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={finalImgUrl} 
                    alt={activeCampaign.title || "Campaign promotion"} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
            ) : (
              // Geometric detail if there is no image
              <div className="hidden lg:flex justify-center items-center h-full relative opacity-20">
                <div className="w-72 h-72 border border-slate-800 rotate-45 flex items-center justify-center">
                  <div className="w-56 h-56 border border-slate-700 flex items-center justify-center">
                    <div className="w-40 h-40 border border-slate-600 rotate-12" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Background Image / Overlay (especially for mobile viewing) */}
          {finalImgUrl ? (
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 opacity-20 lg:opacity-[0.08] lg:blur-sm"
              style={{ backgroundImage: `url(${finalImgUrl})` }}
            />
          ) : null}

          {/* Decorative gradients */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-700/5 rounded-none blur-3xl z-0 pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-800/5 rounded-none blur-3xl z-0 pointer-events-none" />

          {/* Bottom Indicators & Stats Panel */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-t border-slate-800/60 pt-6 mt-6">
            
            {/* Stats list */}
            <div className="flex gap-6 items-center">
              {[
                { value: "50k+", label: "Customers" },
                { value: "100%", label: "Original" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col text-left">
                  <span className="text-[14px] font-black text-white">{stat.value}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Slider Dots */}
            {slides.length > 1 && (
              <div className="flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDotClick(idx)}
                    className="h-1.5 transition-all duration-500 rounded-none relative overflow-hidden cursor-pointer"
                    style={{
                      width: idx === currentSlide ? "32px" : "12px",
                      backgroundColor: idx === currentSlide ? "#10B981" : "rgba(255, 255, 255, 0.2)",
                    }}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Glassmorphic Side Navigation Arrows (Fade in on container hover) */}
          {slides.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-slate-900/60 hover:bg-emerald-600/90 border border-slate-800 hover:border-emerald-500 text-white flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-none cursor-pointer"
                aria-label="Previous Slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-slate-900/60 hover:bg-emerald-600/90 border border-slate-800 hover:border-emerald-500 text-white flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-none cursor-pointer"
                aria-label="Next Slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

        </div>
      </div>
    </section>
  );
}