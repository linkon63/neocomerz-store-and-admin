import Image from "next/image";
import Link from "next/link";

const heroImage =
  "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=85";

const storyImages = [
  {
    src: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85",
    alt: "Vintage styled model in warm editorial light",
  },
  {
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
    alt: "Curated shopping bags and fashion details",
  },
  {
    src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
    alt: "Editorial fashion portrait with classic styling",
  },
];

const collections = [
  "Archive Denim",
  "Leather Jackets",
  "Printed Shirts",
  "Retro Dresses",
];

export default function HumanaVintageHome() {
  return (
    <main className="min-h-screen bg-[#f7f1e8] text-[#261c16]">
      <header className="sticky top-0 z-20 border-b border-[#261c16]/10 bg-[#f7f1e8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="font-serif text-2xl tracking-wide">
            Humana Vintage
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium uppercase tracking-[0.18em] text-[#5f4a3f] md:flex">
            <a href="#new">New In</a>
            <a href="#collections">Collections</a>
            <a href="#journal">Journal</a>
          </nav>
          <a
            href="#collections"
            className="border border-[#261c16] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-[#261c16] hover:text-[#f7f1e8]"
          >
            Shop Edit
          </a>
        </div>
      </header>

      <section className="relative min-h-[82vh] overflow-hidden">
        <Image
          src={heroImage}
          alt="Vintage clothing rack curated for Humana Vintage"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1b130f]/45" />
        <div className="relative z-10 mx-auto flex min-h-[82vh] max-w-7xl flex-col justify-end px-5 pb-12 pt-28 text-[#fff8ef] sm:px-8 lg:pb-18">
          <p className="mb-4 max-w-xl text-sm font-semibold uppercase tracking-[0.28em] text-[#e6c27a]">
            Curated second-life fashion
          </p>
          <h1 className="max-w-4xl font-serif text-5xl leading-none sm:text-7xl lg:text-8xl">
            Humana Vintage
          </h1>
          <div className="mt-8 flex max-w-3xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-lg leading-8 text-[#fff8ef]/90 sm:text-xl">
              One-of-one pieces, recovered classics, and era-rich essentials
              selected for modern wardrobes.
            </p>
            <a
              href="#new"
              className="inline-flex w-fit bg-[#e6c27a] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#261c16] transition hover:bg-[#fff8ef]"
            >
              Explore Drop
            </a>
          </div>
        </div>
      </section>

      <section id="new" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9a4f2f]">
            This week
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            New arrivals with old souls.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {storyImages.map((image, index) => (
            <article key={image.src} className="group">
              <div className="aspect-[4/5] overflow-hidden bg-[#e8dccd]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={900}
                  height={1125}
                  sizes="(min-width: 1024px) 24vw, (min-width: 640px) 30vw, 100vw"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#5f4a3f]">
                Edit 0{index + 1}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="collections" className="border-y border-[#261c16]/10 bg-[#261c16] py-14 text-[#fff8ef]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="font-serif text-4xl sm:text-5xl">Shop by era, texture, and attitude.</h2>
            <p className="max-w-sm text-sm leading-6 text-[#fff8ef]/70">
              Built for fast discovery: each collection can later connect to
              the shared ecommerce product data.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden border border-[#fff8ef]/20 sm:grid-cols-2 lg:grid-cols-4">
            {collections.map((collection) => (
              <Link
                href="/"
                key={collection}
                className="bg-[#2f211a] p-6 transition hover:bg-[#9a4f2f]"
              >
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#e6c27a]">
                  Collection
                </span>
                <h3 className="mt-8 font-serif text-3xl">{collection}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="journal" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
        <div className="bg-[#e8dccd] p-8 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9a4f2f]">
            Circular style
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight">
            Designed as a client-specific storefront, powered by the same admin.
          </h2>
        </div>
        <div className="flex flex-col justify-center gap-6 text-lg leading-8 text-[#5f4a3f]">
          <p>
            Humana Vintage can own the public look, content, and merchandising
            flow while products, orders, and admin operations stay shared.
          </p>
          <p>
            Set <code className="bg-[#e8dccd] px-2 py-1 text-sm">STOREFRONT=humana-vintage</code>{" "}
            before building to make this the storefront at <code className="bg-[#e8dccd] px-2 py-1 text-sm">/</code>.
          </p>
        </div>
      </section>
    </main>
  );
}
