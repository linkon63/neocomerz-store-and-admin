import DiscoverMoreButton from "./ui/button";
import ProductCarousel from "./ui/product-carousel";
import data from "@/data/data.json";

export default function NewArrivals() {
  const products = data.products.newArrivals;

  return (
    <section className="w-full bg-brand-2 py-12 md:py-16 lg:py-20">
      <div className="w-full mx-auto px-4 sm:px-6">
        <ProductCarousel products={products} title="NEW ARRIVALS" />
        <DiscoverMoreButton href="/products" />
      </div>
    </section>
  );
}
