"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categoriesApi, productsApi, type Category, type Product, getProxyImageUrl } from "@/lib/store-api";
import { ProductCard } from "./_components/product-card";

const CATEGORY_FALLBACKS: Array<{ key: string; icon: string; desc: string }> = [
  { key: "ল্যাংড়া", icon: "🥭", desc: "মিষ্টি ও সুগন্ধি" },
  { key: "langra", icon: "🥭", desc: "মিষ্টি ও সুগন্ধি" },
  { key: "ফজলি", icon: "🥭", desc: "বড় ও রসালো" },
  { key: "fazli", icon: "🥭", desc: "বড় ও রসালো" },
  { key: "আম্রপালি", icon: "🥭", desc: "মিষ্টি ও আঁশহীন" },
  { key: "amrapali", icon: "🥭", desc: "মিষ্টি ও আঁশহীন" },
  { key: "ক্ষীরশাপাত", icon: "🥭", desc: "রাজকীয় স্বাদ" },
  { key: "himsagar", icon: "🥭", desc: "রাজকীয় স্বাদ" },
  { key: "গোপালভোগ", icon: "🥭", desc: "আগাম জাত" },
  { key: "gopalbhog", icon: "🥭", desc: "আগাম জাত" },
];

const TAB_CONFIG = [
  { id: "all-mangoes", label: "সকল আম", keywords: ["আম", "mango", "ল্যাংড়া", "ফজলি", "আম্রপালি", "ক্ষীরশাপাত", "গোপালভোগ", "langra", "fazli", "himsagar"] },
  { id: "premium", label: "প্রিমিয়াম আম", keywords: ["ল্যাংড়া", "ক্ষীরশাপাত", "himsagar", "langra", "premium", "special"] },
  { id: "family-pack", label: "ফ্যামিলি প্যাক", keywords: ["pack", "family", "kg", "box", "কেজি", "বক্স", "প্যাক"] },
  { id: "gift", label: "গিফট বক্স", keywords: ["gift", "গিফট", "উপহার", "box", "special", "premium"] },
];

function getCategoryFallback(name: string) {
  const normalized = name.toLowerCase();
  for (const item of CATEGORY_FALLBACKS) {
    if (normalized.includes(item.key)) return item;
  }
  return { icon: "🥭", desc: "Freshly curated" };
}

function sliceProducts(items: Product[], start: number, count: number) {
  if (items.length >= start + count) return items.slice(start, start + count);
  return items.slice(0, count);
}

function matchProduct(product: Product, keywords: string[]) {
  const haystack = [
    product.name,
    product.category?.name ?? "",
    ...(product.tags?.map((tag) => tag.name) ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword));
}

