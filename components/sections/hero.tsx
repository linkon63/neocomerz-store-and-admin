import HeroSlider from "./ui/hero-slider";
import type { Slide } from "@/data/types";
import { fetchActiveCampaigns } from "@/lib/shop-api";
import { resolveImageUrl } from "@/lib/admin-api";

export default async function Hero() {
  const defaultSlides: Slide[] = [
    {
      videoId: "CFfP9DFeOog",
      title: "Well & Fine",
      titleItalic: "Premium Tea",
      subtitle: "A HERITAGE OF RARE TEA, REFINED THROUGH CRAFTSMANSHIP, PURITY AND TIMELESS ELEGANCE",
    },
    {
      videoId: "Ko0frhpjKOk",
      title: "Well & Fine",
      titleItalic: "Premium Tea",
      subtitle: "A HERITAGE OF RARE TEA, REFINED THROUGH CRAFTSMANSHIP, PURITY AND TIMELESS ELEGANCE",
    },
  ];

  let slides = defaultSlides;
  
  try {
    const campaigns = await fetchActiveCampaigns();
    const campaignSlides = campaigns
      .filter((c) => c.images && c.images.length > 0 && c.images[0].images.length > 0)
      .map((c) => ({
        image: resolveImageUrl(c.images![0].images[0]),
        title: c.title,
        subtitle: c.description || "A HERITAGE OF RARE TEA, REFINED THROUGH CRAFTSMANSHIP, PURITY AND TIMELESS ELEGANCE",
        hasDiscount: c.hasDiscount,
      }));

    if (campaignSlides.length > 0) {
      slides = [...campaignSlides, ...defaultSlides];
    }
  } catch (error) {
    console.error("Failed to fetch campaigns for hero slider:", error);
  }

  return (
    <section className="w-full relative">
      <div className="hero-wrapper">
        <HeroSlider slides={slides} />
      </div>
    </section>
  );
}
