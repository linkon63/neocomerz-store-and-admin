import CategoryBannerGrid from "./_components/category-banner-grid";
import HeroSlider from "./_components/hero-slider";
import Newsletter from "@/components/Newsletter";
import ProductGrid from "./_components/product-grid";
import TheBrand from "./_components/the-brand";
import JournalParallax from "./_components/journal-parallax";
import NewsSection from "./_components/news-section";

const editorialImages = [
  {
    src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1100&q=85",
    label: "SHOP WOMENSWEAR",
  },
  {
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1100&q=85",
    label: "SHOP MENSWEAR",
  },
];

const products = [
  {
    name: "Adidas Bayern Munich home shirt",
    color: "Red",
    price: "EUR 89.00",
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Nike archive warm-up jacket",
    color: "Black",
    price: "EUR 129.00",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Vintage football training top",
    color: "Yellow",
    price: "EUR 69.00",
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Classic striped match jersey",
    color: "Blue",
    price: "EUR 74.00",
    image:
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Retro track jacket",
    color: "Green",
    price: "EUR 98.00",
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=85",
  },
];

const newsImage =
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1800&q=85";

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
