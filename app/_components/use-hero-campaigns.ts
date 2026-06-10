"use client";

import { useEffect, useState } from "react";
import { type HeroSlide } from "../../lib/type";
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
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/v1/campaigns", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch campaigns");
        const campaigns = await res.json();

        const hero = (campaigns ?? []).filter(
          (c: any) =>
            c.status === "active" &&
            c.section?.title === "Hero Campaign",
        );

        if (hero.length > 0) {
          const mapped: HeroSlide[] = hero
            .map((c: any) => ({
              image: c.images?.[0]?.images?.[0] ?? "",
              title: c.title,
              copy: c.description ?? "",
            }))
            .filter((s: HeroSlide) => s.image);

          setSlides(mapped.length > 0 ? mapped : FALLBACK_SLIDES);
        } else {
          setSlides(FALLBACK_SLIDES);
        }
      } catch {
        setSlides(FALLBACK_SLIDES);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  return { slides, loading };
}
