"use client";

import { useMemo } from "react";
import { type HeroSlide } from "../../lib/type";
import { resolveImageUrl } from "@/app/_components/products";
import { fetcher, useSWRImmutable } from "@/lib/swr";
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1800&q=85",
    title: "Vintage football stories",
    copy: "Archive jerseys, warm-up jackets, and one-off pieces selected for everyday wear.",
  },
  {
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85",
    title: "Curated streetwear",
    copy: "Statement layers, classic silhouettes, and fresh arrivals from the Humana archive.",
  },
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=85",
    title: "Football corner",
    copy: "Find club colors, training tops, and retro match-day essentials.",
  },
];

export function useHeroCampaigns() {
  const { data, isLoading, error } = useSWRImmutable<any[]>(
    "/api/v1/campaigns",
    fetcher,
  );

  const slides = useMemo<HeroSlide[]>(() => {
    if (error) return FALLBACK_SLIDES;
    if (!data) return [];

    const hero = (data ?? []).filter(
      (c: any) => c.status === "active" && c.section?.title === "Hero Campaign",
    );

    const mapped: HeroSlide[] = hero
      .map((c: any) => ({
        image: resolveImageUrl(c.images?.[0]?.images?.[0] ?? ""),
        title: c.title,
        copy: c.description ?? "",
      }))
      .filter((s: HeroSlide) => s.image);

    return mapped.length > 0 ? mapped : FALLBACK_SLIDES;
  }, [data, error]);

  return { slides, loading: isLoading };
}
