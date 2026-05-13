import Link from "next/link";

const newArrivals = [
  {
    name: "Aero Knit Runner",
    category: "Sneakers",
    price: "$128",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    badge: "New",
  },
  {
    name: "Transit Day Pack",
    category: "Bags",
    price: "$96",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    badge: "Limited",
  },
  {
    name: "Studio Linen Jacket",
    category: "Outerwear",
    price: "$164",
    image:
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
    badge: "Fresh",
  },
  {
    name: "Core Analog Watch",
    category: "Accessories",
    price: "$210",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    badge: "Popular",
  },
];

const categories = ["Women", "Men", "Accessories", "Home", "Sale"];

export default function StorefrontHome() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#171412]">
      <header className="sticky top-0 z-40 border-b border-[#ded7ce] bg-[#f7f4ef]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link className="text-xl font-black tracking-tight" href="/">
            NeoComerz
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#51483f] md:flex">
            {categories.map((category) => (
              <Link className="transition hover:text-[#171412]" href="#" key={category}>
                {category}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              className="hidden rounded-full border border-[#cfc6ba] px-4 py-2 text-sm font-bold text-[#2c2722] transition hover:border-[#171412] sm:inline-flex"
              href="/admin"
            >
              Admin
            </Link>
            <Link
              className="rounded-full bg-[#171412] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3c332b]"
              href="#new-arrivals"
            >
              Shop New
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div className="flex min-h-[540px] flex-col justify-between rounded-[2rem] bg-[#171412] p-7 text-white sm:p-10">
          <div className="max-w-xl">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.22em] text-[#d7f36b]">
              Spring edit 2026
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Daily essentials with a sharper point of view.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#d8d0c8] sm:text-lg">
              Discover fresh apparel, accessories, and everyday gear selected
              for clean styling, useful details, and confident repeat wear.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              className="inline-flex justify-center rounded-full bg-[#d7f36b] px-6 py-3 text-sm font-black text-[#171412] transition hover:bg-white"
              href="#new-arrivals"
            >
              View New Arrivals
            </Link>
            <div className="grid grid-cols-3 gap-5 text-sm text-[#d8d0c8] sm:ml-4">
              <div>
                <p className="text-2xl font-black text-white">240+</p>
                <p>Curated items</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">48h</p>
                <p>Dispatch</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">4.8</p>
                <p>Rating</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-h-[540px] grid-rows-[1fr_auto] gap-4">
          <div
            className="overflow-hidden rounded-[2rem] bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80')",
            }}
          >
            <div className="flex h-full items-end bg-gradient-to-t from-black/55 via-black/10 to-transparent p-7">
              <div className="max-w-sm text-white">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d7f36b]">
                  Storefront
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight">
                  Built for browsing fast and buying with less friction.
                </h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-[#6b6258]">Free shipping</p>
              <p className="mt-2 text-2xl font-black">Orders over $75</p>
            </div>
            <div className="rounded-3xl bg-[#d7f36b] p-5">
              <p className="text-sm font-bold text-[#51483f]">Members save</p>
              <p className="mt-2 text-2xl font-black">Up to 20%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#ded7ce] bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-5 text-sm font-bold uppercase tracking-[0.18em] text-[#6b6258] sm:grid-cols-3 sm:px-8">
          <p>Premium basics</p>
          <p>Easy returns</p>
          <p>Secure checkout</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8" id="new-arrivals">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#756b60]">
              Just landed
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-tight">
              New arrivals
            </h2>
          </div>
          <Link
            className="text-sm font-black text-[#171412] underline decoration-[#d7f36b] decoration-4 underline-offset-4"
            href="#"
          >
            Browse all products
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {newArrivals.map((product) => (
            <article
              className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5"
              key={product.name}
            >
              <div
                className="aspect-[4/5] bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
                style={{ backgroundImage: `url('${product.image}')` }}
              />
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#f0eee9] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#6b6258]">
                    {product.badge}
                  </span>
                  <span className="text-sm font-bold text-[#756b60]">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight">
                  {product.name}
                </h3>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xl font-black">{product.price}</p>
                  <button className="rounded-full bg-[#171412] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3c332b]">
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="bg-[#171412] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link className="text-2xl font-black tracking-tight" href="/">
              NeoComerz
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#d8d0c8]">
              A clean demo storefront connected to a dedicated admin section for
              managing catalog, orders, stock, and settings.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#d7f36b]">
              Shop
            </h3>
            <div className="mt-4 grid gap-3 text-sm text-[#d8d0c8]">
              {categories.slice(0, 4).map((category) => (
                <Link className="hover:text-white" href="#" key={category}>
                  {category}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#d7f36b]">
              Manage
            </h3>
            <div className="mt-4 grid gap-3 text-sm text-[#d8d0c8]">
              <Link className="hover:text-white" href="/admin">
                Admin dashboard
              </Link>
              <Link className="hover:text-white" href="/admin/login">
                Admin login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
