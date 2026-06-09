import Image from "next/image";
import Link from "next/link";
import CategoryBannerGrid from "./_components/category-banner-grid";
import HeroSlider from "./_components/hero-slider";
import ProductGrid from "./_components/product-grid";

const newsImage =
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1800&q=85";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#151515]">
      <HeroSlider />

      <CategoryBannerGrid />

      <ProductGrid />

      <section className="bg-[#ffd3f3] px-4 py-14 text-center sm:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em]">The brand</p>
        <h2 className="mt-4 font-bembo text-3xl font-bold sm:text-4xl">
          Experience our quality firsthand
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6">
          Every piece is selected for character, condition, and the story it carries.
          Discover expressive vintage staples made for everyday wear.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-flex bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
        >
          See the story
        </Link>
      </section>

      <section>
        <div className="relative h-[460px] overflow-hidden sm:h-[560px]">
          <Image
            src={newsImage}
            alt="Community fashion story"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-12 pt-28 text-white sm:px-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]">Journal</p>
            <h2 className="mt-3 max-w-3xl font-bembo text-3xl font-bold leading-none sm:text-5xl">
              Small gestures that transform the world
            </h2>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 pb-28 pt-14 sm:px-8 lg:pb-36 lg:pt-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]">News</p>
          <h2 className="mt-4 font-bembo text-3xl font-bold leading-tight text-black sm:text-5xl">
            What is happening in the world of Humana Vintage
          </h2>
        </div>
      </section>

      <section className="bg-[#ffd02f] px-4 py-16 sm:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
          <div>
            <h2 className="font-bembo text-3xl font-bold leading-tight text-black sm:text-5xl">
              Subscribe to our newsletter
            </h2>
            <p className="mt-4 text-sm font-medium text-black sm:text-base">
              Stay updated and receive 10% off your first order.
            </p>
          </div>
          <div>
            <form className="flex w-full">
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="bg-[#120b16] px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white"
              >
                Subscribe
              </button>
            </form>

            <label className="mt-5 flex items-center gap-3 text-sm font-bold text-black">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-neutral-400 bg-white"
              />
              <span>I have read and accept the terms and conditions</span>
            </label>
          </div>
        </div>
      </section>

    </main>
  );
}
