import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { resolveImageUrl, formatDate, type News } from "@/lib/admin-api";

export const metadata = {
  title: process.env.SHOP_NAME ? `News & Blog | ${process.env.SHOP_NAME}` : "News & Blog",
  description:
    process.env.SHOP_DESCRIPTION ||
    "The latest news, stories, and updates from Humana Vintage.",
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api/v1";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let news: News | null = null;
  try {
    const res = await fetch(`${BASE_URL}/news/slug/${slug}`, { cache: "no-store" });
    if (res.ok) {
      news = await res.json();
    }
  } catch (err) {
    console.error("Error fetching news by slug:", err);
  }

  if (!news || !news.isPublished) {
    notFound();
  }

  const coverImage = news.coverImageUrl ? resolveImageUrl(news.coverImageUrl) : null;

  return (
    <main className="min-h-screen bg-white text-[#151515]">
      <article className="container py-10 md:py-14 lg:py-20">
        <div className="mx-auto max-w-3xl pt-4">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-neutral-500 transition hover:text-neutral-900"
          >
            <FiArrowLeft /> Back to News &amp; Blog
          </Link>

          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
            {news.publishedAt ? formatDate(news.publishedAt) : formatDate(news.createdAt)}
            {news.author ? ` · ${news.author}` : ""}
          </p>
          <h1 className="mt-3 font-bembo text-3xl font-bold leading-tight sm:text-5xl">
            {news.title}
          </h1>
          {news.excerpt && (
            <p className="mt-5 text-lg leading-8 text-neutral-600">{news.excerpt}</p>
          )}

          {coverImage && (
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt={news.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="mt-8 whitespace-pre-line text-base leading-8 text-neutral-800">
            {news.content}
          </div>
        </div>
      </article>
    </main>
  );
}
