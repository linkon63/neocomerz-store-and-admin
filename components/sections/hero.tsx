import HeroSlider from "./ui/hero-slider";
import type { Slide } from "@/data/types";

export default function Hero() {
  const slides: Slide[] = [
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
    {
      videoId: "_I60fhC6Cyg",
      title: "Well & Fine",
      titleItalic: "Premium Tea",
      subtitle: "A HERITAGE OF RARE TEA, REFINED THROUGH CRAFTSMANSHIP, PURITY AND TIMELESS ELEGANCE",
    },
  ];

  return (
    <section className="w-full relative">
      <div className="hero-wrapper">
        <HeroSlider slides={slides} />
      </div>
    </section>
  );
}
