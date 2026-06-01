import DiscoverMoreButton from "./ui/button";
import NewProductCarousel from "./ui/product-carousel-2";
import data from "@/data/data.json";

export default function MostPopular() {
  const products = data.products.newArrivals;

  return (
    <section className="w-full bg-[#f6f6f6] py-12 md:py-16 lg:py-20">
      <div className="w-full mx-auto px-4 sm:px-6">
        <NewProductCarousel products={products} title="Most Populer" />
        <DiscoverMoreButton href="/products" />
      </div>
    </section>
  );
}
