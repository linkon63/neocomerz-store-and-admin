import CategoryBannerGrid from "./_components/category-banner-grid";
import HeroSlider from "./_components/hero-slider";
import ProductGrid from "./_components/product-grid";
import TheBrand from "./_components/the-brand";
import JournalParallax from "./_components/journal-parallax";
import NewsSection from "./_components/news-section";
import Newsletter from "./_components/newsletter";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#151515]">
      <HeroSlider />

      <CategoryBannerGrid />

      <ProductGrid />

      <TheBrand />

      <JournalParallax />

      <NewsSection />

      <Newsletter />

    </main>
  );
}