function getTabProducts(products: Product[], tabId: string) {
  const tab = TAB_CONFIG.find((item) => item.id === tabId) ?? TAB_CONFIG[0];
  const matched = products.filter((product) => matchProduct(product, tab.keywords));
  const source = matched.length >= 4 ? matched : products;
  return source.slice(0, 8);
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState(TAB_CONFIG[0].id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      productsApi.list({ limit: 28, status: "active" }),
      categoriesApi.list(),
    ])
      .then(([productResponse, categoryResponse]) => {
        if (!mounted) return;
        setProducts(productResponse.data ?? []);
        setCategories(categoryResponse ?? []);
      })
      .catch((err) => {
        console.error("Failed to load store homepage data", err);
        if (mounted) setError("We are unable to load the storefront right now.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const heroProducts = useMemo(() => sliceProducts(products, 0, 3), [products]);
  const tabProducts = useMemo(() => getTabProducts(products, activeTab), [products, activeTab]);
  const popularProducts = useMemo(() => sliceProducts(products, 3, 8), [products]);
  const pantryPicks = useMemo(() => sliceProducts(products, 11, 6), [products]);
  const teaCollection = useMemo(() => sliceProducts(products, 17, 6), [products]);
  const categoryList = useMemo(() => categories.slice(0, 8), [categories]);

  return (
    <div className="bg-white text-stone-900 font-sans min-h-screen pb-16">
      <div className="bg-[#15803d] text-white text-center py-2.5 px-4 text-[11px] font-bold tracking-wide">
        🥭 নওগাঁর শতভাগ প্রাকৃতিক ও প্রিমিয়াম আম — সরাসরি বাগান থেকে আপনার দোরগোড়ায়! · ৳২,৫০০+ অর্ডারে ফ্রি ডেলিভারি 🚚
      </div>

      {error && (
        <div className="mx-auto max-w-[1800px] w-full px-5 sm:px-10 lg:px-14 mt-6">
          <div className="bg-rose-50 text-rose-700 border border-rose-200 px-4 py-3 text-sm font-semibold">
            {error}
          </div>
        </div>
      )}

      {/* ── Hero Banner ── */}
      <section className="relative w-full min-h-[420px] sm:min-h-[520px] overflow-hidden">
        <img
          src="/mango_hero.png"
          alt="Fresh Bangladeshi groceries"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative mx-auto max-w-[1800px] w-full px-5 sm:px-10 lg:px-14 py-16 sm:py-24">
          <div className="max-w-xl text-white">
            <span className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-2 store-pill">
              🥭 নওগাঁর আম এক্সপ্রেস — ২০২৬ মৌসুম
            </span>
            <h1 className="mt-6 text-2xl sm:text-3xl lg:text-[40px] font-extrabold leading-[1.2] lg:leading-[1.15] tracking-tight">
              নওগাঁর সুস্বাদু ও শতভাগ প্রাকৃতিক আম — সরাসরি বাগান থেকে আপনার দোরগোড়ায়!
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/90 leading-relaxed">
              শতভাগ রাসায়নিকমুক্ত এবং প্রাকৃতিকভাবে পাকানো নওগাঁর ল্যাংড়া, ফজলি, আম্রপালি ও ক্ষীরশাপাত আম। সরাসরি বাগান থেকে সংগৃহীত ফ্রেশ আম কুরিয়ার সার্ভিসের মাধ্যমে দ্রুত পৌঁছে যাবে আপনার ঠিকানায়!
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/store/products"
                className="bg-[#16a34a] text-white px-6 py-3 text-[12px] font-bold uppercase tracking-widest shadow-xs hover:bg-[#15803d] transition-colors"
              >
                🥭 এখনই অর্ডার করুন
              </Link>
              <a
                href="tel:+8801707819676"
                className="bg-white/90 text-stone-900 px-6 py-3 text-[12px] font-bold uppercase tracking-widest shadow-xs hover:bg-white transition-colors"
              >
                📞 ফোনে অর্ডার করুন
              </a>
            </div>
            {heroProducts.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-4 text-[11px] font-semibold text-white/80">
                {heroProducts.map((product) => (
                  <span key={product.id} className="bg-white/10 border border-white/15 px-3 py-1 store-pill">
                    {product.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Category Icons ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-8 sm:px-10 lg:px-14">
        <div className="bg-white border border-stone-200 px-6 sm:px-8 py-8">
          <div className="flex flex-col items-center text-center gap-3 mb-8 pb-6 border-b border-stone-200">
            <span className="section-badge">
              আমের জাত সমূহ
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-stone-900">আমাদের আমের ক্যাটাগরি</h2>
            <p className="text-sm text-stone-500 font-semibold max-w-lg">
              নওগাঁর বিভিন্ন জাতের আম — আপনার পছন্দের জাতটি বেছে নিন।
            </p>
            <Link
              href="/store/products"
              className="text-xs font-bold text-[#15803d] hover:text-[#0f6a2f] transition-colors tracking-widest mt-2"
            >
              সকল আম দেখুন →
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-5">
            {loading &&
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="border border-stone-200 p-4 text-center animate-pulse w-36 sm:w-40">
                  <div className="store-category-circle w-24 h-24 mx-auto bg-stone-100 border border-stone-200 mb-3" />
                  <div className="h-3 bg-stone-100 w-20 mx-auto mb-2" />
                  <div className="h-2 bg-stone-100 w-16 mx-auto" />
                </div>
              ))}

            {!loading &&
              categoryList.map((category) => {
                const fallback = getCategoryFallback(category.name);
                return (
                  <Link
                    key={category.id}
                    href={`/store/products?categoryId=${category.id}`}
                    className="border border-stone-200 bg-white p-4 text-center hover:border-[#15803d] hover:bg-stone-50 transition-all w-36 sm:w-40"
                  >
                    <div className="store-category-circle w-24 h-24 mx-auto border border-stone-200 bg-stone-50 overflow-hidden flex items-center justify-center">
                      {category.imageUrl ? (
                        <img
                          src={getProxyImageUrl(category.imageUrl)}
                          alt={category.name}
                          className="store-category-circle w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80";
                          }}
                        />
                      ) : (
                        <span className="text-4xl">{fallback.icon}</span>
                      )}
                    </div>
                    <h3 className="mt-3 text-[12px] font-bold text-stone-900">{category.name}</h3>
                    <p className="text-[10px] text-stone-500 font-semibold mt-1">{fallback.desc}</p>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* ── Tabbed New Products ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-6 sm:px-10 lg:px-14">
        <div className="bg-white border border-stone-200 px-6 sm:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <span className="section-badge section-badge-gold">
                🥭 তাজা আম
              </span>
              <h2 className="mt-4 text-2xl font-extrabold text-stone-900">এই মৌসুমের সেরা আম সমূহ</h2>
              <p className="text-sm text-stone-500 font-semibold mt-1.5">
                গাছ পাকা, ফরমালিনমুক্ত, ১০০% প্রাকৃতিক — নওগাঁর বাগান থেকে সরাসরি।
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TAB_CONFIG.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider border transition-all store-pill outline-none ${
                      isActive
                        ? "bg-[#15803d] text-white border-[#15803d]"
                        : "bg-white text-stone-600 border-stone-200 hover:border-[#15803d] hover:text-[#15803d]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="border border-stone-200 bg-white p-4 animate-pulse">
                  <div className="aspect-square bg-stone-100 mb-4" />
                  <div className="h-3 bg-stone-100 w-3/4 mb-2" />
                  <div className="h-3 bg-stone-100 w-2/3" />
                </div>
              ))}
            </div>
          ) : tabProducts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {tabProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500 font-semibold">No products found for this category right now.</p>
          )}
        </div>
      </section>

      {/* ── Promo Banner Row ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-6 sm:px-10 lg:px-14">
        <div className="grid gap-5 lg:grid-cols-2">
          {[
            {
              title: "🥭 ল্যাংড়া আম — নওগাঁর গর্ব",
              desc: "মিষ্টি, সুগন্ধি এবং আঁশহীন ল্যাংড়া আম। সরাসরি বাগান থেকে আপনার ঘরে।",
              cta: "ল্যাংড়া অর্ডার করুন",
              image:
                "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80",
            },
            {
              title: "🎁 ফ্যামিলি প্যাক ও গিফট বক্স",
              desc: "পরিবার ও প্রিয়জনদের জন্য স্পেশাল আমের গিফট বক্স। ৫ কেজি থেকে ২০ কেজি পর্যন্ত।",
              cta: "গিফট বক্স দেখুন",
              image:
                "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=1200&q=80",
            },
          ].map((banner, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden border border-stone-200 bg-stone-900 text-white min-h-[220px]"
            >
              <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/45" />
              <div className="relative p-6 sm:p-8">
                <span className="inline-flex items-center bg-white/15 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest store-pill">
                  🥭 স্পেশাল অফার
                </span>
                <h3 className="mt-4 text-xl font-extrabold">{banner.title}</h3>
                <p className="mt-2 text-sm text-white/85 max-w-md">{banner.desc}</p>
                <Link
                  href="/store/products"
                  className="mt-5 inline-flex items-center gap-2 bg-[#16a34a] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest"
                >
                  {banner.cta}
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular Products ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-6 sm:px-10 lg:px-14">
        <div className="bg-white border border-stone-200 px-6 sm:px-8 py-8">
          <div className="flex items-center justify-between gap-6 mb-8">
            <div>
              <span className="section-badge">
                🔥 সবচেয়ে বেশি বিক্রিত
              </span>
              <h2 className="mt-4 text-2xl font-extrabold text-stone-900">এই সপ্তাহের জনপ্রিয় আম</h2>
            </div>
            <Link
              href="/store/products"
              className="text-xs font-bold text-[#15803d] hover:text-[#0f6a2f] transition-colors tracking-widest"
            >
              সকল আম দেখুন →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Promo Banner Row (Three Columns) ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-6 sm:px-10 lg:px-14">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "🥭 ফজলি আম",
              desc: "বড় আকারের রসালো ফজলি আম — নওগাঁর প্রিমিয়াম কোয়ালিটি।",
              image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
            },
            {
              title: "🥭 আম্রপালি আম",
              desc: "মিষ্টি, আঁশহীন এবং সুস্বাদু আম্রপালি — বাচ্চাদের প্রিয়।",
              image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80",
            },
            {
              title: "📞 সরাসরি ফোনে অর্ডার",
              desc: "কল করুন: ০১৭০৭৮১৯৬৭৬ — ক্যাশ অন ডেলিভারি সুবিধা।",
              image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
            },
          ].map((banner, idx) => (
            <div key={idx} className="relative overflow-hidden border border-stone-200 min-h-[200px]">
              <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative p-5 text-white">
                <h3 className="text-lg font-extrabold">{banner.title}</h3>
                <p className="mt-2 text-sm text-white/85">{banner.desc}</p>
                <Link
                  href="/store/products"
                  className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"
                >
                  অর্ডার করুন →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Variety Sections ── */}
      <section className="mx-auto max-w-[1800px] w-full px-5 py-6 sm:px-10 lg:px-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white border border-stone-200 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <span className="section-badge">
                  দৈনন্দিন চাহিদা
                </span>
                <h3 className="mt-3 text-xl font-extrabold text-stone-900">পরিবারের জন্য আম</h3>
              </div>
              <Link href="/store/products" className="text-xs font-bold text-[#15803d] tracking-widest">
                অর্ডার →
              </Link>
            </div>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {pantryPicks.map((product) => (
                <ProductCard key={product.id} product={product} compact={true} />
              ))}
            </div>
          </div>

          <div className="bg-white border border-stone-200 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <span className="section-badge section-badge-gold">
                  🎁 স্পেশাল কালেকশন
                </span>
                <h3 className="mt-3 text-xl font-extrabold text-stone-900">গিফট বক্স ও স্পেশাল অফার</h3>
              </div>
              <Link href="/store/products" className="text-xs font-bold text-[#15803d] tracking-widest">
                অর্ডার →
              </Link>
            </div>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {teaCollection.map((product) => (
                <ProductCard key={product.id} product={product} compact={true} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
