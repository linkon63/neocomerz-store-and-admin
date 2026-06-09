import Image from "next/image";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import HeroSlider from "./_components/hero-slider";
import Newsletter from "@/components/Newsletter";

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

      <section className="mx-auto max-w-[1400px]">
        <div className="grid gap-2 pt-2 md:grid-cols-2">
          {editorialImages.map((item) => (
            <Link key={item.label} href="#" className="group relative block h-[520px] overflow-hidden">
              <Image
                src={item.src}
                alt={item.label}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8">
        <h1 className="font-bembo text-2xl font-bold sm:text-3xl">
          Thousands of different stories
        </h1>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <article key={product.name} className="group">
              <Link href="#" className="block bg-neutral-50">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
              </Link>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase leading-4 tracking-[0.08em]">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-neutral-500">
                    {product.color}
                  </p>
                  <p className="mt-2 text-xs font-semibold">{product.price}</p>
                </div>
                <FiHeart className="mt-0.5 shrink-0 text-sm" aria-label="Add to wishlist" />
              </div>
            </article>
          ))}
        </div>
      </section>

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
          href="#"
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

      <Newsletter />
    </main>
  );
}
