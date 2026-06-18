import DiscoverMoreButton from "./ui/button";
import ProductCarousel from "./ui/productcarousel";
import data from "@/data/data.json";

export default function NewArrival() {
  const products = data.products.newArrivals;

  return (
    <section 
      className="w-full bg-[#F9F9FB] py-12 md:py-20 lg:py-32 relative overflow-hidden" 
    >
      <div className="w-full mx-auto px-4 sm:px-6">
        <ProductCarousel products={products} title="NEW ARRIVALS" />
        <DiscoverMoreButton href="/products" variant="outline" />
      </div>
    </section>
  );
}

