"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPublishedNews, resolveImageUrl, formatDate, type News } from "@/lib/admin-api";

export default function NewsList() {
  const [items, setItems] = useState<News[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getPublishedNews();
        if (active) setItems(data);
      } catch {
        if (active) {
          setError(true);
          setItems([]);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <div className="container">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
          News &amp; Blog
        </p>
        <h1 className="mt-3 font-bembo text-3xl font-bold leading-tight sm:text-5xl">
          Stories from Humana Vintage
        </h1>

        {items === null ? (
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <article key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-neutral-100" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-neutral-100" />
                  <div className="h-4 w-3/4 rounded bg-neutral-100" />
                  <div className="h-3 w-full rounded bg-neutral-100" />
                </div>
              </article>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-12 rounded-lg border-2 border-dashed border-neutral-200 px-6 py-20 text-center">
            <p className="font-medium italic text-neutral-500">
              {error
                ? "Unable to load news right now. Please try again later."
                : "No news or blog posts have been published yet."}
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((news) => (
              <Link
                key={news.id}
                href={`/news/${news.slug}`}
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
                    <div className="flex h-full items-center justify-center text-neutral-300">
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
                  <h2 className="mt-2 font-bembo text-xl font-bold leading-snug">
                    {news.title}
                  </h2>
                  {news.excerpt && (
                    <p className="mt-3 text-sm leading-6 text-neutral-600 line-clamp-3">
                      {news.excerpt}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-neutral-900 group-hover:underline">
                    Read more →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
