"use client";

import Link from "@/components/LocaleLink";
import { useEffect, useState } from "react";
import { getPublishedNews, resolveImageUrl, formatDate, type News } from "@/lib/admin-api";
import { useI18n } from "@/lib/i18n/I18nProvider";

const newsImage =
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1800&q=85";

export default function NewsSection() {
  const { t } = useI18n();
  const [items, setItems] = useState<News[] | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getPublishedNews();
        if (active) setItems(data);
      } catch {
        if (active) setItems([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Hide the entire section until we know there is published news to show.
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden z-30 bg-white my-16 md:my-24 lg:my-32">
      {/* Fixed Background */}
      <div
        className="absolute inset-0 bg-cover bg-center -z-10"
        style={{
          backgroundImage: `url('${newsImage}')`,
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />

      {/* Solid White Overlay */}
      <div className="absolute inset-0 bg-white -z-5"></div>

      {/* Content */}
      <div className="relative z-10 mx-auto pb-28 pt-14 container lg:pb-36 lg:pt-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em]">{t("home.news.eyebrow")}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-bembo text-3xl font-bold leading-tight text-black sm:text-5xl">
            {t("home.news.heading")}
          </h2>
          <Link
            href="/news"
            className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-900 underline-offset-4 hover:underline"
          >
            {t("home.news.viewAll")} →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.slice(0, 3).map((news) => (
            <Link
              href={`/news/${news.slug}`}
              key={news.id}
              className="group flex flex-col bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                {news.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveImageUrl(news.coverImageUrl)}
                    alt={news.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-neutral-100 text-neutral-300">
                    <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                  {news.publishedAt ? formatDate(news.publishedAt) : formatDate(news.createdAt)}
                  {news.author ? ` · ${news.author}` : ""}
                </p>
                <h3 className="mt-2 font-bembo text-xl font-bold leading-snug text-black">
                  {news.title}
                </h3>
                {news.excerpt && (
                  <p className="mt-3 text-sm leading-6 text-neutral-600 line-clamp-3">
                    {news.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
